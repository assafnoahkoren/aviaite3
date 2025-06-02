import {
  createBrowserRouter,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { LoginPage } from './features/auth/login-page';
import { RegisterPage } from './features/auth/register-page';
import { VerifyPage } from './features/auth/verify-page';
import { useStore_Auth } from './features/auth/auth-store';
import { Button } from '@mantine/core';

// Guard for private routes (always returns true for now)
function PrivateRoute() {
  const auth = useStore_Auth();
  const isAuthenticated = !!auth.user && !!auth.token;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

const HomePage = () => {
  const auth = useStore_Auth();
  return (
    <>
      <div>Hello {auth.user?.fullName} your email is {auth.user?.email}</div>
      <Button onClick={() => auth.logout()}>Logout</Button>
    </>
  );
};

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify', element: <VerifyPage /> },
  // Private routes
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <HomePage /> },
    ],
  },
]); 