// File: src/contexts/UserContext.js
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
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, newData);
      setUserData(prevData => ({ ...prevData, ...newData }));
      return true;
    } catch (error) {
      console.error("Error updating user data:", error);
      return false;
    }
  };

  // Track daily actions in history
  const recordDailyAction = async (action, value) => {
    if (!user || !userData) return;

    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const historyUpdate = {
      [`history.${today}.${action}`]: value,
      [`history.${today}.day`]: ramadanDay
    };

    return await updateUserData(historyUpdate);
  };

  const value = {
    user,
    userData,
    loading,
    ramadanDay,
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