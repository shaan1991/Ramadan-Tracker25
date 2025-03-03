// File: src/components/FastingCheck.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { calculateStreak, updateStreakData } from '../services/streakService';
import './FastingCheck.css';
import '../styles/preRamadan.css';

const FastingCheck = () => {
  const { user, userData, updateUserData, recordDailyAction } = useUser();
  const { prayerTimes, locationStatus } = usePrayerTimes();
  const [streak, setStreak] = useState(0);
  const [currentRamadanDay, setCurrentRamadanDay] = useState(1);
  const [isFastingDayAvailable, setIsFastingDayAvailable] = useState(true);

  // Check if we're viewing a date before Ramadan
  const isBeforeRamadanDay = userData?.beforeRamadan;
  
  // Calculate Ramadan day using Adhan when possible
  useEffect(() => {
    const calculateRamadanDay = () => {
      let dateToUse;
      let isUsingAdhan = false;
      let ramadanStartDate;
      
      // If viewing historical data, use that date
      if (userData?.isHistoricalView && userData?.historicalDate) {
        const [year, month, day] = userData.historicalDate.split('-').map(num => parseInt(num));
        dateToUse = new Date(year, month - 1, day);
      } else {
        // Otherwise use current date
        dateToUse = new Date();
      }
      
      // Try to use Adhan's Islamic date calculation if available
      if (prayerTimes && !userData?.isHistoricalView) {
        try {
          // If Adhan provides Islamic date info, use it
          console.log("Prayer times available for calculation:", prayerTimes);
          
          // Check if prayerTimes has any Hijri date information
          // Adhan might provide Hijri date through its API or calculations
          if (prayerTimes.date && prayerTimes.date.hijri) {
            isUsingAdhan = true;
            console.log("Using Adhan Hijri date:", prayerTimes.date.hijri);
            
            // If we had direct access to Hijri date we could use:
            // const hijriMonth = prayerTimes.date.hijri.month;
            // const hijriDay = prayerTimes.date.hijri.day;
            
            // Check if we're in Ramadan (9th month)
            // const isRamadan = hijriMonth === 9;
            
            // Set Ramadan day directly from Hijri calendar
            // const ramadanDay = isRamadan ? hijriDay : 0;
            
            // For now, we'll still use our calculation as a fallback
          }
        } catch (error) {
          console.error("Error using Adhan date info:", error);
          // Fall back to calculation
        }
      }
      
      // Fallback to calculation if Adhan info not available
      if (!isUsingAdhan) {
        // Define Ramadan start date - keep this for now as fallback
        ramadanStartDate = new Date(2025, 2, 1); // February 28, 2025 (month is 0-indexed)
        
        // Define the date when FastingCheck becomes interactive (1 day after Ramadan starts)
        const fastingCheckStartDate = new Date(ramadanStartDate);
        fastingCheckStartDate.setDate(fastingCheckStartDate.getDate()); // This is March 1st
        
        // Set both dates to noon to avoid timezone issues
        dateToUse.setHours(12, 0, 0, 0);
        ramadanStartDate.setHours(12, 0, 0, 0);
        fastingCheckStartDate.setHours(12, 0, 0, 0);
        
        // Calculate difference in days
        const timeDiff = dateToUse - ramadanStartDate;
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)); // +1 because first day is day 1
        
        // Determine if fasting options should be available (not the pre-fast day)
        const isFastingAvailable = dateToUse >= fastingCheckStartDate;
        setIsFastingDayAvailable(isFastingAvailable);
        
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
      }
    };
    
    calculateRamadanDay();
  }, [userData?.isHistoricalView, userData?.historicalDate, prayerTimes]);

  // Load streak data when component mounts or userData changes
  useEffect(() => {
    const loadStreak = async () => {
      if (user?.uid) {
        const { current } = await calculateStreak(user.uid, 'fasting');
        
        // Only show streak if user is fasting (in current or historical view)
        if (userData?.fasting === true) {
          setStreak(current);
        } else {
          setStreak(0); // Hide streak if not fasting
        }
      }
    };
    
    loadStreak();
  }, [user, userData?.fasting]);

  if (!userData) return null;

  // Update fasting status with proper streak tracking and date validation
  const handleFastingToggle = async (status) => {
    // Prevent recording data for dates before Ramadan
    if (isBeforeRamadanDay) {
      alert("You cannot record fasting for dates before Ramadan begins.");
      return;
    }
    
    // Prevent recording fasting data on the first day of Ramadan (pre-fast day)
    if (!isFastingDayAvailable) {
      alert("You will fast tomorrow. Today is the first day of Ramadan.");
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

  // Determine if the component should be disabled
  const isDisabled = isBeforeRamadanDay || !isFastingDayAvailable;

  return (
    <div className={`fasting-container ${isDisabled ? 'disabled' : ''}`}>
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
      
      {!isBeforeRamadanDay && !isFastingDayAvailable && (
        <div className="pre-ramadan-notice">
         Fasting tracker will be availble after first Taraweeh!
        </div>
      )}
      
      <div className="toggle-buttons">
        <button 
          className={`toggle-button ${!userData.fasting ? 'active' : ''}`}
          onClick={() => handleFastingToggle(false)}
          disabled={isDisabled}
        >
          No
        </button>
        <button 
          className={`toggle-button ${userData.fasting ? 'active' : ''}`}
          onClick={() => handleFastingToggle(true)}
          disabled={isDisabled}
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
      
      {/* <div className="progress-text">
        {currentRamadanDay} out of 30
      </div>
       */}
      {locationStatus === 'error' && (
        <div className="location-warning">
          <small>Using estimated Ramadan dates. Enable location for more accuracy.</small>
        </div>
      )}
    </div>
  );
};

export default FastingCheck;