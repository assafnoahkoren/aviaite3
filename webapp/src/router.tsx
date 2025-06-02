import App from './App';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
} from 'react-router-dom';

// Guard for private routes (always returns true for now)
function PrivateRoute() {
  const isAuthenticated = true; // TODO: Replace with real auth logic
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

function Login() {
  return <div>Login Page</div>;
}

function Register() {
  return <div>Register Page</div>;
}

export const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  // Private routes
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <App /> },
    ],
  },
]); 