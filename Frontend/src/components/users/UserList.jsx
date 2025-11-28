import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import UserModal from './UserModal';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    search: '',
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll(filters);
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userAPI.delete(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
      console.error(error);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await userAPI.update(userId, { isActive: !currentStatus });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error(error);
    }
  };

  const handleModalClose = (refresh) => {
    setShowModal(false);
    setSelectedUser(null);
    if (refresh) {
      loadUsers();
    }
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      isActive: '',
      search: '',
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      superadmin: 'badge-superadmin',
      subadmin: 'badge-subadmin',
      agent: 'badge-agent',
    };
    return `badge ${badges[role]}`;
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h1>User Management</h1>
        <button onClick={handleCreateUser} className="btn btn-primary">
          + Create User
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-section">
        <div className="filters-grid">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Name or email"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select name="role" className="form-control" value={filters.role} onChange={handleFilterChange}>
              <option value="">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="subadmin">Sub Admin</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="isActive" className="form-control" value={filters.isActive} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
        <button onClick={clearFilters} className="btn btn-secondary btn-small">
          Clear Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="card">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="no-data">No users found</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Actions</th>
                  <th>Action2</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getRoleBadge(user.role)}>
                        {user.role.replace('admin', ' Admin').replace('agent', 'Agent')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{user.createdBy?.name || 'System'}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {user.role !== 'superadmin' && (
                          <>
                            <button
                              onClick={() => handleEditUser(user)}
                              className="btn btn-secondary btn-small"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(user._id, user.isActive)}
                              className={`btn btn-small ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn btn-danger btn-small"
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {user.role === 'superadmin' && (
                          <span className="protected-badge">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal user={selectedUser} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default UserList;
