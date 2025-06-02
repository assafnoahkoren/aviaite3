import { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Stack, Alert, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Auth } from './auth-store';
import { Link } from 'react-router-dom';

export const RegisterPage = observer(() => {
  const auth = useStore_Auth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.registerMutation.mutate({ fullName, email, password });
  };

  return (
    <Paper radius="md" p="xl" withBorder maw={400} mx="auto" mt={80}>
      <Title order={2} mb="md" ta="center">Register</Title>
      {auth.registerMutation.isSuccess ? (
        <Text ta="center" c="green">
          We sent a verification email to your address. Please check your inbox.
        </Text>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
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
            {auth.registerMutation.isError && (
              <Alert color="red">{String(auth.registerMutation.error)}</Alert>
            )}
            <Button type="submit" loading={auth.registerMutation.isLoading} fullWidth>
              Register
            </Button>
			<Button component={Link} to="/login" variant="subtle" fullWidth>Login</Button>
          </Stack>
        </form>
      )}
    </Paper>
  );
});
