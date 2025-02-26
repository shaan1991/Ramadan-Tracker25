// src/services/historyTracker.js
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Format date consistently across the app
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Track daily Juz reading progress
export const trackJuzProgress = async (userId, juzNumber, isCompleted) => {
  if (!userId) return false;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      console.error("User document not found");
      return false;
    }
    
    const userData = userSnapshot.data();
    const today = formatDate(new Date());
    
    // Get existing completedJuzs or initialize
    const completedJuzs = userData.completedJuzs || [];
    
    // Create daily history object if needed
    if (!userData.juzHistory) userData.juzHistory = {};
    if (!userData.juzHistory[today]) userData.juzHistory[today] = [];
    
    // Update completedJuzs list (adding or removing the juz)
    let newCompletedJuzs = [...completedJuzs];
    
    if (isCompleted && !completedJuzs.includes(juzNumber)) {
      newCompletedJuzs.push(juzNumber);
    } else if (!isCompleted && completedJuzs.includes(juzNumber)) {
      newCompletedJuzs = completedJuzs.filter(juz => juz !== juzNumber);
    } else {
      // No change needed
      return true;
    }
    
    // Update daily juz reading history
    // We track which juz were completed on this specific day
    let todaysReadings = userData.juzHistory[today] || [];
    
    if (isCompleted && !todaysReadings.includes(juzNumber)) {
      todaysReadings.push(juzNumber);
    } else if (!isCompleted && todaysReadings.includes(juzNumber)) {
      todaysReadings = todaysReadings.filter(juz => juz !== juzNumber);
    }
    
    // Save updated data
    await updateDoc(userDocRef, {
      completedJuzs: newCompletedJuzs,
      [`juzHistory.${today}`]: todaysReadings,
      'quran.completed': newCompletedJuzs.length,
      'quran.total': 30
    });
    
    return true;
  } catch (error) {
    console.error("Error tracking Juz progress:", error);
    return false;
  }
};

// Get a user's reading progress for a specific date
export const getDateJuzProgress = async (userId, dateString) => {
  if (!userId) return [];
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      return [];
    }
    
    const userData = userSnapshot.data();
    
    if (userData.juzHistory && userData.juzHistory[dateString]) {
      return userData.juzHistory[dateString];
    }
    
    return [];
  } catch (error) {
    console.error("Error getting date Juz progress:", error);
    return [];
  }
};

// Generate a progress report for the month
export const getMonthlyJuzReport = async (userId) => {
  if (!userId) return null;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      return null;
    }
    
    const userData = userSnapshot.data();
    
    if (!userData.juzHistory) {
      return { totalCompleted: 0, dailyProgress: [] };
    }
    
    // Get sorted list of dates
    const dates = Object.keys(userData.juzHistory).sort();
    
    // Build daily progress data
    const dailyProgress = dates.map(date => {
      return {
        date,
        completed: userData.juzHistory[date].length,
        juzList: userData.juzHistory[date]
      };
    });
    
    // Calculate overall progress
    const completedJuzs = userData.completedJuzs || [];
    
    return {
      totalCompleted: completedJuzs.length,
      completedJuzs: completedJuzs,
      dailyProgress
    };
  } catch (error) {
    console.error("Error generating monthly report:", error);
    return null;
  }
};

// One-time migration function for existing users
export const migrateJuzData = async (userId) => {
  if (!userId) return false;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) return false;
    
    const userData = userSnapshot.data();
    
    // Check if migration is needed (no juzHistory and has completedJuzs)
    if (!userData.juzHistory && userData.completedJuzs?.length > 0) {
      console.log("Migrating Juz data to new format...");
      
      // Create juzHistory structure
      const juzHistory = {};
      const today = formatDate(new Date());
      
      // Place all existing juz in today's record if we don't know when they were completed
      juzHistory[today] = userData.completedJuzs;
      
      // Update the user document with new structure
      await updateDoc(userDocRef, {
        juzHistory,
        // Add lastActiveDate if it doesn't exist
        lastActiveDate: userData.lastActiveDate || today
      });
      
      console.log("Juz data migration complete!");
      return true;
    }
    
    return false; // No migration needed
  } catch (error) {
    console.error("Error migrating Juz data:", error);
    return false;
  }
};