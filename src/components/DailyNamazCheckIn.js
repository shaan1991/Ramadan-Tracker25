// File: src/components/DailyNamazCheckIn.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import './DailyNamazCheckIn.css';
// Import the CSS for pre-Ramadan styling
import '../styles/preRamadan.css';

const DailyNamazCheckIn = () => {
  const { userData, updateUserData, recordDailyAction } = useUser();

  if (!userData) return null;

  // Check if we're viewing a date before Ramadan
  const isBeforeRamadanDay = userData.beforeRamadan;

  const handlePrayerToggle = async (prayer) => {
    // Prevent recording data for dates before Ramadan
    if (isBeforeRamadanDay) {
      alert("You cannot record prayers for dates before Ramadan begins.");
      return;
    }
    
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
    
    // Record this action in history
    await recordDailyAction(`prayer_${prayer}`, updatedNamaz[prayer]);
  };

  const prayers = [
    { id: 'fajr', label: 'Fajr' },
    { id: 'zuhr', label: 'Zuhr' },
    { id: 'asr', label: 'Asr' },
    { id: 'maghrib', label: 'Maghrib' },
    { id: 'isha', label: 'Isha' }
  ];

  // Calculate progress percentage
  const completedCount = Object.values(userData.namaz).filter(Boolean).length;
  const progressPercentage = (completedCount / 5) * 100;

  return (
    <div className={`namaz-container ${isBeforeRamadanDay ? 'disabled' : ''}`}>
      <h3>Daily Namaz Check-In</h3>
      
      {isBeforeRamadanDay && (
        <div className="pre-ramadan-notice">
          Cannot record prayers for dates before Ramadan begins.
        </div>
      )}
      
      <div className="prayer-buttons">
        {prayers.map((prayer) => (
          <button
            key={prayer.id}
            className={`prayer-button ${userData.namaz[prayer.id] ? 'completed' : ''}`}
            onClick={() => handlePrayerToggle(prayer.id)}
            disabled={isBeforeRamadanDay}
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
      </div>
    </div>
  );
};

export default DailyNamazCheckIn;