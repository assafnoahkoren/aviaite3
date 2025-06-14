import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useStore_Auth } from '../auth/auth-store';
import styles from './AdminLayout.module.scss';

export function AdminLayout() {
  const auth = useStore_Auth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
  };

  const handleBackToApp = () => {
    navigate('/');
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Panel</h2>
          <button 
            className={styles.backButton}
            onClick={handleBackToApp}
            title="Back to App"
          >
            ← Back to App
          </button>
        </div>
        
        <nav className={styles.nav}>
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/users"
            className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
          >
            Users
          </NavLink>
          <NavLink 
            to="/admin/organizations"
            className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
          >
            Organizations
          </NavLink>
          <NavLink 
            to="/admin/products"
            className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
          >
            Products
          </NavLink>
          <NavLink 
            to="/admin/subscriptions"
            className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}
          >
            Subscriptions
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{auth.user?.fullName || auth.user?.email}</div>
            <div className={styles.userRole}>Admin</div>
          </div>
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}