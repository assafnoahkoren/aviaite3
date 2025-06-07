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
import { AuthHero } from './AuthHero';

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
      <AuthHero />
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
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftSection={<IconAt size={16} />}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
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
                <Button color='dark' size='xs' opacity={0.5} component={Link} to="/request-reset-password" variant="subtle" fullWidth>
                  Forgot Password
                </Button>
              </Stack>
            </form>
          </Paper>
        </Stack>
        <Text
          size="xs"
          c="dimmed"
          style={{
            position: 'absolute',
            bottom: 'var(--mantine-spacing-md)',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          &copy; {new Date().getFullYear()} Aviaite. All rights reserved.
        </Text>
      </Grid.Col>
    </Grid>
  );
});
