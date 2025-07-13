import { useQuery } from '@tanstack/react-query';
import { getAdminDashboardStats } from '../../../api/admin-api';
import styles from './AdminDashboard.module.scss';

export function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboardStats,
  });

  if (isLoading) return <div className={styles.loading}>Loading dashboard...</div>;
  if (error) return <div className={styles.error}>Failed to load dashboard</div>;
  if (!stats) return null;

  const formatCurrency = (cents: number) => {
    const dollars = cents / 100;
    
    // Determine appropriate decimal places based on value
    let fractionDigits = 3;
    if (dollars < 0.01 && dollars > 0) {
      fractionDigits = 6;
    } else if (dollars < 1) {
      fractionDigits = 4;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(dollars);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className={styles.dashboard}>
      <h1>Admin Dashboard</h1>

      <div className={styles.statsGrid}>
        {/* User Stats */}
        <div className={styles.statCard}>
          <h3>Users</h3>
          <div className={styles.statValue}>{formatNumber(stats.userStats.total)}</div>
          <div className={styles.statDetails}>
            <div className={styles.statDetail}>
              <span>Active:</span> {formatNumber(stats.userStats.active)} ({stats.userStats.activePercentage.toFixed(1)}%)
            </div>
            <div className={styles.statDetail}>
              <span>Verified:</span> {formatNumber(stats.userStats.verified)}
            </div>
            <div className={styles.statDetail}>
              <span>New this month:</span> {formatNumber(stats.userStats.newThisMonth)}
            </div>
          </div>
        </div>

        {/* Organization Stats */}
        <div className={styles.statCard}>
          <h3>Organizations</h3>
          <div className={styles.statValue}>{formatNumber(stats.organizationStats.total)}</div>
          <div className={styles.statDetails}>
            <div className={styles.statDetail}>
              <span>Active:</span> {formatNumber(stats.organizationStats.active)}
            </div>
            <div className={styles.statDetail}>
              <span>Avg users/org:</span> {stats.organizationStats.averageUsersPerOrg}
            </div>
          </div>
        </div>

        {/* Subscription Stats */}
        <div className={styles.statCard}>
          <h3>Subscriptions</h3>
          <div className={styles.statValue}>{formatNumber(stats.subscriptionStats.active)}</div>
          <div className={styles.statDetails}>
            <div className={styles.statDetail}>
              <span>Monthly:</span> {formatNumber(stats.subscriptionStats.monthlyCount)}
            </div>
            <div className={styles.statDetail}>
              <span>Yearly:</span> {formatNumber(stats.subscriptionStats.yearlyCount)}
            </div>
            <div className={styles.statDetail}>
              <span>Churn rate:</span> {stats.subscriptionStats.churnRate}%
            </div>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className={styles.statCard}>
          <h3>Revenue</h3>
          <div className={styles.statValue}>{formatCurrency(stats.revenueStats.monthlyRecurringRevenueCents)}</div>
          <div className={styles.statLabel}>MRR</div>
          <div className={styles.statDetails}>
            <div className={styles.statDetail}>
              <span>ARR:</span> {formatCurrency(stats.revenueStats.annualRecurringRevenueCents)}
            </div>
            <div className={styles.statDetail}>
              <span>ARPU:</span> {formatCurrency(stats.revenueStats.averageRevenuePerUserCents)}
            </div>
          </div>
        </div>
      </div>

      {/* Token Usage */}
      <div className={styles.section}>
        <h2>Token Usage (Last 30 Days)</h2>
        <div className={styles.usageGrid}>
          <div className={styles.usageCard}>
            <div className={styles.usageLabel}>Total Tokens</div>
            <div className={styles.usageValue}>{formatNumber(stats.usageStats.last30Days.totalTokens)}</div>
          </div>
          <div className={styles.usageCard}>
            <div className={styles.usageLabel}>Total Cost</div>
            <div className={styles.usageValue}>{formatCurrency(stats.usageStats.last30Days.totalCostCents)}</div>
          </div>
        </div>
        
        {stats.usageStats.byModel.length > 0 && (
          <div className={styles.modelUsage}>
            <h3>By Model</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Tokens</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {stats.usageStats.byModel.map((model) => (
                  <tr key={model.model}>
                    <td>{model.model}</td>
                    <td>{formatNumber(model.totalTokens)}</td>
                    <td>{formatCurrency(model.totalCostCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className={styles.section}>
        <h2>Recent Activity</h2>
        <div className={styles.activityGrid}>
          <div className={styles.activityCard}>
            <h3>New Users</h3>
            {stats.recentActivity.recentUsers.length > 0 ? (
              <ul className={styles.activityList}>
                {stats.recentActivity.recentUsers.map((user) => (
                  <li key={user.id}>
                    <div className={styles.activityName}>{user.fullName || user.email}</div>
                    <div className={styles.activityTime}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noActivity}>No recent users</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}