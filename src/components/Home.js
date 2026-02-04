// File: src/components/Home.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { usePrayerTimes } from '../contexts/PrayerTimesContext';
import { DEFAULT_RAMADAN_START_DATE } from '../utils/dateValidation';
import './Home.css';

// Components
import Calendar from './Calendar';
import DailyNamazCheckIn from './DailyNamazCheckIn';
import FastingCheck from './FastingCheck';
import TaraweehCheck from './TaraweehCheck';
import JuzTracker from './JuzTracker';
import HadithOfTheDay from './HadithOfTheDay';
import MonthlySummary from './MonthlySummary'; // New component
import RandomSunnahSuggestion from './RandomSunnahSuggestion';
import RamadanCountdownBanner from './RamadanCountdownBanner';
import RamadanLengthPrompt from './RamadanLengthPrompt';
// New Features - 2026 Enhancements
import Achievements from './Achievements';
import UnifiedPrayerTracker from './UnifiedPrayerTracker';

const Home = () => {
  const { user, userData, loading, updateUserData, isWithinRamadan } = useUser();
  const { prayerTimes, formattedTimes, locationStatus, retryLocation } = usePrayerTimes();
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Initialize with properly formatted today's date
  const today = new Date();
  const formattedToday = formatDate(today);
  const [selectedDate, setSelectedDate] = useState(formattedToday);
  
  // Add state for dynamic Ramadan day calculation
  const [currentRamadanDay, setCurrentRamadanDay] = useState(1);
  const totalDays = userData?.ramadanLength || 30;
  
  // Pull-to-reveal removed to avoid blocking navigation taps.

  // Helper function to ensure consistent date formatting
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Calculate current Ramadan day, potentially using Adhan data when available
  useEffect(() => {
    const calculateDay = () => {
      // If Adhan provides Hijri date info, use it (keep this part)
      if (prayerTimes && prayerTimes.date && prayerTimes.date.hijri) {
        const hijri = prayerTimes.date.hijri;
        if (hijri.month.number === 9) {
          console.log("Using Adhan hijri data:", hijri);
          setCurrentRamadanDay(hijri.day);
          return;
        }
      }
    
      // Get region-specific Ramadan start date
      const fallbackStart = `${DEFAULT_RAMADAN_START_DATE.getFullYear()}-${String(DEFAULT_RAMADAN_START_DATE.getMonth() + 1).padStart(2, '0')}-${String(DEFAULT_RAMADAN_START_DATE.getDate()).padStart(2, '0')}`;
      const ramadanStartString = userData?.ramadanStartDate || fallbackStart;
      const [startYear, startMonth, startDay] = ramadanStartString.split('-').map(Number);
      
      // Create a date object for start date with time stripped away
      const startDate = new Date(startYear, startMonth - 1, startDay);
      
      // Create a date object for today with time stripped away
      const today = new Date();
      
      // DST-proof calculation: ignoring time components entirely
      const calculateDaysBetween = (date1, date2) => {
        // Convert to UTC dates using just year, month, day components
        const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
        
        // Calculate difference in days (milliseconds ÷ milliseconds per day)
        const MS_PER_DAY = 86400000; // Exact number of milliseconds in a day
        return Math.floor((utc2 - utc1) / MS_PER_DAY) + 1; // +1 because day 1 is the start
      };
      
      const dayDiff = calculateDaysBetween(startDate, today);
      
      console.log("DST-proof calculation:", {
        start: `${startYear}-${startMonth}-${startDay}`,
        today: `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`,
        dayDiff
      });
      
      if (dayDiff >= 1 && dayDiff <= totalDays) {
        setCurrentRamadanDay(dayDiff);
      } else if (dayDiff < 1) {
        setCurrentRamadanDay(0);
      } else {
        setCurrentRamadanDay(totalDays);
      }
    };
  
    calculateDay();
  }, [prayerTimes, userData]);
  

  
  // Update Ramadan day when viewing historical dates
  useEffect(() => {
    if (userData?.isHistoricalView && userData?.historicalDate) {
      // Do the same calculation for historical dates
      const fallbackStart = `${DEFAULT_RAMADAN_START_DATE.getFullYear()}-${String(DEFAULT_RAMADAN_START_DATE.getMonth() + 1).padStart(2, '0')}-${String(DEFAULT_RAMADAN_START_DATE.getDate()).padStart(2, '0')}`;
      const ramadanStartString = userData?.ramadanStartDate || fallbackStart;
      const [startYear, startMonth, startDay] = ramadanStartString.split('-').map(Number);
      const ramadanStartDate = new Date(startYear, startMonth - 1, startDay);
      
      // Parse the historical date
      const [year, month, day] = userData.historicalDate.split('-').map(num => parseInt(num));
      const historicalDate = new Date(year, month - 1, day);
      
      // Set both dates to noon to avoid timezone issues
      historicalDate.setHours(12, 0, 0, 0);
      ramadanStartDate.setHours(12, 0, 0, 0);
      
      // Calculate difference
      const timeDiff = historicalDate - ramadanStartDate;
      const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
      
      const totalDays = userData?.ramadanLength || 30;
      // Update the day based on historical date
      if (dayDiff >= 1 && dayDiff <= totalDays) {
        setCurrentRamadanDay(dayDiff);
      } else if (dayDiff < 1) {
        setCurrentRamadanDay(0);
      } else {
        setCurrentRamadanDay(totalDays);
      }
    }
  }, [userData?.historicalDate, userData?.isHistoricalView]);


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

      const buildNamaz = (data) => ({
        fajr: data.namaz?.fajr ?? data.prayer_fajr ?? false,
        zuhr: data.namaz?.zuhr ?? data.prayer_zuhr ?? false,
        asr: data.namaz?.asr ?? data.prayer_asr ?? false,
        maghrib: data.namaz?.maghrib ?? data.prayer_maghrib ?? false,
        isha: data.namaz?.isha ?? data.prayer_isha ?? false
      });

      const computeQuranProgressForDate = (targetDate) => {
        const target = new Date(targetDate);
        const completed = new Set();
        const juzHistory = userData.juzHistory || {};
        Object.entries(juzHistory).forEach(([dateKey, juzList]) => {
          const dateObj = new Date(dateKey);
          if (dateObj <= target) {
            (juzList || []).forEach(juz => completed.add(juz));
          }
        });
        return Array.from(completed);
      };

      const namaz = buildNamaz(historyData);
      const completedPrayers = Object.values(namaz).filter(Boolean).length;
      const completedJuzsForDate = computeQuranProgressForDate(dateString);

      // Update the UserContext with historical data
      const historicalUpdate = {
        namaz,
        salah: historyData.salah || { completed: completedPrayers, total: 5 },
        fasting: historyData.fasting ?? false,
        prayedTaraweeh: historyData.prayedTaraweeh ?? historyData.taraweeh ?? false,
        completedJuzs: completedJuzsForDate,
        quran: {
          completed: completedJuzsForDate.length,
          total: 30
        }
      };
      
      updateUserData({
        currentViewData: historicalUpdate,
        isHistoricalView: true,
        historicalDate: dateString
      });
    } else {
      console.log("No history data for date:", dateString);
      
      // If no historical data, show empty state for that day
      const computeQuranProgressForDate = (targetDate) => {
        const target = new Date(targetDate);
        const completed = new Set();
        const juzHistory = userData?.juzHistory || {};
        Object.entries(juzHistory).forEach(([dateKey, juzList]) => {
          const dateObj = new Date(dateKey);
          if (dateObj <= target) {
            (juzList || []).forEach(juz => completed.add(juz));
          }
        });
        return Array.from(completed);
      };

      const completedJuzsForDate = computeQuranProgressForDate(dateString);
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
          prayedTaraweeh: false,
          salah: { completed: 0, total: 5 },
          completedJuzs: completedJuzsForDate,
          quran: { completed: completedJuzsForDate.length, total: 30 }
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
  
  const isRamadan = isWithinRamadan ? isWithinRamadan(dateObj) : false;

  return (
    <div className="home-container">
      <RamadanCountdownBanner />
      <RamadanLengthPrompt />
      {/* Pull-to-reveal indicator */}
      

      <div className="app-header">
        <div className="welcome-section">
          <p className="welcome-text">Welcome back {user.displayName?.split(' ')[0] || 'Shaan'}!</p>
          <h2 className="motivation-text">Mashallah! going strong <span className="strong-emoji">💪</span></h2>
        </div>
        
        <div className="timing-section">
          <div className="day-counter">
            {isRamadan ? `Day ${Math.max(1, currentRamadanDay)} of ${totalDays}` : 'Daily Tracker'}
            {isRamadan && <span className="ramadan-badge">Ramadan</span>}
          </div>
          
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
      <div className={`elastic-collapse ${showCalendar ? 'open' : ''}`}>
        {showCalendar && (
          <Calendar 
            onDateSelect={handleDateSelect} 
            onClose={handleCloseCalendar} 
          />
        )}
      </div>
      
      {isHistoricalView && (
        <div className="historical-banner">
          <div>
            Viewing data for {dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <button 
            onClick={async () => {
              await updateUserData({
                isHistoricalView: false,
                currentViewData: null,
                historicalDate: null
              });
              setSelectedDate(formattedToday);
              setShowCalendar(false);
            }}
            className="return-to-today"
          >
            Return to Today
          </button>
        </div>
      )}

      {/* Combined daily + monthly overview */}
      {!isHistoricalView && (
        <div className="elastic-expand">
          <MonthlySummary />
        </div>
      )}

      {/* Unified Prayer Tracker - combines both completion and focus (Khushu) */}
      <div className="elastic-expand">
        <UnifiedPrayerTracker />
      </div>
      <div className="elastic-expand">
        <FastingCheck />
      </div>
      {isRamadan && (
        <div className="elastic-expand">
          <TaraweehCheck />
        </div>
      )}
      <div className="elastic-expand">
        <JuzTracker />
      </div>

      {/* Sunnah of the Day */}
      <div className="elastic-expand">
        <RandomSunnahSuggestion currentRamadanDay={currentRamadanDay} />
      </div>

      {/* Replace the quote container with Hadith of the Day */}
      <div className="elastic-expand">
        <HadithOfTheDay />
      </div>

      {/* NEW FEATURES - 2026 Enhancements */}
      {!isHistoricalView && (
        <div className="elastic-expand">
          <Achievements />
        </div>
      )}

      <div className="dua-request">
        <p>I request you to include me and my family in your Dua's</p>
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
