import { Container, Title, Text, Stack, Paper, Center, Image } from '@mantine/core';
import { IconTools } from '@tabler/icons-react';
import classes from './UnderMaintenance.module.scss';

export function UnderMaintenance() {
  return (
    <Center h="100vh" className={classes.container}>
      <Paper shadow="md" p="xl" radius="md" className={classes.paper}>
        <Stack align="center" gap="md">
          <Image src="/logos/ace-by-aviaite-dark.png" alt="Ace by Aviaite logo" w={150} />
          <Title order={1} ta="center">Under Maintenance</Title>
          <Text size="lg" c="dimmed" ta="center">
            We're currently performing maintenance.
            <br />
            Please check back soon.
          </Text>
        </Stack>
      </Paper>
    </Center>
  );
}