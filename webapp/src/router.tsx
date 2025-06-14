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
import { HomeV2 } from './features/home-v2/HomeV2';
import { useCreateStore_Settings } from './features/settings/settings-store';
import { useCreateStore_ChatHistory } from './features/chat-history/chat-history-store';
import { useCreateStore_Chat } from './features/chat/chat-store';
import { initMixpanelInstance } from './mixpanel';
import { AdminRoute } from './features/admin/AdminRoute';
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { AdminUsers } from './features/admin/pages/AdminUsers';
import { AdminOrganizations } from './features/admin/pages/AdminOrganizations';
import { AdminProducts } from './features/admin/pages/AdminProducts';
import { AdminSubscriptions } from './features/admin/pages/AdminSubscriptions';

// Guard for private routes (always returns true for now)
function PrivateRoute() {
  const auth = useStore_Auth();
  const settingsStore = useCreateStore_Settings(auth);
  const chatHistoryStore = useCreateStore_ChatHistory();
  const chatStore = useCreateStore_Chat(settingsStore.store);
  const isAuthenticated = !!auth.user && !!auth.token;
  if (isAuthenticated && auth.user) {
    initMixpanelInstance(auth.user.id, {
      email: auth.user.email,
      name: auth.user.fullName,
      organizationId: auth.user.organizationId,
    });
  }
  return isAuthenticated ? (
    <settingsStore.context>
      <chatHistoryStore.context>
        <chatStore.context>
          <Outlet />
        </chatStore.context>
      </chatHistoryStore.context>
    </settingsStore.context>
  ) : (
    <Navigate to="/login" />
  );
}

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
      { path: '/', element: <HomeV2 /> },
    ],
  },
  // Admin routes
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        path: '',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'organizations', element: <AdminOrganizations /> },
          { path: 'products', element: <AdminProducts /> },
          { path: 'subscriptions', element: <AdminSubscriptions /> },
        ],
      },
    ],
  },
]); 