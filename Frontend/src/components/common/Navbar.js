import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          Lead Management
        </Link>
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/leads" className="navbar-link">
            Leads
          </Link>
          {isSuperAdmin() && (
            <Link to="/users" className="navbar-link">
              Users
            </Link>
          )}
        </div>
        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">({user?.role})</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
