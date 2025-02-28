// File: src/components/DailyOverview.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import './DailyOverview.css';

const DailyOverview = () => {
  const { userData } = useUser();

  if (!userData) return null;

  return (
    <div className="daily-overview">
      <div className="overview-header">
        <span className="moon-icon">🌙</span>
        <h3>Day At a glance</h3>
      </div>
      
      <div className="overview-grid">
        <div className="overview-item">
          <div className="icon-background green">
            <span className="icon">🙌</span>
          </div>
          <p>Salah</p>
          <p className="status">{userData.salah.completed}/{userData.salah.total}</p>
        </div>
        
        <div className="overview-item">
          <div className="icon-background blue">
            <span className="icon">🍉</span>
          </div>
          <p>Roza/Fast</p>
          <p className="status">{userData.fasting ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="overview-item">
          <div className="icon-background yellow">
            <span className="icon">🌙</span>
          </div>
          <p>Taraweeh</p>
          <p className="status">{userData.prayedTaraweeh ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="overview-item">
          <div className="icon-background gray">
            <span className="icon">📖</span>
          </div>
          <p>Quaran</p>
          <p className="status">{userData.quran.completed}/{userData.quran.total}</p>
        </div>
      </div>
    </div>
  );
};

export default DailyOverview;