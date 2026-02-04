// File: src/components/TaraweehCheck.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { calculateStreak, updateStreakData } from '../services/streakService';
import { DEFAULT_RAMADAN_START_DATE } from '../utils/dateValidation';
import './TaraweehCheck.css';

const TaraweehCheck = () => {
  const { user, userData, updateUserData, isWithinRamadan } = useUser();
  const { prayerTimes } = usePrayerTimes();
  const [streak, setStreak] = useState(0);
  const [currentRamadanDay, setCurrentRamadanDay] = useState(1);
  const [animate, setAnimate] = useState(false);

  const getEffectiveDate = () => {
    if (userData?.isHistoricalView && userData?.historicalDate) {
      const [year, month, day] = userData.historicalDate.split('-').map(num => parseInt(num));
      return new Date(year, month - 1, day);
    }
    return new Date();
  };
  
  // Calculate Ramadan day based on Adhan's date calculation when available
  useEffect(() => {
    const calculateRamadanDay = () => {
      // Define Ramadan start date (region-aware when available)
      const fallbackStart = `${DEFAULT_RAMADAN_START_DATE.getFullYear()}-${String(DEFAULT_RAMADAN_START_DATE.getMonth() + 1).padStart(2, '0')}-${String(DEFAULT_RAMADAN_START_DATE.getDate()).padStart(2, '0')}`;
      const startString = userData?.ramadanStartDate || fallbackStart;
      const [startYear, startMonth, startDay] = startString.split('-').map(Number);
      const ramadanStartDate = new Date(startYear, startMonth - 1, startDay);
      
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
    };
    
    calculateRamadanDay();
  }, [userData?.isHistoricalView, userData?.historicalDate, prayerTimes]);

  // Load streak data when component mounts or userData changes
  useEffect(() => {
    const loadStreak = async () => {
      if (user?.uid) {
        const ramadanMode = isWithinRamadan(getEffectiveDate());
        const { current } = await calculateStreak(user.uid, 'taraweeh', { 
          ramadanOnly: ramadanMode,
          baseDate: getEffectiveDate()
        });
        
        // Only show streak if user prayed taraweeh
        if (userData?.prayedTaraweeh === true) {
          setStreak(current);
        } else {
          setStreak(0); // Hide streak if not prayed
        }
      }
    };
    
    loadStreak();
  }, [user, userData?.prayedTaraweeh, userData?.isHistoricalView, userData?.historicalDate, isWithinRamadan]); 

  if (!userData) return null;
  const effectiveDate = getEffectiveDate();
  const isRamadanMode = isWithinRamadan ? isWithinRamadan(effectiveDate) : false;
  const daysInMonth = new Date(effectiveDate.getFullYear(), effectiveDate.getMonth() + 1, 0).getDate();
  const ramadanLength = userData?.ramadanLength || 30;
  const progressPercentage = isRamadanMode
    ? (currentRamadanDay / ramadanLength) * 100
    : (effectiveDate.getDate() / daysInMonth) * 100;

  // Update taraweeh status with proper streak tracking and date validation
  const handleTaraweehToggle = async (status) => {
    try {
      // Update user data in Firebase
      await updateUserData({ prayedTaraweeh: status });
      setAnimate(true);
      setTimeout(() => setAnimate(false), 350);
      
      // Update streak data
      if (user?.uid) {
        const ramadanMode = isWithinRamadan(getEffectiveDate());
        if (!userData?.isHistoricalView) {
          await updateStreakData(user.uid, 'taraweeh', status, { 
            ramadanOnly: ramadanMode,
            baseDate: getEffectiveDate()
          });
        }
        
        // Refresh streak display
        const { current } = await calculateStreak(user.uid, 'taraweeh', { 
          ramadanOnly: ramadanMode,
          baseDate: getEffectiveDate()
        });
        // Ensure streak shows 1 if taraweeh was prayed today
        setStreak(status ? Math.max(current, 1) : current);
      }
    } catch (error) {
      console.error("Error updating taraweeh status:", error);
    }
  };

  return (
    <div className={`taraweeh-container ${animate ? 'pulse' : ''}`}>
      <div className="taraweeh-header">
        <h3>🌙 Prayed Taraweeh Today?</h3>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
          </div>
        )}
      </div>
      <div className={`pill-toggle ${userData.prayedTaraweeh ? 'is-yes' : 'is-no'}`}>
        <div className="pill-slider" />
        <button 
          className={`pill-option ${!userData.prayedTaraweeh ? 'active' : ''}`}
          onClick={() => handleTaraweehToggle(false)}
        >
          No
        </button>
        <button 
          className={`pill-option ${userData.prayedTaraweeh ? 'active' : ''}`}
          onClick={() => handleTaraweehToggle(true)}
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
    </div>
  );
};

export default TaraweehCheck;
