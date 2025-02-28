// src/contexts/UserContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { isBeforeRamadan, isWithinRamadan, calculateRamadanDay as calculateDayFromDate, RAMADAN_START_DATE } from '../utils/dateValidation';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ramadanDay, setRamadanDay] = useState(0); // Initialize with 0 instead of calculating right away
  const [isHistoricalView, setIsHistoricalView] = useState(false);
  const [historicalDate, setHistoricalDate] = useState(null);
  const [currentViewData, setCurrentViewData] = useState(null);
  const [lastActiveDate, setLastActiveDate] = useState(null);

  // Helper function for consistent date formatting
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate which day of Ramadan it is
  function calculateRamadanDay() {
    return calculateDayFromDate(new Date());
  }

  // Check if the app needs to reset for a new day - using useCallback to avoid dependency issues
  const checkForDayChange = useCallback(async () => {
    if (!userData || !user) return;
    
    const today = formatDate(new Date());
    
    // Get the last active date from user data or use stored state
    const storedLastActiveDate = userData.lastActiveDate || lastActiveDate;
    
    // If this is our first check or the date has changed
    if (!storedLastActiveDate || storedLastActiveDate !== today) {
      console.log("New day detected! Resetting daily trackers.");
      
      // Comprehensive reset of daily tracking data
      const resetData = {
        // Reset namaz (prayer) status
        namaz: {
          fajr: false,
          zuhr: false,
          asr: false,
          maghrib: false,
          isha: false
        },
        // EXPLICITLY reset salah tracking to 0 completed
        salah: { 
          completed: 0, 
          total: 5 
        },
        // Reset fasting status
        fasting: false,
        // Reset taraweeh status
        prayedTaraweeh: false,
        // Update last active date
        lastActiveDate: today,
        // Recalculate Ramadan day
        day: calculateRamadanDay()
      };
      
      // Update the user data with a clean slate for today
      await updateUserData(resetData);
      
      // Update local state
      setLastActiveDate(today);
      setRamadanDay(calculateRamadanDay());
      
      // Reset any historical view or current view data
      setIsHistoricalView(false);
      setHistoricalDate(null);
      setCurrentViewData(null);
    }
  }, [userData, user, lastActiveDate]); // Add proper dependencies

  // Fetch user data function with useCallback
  const fetchUserData = useCallback(async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      const today = formatDate(new Date());
      const currentRamadanDay = calculateRamadanDay();
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setLastActiveDate(data.lastActiveDate || null);
        setRamadanDay(currentRamadanDay); // Set Ramadan day after data is loaded
      } else {
        // Initialize user data for first-time users
        const initialData = {
          day: currentRamadanDay,
          totalDays: 30,
          salah: { completed: 0, total: 5 },
          roza: false,
          taraweeh: false,
          quran: { completed: 0, total: 30 },
          namaz: {
            fajr: false,
            zuhr: false,
            asr: false,
            maghrib: false,
            isha: false
          },
          fasting: false,
          prayedTaraweeh: false,
          history: {},
          lastActiveDate: today,
          // Add onboarding flag (initially false to show onboarding)
          onboardingCompleted: false,
          // Initialize with default duas
          duas: [
            'Use this page to add your duas and track them - long press to edit and swipe to delete'
          ]
        };
        
        await setDoc(userDocRef, initialData);
        setUserData(initialData);
        setLastActiveDate(today);
        setRamadanDay(currentRamadanDay);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed here

  // Auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed, user:", currentUser?.uid);
      setUser(currentUser);
      
      if (currentUser) {
        setLoading(true); // Set loading to true when user changes
        await fetchUserData(currentUser.uid);
      } else {
        // Clear all user data when logged out
        setUserData(null);
        setLastActiveDate(null);
        setRamadanDay(0);
        setIsHistoricalView(false);
        setHistoricalDate(null);
        setCurrentViewData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserData]);

  // Effect for checking day change - run on initial load and when userData changes
  useEffect(() => {
    if (userData && user) {
      checkForDayChange();
    }
  }, [userData?.lastActiveDate, checkForDayChange, user]); // Add proper dependencies

  // Also check for day change periodically if the app is left open
  useEffect(() => {
    if (!user) return;
    
    // Check for day change every hour if the app remains open
    const dayChangeInterval = setInterval(() => {
      checkForDayChange();
    }, 3600000); // 1 hour in milliseconds
    
    return () => clearInterval(dayChangeInterval);
  }, [user, checkForDayChange]); // Add proper dependencies

  // Update user data function (memoized)
  const updateUserData = useCallback(async (newData) => {
    if (!user) return false;

    // Check if we're switching to or modifying historical view
    if (newData.hasOwnProperty('isHistoricalView')) {
      setIsHistoricalView(newData.isHistoricalView);
    }
    
    if (newData.hasOwnProperty('historicalDate')) {
      setHistoricalDate(newData.historicalDate);
    }
    
    if (newData.hasOwnProperty('currentViewData')) {
      setCurrentViewData(newData.currentViewData);
    }
    
    // If we're updating actual data (not just view state)
    const dataToUpdate = { ...newData };
    
    // Remove view-only properties
    delete dataToUpdate.isHistoricalView;
    delete dataToUpdate.historicalDate;
    delete dataToUpdate.currentViewData;
    
    // If there's still data to update in Firestore
    if (Object.keys(dataToUpdate).length > 0) {
      try {
        // If we're in historical view and updating data, save to the history object
        if (isHistoricalView && historicalDate) {
          // Check if this date is before Ramadan - don't allow updates
          if (isBeforeRamadan(new Date(historicalDate))) {
            console.warn("Cannot update data for date before Ramadan:", historicalDate);
            return false;
          }
          
          // Update the history object for the specific date
          const historyUpdate = {};
          
          // Structure the history update based on the data being updated
          for (const key in dataToUpdate) {
            historyUpdate[`history.${historicalDate}.${key}`] = dataToUpdate[key];
          }
          
          // Ensure we record what day of Ramadan this was
          historyUpdate[`history.${historicalDate}.day`] = calculateDayFromDate(new Date(historicalDate));
          
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, historyUpdate);
          
          // Update local state
          setUserData(prevData => {
            if (!prevData) return prevData; // Safety check
            
            const newData = { ...prevData };
            if (!newData.history) newData.history = {};
            if (!newData.history[historicalDate]) newData.history[historicalDate] = {};
            
            for (const key in dataToUpdate) {
              newData.history[historicalDate][key] = dataToUpdate[key];
            }
            
            newData.history[historicalDate].day = calculateDayFromDate(new Date(historicalDate));
            
            return newData;
          });
        } else {
          // Normal update for today's data
          const today = formatDate(new Date()); // Use consistent date formatting
          const userDocRef = doc(db, 'users', user.uid);
          
          // For current data, check if today is before Ramadan starts
          if (isBeforeRamadan(new Date())) {
            // Filter out Ramadan tracking data if today is before Ramadan
            const allowedKeys = ['lastActiveDate', 'onboardingCompleted', 'user', 'duas']; 
            
            // Filter dataToUpdate to only include allowed keys
            const filteredUpdates = {};
            for (const key of allowedKeys) {
              if (key in dataToUpdate) {
                filteredUpdates[key] = dataToUpdate[key];
              }
            }
            
            // If there's nothing left to update, return
            if (Object.keys(filteredUpdates).length === 0) {
              console.warn("Cannot update Ramadan data before Ramadan starts");
              return false;
            }
            
            // Update with only the allowed data
            await updateDoc(userDocRef, filteredUpdates);
            setUserData(prevData => {
              if (!prevData) return prevData; // Safety check
              return { ...prevData, ...filteredUpdates };
            });
            return true;
          }
          
          // Continue with normal update during Ramadan
          // Also record in history for today
          const historyUpdate = {};
          for (const key in dataToUpdate) {
            historyUpdate[`history.${today}.${key}`] = dataToUpdate[key];
          }
          historyUpdate[`history.${today}.day`] = ramadanDay;
          
          // Add lastActiveDate to regular updates
          if (!dataToUpdate.hasOwnProperty('lastActiveDate')) {
            dataToUpdate.lastActiveDate = today;
          }
          
          // Combine regular updates with history updates
          const combinedUpdates = { ...dataToUpdate, ...historyUpdate };
          
          await updateDoc(userDocRef, combinedUpdates);
          setUserData(prevData => {
            if (!prevData) return prevData; // Safety check
            return { ...prevData, ...dataToUpdate };
          });
          setLastActiveDate(today);
        }
        
        return true;
      } catch (error) {
        console.error("Error updating user data:", error);
        return false;
      }
    }
    
    // If we're just updating view state, update the local context data
    setUserData(prevData => {
      if (!prevData) return prevData; // Safety check
      return {
        ...prevData,
        isHistoricalView,
        historicalDate,
        currentViewData
      };
    });
    
    return true;
  }, [user, isHistoricalView, historicalDate, ramadanDay]);

  // Calculate Ramadan day for a specific date
  const calculateRamadanDayForDate = useCallback((date) => {
    return calculateDayFromDate(date);
  }, []);

  // Get the effective data to display (either current or historical)
  const getEffectiveData = useCallback(() => {
    if (!userData) return null; // Handle null userData case
    
    if (isHistoricalView && historicalDate && userData) {
      // If viewing historical data, combine base data with historical overrides
      const historyData = userData.history && userData.history[historicalDate] 
        ? userData.history[historicalDate] 
        : {};
      
      // Add flag for pre-Ramadan dates
      const beforeRamadan = isBeforeRamadan(new Date(historicalDate));
      
      return {
        ...userData,
        ...currentViewData,
        ...historyData,
        isHistoricalView,
        historicalDate,
        beforeRamadan // Add flag so components can check this
      };
    }
    
    // Otherwise return current data with beforeRamadan flag if needed
    return {
      ...userData,
      beforeRamadan: isBeforeRamadan(new Date())
    };
  }, [userData, isHistoricalView, historicalDate, currentViewData]);

  // Track daily actions in history
  const recordDailyAction = useCallback(async (action, value) => {
    if (!user || !userData) return false;

    // If we're in historical view, update the historical record
    if (isHistoricalView && historicalDate) {
      // Don't allow recording data for dates before Ramadan
      if (isBeforeRamadan(new Date(historicalDate))) {
        console.warn("Cannot record data for date before Ramadan:", historicalDate);
        return false;
      }
      
      const historyUpdate = {
        [`history.${historicalDate}.${action}`]: value,
        [`history.${historicalDate}.day`]: calculateDayFromDate(new Date(historicalDate))
      };
      
      return await updateUserData(historyUpdate);
    }
    
    // For today, also ensure we're in Ramadan
    const today = new Date();
    if (isBeforeRamadan(today)) {
      console.warn("Cannot record data - today is before Ramadan");
      return false;
    }
    
    // Otherwise update today's record - using consistent date formatting
    const todayFormatted = formatDate(today);
    const historyUpdate = {
      [`history.${todayFormatted}.${action}`]: value,
      [`history.${todayFormatted}.day`]: ramadanDay
    };

    return await updateUserData(historyUpdate);
  }, [user, userData, isHistoricalView, historicalDate, ramadanDay, updateUserData]);

  // Use the memoized getEffectiveData to compute the context value
  const effectiveData = userData ? getEffectiveData() : null;

  const value = {
    user,
    userData: effectiveData,
    loading,
    ramadanDay,
    isHistoricalView,
    historicalDate,
    updateUserData,
    recordDailyAction,
    checkForDayChange, // Expose this method to allow manual refresh
    isBeforeRamadan,   // Expose the date validation functions to components
    isWithinRamadan
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);