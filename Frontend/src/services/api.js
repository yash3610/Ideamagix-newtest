import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// User APIs
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getActivity: (id, params) => api.get(`/users/${id}/activity`, { params }),
};

// Lead APIs
export const leadAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getOne: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  addNote: (id, data) => api.post(`/leads/${id}/notes`, data),
  updateNote: (id, noteId, data) => api.put(`/leads/${id}/notes/${noteId}`, data),
  deleteNote: (id, noteId) => api.delete(`/leads/${id}/notes/${noteId}`),
  getAllTags: () => api.get('/leads/tags/all'),
  import: (formData) => api.post('/leads/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  export: (params) => api.get('/leads/export', { 
    params,
    responseType: 'blob'
  }),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getLeadStatusDistribution: () => api.get('/analytics/lead-status-distribution'),
  getAgentPerformance: () => api.get('/analytics/agent-performance'),
  getRecentActivity: (params) => api.get('/analytics/recent-activity', { params }),
  getLeadsOverTime: (params) => api.get('/analytics/leads-over-time', { params }),
  getTopTags: (params) => api.get('/analytics/top-tags', { params }),
};

export default api;
