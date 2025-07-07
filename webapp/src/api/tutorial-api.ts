import { api } from './index';

export interface TutorialStatus {
  id: string;
  userId: string;
  tutorialId: string;
  completedAt: Date | null;
  skippedAt: Date | null;
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateTutorialProgressDto {
  currentStep: number;
}

export const tutorialApi = {
  getTutorialStatus: async (tutorialId: string): Promise<TutorialStatus> => {
    const response = await api.get<TutorialStatus>(`/api/users/tutorial-status/${tutorialId}`);
    return response.data;
  },

  completeTutorial: async (tutorialId: string): Promise<TutorialStatus> => {
    const response = await api.post<TutorialStatus>(`/api/users/tutorial-status/${tutorialId}/complete`);
    return response.data;
  },

  skipTutorial: async (tutorialId: string): Promise<TutorialStatus> => {
    const response = await api.post<TutorialStatus>(`/api/users/tutorial-status/${tutorialId}/skip`);
    return response.data;
  },

  updateProgress: async (tutorialId: string, currentStep: number): Promise<TutorialStatus> => {
    const response = await api.patch<TutorialStatus>(
      `/api/users/tutorial-status/${tutorialId}/progress`,
      { currentStep }
    );
    return response.data;
  },
};