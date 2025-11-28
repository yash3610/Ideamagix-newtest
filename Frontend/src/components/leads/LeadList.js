import React, { useState, useEffect } from 'react';
import { leadAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LeadModal from './LeadModal';
import LeadDetailModal from './LeadDetailModal';
import './Leads.css';

const LeadList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [agents, setAgents] = useState([]);
  const [tags, setTags] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    tags: '',
    assignedTo: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchLeads();
    fetchTags();
    if (isAdmin()) {
      fetchAgents();
    }
  }, [page, filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getAll({ ...filters, page, limit: 10 });
      setLeads(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      toast.error('Failed to fetch leads');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await userAPI.getAll({ role: 'agent', isActive: true });
      setAgents(response.data.data);
    } catch (error) {
      console.error('Failed to fetch agents', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await leadAPI.getAllTags();
      setTags(response.data.data);
    } catch (error) {
      console.error('Failed to fetch tags', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPage(1);
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleView = (lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadAPI.delete(id);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Failed to delete lead');
        console.error(error);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedLead(null);
    fetchLeads();
  };

  const handleDetailModalClose = () => {
    setShowDetailModal(false);
    setSelectedLead(null);
    fetchLeads();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await leadAPI.import(formData);
      toast.success(`Imported ${response.data.data.imported} leads successfully`);
      if (response.data.data.failed > 0) {
        toast.warning(`${response.data.data.failed} leads failed to import`);
      }
      fetchLeads();
    } catch (error) {
      toast.error('Failed to import leads');
      console.error(error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await leadAPI.export(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Leads exported successfully');
    } catch (error) {
      toast.error('Failed to export leads');
      console.error(error);
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      tags: '',
      assignedTo: '',
      search: '',
      dateFrom: '',
      dateTo: '',
    });
    setPage(1);
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Leads Management</h1>
        <div className="header-actions">
          <button onClick={handleExport} className="btn btn-secondary">
            Export to Excel
          </button>
          {isAdmin() && (
            <>
              <label className="btn btn-secondary">
                Import Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                Add Lead
              </button>
            </>
          )}
        </div>
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
              placeholder="Name, email, or phone"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              className="form-control"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Lost">Lost</option>
              <option value="Won">Won</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <select
              name="tags"
              className="form-control"
              value={filters.tags}
              onChange={handleFilterChange}
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {isAdmin() && (
            <div className="form-group">
              <label>Assigned To</label>
              <select
                name="assignedTo"
                className="form-control"
                value={filters.assignedTo}
                onChange={handleFilterChange}
              >
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Date From</label>
            <input
              type="date"
              name="dateFrom"
              className="form-control"
              value={filters.dateFrom}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Date To</label>
            <input
              type="date"
              name="dateTo"
              className="form-control"
              value={filters.dateTo}
              onChange={handleFilterChange}
            />
          </div>
        </div>
        <button onClick={clearFilters} className="btn btn-secondary">
          Clear Filters
        </button>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="loading">Loading leads...</div>
      ) : (
        <>
          <div className="card">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Tags</th>
                    {isAdmin() && <th>Assigned To</th>}
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin() ? 8 : 7} style={{ textAlign: 'center' }}>
                        No leads found
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead._id}>
                        <td>{lead.name}</td>
                        <td>{lead.email}</td>
                        <td>{lead.phone}</td>
                        <td>
                          <span className={`badge badge-${lead.status.toLowerCase()}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td>
                          {lead.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="tag">
                              {tag}
                            </span>
                          ))}
                          {lead.tags.length > 2 && (
                            <span className="tag">+{lead.tags.length - 2}</span>
                          )}
                        </td>
                        {isAdmin() && (
                          <td>{lead.assignedTo?.name || 'Unassigned'}</td>
                        )}
                        <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleView(lead)}
                              className="btn-icon"
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => handleEdit(lead)}
                              className="btn-icon"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            {isAdmin() && (
                              <button
                                onClick={() => handleDelete(lead._id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <LeadModal
          lead={selectedLead}
          onClose={handleModalClose}
          agents={agents}
        />
      )}

      {showDetailModal && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={handleDetailModalClose}
        />
      )}
    </div>
  );
};

export default LeadList;
