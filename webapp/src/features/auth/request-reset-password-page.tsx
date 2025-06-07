import { useState } from 'react';
import {
  TextInput,
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
import { Link } from 'react-router-dom';
import classes from './login-page.module.scss';
import { IconAt } from '@tabler/icons-react';

export const RequestResetPasswordPage = observer(() => {
  const auth = useStore_Auth();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.createResetPasswordTokenMutation.mutate(email);
  };

  return (
    <Grid className={classes.grid} gutter={0} align="stretch">
      <Grid.Col span={{ base: 12, md: 6 }} className={classes.heroCol}>
        <Title order={1}>Forgot Your Password?</Title>
        <Text mt="md">No worries, we'll help you reset it.</Text>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }} className={classes.formCol}>
        <Paper radius="md" p="xl" withBorder maw={400} w="100%">
          <Title order={2} mb="md" ta="center">
            Reset Password
          </Title>
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
              {auth.createResetPasswordTokenMutation.isError && (
                <Alert color="red">{String(auth.createResetPasswordTokenMutation.error)}</Alert>
              )}
              {auth.createResetPasswordTokenMutation.isSuccess && (
                <Alert color="green">{auth.createResetPasswordTokenMutation.data?.message}</Alert>
              )}
              <Button type="submit" loading={auth.createResetPasswordTokenMutation.isLoading} fullWidth>
                Send Reset Link
              </Button>
              <Button component={Link} to="/login" variant="subtle" fullWidth>
                Back to Login
              </Button>
            </Stack>
          </form>
        </Paper>
      </Grid.Col>
    </Grid>
  );
}); 