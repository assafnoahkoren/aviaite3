import { useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  TextInput, 
  Alert,
  Loader,
  Card
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { 
  IconCheck, 
  IconCreditCard, 
  IconX,
  IconCircleCheck,
  IconArrowLeft,
  IconPlane
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  getProducts, 
  purchaseSubscription,
  type PurchaseSubscriptionDto 
} from '../../api/subscriptions-api';
import styles from './SubscriptionCheckout.module.scss';

export function SubscriptionCheckout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product');

  // Get product from location state or fetch it
  const productFromState = location.state?.product;
  
  console.log('Product ID from URL:', productId);
  console.log('Product from state:', productFromState);

  // Fetch all products if we don't have the product data
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    enabled: !productFromState && !!productId,
  });

  // Get the selected product
  const selectedProduct = productFromState || products?.find((p: any) => p.id === productId);
  const monthlyPrice = selectedProduct?.productPrices?.find((p: any) => p.interval === 'monthly' && p.isActive);

  // Redirect if no product selected
  useEffect(() => {
    if (!productId || (!selectedProduct && !productsLoading)) {
      navigate('/subscription/plans');
    }
  }, [productId, selectedProduct, productsLoading, navigate]);

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
      setTimeout(() => navigate('/'), 1500);
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
      productIds: productId ? [productId] : [],
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

  const handlePurchase = (values: PurchaseSubscriptionDto) => {
    if (!productId) {
      notifications.show({
        title: 'Error',
        message: 'No product selected',
        color: 'red',
        icon: <IconX />,
      });
      return;
    }
    
    const purchaseData = {
      ...values,
      productIds: [productId],
      cardNumber: values.cardNumber.replace(/\s/g, ''),
    };
    console.log('Purchasing with data:', purchaseData);
    purchaseMutation.mutate(purchaseData);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  if (productsLoading || !selectedProduct) {
    return (
      <Container className={styles.container}>
        <div className={styles.loading}>
          <Loader size="lg" />
        </div>
      </Container>
    );
  }

  const getAircraftModel = (name: string) => name.includes('737') ? '737' : '787';
  const aircraftModel = getAircraftModel(selectedProduct.name);

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <a href="/subscription/plans" className={styles.backButton}>
          <IconArrowLeft size={20} />
          <Text size="sm">Back to Plans</Text>
        </a>
        <Title className={styles.header__title}>Complete Your Purchase</Title>
        <Text className={styles.header__subtitle}>
          Secure checkout powered by advanced encryption
        </Text>
      </div>

      <div className={styles.content}>
        {/* Product Summary */}
        <Card className={styles.productSummary}>
          <div className={styles.productSummary__header}>
            <Text size="sm" c="dimmed" fw={600} mb="md">Order Summary</Text>
          </div>
          
          <div className={styles.productSummary__product}>
            <div className={styles.productSummary__icon}>
              <IconPlane size={30} />
            </div>
            <div>
              <Text fw={700} size="lg">Boeing {aircraftModel}</Text>
              <Text c="dimmed" size="sm">Advanced AI Assistant</Text>
              <Text c="dimmed" size="xs" mt={4}>Unlimited tokens per month</Text>
            </div>
          </div>

          <div className={styles.productSummary__pricing}>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">Monthly subscription</Text>
              <Text size="sm" fw={600}>${monthlyPrice ? (monthlyPrice.amount / 100).toFixed(2) : '0'}</Text>
            </Group>
            <div className={styles.productSummary__total}>
              <Text fw={600}>Total due today</Text>
              <Text fw={700} size="xl">${monthlyPrice ? (monthlyPrice.amount / 100).toFixed(2) : '0'}</Text>
            </div>
          </div>
        </Card>

        {/* Payment Form */}
        <Card className={styles.paymentForm}>
          <div className={styles.paymentForm__header}>
            <Title order={3} mb="xs">Payment Information</Title>
            <Text c="dimmed" size="sm">Enter your payment details below</Text>
          </div>

          <div className={styles.testCard}>
            <div className={styles.testCard__label}>Test Mode</div>
            <div className={styles.testCard__number}>
              4242 4242 4242 4242
            </div>
            <div className={styles.testCard__hint}>Use any future expiry • Any 3-digit CVV</div>
          </div>

          <form onSubmit={form.onSubmit(handlePurchase)}>
            <TextInput
              label="Cardholder Name"
              placeholder="John Doe"
              required
              mb="md"
              {...form.getInputProps('cardholderName')}
            />

            <TextInput
              label="Card Number"
              placeholder="4242 4242 4242 4242"
              required
              mb="md"
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

            <Group grow mb="lg">
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

            <Alert color="gray" variant="light" mb="lg">
              <Group gap="xs">
                <IconCheck size={16} />
                <Text size="sm">Your subscription will renew automatically each month</Text>
              </Group>
            </Alert>

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={purchaseMutation.isPending}
              leftSection={<IconCreditCard size={20} />}
              className={styles.submitButton}
            >
              Complete Purchase • ${monthlyPrice ? (monthlyPrice.amount / 100).toFixed(2) : '0'}/mo
            </Button>

            <Text size="xs" c="dimmed" ta="center" mt="md">
              By confirming your purchase, you agree to our terms of service and privacy policy.
              You can cancel your subscription at any time.
            </Text>
          </form>
        </Card>
      </div>
    </Container>
  );
}