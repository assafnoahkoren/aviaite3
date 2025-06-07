import { useState } from 'react';
import { TextInput, Button, Paper, Title, Stack, Alert, Box } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Auth } from './auth-store';
import { Link } from 'react-router-dom';

export const RequestResetPasswordPage = observer(() => {
  const auth = useStore_Auth();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.createResetPasswordTokenMutation.mutate(email);
  };

  return (
    <Box pt={80}>
      <Paper radius="md" p="xl" withBorder maw={400} mx="auto">
        <Title order={2} mb="md" ta="center">Reset Password</Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {auth.createResetPasswordTokenMutation.isError && (
              <Alert color="red">{String(auth.createResetPasswordTokenMutation.error)}</Alert>
            )}
            {auth.createResetPasswordTokenMutation.isSuccess && (
              <Alert color="green">{auth.createResetPasswordTokenMutation.data?.message}</Alert>
            )}
            <Button type="submit" loading={auth.createResetPasswordTokenMutation.isLoading} fullWidth>
              Send Reset Link
            </Button>
            <Button component={Link} to="/login" variant="subtle" fullWidth>Back to Login</Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}); 