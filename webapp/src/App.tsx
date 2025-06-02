import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClickToComponent } from 'click-to-react-component';
import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useCreateStore_Auth } from './features/auth/auth-store';

const queryClient = new QueryClient();

function App() {
  const authStore = useCreateStore_Auth();
  return (
    <React.StrictMode>
      <ClickToComponent editor="cursor" />
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <authStore.context>
            <RouterProvider future={{v7_startTransition: true}} router={router} />
          </authStore.context>
        </MantineProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
