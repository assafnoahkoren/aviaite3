import { api } from './index';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { OnboardingStatus, OnboardingStepData } from './models';

export interface OnboardingResponse {
  id: string;
  email: string;
  fullName: string | null;
  onboardingStatus: OnboardingStatus | null;
  onboardingCompletedAt: string | null;
}

export interface UpdateOnboardingDto {
  currentStep: number;
  stepData?: OnboardingStepData;
}

// API functions
export const onboardingApi = {
  getOnboardingStatus: async (): Promise<OnboardingResponse> => {
    const response = await api.get<OnboardingResponse>('/api/users/onboarding');
    return response.data;
  },

  updateProgress: async (data: UpdateOnboardingDto): Promise<OnboardingResponse> => {
    const response = await api.patch<OnboardingResponse>('/api/users/onboarding/progress', data);
    return response.data;
  },

  createTrialSubscription: async (): Promise<{ success: boolean; message: string; subscriptionExists?: boolean; subscription?: any }> => {
    const response = await api.post('/api/users/onboarding/trial-subscription');
    return response.data;
  },

  completeOnboarding: async (): Promise<OnboardingResponse> => {
    const response = await api.post<OnboardingResponse>('/api/users/onboarding/complete');
    return response.data;
  },

  resetOnboarding: async (): Promise<OnboardingResponse> => {
    const response = await api.post<OnboardingResponse>('/api/users/onboarding/reset');
    return response.data;
  },
};

// React Query hooks
export const useOnboardingStatus = () => {
  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: onboardingApi.getOnboardingStatus,
  });
};

export const useUpdateOnboardingProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: onboardingApi.updateProgress,
    onSuccess: () => {
      // Invalidate settings query to refresh the assistant selection
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      // Also invalidate onboarding status
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      // Force refetch all queries immediately
      queryClient.refetchQueries({ queryKey: ['settings'] });
    },
  });
};

export const useCreateTrialSubscription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: onboardingApi.createTrialSubscription,
    onSuccess: () => {
      // Invalidate subscription-related queries
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: onboardingApi.completeOnboarding,
    onSuccess: () => {
      // Invalidate queries to ensure UI is up to date
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useResetOnboarding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: onboardingApi.resetOnboarding,
    onSuccess: () => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

// Hook to check if onboarding is required
export const useIsOnboardingRequired = () => {
  const { data, isLoading } = useOnboardingStatus();
  
  const isRequired = !isLoading && data && !data.onboardingCompletedAt;
  const currentStep = data?.onboardingStatus?.currentStep || 0;
  
  return {
    isRequired,
    currentStep,
    isLoading,
  };
};