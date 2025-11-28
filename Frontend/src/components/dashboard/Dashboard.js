import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getRecentActivity({ limit: 10 })
      ]);

      setStats(statsRes.data.data);
      setActivities(activityRes.data.data);
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

  return (
    <div className="container">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Leads</h3>
          <p className="stat-number">{stats.totalLeads}</p>
        </div>
        
        <div className="stat-card">
          <h3>Recent Leads</h3>
          <p className="stat-number">{stats.recentLeads}</p>
          <small>Last 30 days</small>
        </div>

        <div className="stat-card">
          <h3>Conversion Rate</h3>
          <p className="stat-number">{stats.conversionRate}%</p>
        </div>

        {isAdmin() && stats.totalUsers && (
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <small>{stats.activeUsers} active</small>
          </div>
        )}
      </div>

      <div className="dashboard-row">
        <div className="card">
          <h2>Leads by Status</h2>
          <div className="status-list">
            {Object.entries(stats.leadsByStatus).map(([status, count]) => (
              <div key={status} className="status-item">
                <span className={`badge badge-${status.toLowerCase()}`}>
                  {status}
                </span>
                <span className="status-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {activities.length === 0 ? (
              <p>No recent activity</p>
            ) : (
              activities.map((activity) => (
                <div key={activity._id} className="activity-item">
                  <div>
                    <strong>{activity.user?.name}</strong> {activity.action.toLowerCase().replace('_', ' ')}
                  </div>
                  <small>{new Date(activity.createdAt).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
