// src/contexts/UserContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ramadanDay, setRamadanDay] = useState(calculateRamadanDay());
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
    // You may need to adjust this based on the actual start date of Ramadan
    const startDate = new Date('2025-02-23'); // Example: Ramadan start date
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? 30 : diffDays;
  }

  // Check if the app needs to reset for a new day
  const checkForDayChange = async () => {
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
        // Reset Quran progress for the day
        quran: { 
          completed: 0, 
          total: 30 
        },
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
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        await fetchUserData(currentUser.uid);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Effect for checking day change - run on initial load and when userData changes
  useEffect(() => {
    checkForDayChange();
  }, [userData?.lastActiveDate]); // Only run when the lastActiveDate changes

  // Also check for day change periodically if the app is left open
  useEffect(() => {
    if (!user) return;
    
    // Check for day change every hour if the app remains open
    const dayChangeInterval = setInterval(() => {
      checkForDayChange();
    }, 3600000); // 1 hour in milliseconds
    
    return () => clearInterval(dayChangeInterval);
  }, [user, userData]);

  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      const today = formatDate(new Date());
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setLastActiveDate(data.lastActiveDate || null);
      } else {
        // Initialize user data for first-time users
        const initialData = {
          day: ramadanDay,
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
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (newData) => {
    if (!user) return;

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
          // Update the history object for the specific date
          const historyUpdate = {};
          
          // Structure the history update based on the data being updated
          for (const key in dataToUpdate) {
            historyUpdate[`history.${historicalDate}.${key}`] = dataToUpdate[key];
          }
          
          // Ensure we record what day of Ramadan this was
          historyUpdate[`history.${historicalDate}.day`] = calculateRamadanDayForDate(new Date(historicalDate));
          
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, historyUpdate);
          
          // Update local state
          setUserData(prevData => {
            const newData = { ...prevData };
            if (!newData.history) newData.history = {};
            if (!newData.history[historicalDate]) newData.history[historicalDate] = {};
            
            for (const key in dataToUpdate) {
              newData.history[historicalDate][key] = dataToUpdate[key];
            }
            
            newData.history[historicalDate].day = calculateRamadanDayForDate(new Date(historicalDate));
            
            return newData;
          });
        } else {
          // Normal update for today's data
          const today = formatDate(new Date()); // Use consistent date formatting
          const userDocRef = doc(db, 'users', user.uid);
          
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
          setUserData(prevData => ({ ...prevData, ...dataToUpdate }));
          setLastActiveDate(today);
        }
        
        return true;
      } catch (error) {
        console.error("Error updating user data:", error);
        return false;
      }
    }
    
    // If we're just updating view state, update the local context data
    setUserData(prevData => ({
      ...prevData,
      isHistoricalView,
      historicalDate,
      currentViewData
    }));
    
    return true;
  };

  // Calculate Ramadan day for a specific date
  const calculateRamadanDayForDate = (date) => {
    const startDate = new Date('2025-02-23'); // Same as above
    const diffTime = Math.abs(date - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? 30 : diffDays;
  };

  // Get the effective data to display (either current or historical)
  const getEffectiveData = () => {
    if (isHistoricalView && historicalDate && userData) {
      // If viewing historical data, combine base data with historical overrides
      const historyData = userData.history && userData.history[historicalDate] 
        ? userData.history[historicalDate] 
        : {};
      
      return {
        ...userData,
        ...currentViewData,
        ...historyData,
        isHistoricalView,
        historicalDate
      };
    }
    
    // Otherwise return current data
    return userData;
  };

  // Track daily actions in history
  const recordDailyAction = async (action, value) => {
    if (!user || !userData) return;

    // If we're in historical view, update the historical record
    if (isHistoricalView && historicalDate) {
      const historyUpdate = {
        [`history.${historicalDate}.${action}`]: value,
        [`history.${historicalDate}.day`]: calculateRamadanDayForDate(new Date(historicalDate))
      };
      
      return await updateUserData(historyUpdate);
    }
    
    // Otherwise update today's record - using consistent date formatting
    const today = formatDate(new Date());
    const historyUpdate = {
      [`history.${today}.${action}`]: value,
      [`history.${today}.day`]: ramadanDay
    };

    return await updateUserData(historyUpdate);
  };

  const value = {
    user,
    userData: getEffectiveData(),
    loading,
    ramadanDay,
    isHistoricalView,
    historicalDate,
    updateUserData,
    recordDailyAction,
    checkForDayChange // Expose this method to allow manual refresh
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);