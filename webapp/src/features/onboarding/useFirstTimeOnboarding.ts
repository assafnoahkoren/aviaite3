import { useEffect } from 'react';
import { tutorialApi } from '../../api/tutorial-api';
import { createMainTour, MAIN_TOUR_ID } from './tours/mainTour';
import 'shepherd.js/dist/css/shepherd.css';
import './tours/shepherd-theme.scss';

export const useFirstTimeOnboarding = () => {
  useEffect(() => {
    let tour: any = null;

    const initializeTour = async () => {
      try {
        // Check if user has already completed or skipped the tour
        const status = await tutorialApi.getTutorialStatus(MAIN_TOUR_ID);
        
        if (status.completedAt || status.skippedAt) {
          return; // Don't show tour if already completed or skipped
        }

        // Create and configure the tour
        tour = createMainTour();

        // Track progress
        tour.on('show', async () => {
          const currentStepIndex = tour.getCurrentStep()?.id ? 
            tour.steps.findIndex((step: any) => step.id === tour.getCurrentStep()?.id) : 0;
          
          try {
            await tutorialApi.updateProgress(MAIN_TOUR_ID, currentStepIndex);
          } catch (error) {
            console.error('Failed to update tutorial progress:', error);
          }
        });

        // Handle tour completion
        tour.on('complete', async () => {
          try {
            await tutorialApi.completeTutorial(MAIN_TOUR_ID);
          } catch (error) {
            console.error('Failed to mark tutorial as complete:', error);
          }
        });

        // Handle tour cancellation
        tour.on('cancel', async () => {
          try {
            await tutorialApi.skipTutorial(MAIN_TOUR_ID);
          } catch (error) {
            console.error('Failed to mark tutorial as skipped:', error);
          }
        });

        // Start the tour after a short delay to ensure DOM is ready
        setTimeout(() => {
          tour.start();
          
          // Resume from saved step if needed
          if (status.currentStep > 0) {
            for (let i = 0; i < status.currentStep; i++) {
              tour.next();
            }
          }
        }, 1000);

      } catch (error) {
        console.error('Failed to initialize onboarding tour:', error);
      }
    };

    initializeTour();

    // Cleanup
    return () => {
      if (tour) {
        tour.complete();
      }
    };
  }, []);
};