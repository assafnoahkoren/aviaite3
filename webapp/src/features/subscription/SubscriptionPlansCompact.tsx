import { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Stack, 
  Group, 
  TextInput, 
  Alert,
  Loader,
  Badge,
  Card,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { 
  IconCheck, 
  IconCreditCard, 
  IconAlertCircle,
  IconX,
  IconCircleCheck
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  getProducts, 
  getActiveSubscription, 
  purchaseSubscription,
  type PurchaseSubscriptionDto 
} from '../../api/subscriptions-api';
import styles from './SubscriptionPlansCompact.module.scss';

export function SubscriptionPlansCompact() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // Queries
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: activeSubscription } = useQuery({
    queryKey: ['activeSubscription'],
    queryFn: getActiveSubscription,
  });

  // Mutation
  const purchaseMutation = useMutation({
    mutationFn: purchaseSubscription,
    onSuccess: () => {
      notifications.show({
        title: 'Subscription Activated!',
        message: 'Your subscription has been activated successfully.',
        color: 'green',
        icon: <IconCircleCheck />,
      });
      setTimeout(() => navigate('/'), 2000);
    },
    onError: (error: any) => {
      notifications.show({
        title: 'Purchase Failed',
        message: error.response?.data?.message || 'Failed to process payment',
        color: 'red',
        icon: <IconX />,
      });
    },
  });

  // Form
  const form = useForm<PurchaseSubscriptionDto>({
    initialValues: {
      productIds: [],
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardholderName: '',
    },
    validate: {
      cardNumber: (value) => {
        if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) {
          return 'Card number must be 16 digits';
        }
        return null;
      },
      cardExpiry: (value) => {
        if (!/^\d{2}\/\d{2}$/.test(value)) {
          return 'Expiry must be in MM/YY format';
        }
        const [month] = value.split('/').map(Number);
        if (month < 1 || month > 12) {
          return 'Invalid month';
        }
        return null;
      },
      cardCvv: (value) => {
        if (!/^\d{3,4}$/.test(value)) {
          return 'CVV must be 3 or 4 digits';
        }
        return null;
      },
      cardholderName: (value) => value.trim() ? null : 'Cardholder name is required',
    },
  });

  // Filter subscription products
  const subscriptionProducts = products?.filter(p => p.type === 'subscription' && p.isActive) || [];
  
  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId);
  };

  const handlePurchase = (values: PurchaseSubscriptionDto) => {
    if (!selectedProduct) return;
    
    purchaseMutation.mutate({
      ...values,
      productIds: [selectedProduct],
      cardNumber: values.cardNumber.replace(/\s/g, ''),
    });
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  if (productsLoading) {
    return (
      <div className={styles.loading}>
        <Loader size="lg" />
      </div>
    );
  }

  if (productsError) {
    return (
      <div className={styles.error}>
        <IconAlertCircle size={48} />
        <Title order={3} mt="md">Failed to load subscription plans</Title>
        <Text c="dimmed">Please try again later</Text>
      </div>
    );
  }

  const selectedProductDetails = subscriptionProducts.find(p => p.id === selectedProduct);
  const monthlyPrice = selectedProductDetails?.productPrices.find(p => p.interval === 'monthly' && p.isActive);

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <Title className={styles.header__title}>Choose Your Plan</Title>
        <Text className={styles.header__subtitle}>
          Select a subscription plan to get started
        </Text>
      </div>

      {activeSubscription && (
        <Alert 
          icon={<IconCheck />} 
          color="green" 
          variant="light"
          mb="xl"
        >
          You already have an active subscription
        </Alert>
      )}

      <div className={styles.plans}>
        {subscriptionProducts.map((product) => {
          const monthlyPrice = product.productPrices.find(p => p.interval === 'monthly' && p.isActive);
          const isCurrentPlan = activeSubscription?.products?.some(p => p.id === product.id) || false;
          const isSelected = selectedProduct === product.id;
          const isDisabled = isCurrentPlan || activeSubscription !== null;
          
          return (
            <Card
              key={product.id}
              className={`${styles.planCard} ${isSelected ? styles['planCard--selected'] : ''} ${isCurrentPlan ? styles['planCard--current'] : ''}`}
              onClick={() => !isDisabled && handleSelectProduct(product.id)}
              style={{ opacity: isDisabled && !isCurrentPlan ? 0.6 : 1 }}
            >
              <div className={styles.planCard__content}>
                <div className={styles.planCard__info}>
                  <Text className={styles.planCard__name}>
                    {product.name}
                    {isCurrentPlan && (
                      <Badge 
                        color="green" 
                        variant="light" 
                        size="sm"
                        className={styles.planCard__badge}
                      >
                        Current
                      </Badge>
                    )}
                  </Text>
                  
                  {monthlyPrice && (
                    <Text className={styles.planCard__price}>
                      ${(monthlyPrice.amount / 100).toFixed(2)}/mo
                    </Text>
                  )}
                  
                  <Text className={styles.planCard__tokens}>
                    {product.baseTokensPerMonth?.toLocaleString() || 'N/A'} tokens
                  </Text>
                </div>
                
                <Button
                  size="sm"
                  variant={isSelected ? 'filled' : 'light'}
                  disabled={isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    !isDisabled && handleSelectProduct(product.id);
                  }}
                >
                  {isCurrentPlan ? 'Current Plan' : isSelected ? 'Selected' : 'Select'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedProduct && (
        <Card className={styles.checkout}>
          <Title order={4} className={styles.checkout__title}>
            Complete Your Purchase
          </Title>

          <div className={styles.checkout__testCard}>
            <Group gap="xs">
              <IconCreditCard size={16} />
              <Text size="sm" fw={500}>Test Mode</Text>
            </Group>
            <Text className={styles.checkout__testCard__number}>
              Use card: 4242 4242 4242 4242
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handlePurchase)} className={styles.checkout__form}>
            <Group grow>
              <TextInput
                label="Cardholder Name"
                placeholder="John Doe"
                required
                {...form.getInputProps('cardholderName')}
              />
              <TextInput
                label="Card Number"
                placeholder="4242 4242 4242 4242"
                required
                maxLength={19}
                value={formatCardNumber(form.values.cardNumber)}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '');
                  if (/^\d*$/.test(value) && value.length <= 16) {
                    form.setFieldValue('cardNumber', value);
                  }
                }}
                error={form.errors.cardNumber}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Expiry (MM/YY)"
                placeholder="12/25"
                required
                maxLength={5}
                value={form.values.cardExpiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  }
                  form.setFieldValue('cardExpiry', value);
                }}
                error={form.errors.cardExpiry}
              />
              <TextInput
                label="CVV"
                placeholder="123"
                required
                maxLength={4}
                {...form.getInputProps('cardCvv')}
              />
            </Group>

            <Group mt="md">
              <Button
                type="submit"
                loading={purchaseMutation.isPending}
                leftSection={<IconCreditCard size={18} />}
              >
                Subscribe for ${monthlyPrice ? (monthlyPrice.amount / 100).toFixed(2) : '0'}/month
              </Button>
              <Button
                variant="subtle"
                onClick={() => setSelectedProduct(null)}
              >
                Cancel
              </Button>
            </Group>
          </form>
        </Card>
      )}
    </Container>
  );
}