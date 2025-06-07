import { useState, useEffect } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Stack, Alert, Box } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Auth } from './auth-store';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';

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
    <Box pt={80}>
      <Paper radius="md" p="xl" withBorder maw={400} mx="auto">
        <Title order={2} mb="md" ta="center">Login</Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {auth.loginMutation.isError && (
              <Alert color="red">{String(auth.loginMutation.error)}</Alert>
            )}
            <Button type="submit" loading={auth.loginMutation.isLoading} fullWidth>
              Login
            </Button>
            <Button component={Link} to="/register" variant="subtle" fullWidth>Register</Button>
            <Button component={Link} to="/request-reset-password" variant="subtle" fullWidth>Forgot Password?</Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
});
