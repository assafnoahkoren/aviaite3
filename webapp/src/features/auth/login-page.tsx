import { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Stack,
  Alert,
  Grid,
  Text,
  Image,
} from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Auth } from './auth-store';
import { Link, useNavigate } from 'react-router-dom';
import classes from './login-page.module.scss';
import { IconAt, IconLock } from '@tabler/icons-react';

export const LoginPage = observer(() => {
  const auth = useStore_Auth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Set up onSuccess handler for login
  useEffect(() => {
    if (auth.loginMutation.isSuccess && auth.loginMutation.data?.token) {
      auth.setCurrentUser(auth.loginMutation.data.user ?? null, auth.loginMutation.data.token);
      navigate('/');
    }
  }, [auth.loginMutation.isSuccess, auth.loginMutation.data, auth, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.loginMutation.mutate({ email, password });
  };

  return (
    <Grid className={classes.grid} gutter={0} align="stretch">
      <Grid.Col span={6} className={classes.heroCol} visibleFrom="md">
        <Stack align="center" gap="xl">
          <Image src="/logos/ace-by-aviaite-light.png" alt="Ace by Aviaite logo" w={200} />
          <Stack gap="xs">
            <Title order={3}>Empowering. &nbsp; Productive. &nbsp; Personalized.</Title>
            <Text size='lg'>
              Fly through the literature with your copilot, Ace.
            </Text>
          </Stack>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }} className={classes.formCol}>
        <Stack align="center" w="100%">
          <Image
            src="/logos/ace-by-aviaite-dark.png"
            alt="Ace by Aviaite logo"
            w={200}
            hiddenFrom="md"
          />
          <Text hiddenFrom='md' fw={600}> Empowering. &nbsp; Productive. &nbsp; Personalized. </Text>
          <Paper radius="md" p="xl" maw={400} w="100%" bg="transparent">
            <form onSubmit={handleSubmit}>
              <Stack>
                <TextInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftSection={<IconAt size={16} />}
                />
                <PasswordInput
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftSection={<IconLock size={16} />}
                />
                {auth.loginMutation.isError && (
                  <Alert color="red">{String(auth.loginMutation.error)}</Alert>
                )}
                <Button type="submit" loading={auth.loginMutation.isLoading} fullWidth>
                  Login
                </Button>
                <Button component={Link} to="/register" variant="subtle" fullWidth>
                  Register
                </Button>
                <Button component={Link} to="/request-reset-password" variant="subtle" fullWidth>
                  Forgot Password?
                </Button>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Grid.Col>
    </Grid>
  );
});
