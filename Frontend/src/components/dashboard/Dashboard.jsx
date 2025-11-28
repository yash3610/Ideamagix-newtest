import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import './Dashboard.css';

const COLORS = {
  New: '#2196F3',
  Contacted: '#FF9800',
  Qualified: '#9C27B0',
  Won: '#4CAF50',
  Lost: '#F44336',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="error">Failed to load dashboard data</div>;
  }

  // Prepare data for charts
  const statusDistributionData = stats.overview?.statusDistribution?.map(item => ({
    status: item._id,
    count: item.count
  })) || [];

  const leadsOverTimeData = stats.monthlyTrend?.map(item => ({
    date: `${item._id.month}/${item._id.year}`,
    count: item.count,
    won: item.won
  })) || [];

  const topSourcesData = stats.overview?.leadsBySource?.slice(0, 5).map(item => ({
    source: item._id || 'Unknown',
    count: item.count
  })) || [];

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p className="welcome-text">Welcome back, {user?.name}!</p>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3b82f6' }}>
            <span>📊</span>
          </div>
          <div className="stat-content">
            <h3>Total Leads</h3>
            <p className="stat-value">{stats.overview?.totalLeads || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#10b981' }}>
            <span>📈</span>
          </div>
          <div className="stat-content">
            <h3>Recent Leads (30 days)</h3>
            <p className="stat-value">{stats.overview?.recentLeadsCount || 0}</p>
          </div>
        </div>

        {stats.userStats && (
          <>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f59e0b' }}>
                <span>👥</span>
              </div>
              <div className="stat-content">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.userStats.total}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#22c55e' }}>
                <span>✓</span>
              </div>
              <div className="stat-content">
                <h3>Active Users</h3>
                <p className="stat-value">{stats.userStats.active}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="card chart-card">
          <h3>Lead Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistributionData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {statusDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#6b7280'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Leads Over Time (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadsOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2} name="Total" />
              <Line type="monotone" dataKey="won" stroke="#22c55e" strokeWidth={2} name="Won" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Top Lead Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSourcesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#764ba2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="dashboard-section">
        <h2>Recent Leads</h2>
        <div className="recent-leads">
          {stats.recentLeads?.map((lead) => (
            <div key={lead._id} className="recent-lead-item">
              <div className="lead-info">
                <h4>{lead.name}</h4>
                <p>{lead.email}</p>
                <p>{lead.phone}</p>
              </div>
              <div className="lead-meta">
                <span className={`status-badge status-${lead.status?.toLowerCase()}`}>
                  {lead.status}
                </span>
                <span className="lead-date">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="dashboard-section">
        <h2>Recent Activity Log</h2>
        <div className="activity-log">
          {stats.recentActivities?.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-icon">
                <i className="fas fa-circle"></i>
              </div>
              <div className="activity-content">
                <p className="activity-action">{activity.action?.replace(/_/g, ' ')}</p>
                <p className="activity-details">{activity.details}</p>
                <div className="activity-meta">
                  <span className="activity-user">
                    {activity.user?.name || 'Unknown User'}
                  </span>
                  <span className="activity-time">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
