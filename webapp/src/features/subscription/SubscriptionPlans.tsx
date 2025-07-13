import { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Button, 
  Stack, 
  Group, 
  TextInput, 
  Alert,
  Loader,
  Badge,
  List,
  ThemeIcon,
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
import styles from './SubscriptionPlans.module.scss';

export function SubscriptionPlans() {
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

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
      // Redirect to home or dashboard
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
      billingAddress: '',
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

  // Debug: Log what we're getting from the API
  console.log('Products from API:', products);
  
  // Filter subscription products
  const subscriptionProducts = products?.filter(p => p.type === 'subscription' && p.isActive) || [];
  console.log('Filtered subscription products:', subscriptionProducts);
  
  // Calculate total price
  const selectedProductDetails = subscriptionProducts.filter(p => selectedProducts.includes(p.id));
  const totalPrice = selectedProductDetails.reduce((sum, product) => {
    const monthlyPrice = product.productPrices.find(p => p.interval === 'monthly' && p.isActive);
    return sum + (monthlyPrice?.amount || 0);
  }, 0);

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts([productId]); // Only allow one product selection
    setShowCheckout(true);
  };

  const handlePurchase = (values: PurchaseSubscriptionDto) => {
    purchaseMutation.mutate({
      ...values,
      productIds: selectedProducts,
      cardNumber: values.cardNumber.replace(/\s/g, ''), // Remove spaces
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
    console.error('Products error:', productsError);
    return (
      <div className={styles.error}>
        <IconAlertCircle size={48} className={styles.error__icon} />
        <Title order={3}>Failed to load subscription plans</Title>
        <Text c="dimmed">Please try again later</Text>
        <Text size="sm" c="red" mt="sm">{(productsError as any)?.message}</Text>
      </div>
    );
  }

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <Title className={styles.header__title}>Choose Your Plan</Title>
        <Text className={styles.header__subtitle}>
          Select the perfect subscription plan for your needs
        </Text>
      </div>

      {activeSubscription && (
        <Alert 
          icon={<IconCheck />} 
          color="green" 
          variant="light"
          mb="xl"
        >
          You already have an active subscription with {activeSubscription.products.map(p => p.name).join(', ')}
        </Alert>
      )}

      <div className={styles.plans}>
        {subscriptionProducts.map((product) => {
          const monthlyPrice = product.productPrices.find(p => p.interval === 'monthly' && p.isActive);
          const isCurrentPlan = activeSubscription?.products?.some(p => p.id === product.id) || false;
          const isRecommended = product.name.toLowerCase() === 'professional';
          
          return (
            <Card 
              key={product.id} 
              className={`${styles.plan} ${isRecommended ? styles['plan--recommended'] : ''} ${isCurrentPlan ? styles['plan--current'] : ''}`}
            >
              <Stack>
                <div>
                  <Group justify="space-between" align="flex-start">
                    <Title order={3} className={styles.plan__name}>
                      {product.name}
                    </Title>
                    {isCurrentPlan && (
                      <Badge color="green" variant="filled">Current Plan</Badge>
                    )}
                  </Group>
                  
                  {monthlyPrice && (
                    <div className={styles.plan__price}>
                      <span className={styles.plan__price__amount}>
                        ${(monthlyPrice.amount / 100).toFixed(0)}
                      </span>
                      <span className={styles.plan__price__period}>/month</span>
                    </div>
                  )}
                  
                  <Text className={styles.plan__description}>
                    {product.description || getProductDescription(product.name)}
                  </Text>
                </div>

                {product.baseTokensPerMonth && (
                  <div className={styles.plan__tokens}>
                    <div className={styles.plan__tokens__amount}>
                      {product.baseTokensPerMonth.toLocaleString()}
                    </div>
                    <div className={styles.plan__tokens__label}>
                      Tokens per month
                    </div>
                  </div>
                )}

                <List
                  spacing="sm"
                  size="sm"
                  className={styles.plan__features}
                  icon={
                    <ThemeIcon color="green" size={20} radius="xl">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  }
                >
                  {getProductFeatures(product.name).map((feature, index) => (
                    <List.Item key={index}>{feature}</List.Item>
                  ))}
                </List>

                <Button
                  fullWidth
                  size="md"
                  disabled={isCurrentPlan || activeSubscription !== null}
                  onClick={() => handleSelectProduct(product.id)}
                  variant={isRecommended ? 'filled' : 'light'}
                >
                  {isCurrentPlan ? 'Current Plan' : activeSubscription ? 'Already Subscribed' : 'Select Plan'}
                </Button>
              </Stack>
            </Card>
          );
        })}
      </div>

      {showCheckout && selectedProducts.length > 0 && (
        <Card className={styles.checkout}>
          <Title order={3} className={styles.checkout__title}>
            Complete Your Purchase
          </Title>

          <div className={styles.checkout__summary}>
            {selectedProductDetails.map(product => (
              <div key={product.id} className={styles.checkout__summary__row}>
                <Text>{product.name} Plan</Text>
                <Text fw={500}>
                  ${((product.productPrices.find(p => p.interval === 'monthly')?.amount || 0) / 100).toFixed(2)}
                </Text>
              </div>
            ))}
            <div className={`${styles.checkout__summary__row} ${styles['checkout__summary__row--total']}`}>
              <Text>Total (Monthly)</Text>
              <Text>${(totalPrice / 100).toFixed(2)}</Text>
            </div>
          </div>

          <div className={styles.checkout__testCard}>
            <div className={styles.checkout__testCard__title}>
              <IconCreditCard size={16} style={{ display: 'inline', marginRight: 4 }} />
              Test Mode - Use this card:
            </div>
            <div className={styles.checkout__testCard__number}>4242 4242 4242 4242</div>
            <Text size="xs" c="dimmed" mt={4}>
              Use any future expiry date and any 3-digit CVV
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handlePurchase)} className={styles.checkout__form}>
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

            <Group grow>
              <TextInput
                label="Expiry Date"
                placeholder="MM/YY"
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

            <TextInput
              label="Billing Address (Optional)"
              placeholder="123 Main St, City, State 12345"
              {...form.getInputProps('billingAddress')}
            />

            <Divider my="md" />

            <Group>
              <Button
                type="submit"
                size="md"
                loading={purchaseMutation.isPending}
                leftSection={<IconCreditCard size={20} />}
              >
                Subscribe for ${(totalPrice / 100).toFixed(2)}/month
              </Button>
              <Button
                variant="subtle"
                onClick={() => {
                  setShowCheckout(false);
                  setSelectedProducts([]);
                }}
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

// Helper functions
function getProductDescription(productName: string): string {
  const descriptions: Record<string, string> = {
    starter: 'Perfect for individuals getting started with AI assistance',
    professional: 'Ideal for power users and small teams',
    enterprise: 'Custom solutions for large organizations',
    'ace-737': 'Access to Boeing 737 AI assistant',
    'ace-787': 'Access to Boeing 787 AI assistant',
  };
  return descriptions[productName.toLowerCase()] || 'AI-powered assistance for your needs';
}

function getProductFeatures(productName: string): string[] {
  const features: Record<string, string[]> = {
    starter: [
      'Basic AI assistance',
      'Email support',
      'Standard response time',
      'Access to community features',
    ],
    professional: [
      'Advanced AI assistance',
      'Priority support',
      'Faster response times',
      'Access to all assistants',
      'Advanced analytics',
    ],
    enterprise: [
      'Custom AI solutions',
      'Dedicated support team',
      'Instant response times',
      'Custom integrations',
      'Advanced security features',
      'Usage analytics dashboard',
    ],
    'ace-737': [
      'Boeing 737 specialized AI',
      'Technical documentation access',
      'Flight operations support',
      'Maintenance guidance',
    ],
    'ace-787': [
      'Boeing 787 specialized AI',
      'Advanced systems knowledge',
      'Performance optimization',
      'Troubleshooting assistance',
    ],
  };
  return features[productName.toLowerCase()] || [
    'AI-powered assistance',
    'Regular updates',
    'Secure and private',
    'Easy to use interface',
  ];
}