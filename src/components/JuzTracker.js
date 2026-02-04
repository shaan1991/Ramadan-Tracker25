// File: src/components/JuzTracker.js - With Pre-Ramadan Validation
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { trackJuzProgress } from '../services/historyTracker';
import { calculateStreak, updateStreakData } from '../services/streakService';
import './JuzTracker.css';

const JuzTracker = () => {
  const { user, userData, updateUserData, isWithinRamadan } = useUser();
  const [completedJuzs, setCompletedJuzs] = useState([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState(null);
  const [streak, setStreak] = useState(0);
  
  const getEffectiveDate = () => {
    if (userData?.isHistoricalView && userData?.historicalDate) {
      const [year, month, day] = userData.historicalDate.split('-').map(num => parseInt(num));
      return new Date(year, month - 1, day);
    }
    return new Date();
  };
  
  // Total juz in Quran
  const totalJuzs = 30;

  // Load data when component mounts or userData changes
  useEffect(() => {
    // Initialize from userData when it changes
    if (userData) {
      // For Juz tracking, we want to use the accumulated data
      if (userData.completedJuzs) {
        setCompletedJuzs(userData.completedJuzs || []);
      } else {
        // Initialize empty
        setCompletedJuzs([]);
      }
      
      // Load streak data only if juz have been read
      if (userData.completedJuzs && userData.completedJuzs.length > 0) {
        loadStreakData();
      } else {
        // Reset streak to 0 if no juz have been read
        setStreak(0);
      }
    }
  }, [userData]);
  
  // Load streak data
  const loadStreakData = async () => {
    if (user?.uid) {
      const ramadanMode = isWithinRamadan(getEffectiveDate());
      const { current } = await calculateStreak(user.uid, 'quran', { 
        ramadanOnly: ramadanMode,
        baseDate: getEffectiveDate()
      });
      setStreak(current);
    }
  };

  // Handle increment/decrement for counter mode
  const handleCounterChange = async (change) => {
    const currentCount = completedJuzs.length;
    const newCount = Math.max(0, Math.min(totalJuzs, currentCount + change));
    
    if (newCount === currentCount) return; // No change needed
    
    // Create new array of completed juzs
    let newCompletedJuzs = [];
    let addedJuz = null;
    let removedJuz = null;
    
    if (change > 0) {
      // Adding a juz - find first uncompleted juz
      for (let i = 1; i <= totalJuzs; i++) {
        if (!completedJuzs.includes(i)) {
          newCompletedJuzs = [...completedJuzs, i];
          addedJuz = i;
          break;
        }
      }
    } else {
      // Removing a juz - remove the last one
      newCompletedJuzs = [...completedJuzs];
      newCompletedJuzs.sort((a, b) => a - b);
      removedJuz = newCompletedJuzs.pop();
    }
    
    // Update local state first for immediate UI feedback
    setCompletedJuzs(newCompletedJuzs);
    
    try {
      // Use the specialized history tracking service
      if (user?.uid && addedJuz) {
        await trackJuzProgress(user.uid, addedJuz, true);
      } else if (user?.uid && removedJuz) {
        await trackJuzProgress(user.uid, removedJuz, false);
      }
      
      // Also update through the main user context
      await updateUserData({ 
        completedJuzs: newCompletedJuzs,
        quran: { 
          completed: newCompletedJuzs.length, 
          total: totalJuzs 
        }
      });
      
      // Update streak data
      if (user?.uid) {
        const ramadanMode = isWithinRamadan(getEffectiveDate());
        if (!userData?.isHistoricalView) {
          await updateStreakData(user.uid, 'quran', newCompletedJuzs.length > 0, { 
            ramadanOnly: ramadanMode,
            baseDate: getEffectiveDate()
          });
        }
        
        // Only load streak data if juz have been read
        if (newCompletedJuzs.length > 0) {
          await loadStreakData(); // Reload streak data
        } else {
          setStreak(0);
        }
      }
    } catch (error) {
      console.error("Error updating Juz progress:", error);
    }
  };

  const handleJuzClick = (juz) => {
    setSelectedJuz(juz);
  };

  const handleMarkAsRead = async () => {
    if (!selectedJuz) return;
    
    // Determine if we're marking as read or unread
    const isCurrentlyCompleted = completedJuzs.includes(selectedJuz);
    const willBeCompleted = !isCurrentlyCompleted;
    
    // Create a new array with the selected juz toggled
    const newCompletedJuzs = [...completedJuzs];
    
    if (willBeCompleted) {
      // Add juz if not already present
      if (!isCurrentlyCompleted) {
        newCompletedJuzs.push(selectedJuz);
      }
    } else {
      // Remove juz
      const index = newCompletedJuzs.indexOf(selectedJuz);
      if (index !== -1) {
        newCompletedJuzs.splice(index, 1);
      }
    }
    
    // Update local state first for immediate UI feedback
    setCompletedJuzs(newCompletedJuzs);
    
    try {
      // Use the specialized history tracking service
      if (user?.uid) {
        await trackJuzProgress(user.uid, selectedJuz, willBeCompleted);
      }
      
      // Also update through the main user context
      await updateUserData({ 
        completedJuzs: newCompletedJuzs,
        quran: { 
          completed: newCompletedJuzs.length, 
          total: totalJuzs 
        }
      });
      
      // Update streak data
      if (user?.uid) {
        const ramadanMode = isWithinRamadan(getEffectiveDate());
        if (!userData?.isHistoricalView) {
          await updateStreakData(user.uid, 'quran', newCompletedJuzs.length > 0, { 
            ramadanOnly: ramadanMode,
            baseDate: getEffectiveDate()
          });
        }
        
        // Only load streak data if juz have been read
        if (newCompletedJuzs.length > 0) {
          await loadStreakData(); // Reload streak data
        } else {
          setStreak(0);
        }
      }
      
      // Clear selection
      setSelectedJuz(null);
    } catch (error) {
      console.error("Error updating Juz progress:", error);
    }
  };

  // Generate array of juz numbers
  const juzNumbers = Array.from({ length: totalJuzs }, (_, i) => i + 1);
  
  // Calculate progress
  const progressPercentage = (completedJuzs.length / totalJuzs) * 100;

  return (
    <div className={`juz-tracker ${advancedMode ? 'advanced-mode' : ''}`}>
      <div className="juz-header">
        <h3>📖 Juz Tracker</h3>
        {streak > 0 && (
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
          </div>
        )}
      </div>
      <p className="juz-description">Track your Qur'an reading during Ramadan</p>
      {/* Simple counter UI */}
      <div className="juz-counter">
        <button 
          className="juz-counter-button"
          onClick={() => handleCounterChange(-1)}
          disabled={completedJuzs.length === 0}
        >
          -
        </button>
        
        <div className="juz-counter-value">
          {completedJuzs.length}/{totalJuzs}
        </div>
        
        <button 
          className="juz-counter-button"
          onClick={() => handleCounterChange(1)}
          disabled={completedJuzs.length === totalJuzs}
        >
          +
        </button>
      </div>
      
      {/* Advanced mode with grid selection */}
      <div className="juz-selection">
        <p className="juz-selection-title">Select juz to mark as completed:</p>
        
        <div className="juz-grid">
          {juzNumbers.map(juz => (
            <div 
              key={juz}
              className={`juz-item ${completedJuzs.includes(juz) ? 'completed' : ''} ${selectedJuz === juz ? 'selected' : ''}`}
              onClick={() => handleJuzClick(juz)}
            >
              {juz}
            </div>
          ))}
        </div>
        
        {selectedJuz && (
          <div className="juz-action">
            <button 
              onClick={handleMarkAsRead}
            >
              {completedJuzs.includes(selectedJuz) ? 'Mark as Unread' : 'Mark as Read'} 
            </button>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {completedJuzs.length} out of {totalJuzs} Juz completed
        </div>
      </div>
    </div>
  );
};

export default JuzTracker;
