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
  Radio
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { 
  IconCheck, 
  IconCreditCard, 
  IconAlertCircle,
  IconX,
  IconCircleCheck,
  IconPlane
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  getProducts, 
  getActiveSubscription, 
  purchaseSubscription,
  type PurchaseSubscriptionDto 
} from '../../api/subscriptions-api';
import styles from './SubscriptionPlansAircraft.module.scss';

export function SubscriptionPlansAircraft() {
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

  // Filter and group products
  const subscriptionProducts = products?.filter(p => p.type === 'subscription' && p.isActive) || [];
  
  const aircraftGroups = {
    '737': subscriptionProducts.filter(p => p.name.startsWith('737')),
    '787': subscriptionProducts.filter(p => p.name.startsWith('787'))
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

  const getPlanLevel = (name: string) => {
    if (name.includes('Starter')) return 'Starter';
    if (name.includes('Professional')) return 'Professional';
    if (name.includes('Max')) return 'Max';
    return '';
  };

  const getPlanDescription = (level: string) => {
    switch (level) {
      case 'Starter': return '100K tokens/month • Basic support';
      case 'Professional': return '500K tokens/month • Priority support';
      case 'Max': return '2M tokens/month • Premium support';
      default: return '';
    }
  };

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <Title className={styles.header__title}>Choose Your Aircraft Assistant</Title>
        <Text className={styles.header__subtitle}>
          Select your preferred Boeing aircraft model and subscription plan
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

      <div className={styles.aircraftCards}>
        {Object.entries(aircraftGroups).map(([aircraft, products]) => (
          <Card key={aircraft} className={styles.aircraftCard}>
            <div className={styles.aircraftCard__header}>
              <Title order={2} className={styles.aircraftCard__title}>
                Boeing {aircraft}
              </Title>
              <div className={styles.aircraftCard__icon}>
                <IconPlane size={28} />
              </div>
            </div>

            <Radio.Group
              value={selectedProduct}
              onChange={setSelectedProduct}
            >
              <div className={styles.aircraftCard__plans}>
                {products
                  .sort((a, b) => {
                    const order = ['Starter', 'Professional', 'Max'];
                    return order.indexOf(getPlanLevel(a.name)) - order.indexOf(getPlanLevel(b.name));
                  })
                  .map((product) => {
                    const monthlyPrice = product.productPrices.find(p => p.interval === 'monthly' && p.isActive);
                    const isCurrentPlan = activeSubscription?.products?.some(p => p.id === product.id) || false;
                    const isDisabled = activeSubscription !== null;
                    const level = getPlanLevel(product.name);

                    return (
                      <label
                        key={product.id}
                        className={`${styles.planOption} ${selectedProduct === product.id ? styles['planOption--selected'] : ''} ${isCurrentPlan ? styles['planOption--current'] : ''}`}
                        style={{ opacity: isDisabled && !isCurrentPlan ? 0.6 : 1 }}
                      >
                        <div className={styles.planOption__content}>
                          <Radio value={product.id} disabled={isDisabled} style={{ display: 'none' }} />
                          <div className={styles.planOption__info}>
                            <Text className={styles.planOption__name}>
                              {level}
                              {isCurrentPlan && (
                                <Badge 
                                  color="green" 
                                  variant="light" 
                                  size="xs"
                                  ml="xs"
                                >
                                  Current
                                </Badge>
                              )}
                            </Text>
                            <Text className={styles.planOption__details}>
                              {getPlanDescription(level)}
                            </Text>
                          </div>
                          {monthlyPrice && (
                            <Text className={styles.planOption__price}>
                              ${(monthlyPrice.amount / 100).toFixed(2)}/mo
                            </Text>
                          )}
                        </div>
                      </label>
                    );
                  })}
              </div>
            </Radio.Group>
          </Card>
        ))}
      </div>

      {selectedProduct && (
        <Card className={styles.checkout}>
          <Title order={4} className={styles.checkout__title}>
            Complete Your Purchase
          </Title>

          <div className={styles.checkout__selectedPlan}>
            <Group justify="space-between">
              <Text fw={600}>
                Selected Plan: {selectedProductDetails?.name}
              </Text>
              <Text fw={700} c="blue">
                ${monthlyPrice ? (monthlyPrice.amount / 100).toFixed(2) : '0'}/month
              </Text>
            </Group>
          </div>

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
                Subscribe Now
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