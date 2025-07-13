import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClickToComponent } from 'click-to-react-component';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useCreateStore_Auth } from './features/auth/auth-store';
import { setQueryClient } from './infra/mobx-query';
import './App.css';
import { theme } from './theme';

const queryClient = new QueryClient();
// Set the query client for MobX queries to use the same instance
setQueryClient(queryClient);

function App() {
  const authStore = useCreateStore_Auth();
  return (
    <React.StrictMode>
      <ClickToComponent editor="cursor" />
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <ModalsProvider>
            <authStore.context>
              <RouterProvider future={{ v7_startTransition: true }} router={router} />
            </authStore.context>
          </ModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
