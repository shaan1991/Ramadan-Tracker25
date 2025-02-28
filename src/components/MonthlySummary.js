// src/components/MonthlySummary.js (Fixed version)
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getMonthlyJuzReport } from '../services/historyTracker';
import { getAllStreaks, getBestStreak } from '../services/streakService';
import './MonthlySummary.css';

const MonthlySummary = () => {
  const { user, userData } = useUser();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
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
          setActiveDays(Object.keys(userData.history).length);
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
  
  // Format dates for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
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
      
      {/* Details toggle */}
      <button 
        className="toggle-details"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>
      
      {/* Details panel (when expanded) */}
      {showDetails && report && (
        <div className="daily-details">
          <h4>Daily Activity Log</h4>
          
          {report.dailyProgress.length === 0 ? (
            <p>No daily activity data recorded yet.</p>
          ) : (
            <div className="daily-log">
              {report.dailyProgress
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map(day => (
                  <div key={day.date} className="day-entry">
                    <div className="day-date">{formatDisplayDate(day.date)}</div>
                    <div className="day-activities">
                      <div className="day-juz">
                        {day.completed > 0 ? (
                          <>
                            <span className="completed-count">{day.completed} Juz</span>
                            {/* <span className="completed-list">
                              {day.juzList.sort((a, b) => a - b).join(', ')}
                            </span> */}
                          </>
                        ) : (
                          <span className="no-progress">-</span>
                        )}
                      </div>
                      
                      {userData.history && userData.history[day.date] && (
                        <div className="day-icons">
                          {userData.history[day.date].fasting && (
                            <span className="activity-icon" title="Fasted">🌙</span>
                          )}
                          {userData.history[day.date].prayedTaraweeh && (
                            <span className="activity-icon" title="Prayed Taraweeh">🕌</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonthlySummary;