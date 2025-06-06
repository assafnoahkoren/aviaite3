import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Paper, Title, Text, Loader, Alert } from '@mantine/core';
import { useStore_Auth } from './auth-store';
import { observer } from 'mobx-react-lite';

export const VerifyPage = observer(() => {
  const [params] = useSearchParams();
  const userId = params.get('userId');
  const token = params.get('token');
  const auth = useStore_Auth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (userId && token) {
      if (auth.verifyMutation.isLoading) return;

      const verify = async () => {
        try {
          const res = await auth.verifyMutation.mutateAsync({ userId, token });
          if (res?.success) {
            auth.setCurrentUser(res.user || null, res.token);
            navigate('/');
          } else {
            // This case might be handled by the error case, but as a fallback
            navigate('/login');
          }
        } catch (error) {
          console.error('Verification failed', error);
          navigate('/login');
        }
      };

      verify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token]);

  return (
    <Paper radius="md" p="xl" withBorder maw={400} mx="auto" mt={80}>
      <Title order={2} mb="md" ta="center">Verify Account</Title>
      {auth.verifyMutation.isLoading && <Loader mx="auto" />}
      {auth.verifyMutation.isError && (
        <Alert color="red" mt="md">{String(auth.verifyMutation.error)}</Alert>
      )}
      {auth.verifyMutation.isSuccess && (
        <Text ta="center" c={auth.verifyMutation.data?.success ? 'green' : 'red'}>
          {auth.verifyMutation.data?.message}
        </Text>
      )}
    </Paper>
  );
}); 