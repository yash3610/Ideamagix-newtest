import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import LeadList from './components/leads/LeadList';
import UserList from './components/users/UserList';
import Navbar from './components/common/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin, requireSuperAdmin }) => {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// App Routes
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      {user && <Navbar />}
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" /> : <Register />} 
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <LeadList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requireSuperAdmin>
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
