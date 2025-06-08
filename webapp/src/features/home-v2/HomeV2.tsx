import { AppShell, ActionIcon, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { HomeHeader } from './HomeHeader';
import { HomeSidebar } from './HomeSidebar';
import { HomeMain } from './HomeMain';
import { IconArrowLeft, IconMenu2 } from '@tabler/icons-react';

export function HomeV2() {
  const [opened, { toggle }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !desktopOpened },
      }}
      padding="0"
    >
      <AppShell.Header
        bg="cream.0"
        styles={{ header: { borderColor: 'var(--mantine-color-cream-2)' } }}
      >
        <HomeHeader opened={opened} toggle={toggle} />
      </AppShell.Header>
      <AppShell.Navbar
        p="0"
        bg="cream.0"
        styles={{ navbar: { borderColor: 'var(--mantine-color-cream-2)' } }}
      >
        <Box
          visibleFrom="sm"
          style={{
            position: 'absolute',
            top: '12px',
            right: '-50px',
            zIndex: 201,
          }}
        >
          <ActionIcon onClick={toggleDesktop} variant="light" size="lg" radius="xl">
            {desktopOpened ? <IconArrowLeft /> : <IconMenu2 />}
          </ActionIcon>
        </Box>
        <HomeSidebar />
      </AppShell.Navbar>
      <AppShell.Main style={{ position: 'relative' }}>
        <HomeMain />
      </AppShell.Main>
    </AppShell>
  );
} 