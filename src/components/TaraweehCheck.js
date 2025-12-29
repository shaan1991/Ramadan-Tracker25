// File: src/components/TaraweehCheck.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { calculateStreak, updateStreakData } from '../services/streakService';
import './TaraweehCheck.css';
import '../styles/preRamadan.css';

const TaraweehCheck = () => {
  const { user, userData, updateUserData, recordDailyAction } = useUser();
  const { prayerTimes } = usePrayerTimes();
  const [streak, setStreak] = useState(0);
  const [currentRamadanDay, setCurrentRamadanDay] = useState(1);

  // Check if we're viewing a date before Ramadan
  const isBeforeRamadanDay = userData?.beforeRamadan;
  
  // Calculate Ramadan day based on Adhan's date calculation when available
  useEffect(() => {
    const calculateRamadanDay = () => {
      // Define Ramadan start date
      const ramadanStartDate = new Date(2026, 1, 23); // February 23, 2026 (month is 0-indexed)
      
      let dateToUse;
      
      // If viewing historical data, use that date
      if (userData?.isHistoricalView && userData?.historicalDate) {
        const [year, month, day] = userData.historicalDate.split('-').map(num => parseInt(num));
        dateToUse = new Date(year, month - 1, day);
      } else {
        // Otherwise use current date
        dateToUse = new Date();
      }
      
      // Try to use Adhan's date calculation if available
      if (prayerTimes && prayerTimes.date && !userData?.isHistoricalView) {
        console.log("Using Adhan date info for Ramadan day calculation");
      }
      
      // Set both dates to noon to avoid timezone issues
      dateToUse.setHours(12, 0, 0, 0);
      ramadanStartDate.setHours(12, 0, 0, 0);
      
      // Calculate difference in days
      const timeDiff = dateToUse - ramadanStartDate;
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1; // +1 because first day is day 1
      
      // Set the current Ramadan day (between 1 and 30)
      if (dayDiff >= 1 && dayDiff <= 30) {
        setCurrentRamadanDay(dayDiff);
      } else if (dayDiff < 1) {
        // Before Ramadan started
        setCurrentRamadanDay(1); // Default to day 1
      } else {
        // After Ramadan ended
        setCurrentRamadanDay(30); // Cap at day 30
      }
    };
    
    calculateRamadanDay();
  }, [userData?.isHistoricalView, userData?.historicalDate, prayerTimes]);

  // Load streak data when component mounts or userData changes
  useEffect(() => {
    const loadStreak = async () => {
      if (user?.uid) {
        const { current } = await calculateStreak(user.uid, 'taraweeh');
        
        // Only show streak if user prayed taraweeh
        if (userData?.prayedTaraweeh === true) {
          setStreak(current);
        } else {
          setStreak(0); // Hide streak if not prayed
        }
      }
    };
    
    loadStreak();
  }, [user, userData?.prayedTaraweeh]); 

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
        // Ensure streak shows 1 if taraweeh was prayed today
        setStreak(status ? Math.max(current, 1) : current);
      }
    } catch (error) {
      console.error("Error updating taraweeh status:", error);
    }
  };

  return (
    <div className={`taraweeh-container ${isBeforeRamadanDay ? 'disabled' : ''}`}>
      <div className="taraweeh-header">
        <h3>🌙 Prayed Taraweeh Today?</h3>
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
          style={{ width: `${(currentRamadanDay / 30) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TaraweehCheck;