// File: src/components/FastingCheck.js (Fixed)
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculateStreak, updateStreakData } from '../services/streakService';
import './FastingCheck.css';

const FastingCheck = () => {
  const { user, userData, ramadanDay, updateUserData, recordDailyAction } = useUser();
  const [streak, setStreak] = useState(0);

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

  // Update fasting status with proper streak tracking
  const handleFastingToggle = async (status) => {
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
    <div className="fasting-container">
      <div className="fasting-header">
        <h3>Fasting today?</h3>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
          </div>
        )}
      </div>
      
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
        <div 
          className="progress-fill"
          style={{ width: `${(ramadanDay / 30) * 100}%` }}
        ></div>
        <div className="progress-text">
          {ramadanDay} out of 30
        </div>
      </div>
    </div>
  );
};

export default FastingCheck;