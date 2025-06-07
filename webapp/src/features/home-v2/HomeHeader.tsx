import { Burger, Group, Image, Avatar, Menu, UnstyledButton, rem, Text } from '@mantine/core';
import { IconChevronDown, IconHeart, IconLogout, IconSettings } from '@tabler/icons-react';
import { useState } from 'react';
import { useStore_Auth } from '../auth/auth-store';

interface HomeHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function HomeHeader({ opened, toggle }: HomeHeaderProps) {
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const auth = useStore_Auth();

  return (
    <Group h="100%" px="md" justify="space-between" style={{ position: 'relative' }}>
      <Group wrap="nowrap" gap={6}>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Group gap="xs" wrap="nowrap" align="end" visibleFrom="sm">
          <img src="/logos/ace-dark.png" height={28}  />
          <Text fw={600} size="xs" w="max-content">by aviate</Text>
        </Group>
      </Group>

      <Image
        src="/logos/ace-fav-dark.png"
        h={32}
        hiddenFrom="sm"
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', objectFit: 'contain', pointerEvents: 'none' }}
      />


      <Menu
        width={260}
        position="bottom-end"
        transitionProps={{ transition: 'pop-top-right' }}
        onClose={() => setUserMenuOpened(false)}
        onOpen={() => setUserMenuOpened(true)}
        withinPortal
      >
        {/* @ts-ignore */}
        <Menu.Target>
          <UnstyledButton c="dark">
            <Group gap={7}>
              <Avatar alt={auth.user?.fullName ?? ''} radius="xl" size={28}>
                {auth.user?.fullName?.[0]}
              </Avatar>
              <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item disabled>
            <Text size="xs" c="dimmed" fs="italic">
              Logged in as {auth.user?.email}
            </Text>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Label>Settings</Menu.Label>
          <Menu.Item
            leftSection={
              <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            }
          >
            Account settings
          </Menu.Item>
          <Menu.Item
            leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            onClick={() => auth.logout()}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
} 