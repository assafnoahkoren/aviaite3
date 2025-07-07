import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { tutorialApi } from '../../api/tutorial-api';
import { createMainTour, MAIN_TOUR_ID } from './tours/mainTour';
import type Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import './tours/shepherd-theme.scss';

interface OnboardingContextType {
  startTour: () => void;
  skipTour: () => void;
  currentStep: number;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [tour, setTour] = useState<Shepherd.Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowTour, setShouldShowTour] = useState(false);

  // Check tutorial status on mount
  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const status = await tutorialApi.getTutorialStatus(MAIN_TOUR_ID);
        
        // Show tour if not completed or skipped
        if (!status.completedAt && !status.skippedAt) {
          setShouldShowTour(true);
          setCurrentStep(status.currentStep);
        }
      } catch (error) {
        console.error('Failed to fetch tutorial status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkTutorialStatus();
  }, []);

  // Initialize tour
  useEffect(() => {
    if (!shouldShowTour) return;

    const newTour = createMainTour();

    // Track progress
    newTour.on('show', async () => {
      const stepIndex = newTour.getCurrentStep()?.id ? 
        newTour.steps.findIndex(step => step.id === newTour.getCurrentStep()?.id) : 0;
      
      setCurrentStep(stepIndex);
      
      try {
        await tutorialApi.updateProgress(MAIN_TOUR_ID, stepIndex);
      } catch (error) {
        console.error('Failed to update tutorial progress:', error);
      }
    });

    // Handle tour completion
    newTour.on('complete', async () => {
      try {
        await tutorialApi.completeTutorial(MAIN_TOUR_ID);
        setShouldShowTour(false);
      } catch (error) {
        console.error('Failed to mark tutorial as complete:', error);
      }
    });

    // Handle tour cancellation
    newTour.on('cancel', async () => {
      try {
        await tutorialApi.skipTutorial(MAIN_TOUR_ID);
        setShouldShowTour(false);
      } catch (error) {
        console.error('Failed to mark tutorial as skipped:', error);
      }
    });

    setTour(newTour);

    // Start the tour automatically
    setTimeout(() => {
      newTour.start();
      if (currentStep > 0) {
        // Resume from saved step
        for (let i = 0; i < currentStep; i++) {
          newTour.next();
        }
      }
    }, 500); // Small delay to ensure DOM is ready

    return () => {
      newTour.complete();
    };
  }, [shouldShowTour, currentStep]);

  const startTour = useCallback(() => {
    if (tour) {
      tour.start();
    }
  }, [tour]);

  const skipTour = useCallback(() => {
    if (tour) {
      tour.cancel();
    }
  }, [tour]);

  return (
    <OnboardingContext.Provider value={{ startTour, skipTour, currentStep, isLoading }}>
      {children}
    </OnboardingContext.Provider>
  );
};