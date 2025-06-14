import {
  Burger,
  Group,
  Image,
  Avatar,
  Menu,
  UnstyledButton,
  rem,
  Text,
  Modal,
  Stack,
  Button,
  Badge,
} from '@mantine/core';
import { IconChevronDown, IconLogout, IconRobot, IconSettings } from '@tabler/icons-react';
import { useState } from 'react';
import { useStore_Auth } from '../auth/auth-store';
import { useStore_Settings } from '../settings/settings-store';
import { observer } from 'mobx-react-lite';
import { BiEvents } from '../../mixpanel';

interface HomeHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export const HomeHeader = observer(({ opened, toggle }: HomeHeaderProps) => {
  const [_userMenuOpened, setUserMenuOpened] = useState(false);
  const auth = useStore_Auth();
  const settingsStore = useStore_Settings();

  const handleAssistantSelect = (assistantId: string) => {
    BiEvents.switchAssistant(assistantId);
    settingsStore.setCurrentAssistantId(assistantId);
    settingsStore.closeSwitchAssistantModal();
  };

  return (
    <>
      <Modal
        opened={settingsStore.isSwitchAssistantModalOpen}
        onClose={settingsStore.closeSwitchAssistantModal}
        title="Switch Assistant"
      >
        <Stack>
          {settingsStore.assistants.map((assistant) => (
            <Button
              key={assistant.id}
              onClick={() => handleAssistantSelect(assistant.id)}
              variant={
                settingsStore.settings?.currentAssistantId === assistant.id ? 'filled' : 'outline'
              }
            >
              {assistant.label}
            </Button>
          ))}
        </Stack>
      </Modal>
      <Group h="100%" px="md" justify="space-between" style={{ position: 'relative' }}>
        <Group wrap="nowrap" gap={6}>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group gap="xs" wrap="nowrap" align="end" visibleFrom="sm">
            <img src="/logos/ace-dark.png" height={24} />
            <Text fw={600} size="xs" opacity={0.5} style={{ lineHeight: '1' }}>
              by aviate
            </Text>
          </Group>
        </Group>

        <Image
          src="/logos/ace-fav-dark.png"
          h={24}
          hiddenFrom="sm"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
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
            <Group>
              <Badge c="blue" variant="light" bg="blue.1" size="sm" style={{ flexGrow: 1 }} >
                Beta
              </Badge>
              <UnstyledButton c="dark">
                <Group gap={7}>
                  <Avatar alt={auth.user?.fullName ?? ''} radius="xl" size={28}>
                    {auth.user?.fullName?.[0]}
                  </Avatar>
                  <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Group>
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
              leftSection={<IconRobot style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
              onClick={settingsStore.openSwitchAssistantModal}
            >
              Switch assistant
            </Menu.Item>
            {auth.user?.role === 'ADMIN' && (
              <Menu.Item
                leftSection={<IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                component="a"
                href="/admin"
              >
                Admin Panel
              </Menu.Item>
            )}
            <Menu.Item
              leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
              onClick={() => auth.logout()}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </>
  );
}); 