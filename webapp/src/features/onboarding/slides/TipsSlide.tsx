import { Stack, Title, Text, Card, Group } from '@mantine/core';
import { IconLanguage, IconTarget, IconPlane, IconBook } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import styles from '../OnboardingPage.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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


const tipVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.15,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const iconVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
};

export function TipsSlide() {
  const tips = [
    {
      icon: IconLanguage,
      title: 'Write in English or Hebrew',
      content: 'ACE understands both. When using Hebrew, replies will be in Hebrew with key aviation terms in English.',
    },
    {
      icon: IconTarget,
      title: 'Be clear and specific',
      content: 'e.g., "Dual engine failure during climb"',
    },
    {
      icon: IconPlane,
      title: 'Use ACE before flights',
      content: 'when reviewing MELs, or clarifying SOPs',
    },
    {
      icon: IconBook,
      title: 'Every answer includes a manual reference',
      content: 'trust the source',
    },
  ];

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
              🔧
            </motion.span>{' '}
            Tips for Best Use
          </Title>
        </motion.div>
        
        <Stack gap="sm">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={tipVariants}
              initial="hidden"
              animate="visible"
            >
              <Card p="md" radius="md" withBorder>
                <Group gap="md" align="flex-start">
                  <motion.div variants={iconVariants}>
                    <tip.icon size={24} color="var(--mantine-color-blue-6)" />
                  </motion.div>
                  <Stack gap="xs" style={{ flex: 1 }}>
                    <Text fw={600} size="sm">{tip.title}</Text>
                    <Text size="sm" c="dimmed">{tip.content}</Text>
                  </Stack>
                </Group>
              </Card>
            </motion.div>
          ))}
        </Stack>
      </Stack>
    </motion.div>
  );
}