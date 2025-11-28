import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';

const UserModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't prefill password
        role: user.role,
        isActive: user.isActive,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...formData };
      
      // Remove password if it's empty during update
      if (user && !data.password) {
        delete data.password;
      }

      if (user) {
        await userAPI.update(user._id, data);
        toast.success('User updated successfully');
      } else {
        if (!data.password) {
          toast.error('Password is required for new users');
          setLoading(false);
          return;
        }
        await userAPI.create(data);
        toast.success('User created successfully');
      }

      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password {!user && '*'}</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              placeholder={user ? 'Leave empty to keep current password' : 'Minimum 6 characters'}
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="agent">Agent</option>
              <option value="subadmin">Sub Admin</option>
            </select>
            <small style={{ color: '#666', fontSize: '12px' }}>
              Note: Cannot create Super Admin users
            </small>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ width: 'auto' }}
              />
              Active
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
