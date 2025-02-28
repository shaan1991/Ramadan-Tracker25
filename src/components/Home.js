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
import MonthlySummary from './MonthlySummary';
import RandomSunnahSuggestion from './RandomSunnahSuggestion';

// Ramadan start dates by major regions - you can expand this
// These are approximate dates for 2025 Ramadan
const RAMADAN_START_DATES = {
  // Default date (used if can't determine location)
  default: new Date(2025, 2, 28), // Feb 28, 2025 (fixed date)
  
  // Different regions might observe different start dates
  'north_america': new Date(2025, 2, 28), // Feb 28, 2025
  'europe': new Date(2025, 2, 28), // Feb 28, 2025
  'middle_east': new Date(2025, 2, 28), // Feb 28, 2025
  'asia': new Date(2025, 3, 1), // Feb 28, 2025 (same start date globally for simplicity)
  'australia': new Date(2025,2, 28), // Feb 28, 2025
  'africa': new Date(2025, 2, 28), // Feb 28, 2025
};

// Store the user's Ramadan start date in localStorage once determined
const saveRamadanStartDate = (date) => {
  if (date) {
    localStorage.setItem('ramadanStartDate', date.toISOString());
    console.log(`Saved Ramadan start date: ${date.toDateString()}`);
  }
};

// Get the saved Ramadan start date from localStorage
const getSavedRamadanStartDate = () => {
  const savedDate = localStorage.getItem('ramadanStartDate');
  return savedDate ? new Date(savedDate) : null;
};

// Fix any incorrect Ramadan start date in localStorage
const fixRamadanStartDate = () => {
  // Fix any incorrect date by setting to Feb 28, 2025
  const correctDate = new Date(2025, 2, 28);
  saveRamadanStartDate(correctDate);
  return correctDate;
};

const Home = () => {
  const { user, userData, loading, updateUserData } = useUser();
  const { prayerTimes, formattedTimes, locationStatus, retryLocation, location } = usePrayerTimes();
  const [showCalendar, setShowCalendar] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullStartY, setPullStartY] = useState(0);
  const [pullCurrentY, setPullCurrentY] = useState(0);
  
  // Initialize with properly formatted today's date
  const today = new Date();
  const formattedToday = formatDate(today);
  const [selectedDate, setSelectedDate] = useState(formattedToday);
  
  // Ramadan date state - force fix the date to Feb 28, 2025
  const [ramadanStartDate, setRamadanStartDate] = useState(() => {
    // Force fix any incorrect date and return the correct one
    return fixRamadanStartDate();
  });
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
  
  // Determine Ramadan start date based on location
  useEffect(() => {
    // Force fix any incorrect date no matter what
    const fixedDate = fixRamadanStartDate();
    setRamadanStartDate(fixedDate);
    
    // Make the date available globally
    if (window.updateRamadanStartDate) {
      window.updateRamadanStartDate(fixedDate);
    }
    
    // Still proceed with location-based logic for future flexibility
    if (!location || !location.latitude || !location.longitude) {
      return;
    }
    
    // Simple function to determine which region the user is in based on coordinates
    const determineRegion = (lat, lon) => {
      // These are very rough bounds for major regions
      // You might want to use a more sophisticated approach or a geocoding service
      if (lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66) {
        return 'north_america'; // North America
      } else if (lat >= 36 && lat <= 70 && lon >= -10 && lon <= 40) {
        return 'europe'; // Europe
      } else if (lat >= 12 && lat <= 42 && lon >= 35 && lon <= 60) {
        return 'middle_east'; // Middle East
      } else if (lat >= -10 && lat <= 55 && lon >= 60 && lon <= 145) {
        return 'asia'; // Asia
      } else if (lat >= -47 && lat <= -10 && lon >= 110 && lon <= 180) {
        return 'australia'; // Australia
      } else if (lat >= -35 && lat <= 37 && lon >= -20 && lon <= 55) {
        return 'africa'; // Africa
      }
      return 'default';
    };
    
    const region = determineRegion(location.latitude, location.longitude);
    console.log(`Determined region: ${region}`);
    
    // For now, we're using the same date everywhere for consistency
    // In future, you can adapt this to use different dates by region if needed
  }, [location]);

  // Calculate current Ramadan day whenever the start date changes
  useEffect(() => {
    // Calculate days since Ramadan started
    const calcDay = () => {
      const currentDay = new Date();
      currentDay.setHours(0, 0, 0, 0); // Remove time component
      
      const startDate = new Date(ramadanStartDate);
      startDate.setHours(0, 0, 0, 0); // Remove time component
      
      // Calculate difference in days - using floor to avoid rounding issues
      const timeDiff = currentDay.getTime() - startDate.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1; // +1 because first day is day 1
      
      console.log(`Current date: ${currentDay.toDateString()}, Ramadan start: ${startDate.toDateString()}, Day diff: ${dayDiff}`);
      
      // Set the current Ramadan day (between 1 and 30)
      if (dayDiff >= 1 && dayDiff <= 30) {
        return dayDiff;
      } else if (dayDiff < 1) {
        // Before Ramadan started
        return 0; // Not started yet
      } else {
        // After Ramadan ended
        return 30; // Cap at day 30
      }
    };
    
    const day = calcDay();
    setCurrentRamadanDay(day);
    
    // Also update the day in UserContext to ensure consistency
    if (user && userData && userData.day !== day) {
      updateUserData({ day });
    }
    
    // Also update the dateValidation utility's start date (if it exists globally)
    if (window.updateRamadanStartDate) {
      window.updateRamadanStartDate(ramadanStartDate);
    }
    
    // Force update of this effect after a short delay to ensure correct calculation
    const timerId = setTimeout(() => {
      const newDay = calcDay();
      if (newDay !== day) {
        setCurrentRamadanDay(newDay);
        if (user && userData) {
          updateUserData({ day: newDay });
        }
      }
    }, 1000);
    
    return () => clearTimeout(timerId);
  }, [ramadanStartDate, userData]);

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
    
    // Check if the selected date is before Ramadan
    const selectedDate = new Date(dateString);
    selectedDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(ramadanStartDate);
    startDate.setHours(0, 0, 0, 0);
    
    const isBeforeRamadan = selectedDate < startDate;
    
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
        historicalDate: dateString,
        beforeRamadan: isBeforeRamadan
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
        historicalDate: dateString,
        beforeRamadan: isBeforeRamadan
      });
    }
  };

  // Function to check if a date is before Ramadan
  const isBeforeRamadan = (date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(ramadanStartDate);
    startDate.setHours(0, 0, 0, 0);
    
    return checkDate < startDate;
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
    
  // Check if current view date is before Ramadan
  const isViewingBeforeRamadan = userData.beforeRamadan || isBeforeRamadan(dateObj);

   // Calculate days until Ramadan if viewing before Ramadan starts
  let daysUntilRamadan = 30; // Start with 30 days
  if (currentRamadanDay <= 0) {
    // Check if we have a saved days remaining in localStorage
    const savedDaysRemaining = localStorage.getItem('daysUntilRamadan');
    const lastUpdateDate = localStorage.getItem('daysRemainingUpdateDate');
    const today = formatDate(new Date());
    
    if (savedDaysRemaining && lastUpdateDate) {
      const parsedDaysRemaining = parseInt(savedDaysRemaining, 10);
      
      // If the last update was on a different day, subtract a day
      if (lastUpdateDate !== today) {
        daysUntilRamadan = Math.max(0, parsedDaysRemaining - 1);
        
        // Save the updated days and current date
        localStorage.setItem('daysUntilRamadan', daysUntilRamadan.toString());
        localStorage.setItem('daysRemainingUpdateDate', today);
      } else {
        // Use the saved days remaining
        daysUntilRamadan = parsedDaysRemaining;
      }
    } else {
      // First time calculation - save initial values
      localStorage.setItem('daysUntilRamadan', '30');
      localStorage.setItem('daysRemainingUpdateDate', today);
    }
    
    // Ensure we don't go below 0
    daysUntilRamadan = Math.max(0, daysUntilRamadan);
  }

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
          {currentRamadanDay > 0 ? (
            <div className="day-counter">Day {currentRamadanDay} of {totalDays}</div>
          ) : (
            <div className="day-counter">
              {daysUntilRamadan} {daysUntilRamadan === 1 ? 'day' : 'days'} until Ramadan
            </div>
          )}
          
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
          ramadanStartDate={ramadanStartDate}
          isBeforeRamadan={isBeforeRamadan}
        />
      )}
      
      {isHistoricalView && (
        <div className="historical-banner">
          Viewing data for {dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          
          {isViewingBeforeRamadan && (
            <div className="pre-ramadan-notice">
              This date is before Ramadan begins. No Ramadan activities can be recorded.
            </div>
          )}
          
          <button 
            onClick={() => {
              updateUserData({
                isHistoricalView: false,
                currentViewData: null,
                historicalDate: null,
                beforeRamadan: currentRamadanDay <= 0
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