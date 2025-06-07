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
  Image,
} from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Auth } from './auth-store';
import { Link } from 'react-router-dom';
import classes from './login-page.module.scss';
import { IconAt } from '@tabler/icons-react';
import { AuthHero } from './AuthHero';

export const RequestResetPasswordPage = observer(() => {
  const auth = useStore_Auth();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.createResetPasswordTokenMutation.mutate(email);
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
          <Text hiddenFrom="md" fw={600}>
            Empowering. &nbsp; Productive. &nbsp; Personalized.
          </Text>
          <Paper radius="md" p="xl" bg="transparent" maw={400} w="100%">
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
                  <Alert color="red">
                    {String(auth.createResetPasswordTokenMutation.error)}
                  </Alert>
                )}
                {auth.createResetPasswordTokenMutation.isSuccess && (
                  <Alert color="green">
                    {auth.createResetPasswordTokenMutation.data?.message}
                  </Alert>
                )}
                <Button
                  type="submit"
                  loading={auth.createResetPasswordTokenMutation.isLoading}
                  fullWidth
                >
                  Send Reset Link
                </Button>
                <Button component={Link} to="/login" variant="subtle" fullWidth>
                  Back to Login
                </Button>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}); 