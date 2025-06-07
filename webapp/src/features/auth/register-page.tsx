import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Stack,
  Alert,
  Text,
  Grid,
  Image,
} from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useStore_Auth } from './auth-store';
import { Link } from 'react-router-dom';
import classes from './login-page.module.scss';
import { IconUser, IconAt, IconLock } from '@tabler/icons-react';
import { AuthHero } from './AuthHero';

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
              Register
            </Title>
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
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    leftSection={<IconUser size={16} />}
                  />
                  <TextInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftSection={<IconAt size={16} />}
                  />
                  <PasswordInput
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    leftSection={<IconLock size={16} />}
                  />
                  {auth.registerMutation.isError && (
                    <Alert color="red">{String(auth.registerMutation.error)}</Alert>
                  )}
                  <Button type="submit" loading={auth.registerMutation.isLoading} fullWidth>
                    Register
                  </Button>
                  <Button component={Link} to="/login" variant="subtle" fullWidth>
                    Back to Login
                  </Button>
                </Stack>
              </form>
            )}
          </Paper>
        </Stack>
      </Grid.Col>
    </Grid>
  );
});
