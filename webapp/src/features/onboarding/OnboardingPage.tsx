import { useState } from 'react';
import { Card, Button, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconRocket } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  useOnboardingStatus, 
  useUpdateOnboardingProgress,
  useCompleteOnboarding 
} from '../../api/onboarding-api';
import { WelcomeSlide } from './slides/WelcomeSlide';
import { FleetSelectionSlide } from './slides/FleetSelectionSlide';
import { SubscriptionInfoSlide } from './slides/SubscriptionInfoSlide';
import { HowItWorksSlide } from './slides/HowItWorksSlide';
import { TipsSlide } from './slides/TipsSlide';
import { ReadySlide } from './slides/ReadySlide';
import styles from './OnboardingPage.module.scss';

const TOTAL_SLIDES = 6;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { isLoading } = useOnboardingStatus();
  const updateProgress = useUpdateOnboardingProgress();
  const completeMutation = useCompleteOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedFleet, setSelectedFleet] = useState<string>('');

  const handleNext = async () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      
      // Save progress, including fleet selection after slide 1
      if (currentSlide === 1 && selectedFleet) {
        await updateProgress.mutateAsync({
          currentStep: nextSlide,
          stepData: {
            preferences: {
              fleet: selectedFleet, // Save just "737" or "787"
              completed: true,
            },
          },
        });
      } else {
        await updateProgress.mutateAsync({
          currentStep: nextSlide,
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = async () => {
    await updateProgress.mutateAsync({
      currentStep: TOTAL_SLIDES,
      stepData: {
        welcome: {
          completed: true,
        },
      },
    });
    await completeMutation.mutateAsync();
    navigate('/');
  };

  const canProceed = () => {
    if (currentSlide === 1) {
      return !!selectedFleet;
    }
    // Can't proceed from subscription info slide if no fleet selected
    if (currentSlide === 2 && !selectedFleet) {
      return false;
    }
    return true;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Text>Loading...</Text>
      </div>
    );
  }

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <WelcomeSlide />;
      case 1:
        return (
          <FleetSelectionSlide 
            selectedFleet={selectedFleet}
            onFleetSelect={setSelectedFleet}
          />
        );
      case 2:
        return <SubscriptionInfoSlide selectedFleet={selectedFleet} />;
      case 3:
        return <HowItWorksSlide />;
      case 4:
        return <TipsSlide />;
      case 5:
        return <ReadySlide />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card} p="xl" radius="lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderSlide()}
          </motion.div>
        </AnimatePresence>

        <div className={styles.navigation}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="subtle"
              onClick={handlePrevious}
              disabled={currentSlide === 0}
            >
              Previous
            </Button>
          </div>
          
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div className={styles.dots}>
              {Array.from({ length: TOTAL_SLIDES }).map((_, index) => (
                <motion.div
                  key={index}
                  className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {currentSlide < TOTAL_SLIDES - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                loading={updateProgress.isPending}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                loading={completeMutation.isPending}
                leftSection={<IconRocket size={16} />}
              >
                Start Using ACE
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}