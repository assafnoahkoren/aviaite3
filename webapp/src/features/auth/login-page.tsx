import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Stack, Alert } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Auth } from './auth-store';
import { Link } from 'react-router-dom';

export const LoginPage = observer(() => {
  const auth = useStore_Auth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.loginMutation.mutate({ email, password });
  };

  return (
    <Paper radius="md" p="xl" withBorder maw={400} mx="auto" mt={80}>
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
        </Stack>
      </form>
    </Paper>
  );
});
