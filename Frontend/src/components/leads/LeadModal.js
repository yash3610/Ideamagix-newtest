import React, { useState, useEffect } from 'react';
import { leadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const LeadModal = ({ lead, onClose, agents }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    status: 'New',
    tags: '',
    assignedTo: '',
  });
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        source: lead.source,
        status: lead.status,
        tags: lead.tags.join(', '),
        assignedTo: lead.assignedTo?._id || '',
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };

      if (lead) {
        await leadAPI.update(lead._id, data);
        toast.success('Lead updated successfully');
      } else {
        await leadAPI.create(data);
        toast.success('Lead created successfully');
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
          <h2>{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
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
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Source *</label>
            <input
              type="text"
              name="source"
              className="form-control"
              value={formData.source}
              onChange={handleChange}
              required
              placeholder="e.g., Website, Referral, Social Media"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
              <option value="Won">Won</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              className="form-control"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., Hot Lead, Follow Up, VIP"
            />
          </div>

          {isAdmin() && (
            <div className="form-group">
              <label>Assign To</label>
              <select
                name="assignedTo"
                className="form-control"
                value={formData.assignedTo}
                onChange={handleChange}
              >
                <option value="">Select Agent</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : lead ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;
