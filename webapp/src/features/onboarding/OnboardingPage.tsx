import { Container, Card, Title, Text, Button, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStatus, useCompleteOnboarding } from '../../api/onboarding-api';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useOnboardingStatus();
  const completeMutation = useCompleteOnboarding();

  const handleComplete = async () => {
    await completeMutation.mutateAsync();
    navigate('/');
  };

  if (isLoading) {
    return (
      <Container size="sm" mt="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="sm" mt="xl">
      <Card shadow="sm" p="lg" radius="md">
        <Stack>
          <Title order={2}>Welcome to Onboarding!</Title>
          <Text c="dimmed">
            This is a placeholder for the onboarding experience.
          </Text>
          <Text>
            Current Step: {data?.onboardingStatus?.currentStep || 0} of {data?.onboardingStatus?.totalSteps || 2}
          </Text>
          <Button 
            onClick={handleComplete}
            loading={completeMutation.isPending}
          >
            Complete Onboarding
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}