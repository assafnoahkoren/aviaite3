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
} from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Auth } from './auth-store';
import { Link, useNavigate } from 'react-router-dom';
import classes from './login-page.module.scss';

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
      <Grid.Col span={{ base: 12, md: 6 }} className={classes.heroCol}>
        <Title order={1}>Welcome Back!</Title>
        <Text mt="md">We are happy to see you again. Please log in to access your account.</Text>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }} className={classes.formCol}>
        <Paper radius="md" p="xl" withBorder maw={400} w="100%">
          <Title order={2} mb="md" ta="center">
            Login
          </Title>
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
      </Grid.Col>
    </Grid>
  );
});
