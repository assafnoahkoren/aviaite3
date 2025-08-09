import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
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
import { initMixpanelInstance, setCurrentUserInfo } from './mixpanel';
import { AdminRoute } from './features/admin/AdminRoute';
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { AdminUsers } from './features/admin/pages/AdminUsers';
import { AdminOrganizations } from './features/admin/pages/AdminOrganizations';
import { AdminProducts } from './features/admin/pages/AdminProducts';
import { AdminSubscriptions } from './features/admin/pages/AdminSubscriptions';
import { AdminRegistrationPermits } from './features/admin/pages/AdminRegistrationPermits';
import { AdminTokenUsage } from './features/admin/pages/AdminTokenUsage';
import { AdminOrganizationStatistics } from './features/admin/pages/AdminOrganizationStatistics';
import { AdminThreads } from './features/admin/pages/AdminThreads';
import { useIsOnboardingRequired } from './api/onboarding-api';
import { OnboardingPage } from './features/onboarding/OnboardingPage';
import { SubscriptionPlansSimple } from './features/subscription/SubscriptionPlansSimple';
import { SubscriptionCheckout } from './features/subscription/SubscriptionCheckout';
import { getCurrentUser } from './api/user-api';
import { NoAccess } from './components/NoAccess';

// Guard for private routes
function PrivateRoute() {
  const auth = useStore_Auth();
  const location = useLocation();
  const settingsStore = useCreateStore_Settings(auth);
  const chatHistoryStore = useCreateStore_ChatHistory();
  const chatStore = useCreateStore_Chat(settingsStore.store);
  const { isRequired: isOnboardingRequired, currentStep, isLoading: isOnboardingLoading } = useIsOnboardingRequired();
  
  const isAuthenticated = !!auth.user && !!auth.token;
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');
  
  // Fetch current user data and refresh every 30 seconds or on window focus
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true, // Refresh when window gains focus
    refetchIntervalInBackground: false, // Don't refresh in background
  });
  
  // Update auth store when fresh user data is fetched
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      // Update the user in auth store with fresh data
      auth.setCurrentUser(currentUser, auth.token);
      
      // Check if user has access
      if (currentUser.hasAccess === false) {
        // User no longer has access, show NoAccess component
        // We'll handle this below in the render logic
      }
    }
  }, [currentUser, isAuthenticated]);
  
  // Show loading state while checking onboarding status
  if (isAuthenticated && isOnboardingLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }
  
  if (isAuthenticated && auth.user) {
    // Check if user has access (using fresh data if available, otherwise cached data)
    const userToCheck = currentUser || auth.user;
    if (userToCheck.hasAccess === false) {
      return <NoAccess />;
    }
    
    initMixpanelInstance(auth.user.id, {
      email: auth.user.email,
      name: auth.user.fullName,
      organizationId: auth.user.organizationId,
    });
    
    // Set current user info for events
    setCurrentUserInfo({
      email: auth.user.email,
      id: auth.user.id,
    });
    
    // If onboarding is required and user is not on onboarding page, redirect
    if (isOnboardingRequired && !isOnboardingRoute) {
      return <Navigate to={`/onboarding?step=${currentStep}`} replace />;
    }
    
    // If onboarding is complete and user is on onboarding page, redirect to home
    if (!isOnboardingRequired && isOnboardingRoute) {
      return <Navigate to="/" replace />;
    }
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
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/subscription/plans', element: <SubscriptionPlansSimple /> },
      { path: '/subscription/checkout', element: <SubscriptionCheckout /> },
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
          { path: 'registration-permits', element: <AdminRegistrationPermits /> },
          { path: 'token-usage', element: <AdminTokenUsage /> },
          { path: 'organization-statistics', element: <AdminOrganizationStatistics /> },
          { path: 'threads', element: <AdminThreads /> },
        ],
      },
    ],
  },
]); 