import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, updateAdminUser, deleteAdminUser } from '../../../api/admin-api';
import type { AdminUser, UpdateUserDto } from '../../../api/admin-api';
import type { UserRole } from '../../../api/models';
import styles from './AdminUsers.module.scss';

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserDto>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', { page, search }],
    queryFn: async () => {
      const result = await getAdminUsers({ page, limit: 20, search });
      console.log('Admin users data:', result);
      return result;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, dto }: { userId: string; dto: UpdateUserDto }) =>
      updateAdminUser(userId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditingUser(null);
      setEditForm({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const handleEdit = (user: AdminUser) => {
    console.log('Editing user:', user);
    console.log('User hasAccess value:', user.hasAccess);
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasAccess: user.hasAccess ?? true,  // Default to true if undefined
      verified: user.verified,
      organizationId: user.organizationId,
    });
    console.log('Edit form hasAccess:', user.hasAccess);
  };

  const handleSave = () => {
    if (editingUser) {
      updateMutation.mutate({ userId: editingUser.id, dto: editForm });
    }
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading users...</div>;
  if (error) return <div className={styles.error}>Failed to load users</div>;
  if (!data) return null;

  return (
    <div className={styles.users}>
      <div className={styles.header}>
        <h1>User Management</h1>
        <div className={styles.stats}>
          Total Users: {data.total}
        </div>
      </div>

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Access</th>
              <th>Organization</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName || '-'}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.badge} ${styles[`badge${user.role}`]}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className={styles.statusGroup}>
                    {user.isActive ? (
                      <span className={`${styles.badge} ${styles.badgeActive}`}>Active</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeInactive}`}>Inactive</span>
                    )}
                    {user.verified && (
                      <span className={`${styles.badge} ${styles.badgeVerified}`}>Verified</span>
                    )}
                  </div>
                </td>
                <td>
                  {user.hasAccess !== false ? (
                    <span className={`${styles.badge} ${styles.badgeActive}`}>Allowed</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeInactive}`}>Blocked</span>
                  )}
                </td>
                <td>{user.Organization?.name || '-'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={styles.pageButton}
          >
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {page} of {data.totalPages}
          </span>
          <button
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
            className={styles.pageButton}
          >
            Next
          </button>
        </div>
      )}

      {editingUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.verified}
                    onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                  />
                  Verified
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.hasAccess ?? true}
                    onChange={(e) => setEditForm({ ...editForm, hasAccess: e.target.checked })}
                  />
                  Has Access (allows login)
                </label>
              </div>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.saveButton}>
                  Save
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setEditingUser(null);
                    setEditForm({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}