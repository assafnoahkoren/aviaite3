import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { HomeHeader } from './HomeHeader';
import { HomeSidebar } from './HomeSidebar';
import { HomeMain } from './HomeMain';

export function HomeV2() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 50 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="0"
    >
      <AppShell.Header bg="cream.0" styles={{header: {borderColor: 'var(--mantine-color-cream-2)'}}}>
        <HomeHeader opened={opened} toggle={toggle} />
      </AppShell.Header>
      <AppShell.Navbar p="0" bg="cream.0" styles={{navbar: {borderColor: 'var(--mantine-color-cream-2)'}}}>
        <HomeSidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <HomeMain />
      </AppShell.Main>
    </AppShell>
  );
} 