// File: src/components/TaraweehCheck.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculateStreak, updateStreakData } from '../services/streakService';
import './TaraweehCheck.css';
// Import the CSS for pre-Ramadan styling
import '../styles/preRamadan.css';

const TaraweehCheck = () => {
  const { user, userData, ramadanDay, updateUserData, recordDailyAction } = useUser();
  const [streak, setStreak] = useState(0);

  // Check if we're viewing a date before Ramadan
  const isBeforeRamadanDay = userData?.beforeRamadan;

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

  // Update taraweeh status with proper streak tracking and date validation
  const handleTaraweehToggle = async (status) => {
    // Prevent recording data for dates before Ramadan
    if (isBeforeRamadanDay) {
      alert("You cannot record Taraweeh prayers for dates before Ramadan begins.");
      return;
    }
    
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
    <div className={`taraweeh-container ${isBeforeRamadanDay ? 'disabled' : ''}`}>
      <div className="taraweeh-header">
        <h3>Prayed Taraweeh Today?</h3>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
          </div>
        )}
      </div>
      
      {isBeforeRamadanDay && (
        <div className="pre-ramadan-notice">
          Cannot record Taraweeh prayers for dates before Ramadan begins.
        </div>
      )}
      
      <div className="toggle-buttons">
        <button 
          className={`toggle-button ${!userData.prayedTaraweeh ? 'active' : ''}`}
          onClick={() => handleTaraweehToggle(false)}
          disabled={isBeforeRamadanDay}
        >
          No
        </button>
        <button 
          className={`toggle-button ${userData.prayedTaraweeh ? 'active' : ''}`}
          onClick={() => handleTaraweehToggle(true)}
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

export default TaraweehCheck;