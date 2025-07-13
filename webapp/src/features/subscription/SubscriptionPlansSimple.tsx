import { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  TextInput, 
  Alert,
  Loader,
  Badge,
  Card,
  ThemeIcon
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { 
  IconCheck, 
  IconCreditCard, 
  IconAlertCircle,
  IconX,
  IconCircleCheck,
  IconPlane,
  IconArrowLeft,
  IconInfinity,
  IconRocket,
  IconHeadset,
  IconShieldCheck
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  getProducts, 
  getActiveSubscription, 
  purchaseSubscription,
  type PurchaseSubscriptionDto 
} from '../../api/subscriptions-api';
import styles from './SubscriptionPlansPrestige.module.scss';

export function SubscriptionPlansSimple() {
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

  const getAircraftModel = (name: string) => name.includes('737') ? '737' : '787';

  return (
    <Container className={styles.container}>
      <a href="/" className={styles.backButton}>
        <IconArrowLeft size={20} />
        <Text size="sm">Back to Home</Text>
      </a>

      <div className={styles.header}>
        <Title className={styles.header__title}>Premium Aircraft Intelligence</Title>
        <Text className={styles.header__subtitle}>
          Elevate your operations with unlimited AI assistance
        </Text>
        <div className={styles.header__badge}>
          <IconInfinity size={14} />
          <span>Unlimited Access</span>
        </div>
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

      <div className={`${styles.content} ${selectedProduct ? styles.contentWithCheckout : ''}`}>
        {subscriptionProducts.map((product) => {
          const monthlyPrice = product.productPrices.find(p => p.interval === 'monthly' && p.isActive);
          const isCurrentPlan = activeSubscription?.products?.some(p => p.id === product.id) || false;
          const isSelected = selectedProduct === product.id;
          const isDisabled = activeSubscription !== null;
          const aircraftModel = getAircraftModel(product.name);

          return (
            <Card
              key={product.id}
              className={`${styles.productCard} ${isSelected ? styles['productCard--selected'] : ''} ${isCurrentPlan ? styles['productCard--current'] : ''}`}
              onClick={() => !isDisabled && setSelectedProduct(product.id)}
              style={{ opacity: isDisabled && !isCurrentPlan ? 0.6 : 1 }}
            >
              <div className={styles.productCard__header}>
                <div className={styles.productCard__icon}>
                  <IconPlane />
                </div>
                <div className={styles.productCard__badge}>Boeing</div>
                <Title className={styles.productCard__title}>
                  {aircraftModel}
                  {isCurrentPlan && (
                    <Badge 
                      color="green" 
                      variant="light" 
                      size="sm"
                      ml="xs"
                    >
                      Current
                    </Badge>
                  )}
                </Title>
                <Text className={styles.productCard__subtitle}>
                  Advanced AI Assistant
                </Text>
              </div>

              <div className={styles.productCard__price}>
                {monthlyPrice && (
                  <>
                    <div className={styles.productCard__price__amount}>
                      ${(monthlyPrice.amount / 100).toFixed(2)}
                    </div>
                    <div className={styles.productCard__price__period}>
                      per month
                    </div>
                  </>
                )}
              </div>

              <Button
                fullWidth
                size="md"
                disabled={isDisabled}
                className={styles.productCard__button}
                onClick={(e) => {
                  e.stopPropagation();
                  !isDisabled && setSelectedProduct(product.id);
                }}
                styles={{
                  root: {
                    height: '48px',
                    backgroundColor: isSelected ? 'var(--mantine-color-gray-9)' : 'transparent',
                    color: isSelected ? 'white' : 'var(--mantine-color-gray-9)',
                    border: '2px solid var(--mantine-color-gray-9)',
                  }
                }}
              >
                {isCurrentPlan ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
              </Button>
            </Card>
          );
        })}

        {selectedProduct && (
          <Card className={styles.checkout}>
          <div className={styles.checkout__header}>
            <Title className={styles.checkout__title}>
              Secure Checkout
            </Title>
            <Text className={styles.checkout__subtitle}>
              Complete your purchase in seconds
            </Text>
          </div>

          <div className={styles.checkout__selectedPlan}>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed" mb={4}>Selected Plan</Text>
                <Text fw={700} size="lg">{selectedProductDetails?.name}</Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text fw={700} size="xl">${monthlyPrice ? (monthlyPrice.amount / 100).toFixed(2) : '0'}</Text>
                <Text size="xs" c="dimmed">per month</Text>
              </div>
            </Group>
          </div>

          <div className={styles.checkout__testCard}>
            <div className={styles.checkout__testCard__label}>Test Mode</div>
            <div className={styles.checkout__testCard__number}>
              4242 4242 4242 4242
            </div>
            <div className={styles.checkout__testCard__hint}>Use any future expiry • Any 3-digit CVV</div>
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

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={purchaseMutation.isPending}
              leftSection={<IconCreditCard size={20} />}
              className={styles.prestigeButton}
              mt="sm"
            >
              <span>Start Premium Access • ${monthlyPrice ? (monthlyPrice.amount / 100).toFixed(2) : '0'}/mo</span>
            </Button>
          </form>
        </Card>
      )}
      </div>
    </Container>
  );
}