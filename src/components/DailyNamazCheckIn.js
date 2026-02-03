// File: src/components/DailyNamazCheckIn.js
import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import Celebration from './Celebration';
import './DailyNamazCheckIn.css';
// Import styles
import './Celebration.css';

const DailyNamazCheckIn = () => {
  const { userData, updateUserData } = useUser();
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevCompletedCount, setPrevCompletedCount] = useState(0);

  // Effect to detect when all 5 prayers are completed
  useEffect(() => {
    if (!userData) return;
    
    // Calculate completed prayers
    const completedCount = Object.values(userData.namaz).filter(Boolean).length;
    
    // Check if we just completed all prayers (and weren't already complete before)
    if (completedCount === 5 && prevCompletedCount !== 5) {
      setShowCelebration(true);
    }
    
    // Update the previous count
    setPrevCompletedCount(completedCount);
  }, [userData, prevCompletedCount]);

  if (!userData) return null;

  // Calculate completed prayers
  const completedCount = Object.values(userData.namaz).filter(Boolean).length;

  const handlePrayerToggle = async (prayer) => {
    // Create a copy of the current namaz state
    const updatedNamaz = { ...userData.namaz, [prayer]: !userData.namaz[prayer] };
    
    // Calculate completed prayers
    const completedPrayers = Object.values(updatedNamaz).filter(Boolean).length;
    
    // Update both namaz and salah data
    await updateUserData({ 
      namaz: updatedNamaz,
      salah: { 
        completed: completedPrayers, 
        total: 5 
      }
    });
    
  };

  const prayers = [
    { id: 'fajr', label: 'Fajr' },
    { id: 'zuhr', label: 'Zuhr' },
    { id: 'asr', label: 'Asr' },
    { id: 'maghrib', label: 'Maghrib' },
    { id: 'isha', label: 'Isha' }
  ];

  // Calculate progress percentage
  const progressPercentage = (completedCount / 5) * 100;

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };

  return (
    <div className="namaz-container">
      <h3>🤲 Daily Namaz/Salah Check-In</h3>
      
      <div className="prayer-buttons">
        {prayers.map((prayer) => (
          <button
            key={prayer.id}
            className={`prayer-button ${userData.namaz[prayer.id] ? 'completed' : ''}`}
            onClick={() => handlePrayerToggle(prayer.id)}
          >
            {prayer.label}
          </button>
        ))}
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="progress-text">
        {completedCount} out of 5 prayers
        {completedCount === 5 && <span className="all-complete-text"> - MashaAllah!</span>}
      </div>
      
      {/* Show celebration when all prayers are complete */}
      {showCelebration && (
        <Celebration onComplete={handleCelebrationComplete} />
      )}
    </div>
  );
};

export default DailyNamazCheckIn;
