import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="sindoor-dot">🔴</span> Sindoor Daan
        </Link>
        <div className="navbar-links">
          <Link to="/search" className="nav-link">🔍 Search</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">My Profile</Link>
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-btn">Join Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
