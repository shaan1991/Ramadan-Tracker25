// File: src/components/Home.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { getPrayerTimes } from '../services/dataService';
import './Home.css';

// Components
import DailyOverview from './DailyOverview';
import DailyNamazCheckIn from './DailyNamazCheckIn';
import FastingCheck from './FastingCheck';
import TaraweehCheck from './TaraweehCheck';
import JuzTracker from './JuzTracker';

const Home = () => {
  const { user, userData, ramadanDay, loading } = useUser();
  const [prayerTimes, setPrayerTimes] = useState(null);

  // Fetch prayer times when component mounts
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        // For demo, using default coordinates for Mecca
        // In production, you would get user's location or let them set their location
        const latitude = 21.4225;
        const longitude = 39.8262;
        const times = await getPrayerTimes(latitude, longitude);
        setPrayerTimes(times);
      } catch (error) {
        console.error("Error fetching prayer times:", error);
      }
    };

    fetchPrayerTimes();
  }, []);

  if (loading || !userData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your data...</p>
      </div>
    );
  }

  // Format time to more readable format (6am instead of 06:00)
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      return `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`;
    } catch (e) {
      return timeString;
    }
  };

  // Get suhoor and iftar times
  const suhoorTime = formatTime(prayerTimes?.fajr || '06:00');
  const iftarTime = formatTime(prayerTimes?.maghrib || '18:00');

  return (
    <div className="home-container">
      <div className="welcome-header-card">
        <div className="welcome-header">
          <div className="welcome-text-container">
            <p className="welcome-text">Welcome back {user.displayName?.split(' ')[0] || 'Shaan'}!</p>
            <h2 className="motivation-text">Mashallah! going strong <span className="strong-emoji">💪</span></h2>
          </div>
          
          <div className="timing-container">
            <div className="timing-row">
              <div className="timing-item suhoor">
                <p>Suhoor: {suhoorTime}</p>
              </div>
              
              <div className="timing-item today-dropdown">
                <p>Today</p>
                <span className="dropdown-icon">▼</span>
              </div>
              
              <div className="timing-item iftar">
                <p>Iftar: {iftarTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DailyOverview />
      
      <div className="suggested-sunnah">
        <p>Suggested Sunnah of the day</p>
        <p>🤲 Pray an Extra Sunnah Prayer</p>
      </div>

      <DailyNamazCheckIn />
      <FastingCheck />
      <TaraweehCheck />
      <JuzTracker />

      <div className="quote-container">
        <p className="quote-text">Design is a formal response to a strategic question.</p>
        <p className="quote-author">Mariona Lopez</p>
      </div>

      <div className="dua-request">
        <p>I request you to include me and family in your Dua's</p>
      </div>
    </div>
  );
};

export default Home;