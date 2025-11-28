import React, { useState, useEffect } from 'react';
import { leadAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LeadModal from './LeadModal';
import LeadDetailModal from './LeadDetailModal';
import './LeadList.css';

const LeadList = () => {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    tags: '',
    assignedTo: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    loadLeads();
    loadAllTags();
    if (isAdmin()) {
      loadAgents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await leadAPI.getAll(filters);
      setLeads(response.data.data);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Failed to load leads');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await userAPI.getAll({ role: 'agent', isActive: true });
      setAgents(response.data.data);
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const loadAllTags = async () => {
    try {
      const response = await leadAPI.getAllTags();
      setAllTags(response.data.data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1, // Reset to first page on filter change
    });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleCreateLead = () => {
    setSelectedLead(null);
    setShowModal(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setShowDetailModal(true);
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    try {
      await leadAPI.delete(leadId);
      toast.success('Lead deleted successfully');
      loadLeads();
    } catch (error) {
      toast.error('Failed to delete lead');
      console.error(error);
    }
  };

  const handleModalClose = (refresh) => {
    setShowModal(false);
    setShowDetailModal(false);
    setSelectedLead(null);
    if (refresh) {
      loadLeads();
      loadAllTags();
    }
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
      loadLeads();
      e.target.value = null; // Reset file input
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
      search: '',
      status: '',
      tags: '',
      assignedTo: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
      limit: 10,
    });
  };

  const getStatusBadgeClass = (status) => {
    return `badge badge-${status.toLowerCase()}`;
  };

  return (
    <div className="lead-list-container">
      <div className="lead-list-header">
        <h1>Lead Management</h1>
        <div className="header-actions">
          {isAdmin() && (
            <>
              <label htmlFor="import-file" className="btn btn-secondary btn-small">
                Import Excel
              </label>
              <input
                type="file"
                id="import-file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
              <button onClick={handleCreateLead} className="btn btn-primary btn-small">
                + Create Lead
              </button>
            </>
          )}
          <button onClick={handleExport} className="btn btn-success btn-small">
            Export
          </button>
        </div>
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
              placeholder="Name, email, or phone"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" className="form-control" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <select name="tags" className="form-control" value={filters.tags} onChange={handleFilterChange}>
              <option value="">All Tags</option>
              {allTags.map((tag, index) => (
                <option key={index} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {isAdmin() && (
            <div className="form-group">
              <label>Assigned To</label>
              <select name="assignedTo" className="form-control" value={filters.assignedTo} onChange={handleFilterChange}>
                <option value="">All Agents</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>{agent.name}</option>
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
        <button onClick={clearFilters} className="btn btn-secondary btn-small">
          Clear Filters
        </button>
      </div>

      {/* Leads Table */}
      <div className="card">
        {loading ? (
          <div className="loading">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="no-data">No leads found</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Tags</th>
                    <th>Assigned To</th>
                    <th>Created</th>
                    <th>Actions</th>
                   <th>Notes All</th> 
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td>{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.source}</td>
                      <td>
                        <span className={getStatusBadgeClass(lead.status)}>
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        {lead.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                        {lead.tags.length > 2 && <span className="tag">+{lead.tags.length - 2}</span>}
                      </td>
                      <td>{lead.assignedTo?.name || 'Unassigned'}</td>
                      <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleViewLead(lead)}
                            className="btn btn-primary btn-small"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditLead(lead)}
                            className="btn btn-secondary btn-small"
                          >
                            Edit
                          </button>
                          {isAdmin() && (
                            <button
                              onClick={() => handleDeleteLead(lead._id)}
                              className="btn btn-danger btn-small"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="btn btn-secondary btn-small"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="btn btn-secondary btn-small"
              >
                Next Page
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <LeadModal
          lead={selectedLead}
          agents={agents}
          onClose={handleModalClose}
        />
      )}

      {showDetailModal && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default LeadList;
