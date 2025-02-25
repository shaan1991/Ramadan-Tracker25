// File: src/components/TaraweehCheck.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import './TaraweehCheck.css';

const TaraweehCheck = () => {
  const { userData, ramadanDay, updateUserData, recordDailyAction } = useUser();

  if (!userData) return null;

  const handleTaraweehToggle = async (status) => {
    await updateUserData({ prayedTaraweeh: status });
    await recordDailyAction('taraweeh', status);
  };

  return (
    <div className="taraweeh-container">
      <h3>Prayed Taraweeh Today?</h3>
      
      <div className="toggle-buttons">
        <button 
          className={`toggle-button ${!userData.prayedTaraweeh ? 'active' : ''}`}
          onClick={() => handleTaraweehToggle(false)}
        >
          No
        </button>
        <button 
          className={`toggle-button ${userData.prayedTaraweeh ? 'active' : ''}`}
          onClick={() => handleTaraweehToggle(true)}
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

export default TaraweehCheck;