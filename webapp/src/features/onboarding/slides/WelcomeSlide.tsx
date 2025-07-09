import { Stack, Title, Text, Paper, Group, Badge, Box } from '@mantine/core';
import { IconRocket, IconBook, IconShieldCheck } from '@tabler/icons-react';
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

const featureVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.5 + i * 0.1,
      duration: 0.4,
      ease: 'backOut',
    },
  }),
};

export function WelcomeSlide() {
  const features = [
    {
      icon: IconBook,
      title: 'Official Documentation',
      description: 'FCOM, QRH, MEL, OM-A, FCTM',
      color: 'blue',
    },
    {
      icon: IconRocket,
      title: 'Fast & Accurate',
      description: 'Instant answers when you need them',
      color: 'green',
    },
    {
      icon: IconShieldCheck,
      title: 'Regulation Compliant',
      description: 'Built for El Al pilots',
      color: 'indigo',
    },
  ];
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Stack className={styles.slideContent} gap="xl" style={{ paddingTop: 0 }}>
        <Stack gap="md" align="center" ta="center">
          <motion.div variants={itemVariants}>
            <Badge size="lg" radius="sm" variant="light" color="blue">
              BETA
            </Badge>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Title order={2} ta="center">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ display: 'inline-block' }}
              >
                👋
              </motion.span>{' '}
              Welcome to ACE
            </Title>
            <Text size="xl" fw={600} c="blue" ta="center">
              Aviaite Co-pilot Expert
            </Text>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Text size="lg" c="dimmed" ta="center" maw={500}>
              Your AI assistant for aircraft procedures, technical references, 
              and company policies – built exclusively for El Al pilots.
            </Text>
          </motion.div>
        </Stack>
        
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Box visibleFrom="sm">
            <Group grow gap="sm" align="stretch">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={featureVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'flex' }}
                >
                  <Paper 
                    p="md" 
                    radius="md" 
                    withBorder
                    style={{
                      width: '100%',
                      borderColor: `var(--mantine-color-${feature.color}-2)`,
                      backgroundColor: `var(--mantine-color-${feature.color}-0)`,
                    }}
                  >
                    <Stack gap="xs" align="center" ta="center" h="100%">
                      <feature.icon 
                        size={28} 
                        color={`var(--mantine-color-${feature.color}-6)`}
                      />
                      <Text fw={600} size="sm">{feature.title}</Text>
                      <Text size="xs" c="dimmed">{feature.description}</Text>
                    </Stack>
                  </Paper>
                </motion.div>
              ))}
            </Group>
          </Box>
          
          <Stack gap="sm" hiddenFrom="sm">
            {features.map((feature, i) => (
              <motion.div
                key={`mobile-${i}`}
                custom={i}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
              >
                <Paper 
                  p="md" 
                  radius="md" 
                  withBorder
                  style={{
                    borderColor: `var(--mantine-color-${feature.color}-2)`,
                    backgroundColor: `var(--mantine-color-${feature.color}-0)`,
                  }}
                >
                  <Group gap="md" align="center">
                    <feature.icon 
                      size={28} 
                      color={`var(--mantine-color-${feature.color}-6)`}
                      style={{ flexShrink: 0 }}
                    />
                    <Stack gap="xs" style={{ flex: 1 }} align="center">
                      <Text fw={600} size="sm" ta="center">{feature.title}</Text>
                      <Text size="xs" c="dimmed" ta="center">{feature.description}</Text>
                    </Stack>
                  </Group>
                </Paper>
              </motion.div>
            ))}
          </Stack>
        </Box>
      </Stack>
    </motion.div>
  );
}