// File: src/components/Home.js
import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import './Home.css';

// Components
import Calendar from './Calendar';
import DailyOverview from './DailyOverview';
import DailyNamazCheckIn from './DailyNamazCheckIn';
import FastingCheck from './FastingCheck';
import TaraweehCheck from './TaraweehCheck';
import JuzTracker from './JuzTracker';
import HadithOfTheDay from './HadithOfTheDay';
import MonthlySummary from './MonthlySummary'; // New component
import RandomSunnahSuggestion from './RandomSunnahSuggestion';
// import ShareButton from './ShareButton';
// import { 
//   setupNotifications, 
//   scheduleNotification, 
//   sendInAppNotification, 
//   addNotificationButton,
//   testNotification,
//   cleanupNotifications
// } from '../services/notificationService';

const Home = () => {
  const { user, userData, loading, updateUserData } = useUser();
  const { prayerTimes, formattedTimes, locationStatus, retryLocation } = usePrayerTimes();
  const [showCalendar, setShowCalendar] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullCurrentY, setPullCurrentY] = useState(0);
  
  // // Add test function to window for debugging notifications
  // if (typeof window !== 'undefined') {
  //   window.testRamadanNotification = () => {
  //     return testNotification();
  //   };
  // }
  
  // Initialize with properly formatted today's date
  const today = new Date();
  const formattedToday = formatDate(today);
  const [selectedDate, setSelectedDate] = useState(formattedToday);
  
  // Add state for dynamic Ramadan day calculation
  const [currentRamadanDay, setCurrentRamadanDay] = useState(1);
  const totalDays = 30;
  
  const containerRef = useRef(null);

  // Helper function to ensure consistent date formatting
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Calculate current Ramadan day on component mount
  useEffect(() => {
    // Define Ramadan start date - update this for the correct year
    const ramadanStartDate = new Date(2025, 1, 27); // February 27, 2025
    
    // Calculate days since Ramadan started
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time component
    ramadanStartDate.setHours(0, 0, 0, 0); // Remove time component
    
    // Calculate difference in days
    const timeDiff = today.getTime() - ramadanStartDate.getTime();
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
  }, []);

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
      
      // Clean up notification elements (but keep session flags)
      // cleanupNotifications();
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
    console.log("Selected date:", date);
    setSelectedDate(date);
    // Load data for the selected date - using exact string passed from Calendar
    loadDateData(date);
    // Close calendar after selection
    setShowCalendar(false);
  };

  const handleCloseCalendar = () => {
    setShowCalendar(false);
  };

  const loadDateData = async (dateString) => {
    console.log("Loading data for date:", dateString);
    
    // Check if there's history data for this date - EXACT string match
    if (userData && userData.history && userData.history[dateString]) {
      console.log("Found history data for date:", dateString);
      
      const historyData = userData.history[dateString];
      
      // Update the UserContext with historical data
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
      
      updateUserData({
        currentViewData: historicalUpdate,
        isHistoricalView: true,
        historicalDate: dateString
      });
    } else {
      console.log("No history data for date:", dateString);
      
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

  // Determine if we're viewing historical data or today's data
  const isHistoricalView = userData.isHistoricalView || false;
  const viewDate = isHistoricalView ? userData.historicalDate : formattedToday;
  
  // Parse the date string directly to avoid timezone issues
  const [year, month, day] = viewDate.split('-').map(num => parseInt(num));
  const dateObj = new Date(year, month - 1, day); // month is 0-indexed in JS Date
  
  const displayDate = isHistoricalView ? 
    dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
    'Today';

  return (
    <div className="home-container" ref={containerRef}>
      {/* Pull-to-reveal indicator */}
      <div id="pull-indicator" className={`pull-indicator ${pulling ? 'pulling' : 'hidden'}`}>
        <span className="pull-spinner">⟳</span>
        <span id="pull-text">Pull down to show calendar</span>
      </div>

      <div className="app-header">
        <div className="welcome-section">
          <p className="welcome-text">Welcome back {user.displayName?.split(' ')[0] || 'Shaan'}!</p>
          <h2 className="motivation-text">Mashallah! going strong <span className="strong-emoji">💪</span></h2>
        </div>
        
        <div className="timing-section">
          <div className="day-counter">Day {currentRamadanDay} of {totalDays}</div>
          
          <div className="time-container">
            <div className="suhoor-time">
              Suhoor: {formattedTimes.fajr}
              {locationStatus === 'error' && <span className="location-error"> (based on default)</span>}
            </div>
            
            <div 
              className="date-selector"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              {displayDate}
              <span className={`chevron ${showCalendar ? 'up' : 'down'}`}>▼</span>
            </div>
            
            <div className="iftar-time">
              Iftar: {formattedTimes.maghrib}
              {locationStatus === 'error' && <span className="location-error"> (based on default)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Location permission banner */}
      {locationStatus === 'error' && (
        <div className="location-banner">
          <p>Enable location for accurate prayer times</p>
          <button 
            onClick={retryLocation}
            className="location-retry-button"
          >
            Allow Location
          </button>
        </div>
      )}

      {/* Calendar (shown/hidden based on state) */}
      {showCalendar && (
        <Calendar 
          onDateSelect={handleDateSelect} 
          onClose={handleCloseCalendar} 
        />
      )}
      
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
              setSelectedDate(formattedToday);
            }}
            className="return-to-today"
          >
            Return to Today
          </button>
        </div>
      )}

      <DailyOverview />
      {/* <ShareButton />  Add this line */}

      {/* Add the Monthly Summary component for progress stats */}
      {!isHistoricalView && <MonthlySummary />}

      <RandomSunnahSuggestion currentRamadanDay={currentRamadanDay} />

      <DailyNamazCheckIn />
      <FastingCheck />
      <TaraweehCheck />
      <JuzTracker />

      {/* Replace the quote container with Hadith of the Day */}
      <HadithOfTheDay />

      <div className="dua-request">
        <p>I request you to include me and family in your Dua's</p>
      </div>
    </div>
  );
};

export default Home;

export const setupNotifications = async () => {
  return Promise.resolve(false);
};

export const scheduleNotification = async () => {
  return Promise.resolve(false);
};