// src/contexts/PrayerTimesContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { PrayerTimes, CalculationMethod, Coordinates } from 'adhan';

// Create context
export const PrayerTimesContext = createContext();

// Format time consistently
const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  }).toLowerCase();
};

// Provider component
export const PrayerTimesProvider = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [formattedTimes, setFormattedTimes] = useState({
    fajr: 'Loading...',
    sunrise: 'Loading...',
    dhuhr: 'Loading...',
    asr: 'Loading...',
    maghrib: 'Loading...',
    isha: 'Loading...'
  });

  // Calculate prayer times for a specific date
  const getPrayerTimesForDate = (date) => {
    if (!location) return null;
    
    try {
      const coordinates = new Coordinates(location.latitude, location.longitude);
      const params = CalculationMethod.MoonsightingCommittee();
      return new PrayerTimes(coordinates, date, params);
    } catch (error) {
      console.error('Error calculating prayer times:', error);
      return null;
    }
  };

  // Format all prayer times
  const formatPrayerTimes = (times) => {
    if (!times) return formattedTimes;
    
    return {
      fajr: formatTime(times.fajr),
      sunrise: formatTime(times.sunrise),
      dhuhr: formatTime(times.dhuhr),
      asr: formatTime(times.asr),
      maghrib: formatTime(times.maghrib),
      isha: formatTime(times.isha)
    };
  };

  // Get user location and calculate prayer times
  useEffect(() => {
    // Skip if already loaded successfully
    if (locationStatus === 'success' && prayerTimes) {
      return;
    }
    
    const getLocationAndPrayerTimes = async () => {
      setLocationStatus('loading');
      
      try {
        // Get user's geolocation
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000 * 60 * 60 // 1 hour cache
          });
        });
        
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        
        // Calculate prayer times using adhan
        const coordinates = new Coordinates(latitude, longitude);
        const date = new Date();
        const params = CalculationMethod.MoonsightingCommittee();
        const times = new PrayerTimes(coordinates, date, params);
        
        setPrayerTimes(times);
        setFormattedTimes(formatPrayerTimes(times));
        setLocationStatus('success');
        
        // Cache the location in localStorage for faster future loads
        localStorage.setItem('cachedLocation', JSON.stringify({
          latitude,
          longitude,
          timestamp: Date.now()
        }));
        
        console.log('Prayer times calculated:', times);
      } catch (error) {
        console.error('Error getting location:', error);
        
        // Try to use cached location if available
        const cachedLocation = localStorage.getItem('cachedLocation');
        if (cachedLocation) {
          try {
            const { latitude, longitude, timestamp } = JSON.parse(cachedLocation);
            
            // Only use cache if it's less than 24 hours old
            if (Date.now() - timestamp < 1000 * 60 * 60 * 24) {
              setLocation({ latitude, longitude });
              
              // Calculate prayer times with cached location
              const coordinates = new Coordinates(latitude, longitude);
              const date = new Date();
              const params = CalculationMethod.MoonsightingCommittee();
              const times = new PrayerTimes(coordinates, date, params);
              
              setPrayerTimes(times);
              setFormattedTimes(formatPrayerTimes(times));
              setLocationStatus('cached');
              console.log('Using cached location for prayer times');
              return;
            }
          } catch (cacheError) {
            console.error('Error using cached location:', cacheError);
          }
        }
        
        setLocationStatus('error');
      }
    };
    
    getLocationAndPrayerTimes();
  }, [locationStatus, prayerTimes]);

  // Retry getting location
  const retryLocation = () => {
    setLocationStatus('loading');
  };

  const value = {
    prayerTimes,
    formattedTimes,
    locationStatus,
    retryLocation,
    getPrayerTimesForDate,
    formatPrayerTimes
  };

  return (
    <PrayerTimesContext.Provider value={value}>
      {children}
    </PrayerTimesContext.Provider>
  );
};

// Custom hook to use the prayer times context
export const usePrayerTimes = () => {
  const context = useContext(PrayerTimesContext);
  if (context === undefined) {
    throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
  }
  return context;
};