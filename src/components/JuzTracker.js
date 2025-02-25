// File: src/components/JuzTracker.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import './JuzTracker.css';

const JuzTracker = () => {
  const { userData, ramadanDay, updateUserData, recordDailyAction } = useUser();

  if (!userData) return null;

  const handleDecrement = async () => {
    if (userData.quran.completed > 0) {
      const newCount = userData.quran.completed - 1;
      await updateUserData({ 
        quran: { ...userData.quran, completed: newCount } 
      });
      await recordDailyAction('quran_juz', newCount);
    }
  };

  const handleIncrement = async () => {
    if (userData.quran.completed < userData.quran.total) {
      const newCount = userData.quran.completed + 1;
      await updateUserData({ 
        quran: { ...userData.quran, completed: newCount } 
      });
      await recordDailyAction('quran_juz', newCount);
    }
  };

  return (
    <div className="juz-tracker-container">
      <h3>Juz Tracker</h3>
      
      <div className="juz-counter">
        <button className="counter-button" onClick={handleDecrement}>-</button>
        <div className="juz-display">
          {userData.quran.completed}/{userData.quran.total}
        </div>
        <button className="counter-button" onClick={handleIncrement}>+</button>
      </div>
      
      <div className="progress-bar">
        <div className="progress-text">
          {ramadanDay} out of 30
        </div>
      </div>
    </div>
  );
};

export default JuzTracker;