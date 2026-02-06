// File: src/components/BottomNavigation.js
import React from 'react';
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
  
  const isActive = (path) => currentPath === path;
  
  const activeIndex = ['/', '/dua', '/tasbeeh', '/profile'].indexOf(currentPath);
  const pillStyle = {
    '--pill-index': Math.max(activeIndex, 0)
  };
  
  return (
    <div className="bottom-nav-container">
      <div className="bottom-nav">
        <span className="nav-pill" style={pillStyle} />
        <div 
          className={`nav-item ${isActive('/') ? 'active' : ''}`}
          onClick={() => onNavigate('/')}
        >
          <div className="nav-icon">⌂</div>
          <p>{labels.home}</p>
        </div>
        <div 
          className={`nav-item ${isActive('/dua') ? 'active' : ''}`}
          onClick={() => onNavigate('/dua')}
        >
          <div className="nav-icon">☪︎</div>
          <p>{labels.dua}</p>
        </div>
        <div 
          className={`nav-item ${isActive('/tasbeeh') ? 'active' : ''}`}
          onClick={() => onNavigate('/tasbeeh')}
        >
          <div className="nav-icon">◎</div>
          <p>{labels.tasbeeh}</p>
        </div>
        <div 
          className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
          onClick={() => onNavigate('/profile')}
        >
          <div className="nav-icon">✦</div>
          <p>{labels.profile}</p>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
