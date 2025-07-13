import { Stack, Title, Text, Paper, Group, Badge, ThemeIcon } from '@mantine/core';
import { IconGift, IconCheck, IconCurrencyDollar } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import styles from '../OnboardingPage.module.scss';

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

const giftVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.3,
    },
  },
};

interface SubscriptionInfoSlideProps {
  selectedFleet: string;
}

export function SubscriptionInfoSlide({ selectedFleet }: SubscriptionInfoSlideProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Stack className={styles.slideContent} gap="xl">
        <motion.div variants={itemVariants}>
          <Title order={2} ta="center">
            <motion.span
              variants={giftVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'inline-block' }}
            >
              <ThemeIcon size={60} radius="xl" variant="gradient" gradient={{ from: 'gold', to: 'yellow' }}>
                <IconGift size={35} />
              </ThemeIcon>
            </motion.span>
          </Title>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Title order={3} ta="center">
            You're Getting a Free Month!
          </Title>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Text size="lg" c="dimmed" ta="center">
            Your {selectedFleet === '737' ? 'Boeing 737' : 'Boeing 787'} Assistant subscription
          </Text>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Paper p="xl" radius="md" withBorder bg="gray.0">
            <Stack gap="md">
              <Group justify="center" gap="xs">
                <Text size="sm" c="dimmed" style={{ textDecoration: 'line-through' }}>
                  $19.00/month
                </Text>
                <Badge size="lg" variant="gradient" gradient={{ from: 'teal', to: 'lime' }}>
                  FREE for 1 month!
                </Badge>
              </Group>

              <Stack gap="sm">
                <Group gap="xs">
                  <ThemeIcon size="sm" radius="xl" color="teal" variant="light">
                    <IconCheck size={16} />
                  </ThemeIcon>
                  <Text size="sm">Unlimited access to your AI assistant</Text>
                </Group>
                
                <Group gap="xs">
                  <ThemeIcon size="sm" radius="xl" color="teal" variant="light">
                    <IconCheck size={16} />
                  </ThemeIcon>
                  <Text size="sm">10 million tokens per month included</Text>
                </Group>
                
                <Group gap="xs">
                  <ThemeIcon size="sm" radius="xl" color="teal" variant="light">
                    <IconCheck size={16} />
                  </ThemeIcon>
                  <Text size="sm">Real-time answers to aviation questions</Text>
                </Group>
                
                <Group gap="xs">
                  <ThemeIcon size="sm" radius="xl" color="teal" variant="light">
                    <IconCheck size={16} />
                  </ThemeIcon>
                  <Text size="sm">Cancel anytime</Text>
                </Group>
              </Stack>

              <Paper p="md" radius="sm" bg="yellow.0" mt="md">
                <Group gap="sm">
                  <ThemeIcon size="md" radius="xl" color="yellow.7" variant="light">
                    <IconCurrencyDollar size={20} />
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="sm" fw={500}>After your free trial</Text>
                    <Text size="xs" c="dimmed">
                      Subscribe for $19/month to continue using the assistant
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </Stack>
          </Paper>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Text size="sm" c="dimmed" ta="center">
            No credit card required • No hidden fees
          </Text>
        </motion.div>
      </Stack>
    </motion.div>
  );
}