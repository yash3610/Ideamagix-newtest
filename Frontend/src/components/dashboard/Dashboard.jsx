import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
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
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [leadsOverTime, setLeadsOverTime] = useState([]);
  const [topTags, setTopTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load dashboard stats
      const statsRes = await analyticsAPI.getDashboard();
      setStats(statsRes.data.data);

      const statusRes = await analyticsAPI.getLeadStatusDistribution();
      setStatusDistribution(statusRes.data.data);

      if (isAdmin()) {
        const agentRes = await analyticsAPI.getAgentPerformance();
        setAgentPerformance(agentRes.data.data);
      }

      const activityRes = await analyticsAPI.getRecentActivity({ limit: 10 });
      setRecentActivity(activityRes.data.data);

      const timeRes = await analyticsAPI.getLeadsOverTime({ period: 30 });
      setLeadsOverTime(timeRes.data.data);

      const tagsRes = await analyticsAPI.getTopTags({ limit: 10 });
      setTopTags(tagsRes.data.data);

    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }
  
  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p className="welcome-text">Welcome back, {user?.name}!</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>
            <span style={{ color: '#1976d2' }}>📊</span>
          </div>
          <div className="stat-content">
            <h3>{stats?.totalLeads || 0}</h3>
            <p>Total Leads</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>
            <span style={{ color: '#388e3c' }}>✓</span>
          </div>
          <div className="stat-content">
            <h3>{stats?.leadsByStatus?.Won || 0}</h3>
            <p>Won Leads</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>
            <span style={{ color: '#f57c00' }}>📞</span>
          </div>
          <div className="stat-content">
            <h3>{stats?.leadsByStatus?.Contacted || 0}</h3>
            <p>Contacted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>
            <span style={{ color: '#7b1fa2' }}>%</span>
          </div>
          <div className="stat-content">
            <h3>{stats?.conversionRate || 0}%</h3>
            <p>Conversion Rate</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">

        <div className="card chart-card">
          <h3>Lead Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Leads Over Time (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#667eea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h3>Top Tags</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topTags}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tag" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#764ba2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {isAdmin() && agentPerformance.length > 0 && (
          <div className="card chart-card">
            <h3>Agent Performance</h3>
            <div className="agent-performance-list">
              {agentPerformance.map((agent, index) => (
                <div key={index} className="agent-performance-item">
                  <div className="agent-info">
                    <strong>{agent.agent.name}</strong>
                    <span className="agent-email">{agent.agent.email}</span>
                  </div>
                  <div className="agent-stats">
                    <span className="agent-leads">{agent.totalLeads} leads</span>
                    <span className="agent-conversion">{agent.conversionRate}% conversion</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.length === 0 ? (
            <p className="no-data">No recent activity</p>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                
                <div className="activity-content">
                  <p className="activity-text">
                    <strong>{activity.user?.name}</strong> {activity.details}
                  </p>
                  <span className="activity-time">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
