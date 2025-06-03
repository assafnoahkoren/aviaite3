import { useState, useEffect } from 'react';
import { PasswordInput, Button, Paper, Title, Stack, Alert } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Auth } from './auth-store';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ResetPasswordPage = observer(() => {
  const auth = useStore_Auth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!userId || !token) {
      navigate('/login');
    }
  }, [userId, token, navigate]);

  useEffect(() => {
    if (auth.resetPasswordMutation.isSuccess && auth.resetPasswordMutation.data?.user) {
      auth.setCurrentUser(auth.resetPasswordMutation.data.user, null);
      navigate('/');
    }
  }, [auth.resetPasswordMutation.isSuccess, auth.resetPasswordMutation.data, auth, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    if (userId && token) {
      auth.resetPasswordMutation.mutate({ userId, token, newPassword: password });
    }
  };

  if (!userId || !token) {
    return null;
  }

  return (
    <Paper radius="md" p="xl" withBorder maw={400} mx="auto" mt={80}>
      <Title order={2} mb="md" ta="center">Reset Password</Title>
      <form onSubmit={handleSubmit}>
        <Stack>
          <PasswordInput
            label="New Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <PasswordInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {password !== confirmPassword && (
            <Alert color="red">Passwords do not match</Alert>
          )}
          {auth.resetPasswordMutation.isError && (
            <Alert color="red">{String(auth.resetPasswordMutation.error)}</Alert>
          )}
          <Button 
            type="submit" 
            loading={auth.resetPasswordMutation.isLoading} 
            fullWidth
            disabled={password !== confirmPassword}
          >
            Reset Password
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}); 