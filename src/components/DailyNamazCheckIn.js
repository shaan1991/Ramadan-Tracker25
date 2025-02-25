// File: src/components/DailyNamazCheckIn.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import './DailyNamazCheckIn.css';

const DailyNamazCheckIn = () => {
  const { userData, updateUserData, recordDailyAction } = useUser();

  if (!userData) return null;

  const handlePrayerToggle = async (prayer) => {
    const newStatus = !userData.namaz[prayer];
    
    // Update namaz status
    const updatedNamaz = { ...userData.namaz, [prayer]: newStatus };
    
    // Calculate completed prayers
    const completedPrayers = Object.values(updatedNamaz).filter(Boolean).length;
    
    // Update both namaz and salah data
    await updateUserData({ 
      namaz: updatedNamaz,
      salah: { completed: completedPrayers, total: 5 }
    });
    
    // Record this action in history
    await recordDailyAction(`prayer_${prayer}`, newStatus);
  };

  const prayers = [
    { id: 'fajr', label: 'Fajr' },
    { id: 'zuhr', label: 'Zuhr' },
    { id: 'asr', label: 'Asr' },
    { id: 'maghrib', label: 'Maghrib' },
    { id: 'isha', label: 'Isha' }
  ];

  const completedCount = Object.values(userData.namaz).filter(Boolean).length;
  const progressPercentage = (completedCount / 5) * 100;

  return (
    <div className="namaz-container">
      <h3>Daily Namaz Check-In</h3>
      <p className="namaz-description">
        You will get extra points for not missing any namaz throughout the week
      </p>
      
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
    </div>
  );
};

export default DailyNamazCheckIn;