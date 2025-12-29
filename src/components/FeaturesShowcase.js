import React from 'react';
import { useUser } from '../contexts/UserContext';
import Achievements from './Achievements';
import Leaderboard from './Leaderboard';
import EnhancedJuzTracker from './EnhancedJuzTracker';
import KhushuTracker from './KhushuTracker';
import './FeaturesShowcase.css';

const FeaturesShowcase = () => {
  const { user } = useUser();

  return (
    <div className="features-showcase-container">
      <div className="features-header">
        <h1>🌟 Ramadan 2026 Features</h1>
        <p>Track your journey with enhanced tools and insights</p>
      </div>

      <div className="features-grid">
        <div className="feature-section">
          <h2>📊 Your Achievements</h2>
          <Achievements />
        </div>

        <div className="feature-section">
          <h2>🏆 Community Leaderboard</h2>
          {user && <Leaderboard userId={user.uid} />}
        </div>

        <div className="feature-section">
          <h2>📖 Enhanced Qur'an Tracking</h2>
          <EnhancedJuzTracker />
        </div>

        <div className="feature-section">
          <h2>🤲 Prayer Focus Tracking</h2>
          <KhushuTracker />
        </div>
      </div>

      <div className="features-info">
        <h3>About These Features</h3>
        <ul>
          <li><strong>Achievements:</strong> Unlock badges for milestones and consistent practice</li>
          <li><strong>Leaderboard:</strong> Compete with friends on streak, prayers completed, and Qur'an progress</li>
          <li><strong>Enhanced Juz Tracker:</strong> Track individual Surahs within each Juz with visual progress</li>
          <li><strong>Khushu Tracker:</strong> Rate your focus and concentration (1-10) for each prayer daily</li>
        </ul>
      </div>
    </div>
  );
};

export default FeaturesShowcase;
