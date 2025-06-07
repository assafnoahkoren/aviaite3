import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { HomeHeader } from './HomeHeader';
import { HomeSidebar } from './HomeSidebar';
import { HomeMain } from './HomeMain';

export function HomeV2() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <HomeHeader opened={opened} toggle={toggle} />
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <HomeSidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <HomeMain />
      </AppShell.Main>
    </AppShell>
  );
} 