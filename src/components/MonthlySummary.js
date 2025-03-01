// src/components/MonthlySummary.js (Simplified version)
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getMonthlyJuzReport } from '../services/historyTracker';
import { getAllStreaks, getBestStreak } from '../services/streakService';
import { isWithinRamadan } from '../utils/dateValidation';
import './MonthlySummary.css';

const MonthlySummary = () => {
  const { user, userData } = useUser();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState({
    quran: { current: 0, best: 0 },
    fasting: { current: 0, best: 0 },
    taraweeh: { current: 0, best: 0 }
  });
  const [bestStreak, setBestStreak] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  
  // Load all data when component mounts or user changes
  useEffect(() => {
    const loadAllData = async () => {
      if (!user?.uid) return;
      
      setLoading(true);
      
      try {
        // Load Quran progress report
        const monthReport = await getMonthlyJuzReport(user.uid);
        setReport(monthReport);
        
        // Load streak information for all activities
        const allStreaks = await getAllStreaks(user.uid);
        setStreaks(allStreaks);
        
        // Get best streak across all activities
        const best = await getBestStreak(user.uid);
        setBestStreak(best);
        
        // Calculate active days (days with any activity)
        if (userData && userData.history) {
          // Only count days that are within Ramadan
          const validDates = Object.keys(userData.history).filter(dateString => {
            const date = new Date(dateString);
            return isWithinRamadan(date);
          });
          setActiveDays(validDates.length);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading summary data:", error);
        setLoading(false);
      }
    };
    
    loadAllData();
    
    // Refresh data periodically
    const intervalId = setInterval(() => {
      if (user?.uid) loadAllData();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [user, userData]);
  
  if (loading) {
    return (
      <div className="monthly-summary loading">
        <p>Loading your monthly progress...</p>
      </div>
    );
  }
  
  return (
    <div className="monthly-summary">
      {/* Streak summary row */}
      <div className="streak-summary">
        <div className="streak-category">
          <div className="streak-icon">📖</div>
          <div className="streak-info">
            <div className="streak-label">Quran</div>
            <div className="streak-value">{streaks.quran.current} days</div>
          </div>
        </div>
        
        <div className="streak-category">
          <div className="streak-icon">🌙</div>
          <div className="streak-info">
            <div className="streak-label">Fasting</div>
            <div className="streak-value">{streaks.fasting.current} days</div>
          </div>
        </div>
        
        <div className="streak-category">
          <div className="streak-icon">🕌</div>
          <div className="streak-info">
            <div className="streak-label">Taraweeh</div>
            <div className="streak-value">{streaks.taraweeh.current} days</div>
          </div>
        </div>
      </div>
      
      {/* Stats boxes */}
      <div className="summary-stats">
        <div className="stat-box">
          <div className="stat-value">{report?.totalCompleted || 0}</div>
          <div className="stat-label">Juz Completed</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-value">{bestStreak}</div>
          <div className="stat-label">Best Streak</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-value">{activeDays}</div>
          <div className="stat-label">Active Days</div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySummary;