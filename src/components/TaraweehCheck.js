// File: src/components/TaraweehCheck.js (Fixed)
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculateStreak, updateStreakData } from '../services/streakService';
import './TaraweehCheck.css';

const TaraweehCheck = () => {
  const { user, userData, ramadanDay, updateUserData, recordDailyAction } = useUser();
  const [streak, setStreak] = useState(0);

  // Load streak data when component mounts or userData changes
  useEffect(() => {
    const loadStreak = async () => {
      if (user?.uid) {
        const { current } = await calculateStreak(user.uid, 'taraweeh');
        setStreak(current);
      }
    };
    
    loadStreak();
  }, [user, userData]);

  if (!userData) return null;

  // Update taraweeh status with proper streak tracking
  const handleTaraweehToggle = async (status) => {
    try {
      // Update user data in Firebase
      await updateUserData({ prayedTaraweeh: status });
      
      // Record this action in daily history
      await recordDailyAction('taraweeh', status);
      
      // Update streak data
      if (user?.uid) {
        await updateStreakData(user.uid, 'taraweeh', status);
        
        // Refresh streak display
        const { current } = await calculateStreak(user.uid, 'taraweeh');
        setStreak(current);
      }
    } catch (error) {
      console.error("Error updating taraweeh status:", error);
    }
  };

  return (
    <div className="taraweeh-container">
      <div className="taraweeh-header">
        <h3>Prayed Taraweeh Today?</h3>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
          </div>
        )}
      </div>
      
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

export default TaraweehCheck;