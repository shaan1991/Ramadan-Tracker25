// File: src/components/BottomNavigation.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logOut } from '../services/authService';
import './BottomNavigation.css';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      try {
        await logOut();
        // The auth state change will be handled by onAuthStateChanged in App.js
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <div className="bottom-nav">
  <div 
    className={`nav-item ${isActive('/') ? 'active' : ''}`}
    onClick={() => navigate('/')}
  >
    <div className="nav-icon">🏠</div>
    <p>Home</p>
  </div>
  <div 
    className={`nav-item ${isActive('/dua') ? 'active' : ''}`}
    onClick={() => navigate('/dua')}
  >
    <div className="nav-icon">📿</div>
    <p>Dua</p>
  </div>
  <div 
    className={`nav-item ${isActive('/tasbeeh') ? 'active' : ''}`}
    onClick={() => navigate('/tasbeeh')}
  >
    <div className="nav-icon">⏰</div>
    <p>Tasbeeh</p>
  </div>
  <div 
    className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
    onClick={() => navigate('/profile')}
  >
    <div className="nav-icon">👤</div>
    <p>Profile</p>
  </div>
</div>

  );
};

export default BottomNavigation;