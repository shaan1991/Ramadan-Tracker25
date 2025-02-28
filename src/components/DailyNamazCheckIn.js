// File: src/components/DailyNamazCheckIn.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import './DailyNamazCheckIn.css';

const DailyNamazCheckIn = () => {
  const { userData, updateUserData, recordDailyAction } = useUser();

  if (!userData) return null;

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
    <div className="namaz-container">
      <h3>Daily Namaz Check-In</h3>
      
      
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
      </div>
    </div>
  );
};

export default DailyNamazCheckIn;