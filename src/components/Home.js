// File: src/components/Home.js
import React, { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import './Home.css';

// Components
import DailyOverview from './DailyOverview';
import DailyNamazCheckIn from './DailyNamazCheckIn';
import FastingCheck from './FastingCheck';
import TaraweehCheck from './TaraweehCheck';
import JuzTracker from './JuzTracker';

const Home = () => {
  const { user, userData, ramadanDay, loading } = useUser();

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

  return (
    <div className="home-container">
      <div className="welcome-header">
        <div>
          <p className="welcome-text">Welcome back {user.displayName?.split(' ')[0] || 'Shaan'}!</p>
          <h2 className="motivation-text">Mashallah! going strong 💪</h2>
        </div>
        <div className="timing-info">
          <p>Suhoor: {suhoorTime}</p>
          <p>Today</p>
          <p>Iftar: {iftarTime}</p>
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