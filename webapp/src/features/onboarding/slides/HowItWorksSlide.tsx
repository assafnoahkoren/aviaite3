import { Stack, Title, Text, Card, Group, Box } from '@mantine/core';
import { IconCheck, IconPaperclip, IconShieldCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import styles from '../OnboardingPage.module.scss';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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


const exampleVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

const blockVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8 + i * 0.1,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

export function HowItWorksSlide() {
  const examples = [
    "What is the CABIN ALTITUDE procedure?",
    "Can I depart with PACK L INOP?",
    "Where is NADP1 defined?",
  ];

  const results = [
    { 
      icon: IconCheck, 
      title: "A clear answer",
      subtitle: "to your specific question",
      color: "green"
    },
    { 
      icon: IconPaperclip, 
      title: "Direct source",
      subtitle: "eg., QRH, FCOM section",
      color: "blue"
    },
    { 
      icon: IconShieldCheck, 
      title: "Fully document-based",
      subtitle: "El Al policy compliant",
      color: "indigo"
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
              💬
            </motion.span>{' '}
            How It Works
          </Title>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Text size="md" c="dimmed">
            Ask any operational, technical, or policy question.
          </Text>
        </motion.div>
        
        <Stack gap="sm">
          <motion.div variants={itemVariants}>
            <Text fw={500}>Examples:</Text>
          </motion.div>
          
          {examples.map((example, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={exampleVariants}
              initial="hidden"
              animate="visible"
              className={styles.exampleBox}
            >
              {example}
            </motion.div>
          ))}
        </Stack>
        
        <motion.div variants={itemVariants}>
          <Text size="md" fw={500} mt="md">You'll get:</Text>
        </motion.div>
        
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Box visibleFrom="sm">
            <Group grow gap="xs" align="stretch">
              {results.map((result, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={blockVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'flex' }}
                >
                  <Card p="sm" radius="md" withBorder style={{ width: '100%' }}>
                    <Stack gap="0" align="center" ta="center" h="100%">
                      <result.icon 
                        size={32} 
                        color={`var(--mantine-color-${result.color}-6)`}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <Text fw={600} size="sm">{result.title}</Text>
                      {result.subtitle && (
                        <Text size="xs" c="dimmed">{result.subtitle}</Text>
                      )}
                    </Stack>
                  </Card>
                </motion.div>
              ))}
            </Group>
          </Box>
          
          <Stack gap="xs" hiddenFrom="sm">
            {results.map((result, i) => (
              <motion.div
                key={`mobile-${i}`}
                custom={i}
                variants={blockVariants}
                initial="hidden"
                animate="visible"
              >
                <Card p="sm" radius="md" withBorder>
                  <Group gap="md" align="center">
                    <result.icon 
                      size={32} 
                      color={`var(--mantine-color-${result.color}-6)`}
                      style={{ flexShrink: 0 }}
                    />
                    <Stack gap="0" style={{ flex: 1 }} align="center">
                      <Text fw={600} size="sm" ta="center">{result.title}</Text>
                      {result.subtitle && (
                        <Text size="xs" c="dimmed" ta="center">{result.subtitle}</Text>
                      )}
                    </Stack>
                  </Group>
                </Card>
              </motion.div>
            ))}
          </Stack>
        </Box>
      </Stack>
    </motion.div>
  );
}