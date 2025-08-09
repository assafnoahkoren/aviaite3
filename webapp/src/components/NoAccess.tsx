import { Container, Title, Text, Button, Stack, Paper, Group, Box } from '@mantine/core';
import { IconRocket, IconUsers, IconMessageCircle, IconCpu } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import styles from './NoAccess.module.scss';

export function NoAccess() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate('/login');
  };

  return (
    <Container size="sm" className={styles.container}>
      <Paper shadow="md" p="xl" radius="md" className={styles.paper}>
        <Stack align="center" gap="lg">
          <IconRocket size={64} className={styles.icon} />
          
          <Title order={1} className={styles.title}>
            Thank You for participating in Our Beta!
          </Title>
          
          <Text size="lg" ta="center" className={styles.description}>
            Our beta testing phase has come to an end.
            <br />
            We want to express our heartfelt 
            gratitude for your valuable participation and feedback.
          </Text>

          {/* Statistics Section */}
          <Paper withBorder p="md" radius="md" className={styles.statsContainer}>
            <Text size="sm" fw={600} ta="center" mb="md" c="dimmed">
              BETA ACHIEVEMENTS
            </Text>
            <Group justify="center" gap="xl">
              <Box className={styles.statItem}>
                <Group gap="xs">
                  <IconUsers size={20} className={styles.statIcon} />
                  <div>
                    <Text size="xl" fw={700} className={styles.statNumber}>30+</Text>
                    <Text size="xs" c="dimmed">Active Users</Text>
                  </div>
                </Group>
              </Box>
              
              <Box className={styles.statItem}>
                <Group gap="xs">
                  <IconMessageCircle size={20} className={styles.statIcon} />
                  <div>
                    <Text size="xl" fw={700} className={styles.statNumber}>1,000+</Text>
                    <Text size="xs" c="dimmed">Questions Asked</Text>
                  </div>
                </Group>
              </Box>
              
              <Box className={styles.statItem}>
                <Group gap="xs">
                  <IconCpu size={20} className={styles.statIcon} />
                  <div>
                    <Text size="xl" fw={700} className={styles.statNumber}>20M</Text>
                    <Text size="xs" c="dimmed">Tokens Used</Text>
                  </div>
                </Group>
              </Box>
            </Group>
          </Paper>

          <Text size="md" ta="center" className={styles.subdescription}>
            Your insights have been instrumental in shaping our product.
            <br />
            We're working 
            hard to incorporate your feedback and <b>will be back soon with an even better experience </b>
          </Text>

          <Text size="sm" ta="center" c="dimmed">
            Stay tuned for exciting updates!
          </Text>
          
          <Stack gap="sm" w="100%">
            <Button 
              variant="outline" 
              size="md"
              component="a"
              href="https://wa.me/972543304732"
              target="_blank"
              fullWidth
            >
              Interested in extended access? Contact us
            </Button>
            
            <Button 
              variant="filled" 
              size="md"
              onClick={handleLogout}
              fullWidth
            >
              Sign Out
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}