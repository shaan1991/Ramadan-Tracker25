// File: src/components/TaraweehCheck.js
import React, { useCallback, useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { calculateStreak, updateStreakData } from '../services/streakService';
import { DEFAULT_RAMADAN_START_DATE } from '../utils/dateValidation';
import './TaraweehCheck.css';

const TaraweehCheck = () => {
  const { user, userData, updateUserData, isWithinRamadan } = useUser();
  const [streak, setStreak] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [localTaraweehStatus, setLocalTaraweehStatus] = useState(false);

  const formatDateKey = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getEffectiveDate = useCallback(() => {
    if (userData?.isHistoricalView && userData?.historicalDate) {
      const [year, month, day] = userData.historicalDate.split('-').map(num => parseInt(num));
      return new Date(year, month - 1, day);
    }
    return new Date();
  }, [userData?.isHistoricalView, userData?.historicalDate]);

  const getRamadanStartForUser = useCallback(() => {
    const fallbackStart = `${DEFAULT_RAMADAN_START_DATE.getFullYear()}-${String(DEFAULT_RAMADAN_START_DATE.getMonth() + 1).padStart(2, '0')}-${String(DEFAULT_RAMADAN_START_DATE.getDate()).padStart(2, '0')}`;
    const startString = userData?.ramadanStartDate || fallbackStart;
    const [startYear, startMonth, startDay] = startString.split('-').map(Number);
    return new Date(startYear, startMonth - 1, startDay, 12, 0, 0, 0);
  }, [userData?.ramadanStartDate]);

  const getTaraweehTargetDate = useCallback((sourceDate) => {
    const dateToUse = new Date(sourceDate.getFullYear(), sourceDate.getMonth(), sourceDate.getDate(), 12, 0, 0, 0);
    const startDate = getRamadanStartForUser();

    if (isWithinRamadan ? isWithinRamadan(dateToUse) : false) {
      return dateToUse;
    }

    const preRamadanNight = new Date(startDate);
    preRamadanNight.setDate(preRamadanNight.getDate() - 1);
    if (dateToUse.getTime() === preRamadanNight.getTime()) {
      return startDate;
    }

    return null;
  }, [getRamadanStartForUser, isWithinRamadan]);

  const effectiveDate = getEffectiveDate();
  const taraweehTargetDate = getTaraweehTargetDate(effectiveDate);
  const targetKey = taraweehTargetDate ? formatDateKey(taraweehTargetDate) : null;
  const todayKey = formatDateKey(new Date());
  const targetHistory = targetKey ? (userData?.history?.[targetKey] || {}) : {};
  const resolvedTaraweehStatus = targetKey
    ? ((targetHistory.prayedTaraweeh ?? targetHistory.taraweeh)
      ?? (targetKey === todayKey ? (userData?.prayedTaraweeh ?? false) : false))
    : false;

  useEffect(() => {
    setLocalTaraweehStatus(Boolean(resolvedTaraweehStatus));
  }, [resolvedTaraweehStatus, targetKey]);

  // Load streak data when component mounts or userData changes
  useEffect(() => {
    const loadStreak = async () => {
      if (user?.uid) {
        const baseDate = getTaraweehTargetDate(getEffectiveDate()) || getEffectiveDate();
        const ramadanMode = isWithinRamadan(baseDate);
        const { current } = await calculateStreak(user.uid, 'taraweeh', { 
          ramadanOnly: ramadanMode,
          baseDate
        });
        
        // Only show streak if user prayed taraweeh
        if (localTaraweehStatus === true) {
          setStreak(current);
        } else {
          setStreak(0); // Hide streak if not prayed
        }
      }
    };
    
    loadStreak();
  }, [user, userData?.isHistoricalView, userData?.historicalDate, isWithinRamadan, getEffectiveDate, getTaraweehTargetDate, localTaraweehStatus]); 

  if (!userData) return null;
  if (!taraweehTargetDate) return null;

  const isRamadanMode = isWithinRamadan ? isWithinRamadan(taraweehTargetDate) : false;
  const daysInMonth = new Date(effectiveDate.getFullYear(), effectiveDate.getMonth() + 1, 0).getDate();
  const ramadanLength = userData?.ramadanLength || 30;
  const startDate = getRamadanStartForUser();
  const normalizedTargetDate = new Date(taraweehTargetDate);
  normalizedTargetDate.setHours(12, 0, 0, 0);
  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setHours(12, 0, 0, 0);
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const dayFromStart = Math.floor((normalizedTargetDate - normalizedStartDate) / MS_PER_DAY) + 1;
  const ramadanNightCount = Math.min(Math.max(dayFromStart, 1), ramadanLength);
  const getOrdinal = (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return `${n}st`;
    if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
    if (mod10 === 3 && mod100 !== 13) return `${n}rd`;
    return `${n}th`;
  };
  const ramadanNightLabel = getOrdinal(ramadanNightCount);
  const progressPercentage = isRamadanMode
    ? (ramadanNightCount / ramadanLength) * 100
    : (effectiveDate.getDate() / daysInMonth) * 100;

  // Update taraweeh status with proper streak tracking and date validation
  const handleTaraweehToggle = async (status) => {
    try {
      setLocalTaraweehStatus(status);
      // Update user data in Firebase
      await updateUserData({ prayedTaraweeh: status, historyDateOverride: targetKey });
      setAnimate(true);
      setTimeout(() => setAnimate(false), 350);
      
      // Update streak data
      if (user?.uid) {
        const baseDate = taraweehTargetDate;
        const ramadanMode = isWithinRamadan(baseDate);
        await updateStreakData(user.uid, 'taraweeh', status, { 
          ramadanOnly: ramadanMode,
          baseDate
        });
        
        // Refresh streak display
        const { current } = await calculateStreak(user.uid, 'taraweeh', { 
          ramadanOnly: ramadanMode,
          baseDate
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
        <h3>🌙 Prayed Taraweeh?</h3>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
          </div>
        )}
      </div>
      <p className="taraweeh-note">
        You are logging for the {ramadanNightLabel} night of Ramadan.
      </p>
      <div className={`pill-toggle ${localTaraweehStatus ? 'is-yes' : 'is-no'}`}>
        <div className="pill-slider" />
        <button 
          className={`pill-option ${!localTaraweehStatus ? 'active' : ''}`}
          onClick={() => handleTaraweehToggle(false)}
        >
          No
        </button>
        <button 
          className={`pill-option ${localTaraweehStatus ? 'active' : ''}`}
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
