import { Burger, Group, Text } from '@mantine/core';

interface HomeHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function HomeHeader({ opened, toggle }: HomeHeaderProps) {
  return (
    <Group h="100%" px="md">
      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
      <Text>Header Content</Text>
    </Group>
  );
} 