// File: src/components/Home.js
import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './Home.css';

// Components
import Calendar from './Calendar';
import DailyOverview from './DailyOverview';
import DailyNamazCheckIn from './DailyNamazCheckIn';
import FastingCheck from './FastingCheck';
import TaraweehCheck from './TaraweehCheck';
import JuzTracker from './JuzTracker';
import HadithOfTheDay from './HadithOfTheDay';

const Home = () => {
  const { user, userData, ramadanDay, loading, updateUserData } = useUser();
  const [showCalendar, setShowCalendar] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullCurrentY, setPullCurrentY] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const containerRef = useRef(null);

  useEffect(() => {
    // Add touch event listeners for pull-to-reveal
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    return () => {
      // Clean up event listeners
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, []);

  const handleTouchStart = (e) => {
    // Only enable pull-to-reveal when at the top of the page
    if (window.scrollY === 0) {
      setPullStartY(e.touches[0].clientY);
      setPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!pulling) return;
    
    const currentY = e.touches[0].clientY;
    setPullCurrentY(currentY);
    
    // Calculate pull distance
    const pullDistance = currentY - pullStartY;
    
    // If pulling down and we're at the top of the page
    if (pullDistance > 0 && window.scrollY === 0) {
      // Prevent default scrolling behavior
      e.preventDefault();
      
      // Restrict pull distance with diminishing returns
      const maxPull = 120;
      const pullPercentage = Math.min(pullDistance / maxPull, 1);
      const adjustedPull = pullPercentage * 60; // max height of pull indicator
      
      // Update UI based on pull distance
      document.documentElement.style.setProperty('--pull-height', `${adjustedPull}px`);
      
      // If pulled enough, show "Release to show calendar" message
      if (pullDistance > 80) {
        document.getElementById('pull-text').innerText = 'Release to show calendar';
      } else {
        document.getElementById('pull-text').innerText = 'Pull down to show calendar';
      }
    }
  };

  const handleTouchEnd = () => {
    if (!pulling) return;
    
    const pullDistance = pullCurrentY - pullStartY;
    
    // If pulled far enough, show calendar
    if (pullDistance > 80) {
      setShowCalendar(true);
    }
    
    // Reset pull state
    setPulling(false);
    document.documentElement.style.setProperty('--pull-height', '0px');
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    // Load data for the selected date
    loadDateData(date);
  };

  const handleCloseCalendar = () => {
    setShowCalendar(false);
  };

  const loadDateData = async (dateString) => {
    // Check if there's history data for this date
    if (userData && userData.history && userData.history[dateString]) {
      // If data exists, you might want to update the UI to show this historical data
      // This will depend on how you've structured your data
      console.log(`Loading data for ${dateString}`);
      
      // You may need to update the global state or context to reflect this historical data
      // This is a simplified example:
      const historyData = userData.history[dateString];
      
      // Update the UserContext with historical data
      // Note: You'll need to adapt this to your actual data structure
      const historicalUpdate = {
        namaz: historyData.namaz || {
          fajr: false,
          zuhr: false,
          asr: false,
          maghrib: false,
          isha: false
        },
        fasting: historyData.fasting || false,
        prayedTaraweeh: historyData.prayedTaraweeh || false,
        // Add other fields as necessary
      };
      
      // This assumes you have a method to temporarily override the display data
      // without affecting today's actual data
      updateUserData({
        currentViewData: historicalUpdate,
        isHistoricalView: true,
        historicalDate: dateString
      });
    } else {
      // If no historical data, show empty state for that day
      updateUserData({
        currentViewData: {
          namaz: {
            fajr: false,
            zuhr: false,
            asr: false,
            maghrib: false,
            isha: false
          },
          fasting: false,
          prayedTaraweeh: false
        },
        isHistoricalView: true,
        historicalDate: dateString
      });
    }
  };

  if (loading || !userData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your data...</p>
      </div>
    );
  }

  // Calculate suhoor and iftar times (simplified example)
  const suhoorTime = "6:00 AM"; // You may want to fetch this from an API
  const iftarTime = "6:00 PM";  // You may want to fetch this from an API
  
  // Determine if we're viewing historical data or today's data
  const isHistoricalView = userData.isHistoricalView || false;
  const viewDate = isHistoricalView ? userData.historicalDate : new Date().toISOString().split('T')[0];
  const dateObj = new Date(viewDate);
  const displayDate = isHistoricalView ? 
    dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
    'Today';

  return (
    <div className="home-container" ref={containerRef}>
      {/* Pull-to-reveal indicator */}
      <div className={`pull-indicator ${pulling ? 'pulling' : 'hidden'}`}>
        <span className="pull-spinner">⟳</span>
        <span id="pull-text">Pull down to show calendar</span>
      </div>

      {/* Calendar (shown/hidden based on state) */}
      {showCalendar && (
        <Calendar 
          onDateSelect={handleDateSelect} 
          onClose={handleCloseCalendar} 
        />
      )}
      
      <div className="welcome-header">
        <div>
          <p className="welcome-text">Welcome back {user.displayName?.split(' ')[0] || 'Shaan'}!</p>
          <h2 className="motivation-text">Mashallah! going strong 💪</h2>
        </div>
        <div className="timing-info">
          <p>Suhoor: {suhoorTime}</p>
          <div 
            className="date-selector"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {displayDate}
            <span className={`chevron ${showCalendar ? 'up' : 'down'}`}>▼</span>
          </div>
          <p>Iftar: {iftarTime}</p>
        </div>
      </div>

      {isHistoricalView && (
        <div className="historical-banner">
          Viewing data for {dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          <button 
            onClick={() => {
              updateUserData({
                isHistoricalView: false,
                currentViewData: null,
                historicalDate: null
              });
              setSelectedDate(new Date().toISOString().split('T')[0]);
            }}
            className="return-to-today"
          >
            Return to Today
          </button>
        </div>
      )}

      <DailyOverview />

      <div className="suggested-sunnah">
        <p>Suggested Sunnah of the day</p>
        <p>🤲 Pray an Extra Sunnah Prayer</p>
      </div>

      <DailyNamazCheckIn />
      <FastingCheck />
      <TaraweehCheck />
      <JuzTracker />

      {/* <div className="quote-container">
        <p className="quote-text">Design is a formal response to a strategic question.</p>
        <p className="quote-author">Mariona Lopez</p>
      </div> */}

{/* Replace the quote container with Hadith of the Day */}
<HadithOfTheDay />

      <div className="dua-request">
        <p>I request you to include me and family in your Dua's</p>
      </div>
    </div>
  );
};

export default Home;