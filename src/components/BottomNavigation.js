// File: src/components/BottomNavigation.js
import React from 'react';
import { logOut } from '../services/authService';
import './BottomNavigation.css';

// Remove the language context for now to get the component working
// We'll add it back in once we confirm the context is working

const BottomNavigation = ({ currentPath, onNavigate }) => {
  
  // Use simple strings instead of translations for now
  const labels = {
    home: 'Home',
    dua: 'Dua',
    tasbeeh: 'Tasbeeh',
    profile: 'More'
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
  
  const isActive = (path) => currentPath === path;
  
  return (
    <div className="bottom-nav">
      <div 
        className={`nav-item ${isActive('/') ? 'active' : ''}`}
        onClick={() => onNavigate('/')}
      >
        <div className="nav-icon">🏠</div>
        <p>{labels.home}</p>
      </div>
      <div 
        className={`nav-item ${isActive('/dua') ? 'active' : ''}`}
        onClick={() => onNavigate('/dua')}
      >
        <div className="nav-icon">🤲</div>
        <p>{labels.dua}</p>
      </div>
      <div 
        className={`nav-item ${isActive('/tasbeeh') ? 'active' : ''}`}
        onClick={() => onNavigate('/tasbeeh')}
      >
        <div className="nav-icon">📿</div>
        <p>{labels.tasbeeh}</p>
      </div>
      <div 
        className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => onNavigate('/profile')}
      >
        <div className="nav-icon">✨</div>
        <p>{labels.profile}</p>
      </div>
    </div>
  );
};

export default BottomNavigation;
