// File: src/components/FastingCheck.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import './FastingCheck.css';

const FastingCheck = () => {
  const { userData, ramadanDay, updateUserData, recordDailyAction } = useUser();

  if (!userData) return null;

  const handleFastingToggle = async (status) => {
    await updateUserData({ fasting: status });
    await recordDailyAction('fasting', status);
  };

  return (
    <div className="fasting-container">
      <h3>Fasting today?</h3>
      
      <div className="toggle-buttons">
        <button 
          className={`toggle-button ${!userData.fasting ? 'active' : ''}`}
          onClick={() => handleFastingToggle(false)}
        >
          No
        </button>
        <button 
          className={`toggle-button ${userData.fasting ? 'active' : ''}`}
          onClick={() => handleFastingToggle(true)}
        >
          Yes
        </button>
      </div>
      
      <div className="progress-bar">
        <div className="progress-text">
          {ramadanDay} out of 30
        </div>
      </div>
    </div>
  );
};

export default FastingCheck;