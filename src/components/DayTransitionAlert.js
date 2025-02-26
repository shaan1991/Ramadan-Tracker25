// src/components/DayTransitionAlert.js
import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './DayTransitionAlert.css';

const DayTransitionAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const { userData, checkForDayChange } = useUser();
  const [nextCheckTime, setNextCheckTime] = useState(null);

  // Helper function for consistent date formatting
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Setup check for day change at midnight
  useEffect(() => {
    // Calculate time until midnight
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 10, 0); // 10 seconds after midnight
      
      return tomorrow - now;
    };

    // Schedule the next check
    const scheduleNextCheck = () => {
      const timeUntilMidnight = calculateTimeUntilMidnight();
      console.log(`Scheduling day change check in ${Math.floor(timeUntilMidnight / 1000 / 60)} minutes`);
      
      // Store the next check time for display
      const nextCheck = new Date();
      nextCheck.setTime(nextCheck.getTime() + timeUntilMidnight);
      setNextCheckTime(nextCheck);
      
      // Set timeout for midnight check
      const timerId = setTimeout(() => {
        const today = formatDate(new Date());
        const lastActiveDate = userData?.lastActiveDate || '';
        
        if (today !== lastActiveDate) {
          // Day has changed, show alert
          setShowAlert(true);
          
          // Also trigger the context refresh
          checkForDayChange();
        }
        
        // Schedule the next check for the following day
        scheduleNextCheck();
      }, timeUntilMidnight);
      
      return timerId;
    };
    
    // Start the scheduling chain
    const timerId = scheduleNextCheck();
    
    // Cleanup
    return () => clearTimeout(timerId);
  }, [userData?.lastActiveDate]);

  const handleRefresh = () => {
    // Refresh the data
    checkForDayChange();
    // Hide the alert
    setShowAlert(false);
    // Force a refresh of the page
    window.location.reload();
  };

  if (!showAlert) return null;

  return (
    <div className="day-transition-alert">
      <div className="alert-content">
        <h3>New Day Started!</h3>
        <p>It's a new day in Ramadan. Your tracking has been reset for today.</p>
        <button onClick={handleRefresh} className="refresh-button">
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default DayTransitionAlert;