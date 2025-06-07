import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClickToComponent } from 'click-to-react-component';
import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useCreateStore_Auth } from './features/auth/auth-store';
import "./App.css"
import { theme } from './theme';
import { useCreateStore_ChatHistory } from './features/chat-history/chat-history-store';
import { useCreateStore_Chat } from './features/chat/chat-store';
const queryClient = new QueryClient();

function App() {
  const authStore = useCreateStore_Auth();
  const chatHistoryStore = useCreateStore_ChatHistory();
  const chatStore = useCreateStore_Chat();
  return (
    <React.StrictMode>
      <ClickToComponent editor="cursor" />
      <QueryClientProvider client={queryClient}>
        <MantineProvider theme={theme}>
          <authStore.context>
            <chatHistoryStore.context>
              <chatStore.context>
                <RouterProvider future={{v7_startTransition: true}} router={router} />
              </chatStore.context>
            </chatHistoryStore.context>
          </authStore.context>
        </MantineProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
