// File: src/components/BottomNavigation.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logOut } from '../services/authService';
import './BottomNavigation.css';

// Remove the language context for now to get the component working
// We'll add it back in once we confirm the context is working

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use simple strings instead of translations for now
  const labels = {
    home: 'Home',
    dua: 'Dua',
    tasbeeh: 'Tasbeeh',
    profile: 'Profile'
  };
  
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
        <p>{labels.home}</p>
      </div>
      <div 
        className={`nav-item ${isActive('/dua') ? 'active' : ''}`}
        onClick={() => navigate('/dua')}
      >
        <div className="nav-icon">📿</div>
        <p>{labels.dua}</p>
      </div>
      <div 
        className={`nav-item ${isActive('/tasbeeh') ? 'active' : ''}`}
        onClick={() => navigate('/tasbeeh')}
      >
        <div className="nav-icon">⏰</div>
        <p>{labels.tasbeeh}</p>
      </div>
      <div 
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
      >
        <div className="nav-icon">👤</div>
        <p>{labels.profile}</p>
      </div>
    </div>
  );
};

export default BottomNavigation;