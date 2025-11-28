import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          Lead Management
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/dashboard" className="navbar-link">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/leads" className="navbar-link">
              Leads
            </Link>
          </li>
          {isSuperAdmin() && (
            <li>
              <Link to="/users" className="navbar-link">
                Users
              </Link>
            </li>
          )}
        </ul>
        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">({user?.role})</span>
          <button onClick={handleLogout} className="btn btn-danger btn-small">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
