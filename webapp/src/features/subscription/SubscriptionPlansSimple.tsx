import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Alert,
  Loader,
  Badge,
  Card
} from '@mantine/core';
import { 
  IconCheck, 
  IconAlertCircle,
  IconPlane,
  IconArrowLeft,
  IconInfinity
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  getProducts, 
  getActiveSubscription
} from '../../api/subscriptions-api';
import styles from './SubscriptionPlansPrestige.module.scss';

export function SubscriptionPlansSimple() {
  const navigate = useNavigate();

  // Queries
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: activeSubscription } = useQuery({
    queryKey: ['activeSubscription'],
    queryFn: getActiveSubscription,
  });

  // Filter subscription products
  const subscriptionProducts = products?.filter(p => p.type === 'subscription' && p.isActive) || [];

  const handleSelectPlan = (product: any) => {
    navigate(`/subscription/checkout?product=${product.id}`, {
      state: { product }
    });
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

      <div className={styles.content}>
        {subscriptionProducts.map((product) => {
          const monthlyPrice = product.productPrices.find(p => p.interval === 'monthly' && p.isActive);
          const isCurrentPlan = activeSubscription?.products?.some(p => p.id === product.id) || false;
          const isDisabled = isCurrentPlan; // Only disable if it's the current plan
          const aircraftModel = getAircraftModel(product.name);

          return (
            <Card
              key={product.id}
              className={`${styles.productCard} ${isCurrentPlan ? styles['productCard--current'] : ''}`}
              style={{ opacity: isCurrentPlan ? 0.8 : 1 }}
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
                onClick={() => !isDisabled && handleSelectPlan(product)}
                styles={{
                  root: {
                    height: '48px',
                    backgroundColor: 'transparent',
                    color: 'var(--mantine-color-gray-9)',
                    border: '2px solid var(--mantine-color-gray-9)',
                  }
                }}
              >
                {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
              </Button>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}