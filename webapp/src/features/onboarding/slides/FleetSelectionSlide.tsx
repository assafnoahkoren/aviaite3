import { Stack, Title, Text, Paper, Group } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import styles from '../OnboardingPage.module.scss';

interface FleetSelectionSlideProps {
  selectedFleet: string;
  onFleetSelect: (fleet: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};


const optionVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: 'backOut',
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.98,
  },
};

export function FleetSelectionSlide({ selectedFleet, onFleetSelect }: FleetSelectionSlideProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Stack className={styles.slideContent}>
        <motion.div variants={itemVariants}>
          <Title order={2}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ display: 'inline-block' }}
            >
              ✈️
            </motion.span>{' '}
            Choose Your Fleet
          </Title>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Text size="lg" c="dimmed" mb="lg">
            Please select your current aircraft
          </Text>
        </motion.div>
        
        <Stack gap="md">
          <motion.div variants={itemVariants}>
            <motion.div
              variants={optionVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Paper
                p="lg"
                radius="md"
                withBorder
                className={styles.fleetOption}
                style={{
                  borderColor: selectedFleet === 'B787' ? 'var(--mantine-color-blue-6)' : undefined,
                  borderWidth: selectedFleet === 'B787' ? 2 : 1,
                  cursor: 'pointer',
                }}
                onClick={() => onFleetSelect('B787')}
              >
                <Group justify="space-between" align="center">
                  <Text fw={500}>Boeing 787 Dreamliner</Text>
                  {selectedFleet === 'B787' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <IconCheck color="var(--mantine-color-blue-6)" />
                    </motion.div>
                  )}
                </Group>
              </Paper>
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <motion.div
              variants={optionVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Paper
                p="lg"
                radius="md"
                withBorder
                className={styles.fleetOption}
                style={{
                  borderColor: selectedFleet === 'B737' ? 'var(--mantine-color-blue-6)' : undefined,
                  borderWidth: selectedFleet === 'B737' ? 2 : 1,
                  cursor: 'pointer',
                }}
                onClick={() => onFleetSelect('B737')}
              >
                <Group justify="space-between" align="center">
                  <Text fw={500}>Boeing 737</Text>
                  {selectedFleet === 'B737' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      style={{ display: 'flex', alignItems: 'center' }}
                    >
                      <IconCheck color="var(--mantine-color-blue-6)" />
                    </motion.div>
                  )}
                </Group>
              </Paper>
            </motion.div>
          </motion.div>
        </Stack>
        
        <motion.div variants={itemVariants}>
          <Text size="sm" c="dimmed" ta="center">
            You can change this anytime in Settings
          </Text>
        </motion.div>
      </Stack>
    </motion.div>
  );
}