// src/components/MonthlySummary.js (Simplified version)
import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { getAllStreaks, getBestStreak } from '../services/streakService';
import './MonthlySummary.css';

const MonthlySummary = () => {
  const { user, userData, isWithinRamadan } = useUser();
  const [collapsed, setCollapsed] = useState(true);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState({
    quran: { current: 0, best: 0 },
    fasting: { current: 0, best: 0 },
    taraweeh: { current: 0, best: 0 }
  });
  const [bestStreak, setBestStreak] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const initialLoadRef = useRef(true);
  
  // Load all data when component mounts or user changes
  useEffect(() => {
    const loadAllData = async () => {
      if (!user?.uid) return;
      const parseDateKey = (key) => {
        const [y, m, d] = key.split('-').map(Number);
        return new Date(y, m - 1, d, 12, 0, 0, 0);
      };
      
      if (initialLoadRef.current) {
        setLoading(true);
      }
      
      try {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Determine whether to show Ramadan-only streaks
        const ramadanMode = isWithinRamadan ? isWithinRamadan(now) : false;
        
        // Load streak information for all activities (Ramadan-only during Ramadan)
        const allStreaks = await getAllStreaks(user.uid, { 
          ramadanOnly: ramadanMode,
          baseDate: now
        });
        setStreaks(allStreaks);
        
        // Get best streak across all activities
        const best = await getBestStreak(user.uid, { 
          ramadanOnly: ramadanMode,
          baseDate: now
        });
        setBestStreak(best);
        
        // Calculate active days and Quran progress for the current month
        if (userData) {
          const historyDates = userData.history ? Object.keys(userData.history) : [];
          const validDates = historyDates.filter(dateString => {
            const date = parseDateKey(dateString);
            return date >= monthStart && date <= monthEnd;
          });
          setActiveDays(validDates.length);
          
          // Calculate monthly Quran progress from juzHistory if available
          const juzHistory = userData.juzHistory || {};
          const monthlyJuzs = new Set();
          Object.keys(juzHistory).forEach(dateString => {
            const date = parseDateKey(dateString);
            if (date >= monthStart && date <= monthEnd) {
              (juzHistory[dateString] || []).forEach(juz => monthlyJuzs.add(juz));
            }
          });
          
          setReport({
            totalCompleted: monthlyJuzs.size,
            completedJuzs: Array.from(monthlyJuzs)
          });
        }
        
        if (initialLoadRef.current) {
          setLoading(false);
          initialLoadRef.current = false;
        }
      } catch (error) {
        console.error("Error loading summary data:", error);
        if (initialLoadRef.current) {
          setLoading(false);
          initialLoadRef.current = false;
        }
      }
    };
    
    loadAllData();
    
    // Refresh data periodically
    const intervalId = setInterval(() => {
      if (user?.uid) loadAllData();
    }, 300000); // Refresh every 5 minutes
    
    return () => clearInterval(intervalId);
  }, [user, userData, isWithinRamadan]);
  
  if (loading) {
    return (
      <div className="monthly-summary loading">
        <p>Loading your monthly progress...</p>
      </div>
    );
  }
  
  const isRamadan = isWithinRamadan ? isWithinRamadan(new Date()) : false;

  return (
    <div className="monthly-summary">
      <div className="summary-header">
        <div>
          <div className="summary-title">Day At a Glance</div>
          <div className="summary-subtitle">Today&apos;s snapshot</div>
        </div>
      </div>

      <div className="daily-glance-grid">
        <div className="daily-glance-item">
          <div className="daily-icon-bg green">
            <span className="daily-icon">🙌</span>
          </div>
          <div className="daily-label">Salah</div>
          <div className="daily-value">{userData.salah.completed}/{userData.salah.total}</div>
        </div>

        <div className="daily-glance-item">
          <div className="daily-icon-bg blue">
            <span className="daily-icon">🍉</span>
          </div>
          <div className="daily-label">Fast</div>
          <div className="daily-value">{userData.fasting ? 'Yes' : 'No'}</div>
        </div>

        {isRamadan && (
          <div className="daily-glance-item">
            <div className="daily-icon-bg yellow">
              <span className="daily-icon">🌙</span>
            </div>
            <div className="daily-label">Taraweeh</div>
            <div className="daily-value">{userData.prayedTaraweeh ? 'Yes' : 'No'}</div>
          </div>
        )}

        <div className="daily-glance-item">
          <div className="daily-icon-bg gray">
            <span className="daily-icon">📖</span>
          </div>
          <div className="daily-label">Qur'an</div>
          <div className="daily-value">{userData.quran.completed}/{userData.quran.total}</div>
        </div>
      </div>

      <div className="summary-divider" />

      <div className="summary-header">
        <div>
          <div className="summary-title">Monthly Summary</div>
          <div className="summary-subtitle">Quick stats for this month</div>
        </div>
        <button
          className={`summary-toggle ${collapsed ? '' : 'open'}`}
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
        >
          {collapsed ? 'Show details' : 'Hide details'}
          <span className="summary-chevron">›</span>
        </button>
      </div>

      {/* Streak summary row */}
      <div className="streak-summary">
        <div className="streak-category">
          <div className="streak-icon">📖</div>
          <div className="streak-info">
            <div className="streak-label">Qur'an</div>
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
        
        {isRamadan && (
          <div className="streak-category">
            <div className="streak-icon">🕌</div>
            <div className="streak-info">
              <div className="streak-label">Taraweeh</div>
              <div className="streak-value">{streaks.taraweeh.current} days</div>
            </div>
          </div>
        )}
      </div>
      
      <div className={`summary-collapsible ${collapsed ? '' : 'open'}`}>
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
    </div>
  );
};

export default MonthlySummary;
