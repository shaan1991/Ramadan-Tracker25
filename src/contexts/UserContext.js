// Modified src/contexts/UserContext.js
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

  // Calculate which day of Ramadan it is
  function calculateRamadanDay() {
    // You may need to adjust this based on the actual start date of Ramadan
    // This is a simplified example
    const startDate = new Date('2025-02-23'); // Example: Ramadan start date
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? 30 : diffDays;
  }

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

  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data());
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
          // Initialize with default duas
          duas: [
            'O Allah, Guardian of my soul, envelop me in Your divine protection and shield me from all forms of harm, negativity, and malignance that seek to disrupt my path.',
            'O Most Merciful, bestow upon me the companionship of a righteous spouse whose heart is filled with faith, love, and kindness.',
            'O Allah, Guardian of my soul, envelop me in Your divine protection and shield me from all forms of harm, negativity, and malignance that seek to disrupt my path.'
          ]
        };
        
        await setDoc(userDocRef, initialData);
        setUserData(initialData);
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
          const today = new Date().toISOString().split('T')[0];
          const userDocRef = doc(db, 'users', user.uid);
          
          // Also record in history for today
          const historyUpdate = {};
          for (const key in dataToUpdate) {
            historyUpdate[`history.${today}.${key}`] = dataToUpdate[key];
          }
          historyUpdate[`history.${today}.day`] = ramadanDay;
          
          // Combine regular updates with history updates
          const combinedUpdates = { ...dataToUpdate, ...historyUpdate };
          
          await updateDoc(userDocRef, combinedUpdates);
          setUserData(prevData => ({ ...prevData, ...dataToUpdate }));
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
    
    // Otherwise update today's record
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
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
    recordDailyAction
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);