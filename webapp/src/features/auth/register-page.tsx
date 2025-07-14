import { useState, useEffect } from 'react';
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
import { Link, useSearchParams } from 'react-router-dom';
import classes from './login-page.module.scss';
import { IconUser, IconAt, IconLock } from '@tabler/icons-react';
import { AuthHero } from './AuthHero';

export const RegisterPage = observer(() => {
  const auth = useStore_Auth();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.registerMutation.mutate({ fullName, email, password, token: token || undefined });
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
            {!token ? (
              <Stack align="center" gap="md">
                <Alert color="red" icon={<IconLock size={16} />}>
                  Registration requires an invitation token.
                </Alert>
                <Text ta="center" c="dimmed">
                  Please contact your administrator to receive a registration link.
                </Text>
                <Button component={Link} to="/login" variant="subtle">
                  Back to Login
                </Button>
              </Stack>
            ) : auth.registerMutation.isSuccess ? (
              <Stack align="center" gap="md">
                <Text ta="center" c="dimmed">
                  We sent a verification email to your address. Please check your inbox.
                </Text>
                <Button component={Link} to="/login" variant="subtle">
                  Back to Login
                </Button>
              </Stack>
            ) : (
              <form onSubmit={handleSubmit}>
                <Stack>
                  <TextInput
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    leftSection={<IconUser size={16} />}
                    placeholder="Full Name"
                  />
                  <TextInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftSection={<IconAt size={16} />}
                    placeholder="Email"
                  />
                  <PasswordInput
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    leftSection={<IconLock size={16} />}
                    placeholder="Password"
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
