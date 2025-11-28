import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import UserModal from './UserModal';
import './Users.css';

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
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll(filters);
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch users');
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

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(id);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
        console.error(error);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userAPI.update(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
    fetchUsers();
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>User Management</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <h3>Filters</h3>
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
            <select
              name="role"
              className="form-control"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="subadmin">Sub Admin</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="isActive"
              className="form-control"
              value={filters.isActive}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge badge-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(user)}
                            className="btn-icon"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="btn-icon"
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? '🔒' : '🔓'}
                          </button>
                          {user.role !== 'superadmin' && (
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="btn-icon"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <UserModal user={selectedUser} onClose={handleModalClose} />
      )}
    </div>
  );
};

export default UserList;
