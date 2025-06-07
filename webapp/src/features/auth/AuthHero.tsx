import { Grid, Image, Stack, Text, Title } from '@mantine/core';
import classes from './login-page.module.scss';

export function AuthHero() {
  return (
    <Grid.Col span={6} className={classes.heroCol} visibleFrom="md">
      <Stack align="center" gap="xl">
        <Image src="/logos/ace-by-aviaite-light.png" alt="Ace by Aviaite logo" w={200} />
        <Stack gap="xs">
          <Title order={3}>Empowering. &nbsp; Productive. &nbsp; Personalized.</Title>
          <Text size="lg">Fly through the literature with your copilot, Ace.</Text>
        </Stack>
      </Stack>
    </Grid.Col>
  );
} 