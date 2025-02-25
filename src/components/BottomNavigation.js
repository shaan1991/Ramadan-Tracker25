// File: src/components/BottomNavigation.js
import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './BottomNavigation.css';

const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState('home');

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="bottom-nav">
      <div 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <div className="nav-icon">🏠</div>
        <p>Home</p>
      </div>
      <div 
        className={`nav-item ${activeTab === 'mosque' ? 'active' : ''}`}
        onClick={() => setActiveTab('mosque')}
      >
        <div className="nav-icon">🕌</div>
        <p>Mosque</p>
      </div>
      <div 
        className={`nav-item ${activeTab === 'time' ? 'active' : ''}`}
        onClick={() => setActiveTab('time')}
      >
        <div className="nav-icon">⏰</div>
        <p>Time</p>
      </div>
      <div 
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('profile');
          // For now, clicking profile signs out (you can change this later)
          if (window.confirm("Do you want to sign out?")) {
            handleSignOut();
          }
        }}
      >
        <div className="nav-icon">👤</div>
        <p>Profile</p>
      </div>
    </div>
    
  );
};

export default BottomNavigation;