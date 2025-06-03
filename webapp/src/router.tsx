import {
  createBrowserRouter,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { LoginPage } from './features/auth/login-page';
import { RegisterPage } from './features/auth/register-page';
import { VerifyPage } from './features/auth/verify-page';
import { RequestResetPasswordPage } from './features/auth/request-reset-password-page';
import { ResetPasswordPage } from './features/auth/reset-password-page';
import { useStore_Auth } from './features/auth/auth-store';
import { Button } from '@mantine/core';
import { useCreateStore_ChatHistory } from './features/chat-history/chat-history-store';
import { observer } from 'mobx-react-lite';

// Guard for private routes (always returns true for now)
function PrivateRoute() {
  const auth = useStore_Auth();
  const isAuthenticated = !!auth.user && !!auth.token;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

const HomePage = observer(() => {
  const auth = useStore_Auth();
  const chatHistoryStore = useCreateStore_ChatHistory();
  const chats = chatHistoryStore.store.chatsQuery.data ?? [];
  const createChat = () => {
    // For demo, use dummy values. Replace with real values or a form as needed.
    chatHistoryStore.store.createChatMutation.mutate({
      assistantId: 'demo-assistant',
      profileId: 'demo-profile',
    });
  };
  return (
    <chatHistoryStore.context>
      <div>Hello {auth.user?.fullName} your email is {auth.user?.email}</div>
      <Button onClick={() => auth.logout()}>Logout</Button>
      <Button onClick={createChat} disabled={chatHistoryStore.store.createChatMutation.isLoading}>
        {chatHistoryStore.store.createChatMutation.isLoading ? 'Creating...' : 'Create Chat'}
      </Button>
      {chatHistoryStore.store.createChatMutation.isError && (
        <div style={{ color: 'red' }}>Error creating chat</div>
      )}
      {chats.map((chat) => (
        <div key={chat.id}>{chat.id}</div>
      ))}
    </chatHistoryStore.context>
  );
});

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify', element: <VerifyPage /> },
  { path: '/request-reset-password', element: <RequestResetPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  // Private routes
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <HomePage /> },
    ],
  },
]); 