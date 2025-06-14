import { Navigate, Outlet } from 'react-router-dom';
import { useStore_Auth } from '../auth/auth-store';

export function AdminRoute() {
  const auth = useStore_Auth();
  const isAdmin = auth.user?.role === 'ADMIN';

  if (!auth.user || !auth.token) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}