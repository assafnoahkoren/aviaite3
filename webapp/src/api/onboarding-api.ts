import { api } from './index';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  totalSteps: number;
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

  completeOnboarding: async (): Promise<OnboardingResponse> => {
    const response = await api.post<OnboardingResponse>('/api/users/onboarding/complete');
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
  return useMutation({
    mutationFn: onboardingApi.updateProgress,
  });
};

export const useCompleteOnboarding = () => {
  return useMutation({
    mutationFn: onboardingApi.completeOnboarding,
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