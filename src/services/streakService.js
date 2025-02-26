// src/services/streakService.js
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Format date consistently
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get activity value from history or current state
const getActivityValue = (userData, activityType, date) => {
  // Check if the data is in history
  if (userData.history && userData.history[date]) {
    if (activityType === 'quran') {
      // For Quran, check if any juz was read that day
      return userData.history[date].juzReadToday !== undefined;
    } else if (activityType === 'fasting') {
      return !!userData.history[date].fasting;
    } else if (activityType === 'taraweeh') {
      return !!userData.history[date].prayedTaraweeh;
    }
  }
  
  // If not in history and asking about today, check current state
  const today = formatDate(new Date());
  if (date === today) {
    if (activityType === 'quran') {
      // For today's Quran, check if there are any completed juz
      return userData.completedJuzs && userData.completedJuzs.length > 0;
    } else if (activityType === 'fasting') {
      return !!userData.fasting;
    } else if (activityType === 'taraweeh') {
      return !!userData.prayedTaraweeh;
    }
  }
  
  return false;
};

// Calculate streak for any activity type
export const calculateStreak = async (userId, activityType) => {
  if (!userId || !activityType) return { current: 0, best: 0 };
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      return { current: 0, best: 0 };
    }
    
    const userData = userSnapshot.data();
    
    // Get today's date
    const today = formatDate(new Date());
    
    // Check if user has history
    if (!userData.history) {
      // If no history but activity is completed today, return 1
      const todayCompleted = getActivityValue(userData, activityType, today);
      return { 
        current: todayCompleted ? 1 : 0, 
        best: todayCompleted ? 1 : 0 
      };
    }
    
    // Get all dates from history plus today
    const allDates = [today, ...Object.keys(userData.history)]
      .filter((date, index, self) => self.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b) - new Date(a)); // Sort newest first
    
    // Start calculating streak
    let currentStreak = 0;
    let bestStreak = userData.streaks?.[activityType]?.best || 0;
    
    // Track dates we've seen for continuous streak
    const seenDates = new Set();
    
    // Function to check if a date is the next consecutive day
    const isConsecutiveDay = (currentDate, nextDate) => {
      const current = new Date(currentDate);
      const next = new Date(nextDate);
      
      // Set hours to noon to avoid timezone issues
      current.setHours(12, 0, 0, 0);
      next.setHours(12, 0, 0, 0);
      
      // Calculate difference in days
      const diffTime = current.getTime() - next.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays === 1;
    };
    
    // Iterate through dates in order (newest to oldest)
    for (let i = 0; i < allDates.length; i++) {
      const date = allDates[i];
      
      // Skip if we've already seen this date
      if (seenDates.has(date)) continue;
      seenDates.add(date);
      
      // Check if activity was completed on this date
      const activityCompleted = getActivityValue(userData, activityType, date);
      
      if (activityCompleted) {
        // If this is the first completed date or consecutive with previous, increment streak
        if (currentStreak === 0) {
          currentStreak = 1;
        } else if (i > 0 && isConsecutiveDay(allDates[i-1], date)) {
          currentStreak++;
        } else {
          // Break in the streak
          break;
        }
      } else {
        // Activity not completed on this date, break streak
        break;
      }
    }
    
    // Update best streak if needed
    bestStreak = Math.max(bestStreak, currentStreak);
    
    return { current: currentStreak, best: bestStreak };
  } catch (error) {
    console.error(`Error calculating ${activityType} streak:`, error);
    return { current: 0, best: 0 };
  }
};

// Get all streaks in a single call
export const getAllStreaks = async (userId) => {
  if (!userId) return {
    quran: { current: 0, best: 0 },
    fasting: { current: 0, best: 0 },
    taraweeh: { current: 0, best: 0 }
  };
  
  try {
    const quranStreak = await calculateStreak(userId, 'quran');
    const fastingStreak = await calculateStreak(userId, 'fasting');
    const taraweehStreak = await calculateStreak(userId, 'taraweeh');
    
    return {
      quran: quranStreak,
      fasting: fastingStreak,
      taraweeh: taraweehStreak
    };
  } catch (error) {
    console.error('Error getting all streaks:', error);
    return {
      quran: { current: 0, best: 0 },
      fasting: { current: 0, best: 0 },
      taraweeh: { current: 0, best: 0 }
    };
  }
};

// Update streak data for user
export const updateStreakData = async (userId, activityType, isCompleted) => {
  if (!userId || !activityType) return false;
  
  try {
    // Calculate current streak
    const { current, best } = await calculateStreak(userId, activityType);
    
    // Update streak data in Firestore
    const userDocRef = doc(db, 'users', userId);
    const today = formatDate(new Date());
    
    const streakData = {
      [`streaks.${activityType}`]: {
        current: isCompleted ? current : 0,
        best: best,
        lastDate: isCompleted ? today : null
      }
    };
    
    await updateDoc(userDocRef, streakData);
    return true;
  } catch (error) {
    console.error(`Error updating ${activityType} streak:`, error);
    return false;
  }
};

// Initialize streak tracking for new users
export const initializeStreakTracking = async (userId) => {
  if (!userId) return false;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      return false;
    }
    
    const userData = userSnapshot.data();
    
    // Only initialize if streaks object doesn't exist
    if (!userData.streaks) {
      const initialStreaks = {
        streaks: {
          fasting: { current: 0, best: 0, lastDate: null },
          taraweeh: { current: 0, best: 0, lastDate: null },
          quran: { current: 0, best: 0, lastDate: null }
        }
      };
      
      await updateDoc(userDocRef, initialStreaks);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing streak tracking:', error);
    return false;
  }
};

// Get combined streak score across all activities
export const getCombinedStreakScore = async (userId) => {
  if (!userId) return 0;
  
  try {
    const allStreaks = await getAllStreaks(userId);
    
    // Weigh each activity (can be adjusted)
    const fastingWeight = 0.4;  // 40%
    const taraweehWeight = 0.2; // 20%
    const quranWeight = 0.4;    // 40%
    
    const fastingScore = allStreaks.fasting.current / 30 * 100 * fastingWeight;
    const taraweehScore = allStreaks.taraweeh.current / 30 * 100 * taraweehWeight;
    const quranScore = (allStreaks.quran.current / 30) * 100 * quranWeight;
    
    return Math.round(fastingScore + taraweehScore + quranScore);
  } catch (error) {
    console.error('Error calculating combined streak score:', error);
    return 0;
  }
};

// Get the best streak across all activities
export const getBestStreak = async (userId) => {
  if (!userId) return 0;
  
  try {
    const allStreaks = await getAllStreaks(userId);
    
    return Math.max(
      allStreaks.quran.best,
      allStreaks.fasting.best,
      allStreaks.taraweeh.best
    );
  } catch (error) {
    console.error('Error getting best streak:', error);
    return 0;
  }
};