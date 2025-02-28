// File: src/components/FastingCheck.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculateStreak, updateStreakData } from '../services/streakService';
import './FastingCheck.css';
// Import the CSS for pre-Ramadan styling
import '../styles/preRamadan.css';

const FastingCheck = () => {
  const { user, userData, ramadanDay, updateUserData, recordDailyAction } = useUser();
  const [streak, setStreak] = useState(0);

  // Check if we're viewing a date before Ramadan
  const isBeforeRamadanDay = userData?.beforeRamadan;

  // Load streak data when component mounts or userData changes
  useEffect(() => {
    const loadStreak = async () => {
      if (user?.uid) {
        const { current } = await calculateStreak(user.uid, 'fasting');
        setStreak(current);
      }
    };
    
    loadStreak();
  }, [user, userData]);

  if (!userData) return null;

  // Update fasting status with proper streak tracking and date validation
  const handleFastingToggle = async (status) => {
    // Prevent recording data for dates before Ramadan
    if (isBeforeRamadanDay) {
      alert("You cannot record fasting for dates before Ramadan begins.");
      return;
    }
    
    try {
      // Update user data in Firebase
      await updateUserData({ fasting: status });
      
      // Record this action in daily history
      await recordDailyAction('fasting', status);
      
      // Update streak data
      if (user?.uid) {
        await updateStreakData(user.uid, 'fasting', status);
        
        // Refresh streak display
        const { current } = await calculateStreak(user.uid, 'fasting');
        setStreak(current);
      }
    } catch (error) {
      console.error("Error updating fasting status:", error);
    }
  };

  return (
    <div className={`fasting-container ${isBeforeRamadanDay ? 'disabled' : ''}`}>
      <div className="fasting-header">
        <h3>🧆 Fasting today?</h3>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
          </div>
        )}
      </div>
      
      {isBeforeRamadanDay && (
        <div className="pre-ramadan-notice">
          Cannot record fasting for dates before Ramadan begins.
        </div>
      )}
      
      <div className="toggle-buttons">
        <button 
          className={`toggle-button ${!userData.fasting ? 'active' : ''}`}
          onClick={() => handleFastingToggle(false)}
          disabled={isBeforeRamadanDay}
        >
          No
        </button>
        <button 
          className={`toggle-button ${userData.fasting ? 'active' : ''}`}
          onClick={() => handleFastingToggle(true)}
          disabled={isBeforeRamadanDay}
        >
          Yes
        </button>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${(ramadanDay / 30) * 100}%` }}
        ></div>
      </div>
      
      <div className="progress-text">
        {ramadanDay} out of 30
      </div>
    </div>
  );
};

export default FastingCheck;