import { Stack, Title, Text, Paper, Group } from '@mantine/core';
import { IconShieldCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import styles from '../OnboardingPage.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
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


const paperVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.5,
      ease: 'backOut',
    },
  },
};

const shieldVariants = {
  hidden: { rotate: -180, scale: 0 },
  visible: {
    rotate: 0,
    scale: 1,
    transition: {
      delay: 0.7,
      duration: 0.5,
      ease: 'backOut',
    },
  },
};

export function ReadySlide() {
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
              🚀
            </motion.span>{' '}
            Ready? Ask your first question.
          </Title>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Text size="lg" c="dimmed">
            ACE is your co-pilot for procedures, performance, and precision.
          </Text>
        </motion.div>
        
        <motion.div variants={paperVariants}>
          <Paper p="xl" radius="md" bg="blue.0" mt="lg">
            <Stack gap="md">
              <Group>
                <motion.div variants={shieldVariants}>
                  <IconShieldCheck size={24} color="var(--mantine-color-blue-6)" />
                </motion.div>
                <Text fw={500} c="blue.7">Important Note</Text>
              </Group>
              <motion.div variants={itemVariants}>
                <Text c="blue.7">
                  This is a powerful support tool – but in the end, you are the captain.
                  Use your judgment.
                </Text>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Text c="blue.7">
                  And if something's unclear – just ask.
                </Text>
              </motion.div>
            </Stack>
          </Paper>
        </motion.div>
      </Stack>
    </motion.div>
  );
}