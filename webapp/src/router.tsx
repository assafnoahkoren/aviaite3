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
import HomePage from './features/home/home-page';

// Guard for private routes (always returns true for now)
function PrivateRoute() {
  const auth = useStore_Auth();
  const isAuthenticated = !!auth.user && !!auth.token;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
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
      { path: '/', element: <HomePage /> },
    ],
  },
]); 