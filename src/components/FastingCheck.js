// File: src/components/FastingCheck.js
import React, { useCallback, useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { calculateStreak, updateStreakData } from '../services/streakService';
import { DEFAULT_RAMADAN_START_DATE } from '../utils/dateValidation';
import './FastingCheck.css';

const FastingCheck = () => {
  const { user, userData, updateUserData, isWithinRamadan } = useUser();
  const { prayerTimes } = usePrayerTimes();
  const [streak, setStreak] = useState(0);
  const [currentRamadanDay, setCurrentRamadanDay] = useState(1);
  const [animate, setAnimate] = useState(false);
  
  const getEffectiveDate = useCallback(() => {
    if (userData?.isHistoricalView && userData?.historicalDate) {
      const [year, month, day] = userData.historicalDate.split('-').map(num => parseInt(num));
      return new Date(year, month - 1, day);
    }
    return new Date();
  }, [userData?.isHistoricalView, userData?.historicalDate]);
  
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
        // Define Ramadan start date - use user region when available
        const fallbackStart = `${DEFAULT_RAMADAN_START_DATE.getFullYear()}-${String(DEFAULT_RAMADAN_START_DATE.getMonth() + 1).padStart(2, '0')}-${String(DEFAULT_RAMADAN_START_DATE.getDate()).padStart(2, '0')}`;
        const startString = userData?.ramadanStartDate || fallbackStart;
        const [startYear, startMonth, startDay] = startString.split('-').map(Number);
        ramadanStartDate = new Date(startYear, startMonth - 1, startDay);
        
        // Set both dates to noon to avoid timezone issues
        dateToUse.setHours(12, 0, 0, 0);
        ramadanStartDate.setHours(12, 0, 0, 0);
        
        // Calculate difference in days
        const timeDiff = dateToUse - ramadanStartDate;
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)); // +1 because first day is day 1
        
        // Set the current Ramadan day (between 1 and 30)
        const totalDays = userData?.ramadanLength || 30;
        if (dayDiff >= 1 && dayDiff <= totalDays) {
          setCurrentRamadanDay(dayDiff);
        } else if (dayDiff < 1) {
          // Before Ramadan started
          setCurrentRamadanDay(1); // Default to day 1
        } else {
          // After Ramadan ended
          setCurrentRamadanDay(totalDays); // Cap at configured length
        }
      }
    };
    
    calculateRamadanDay();
  }, [userData?.isHistoricalView, userData?.historicalDate, userData?.ramadanLength, userData?.ramadanStartDate, prayerTimes]);

  // Load streak data when component mounts or userData changes
  useEffect(() => {
    const loadStreak = async () => {
      if (user?.uid) {
        const ramadanMode = isWithinRamadan(getEffectiveDate());
        const { current } = await calculateStreak(user.uid, 'fasting', { 
          ramadanOnly: ramadanMode,
          baseDate: getEffectiveDate()
        });
        
        // Only show streak if user is fasting (in current or historical view)
        if (userData?.fasting === true) {
          setStreak(current);
        } else {
          setStreak(0); // Hide streak if not fasting
        }
      }
    };
    
    loadStreak();
  }, [user, userData?.fasting, userData?.isHistoricalView, userData?.historicalDate, isWithinRamadan, getEffectiveDate]);

  if (!userData) return null;
  const effectiveDate = getEffectiveDate();
  const isRamadanMode = isWithinRamadan ? isWithinRamadan(effectiveDate) : false;
  const daysInMonth = new Date(effectiveDate.getFullYear(), effectiveDate.getMonth() + 1, 0).getDate();
  const ramadanLength = userData?.ramadanLength || 30;
  const progressPercentage = isRamadanMode
    ? (currentRamadanDay / ramadanLength) * 100
    : (effectiveDate.getDate() / daysInMonth) * 100;

  // Update fasting status with proper streak tracking and date validation
  const handleFastingToggle = async (status) => {
    try {
      // Update user data in Firebase
      await updateUserData({ fasting: status });
      setAnimate(true);
      setTimeout(() => setAnimate(false), 350);
      
      // Update streak data
      if (user?.uid) {
        const ramadanMode = isWithinRamadan(getEffectiveDate());
        if (!userData?.isHistoricalView) {
          await updateStreakData(user.uid, 'fasting', status, { 
            ramadanOnly: ramadanMode,
            baseDate: getEffectiveDate()
          });
        }
        
        // Refresh streak display
        const { current } = await calculateStreak(user.uid, 'fasting', { 
          ramadanOnly: ramadanMode,
          baseDate: getEffectiveDate()
        });
        setStreak(current);
      }
    } catch (error) {
      console.error("Error updating fasting status:", error);
    }
  };

  return (
    <div className={`fasting-container ${animate ? 'pulse' : ''}`}>
      <div className="fasting-header">
        <h3>🧆 Fasting today?</h3>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
          </div>
        )}
      </div>
      
      <div className={`pill-toggle ${userData.fasting ? 'is-yes' : 'is-no'}`}>
        <div className="pill-slider" />
        <button 
          className={`pill-option ${!userData.fasting ? 'active' : ''}`}
          onClick={() => handleFastingToggle(false)}
        >
          No
        </button>
        <button 
          className={`pill-option ${userData.fasting ? 'active' : ''}`}
          onClick={() => handleFastingToggle(true)}
        >
          Yes
        </button>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* <div className="progress-text">
        {currentRamadanDay} out of 30
      </div>
       */}
    </div>
  );
};

export default FastingCheck;
