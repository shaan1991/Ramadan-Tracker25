// File: src/services/dataService.js
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    serverTimestamp 
  } from 'firebase/firestore';
  
  const db = getFirestore();
  
  // Initialize user data for the first time
  export const initializeUserData = async (userId, name) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      // Check if user doc already exists
      if (!userDoc.exists()) {
        const now = new Date();
        const ramadanDay = calculateRamadanDay(now);
        
        const userData = {
          userId,
          name,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ramadanStats: {
            currentDay: ramadanDay,
            totalDays: 30,
            salah: { 
              completed: 0, 
              total: 5 
            },
            quran: { 
              completed: 0, 
              total: 30 
            }
          },
          dailyLogs: {},
        };
        
        // Create initial daily log for today
        const todayKey = formatDateKey(now);
        userData.dailyLogs[todayKey] = {
          date: serverTimestamp(),
          day: ramadanDay,
          namaz: {
            fajr: false,
            zuhr: false,
            asr: false,
            maghrib: false,
            isha: false
          },
          fasting: true,
          prayedTaraweeh: false,
          extraDeeds: [],
          notes: ''
        };
        
        await setDoc(doc(db, 'users', userId), userData);
        return userData;
      }
      
      return userDoc.data();
    } catch (error) {
      console.error("Error initializing user data:", error);
      throw error;
    }
  };
  
  // Get user data
  export const getUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };
  
  // Update prayer status
  export const updatePrayerStatus = async (userId, prayer, status) => {
    try {
      const today = formatDateKey(new Date());
      const userDocRef = doc(db, 'users', userId);
      
      // Get current user data
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User document not found");
      }
      
      const userData = userDoc.data();
      
      // Ensure today's log exists
      if (!userData.dailyLogs[today]) {
        userData.dailyLogs[today] = {
          date: serverTimestamp(),
          day: userData.ramadanStats.currentDay,
          namaz: {
            fajr: false,
            zuhr: false,
            asr: false,
            maghrib: false,
            isha: false
          },
          fasting: true,
          prayedTaraweeh: false,
          extraDeeds: [],
          notes: ''
        };
      }
      
      // Update prayer status
      userData.dailyLogs[today].namaz[prayer] = status;
      
      // Calculate completed prayers
      const completedPrayers = Object.values(userData.dailyLogs[today].namaz)
        .filter(val => val).length;
      
      // Update salah stats
      userData.ramadanStats.salah.completed = completedPrayers;
      
      // Update document
      await updateDoc(userDocRef, {
        [`dailyLogs.${today}.namaz.${prayer}`]: status,
        'ramadanStats.salah.completed': completedPrayers,
        updatedAt: serverTimestamp()
      });
      
      return {
        status: true,
        completedPrayers
      };
    } catch (error) {
      console.error("Error updating prayer status:", error);
      throw error;
    }
  };
  
  // Update fasting status
  export const updateFastingStatus = async (userId, status) => {
    try {
      const today = formatDateKey(new Date());
      const userDocRef = doc(db, 'users', userId);
      
      await updateDoc(userDocRef, {
        [`dailyLogs.${today}.fasting`]: status,
        updatedAt: serverTimestamp()
      });
      
      return { status: true };
    } catch (error) {
      console.error("Error updating fasting status:", error);
      throw error;
    }
  };
  
  // Update Taraweeh prayer status
  export const updateTaraweehStatus = async (userId, status) => {
    try {
      const today = formatDateKey(new Date());
      const userDocRef = doc(db, 'users', userId);
      
      await updateDoc(userDocRef, {
        [`dailyLogs.${today}.prayedTaraweeh`]: status,
        updatedAt: serverTimestamp()
      });
      
      return { status: true };
    } catch (error) {
      console.error("Error updating Taraweeh status:", error);
      throw error;
    }
  };
  
  // Update Juz count
  export const updateJuzCount = async (userId, count) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      await updateDoc(userDocRef, {
        'ramadanStats.quran.completed': count,
        updatedAt: serverTimestamp()
      });
      
      return { status: true, count };
    } catch (error) {
      console.error("Error updating Juz count:", error);
      throw error;
    }
  };
  
  // Get today's prayer times based on location
  export const getPrayerTimes = async (latitude, longitude) => {
    try {
      // Using a free prayer times API
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
      const data = await response.json();
      
      if (data.code === 200) {
        return {
          fajr: data.data.timings.Fajr,
          sunrise: data.data.timings.Sunrise,
          dhuhr: data.data.timings.Dhuhr,
          asr: data.data.timings.Asr,
          maghrib: data.data.timings.Maghrib,
          isha: data.data.timings.Isha
        };
      } else {
        throw new Error("Failed to get prayer times");
      }
    } catch (error) {
      console.error("Error getting prayer times:", error);
      return {
        fajr: "05:00",
        sunrise: "06:30",
        dhuhr: "12:30",
        asr: "15:30",
        maghrib: "18:00",
        isha: "19:30"
      };
    }
  };
  
  // Helper function to format date as YYYY-MM-DD for Firebase keys
  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Helper function to calculate which day of Ramadan it is
  const calculateRamadanDay = (date) => {
    // This is a placeholder function
    // In a real app, you would use a proper Islamic calendar calculation
    // or an API to determine the current day of Ramadan
    
    // For demo purposes, assuming Ramadan starts on a certain date
    const ramadanStartDate = new Date('2025-02-01'); // Example date
    const diffTime = Math.abs(date - ramadanStartDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 30 ? diffDays : 1;
  };
  
  export { db };