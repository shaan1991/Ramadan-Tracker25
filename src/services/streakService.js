// src/services/streakService.js - with Pre-Ramadan validation
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { isBeforeRamadan, getRamadanStartDate } from '../utils/dateValidation';

// Format date consistently
export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate prayer streaks from userData (based on completing all 5 prayers in a day)
export const calculatePrayerStreakFromData = (userData, options = {}) => {
  if (!userData) return { current: 0, best: 0 };
  const { ramadanOnly = false, baseDate = new Date() } = options;
  const history = userData.history || {};
  const todayKey = formatDate(baseDate);

  const completedToday = userData.namaz
    ? ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].every(prayer => userData.namaz[prayer])
    : false;

  const allDates = [todayKey, ...Object.keys(history)]
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => new Date(b) - new Date(a));

  const baseDateKey = formatDate(baseDate);
  const relevantDates = (ramadanOnly
    ? allDates.filter(date => !isBeforeRamadan(new Date(date), userData))
    : allDates
  ).filter(date => new Date(date) <= new Date(baseDateKey));

  const isComplete = (date) => {
    const entry = history[date] || {};
    if (date === todayKey && Object.keys(entry).length === 0) {
      return completedToday;
    }
    const byPrayerFlags = ['fajr', 'zuhr', 'asr', 'maghrib', 'isha']
      .every(prayer => entry[`prayer_${prayer}`] === true);
    if (byPrayerFlags) return true;
    if (entry.namaz) {
      return ['fajr', 'zuhr', 'asr', 'maghrib', 'isha'].every(prayer => entry.namaz?.[prayer] === true);
    }
    return false;
  };

  const isConsecutiveDay = (currentDate, nextDate) => {
    const currentObj = new Date(currentDate);
    const nextObj = new Date(nextDate);
    currentObj.setHours(12, 0, 0, 0);
    nextObj.setHours(12, 0, 0, 0);
    const diffTime = currentObj.getTime() - nextObj.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  let current = 0;
  let best = 0;

  for (let i = 0; i < relevantDates.length; i++) {
    const date = relevantDates[i];
    if (isComplete(date)) {
      if (current === 0) {
        current = 1;
      } else if (i > 0 && isConsecutiveDay(relevantDates[i - 1], date)) {
        current++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  let temp = 0;
  for (let i = 0; i < relevantDates.length; i++) {
    const date = relevantDates[i];
    if (isComplete(date)) {
      if (temp === 0) {
        temp = 1;
      } else if (i > 0 && isConsecutiveDay(relevantDates[i - 1], date)) {
        temp++;
      } else {
        temp = 1;
      }
      best = Math.max(best, temp);
    }
  }

  return { current, best };
};

// Helper function to get activity value from history or current state
const getActivityValue = (userData, activityType, date, ramadanOnly = false, baseDate = new Date()) => {
  // If we're calculating Ramadan-only streaks, ignore dates before Ramadan
  if (ramadanOnly && isBeforeRamadan(new Date(date), userData)) {
    return false;
  }
  
  // Check if the data is in history
  if (userData.history && userData.history[date]) {
    if (activityType === 'quran') {
      // For Quran, check if any juz was read that day
      if (userData.history[date].juzReadToday !== undefined) return true;
      if (Array.isArray(userData.history[date].completedJuzs)) {
        return userData.history[date].completedJuzs.length > 0;
      }
      if (userData.history[date].quran?.completed !== undefined) {
        return userData.history[date].quran.completed > 0;
      }
      // Fall back to juzHistory if available
      if (userData.juzHistory && userData.juzHistory[date]) {
        return userData.juzHistory[date].length > 0;
      }
      return false;
    } else if (activityType === 'fasting') {
      return !!userData.history[date].fasting;
    } else if (activityType === 'taraweeh') {
      return !!(userData.history[date].prayedTaraweeh ?? userData.history[date].taraweeh);
    }
  }
  
  // If not in history and asking about today, check current state
  const today = formatDate(baseDate);
  if (date === today) {
    if (activityType === 'quran') {
      // For today's Quran, check if there are any completed juz
      if (userData.completedJuzs && userData.completedJuzs.length > 0) return true;
      if (userData.quran?.completed !== undefined) return userData.quran.completed > 0;
      return false;
    } else if (activityType === 'fasting') {
      return !!userData.fasting;
    } else if (activityType === 'taraweeh') {
      return !!userData.prayedTaraweeh;
    }
  }
  
  return false;
};

// Calculate streak for any activity type - with pre-Ramadan validation
export const calculateStreak = async (userId, activityType, options = {}) => {
  if (!userId || !activityType) return { current: 0, best: 0 };
  const { ramadanOnly = false, baseDate = new Date() } = options;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      return { current: 0, best: 0 };
    }
    
    const userData = userSnapshot.data();
    
    // Get today's date
    const today = formatDate(baseDate);
    
    // Check if user has history
    if (!userData.history) {
      // If no history but activity is completed today, return 1
      const todayCompleted = getActivityValue(userData, activityType, today, ramadanOnly, baseDate);
      return { 
        current: todayCompleted ? 1 : 0, 
        best: todayCompleted ? 1 : 0 
      };
    }
    
    // Get all dates from history plus today
    const allDates = [today, ...Object.keys(userData.history)]
      .filter((date, index, self) => self.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b) - new Date(a)); // Sort newest first
    
    // If Ramadan-only, filter to Ramadan dates; otherwise keep all dates
    const relevantDates = ramadanOnly
      ? allDates.filter(date => !isBeforeRamadan(new Date(date), userData))
      : allDates;
    
    const baseDateKey = formatDate(baseDate);
    const cappedDates = relevantDates.filter(date => new Date(date) <= new Date(baseDateKey));
    
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
    // But only use dates within Ramadan period
    for (let i = 0; i < cappedDates.length; i++) {
      const date = cappedDates[i];
      
      // Skip if we've already seen this date
      if (seenDates.has(date)) continue;
      seenDates.add(date);
      
      // Check if activity was completed on this date
      const activityCompleted = getActivityValue(userData, activityType, date, ramadanOnly, baseDate);
      
      if (activityCompleted) {
        // If this is the first completed date or consecutive with previous, increment streak
        if (currentStreak === 0) {
          currentStreak = 1;
        } else if (i > 0 && isConsecutiveDay(cappedDates[i-1], date)) {
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
    
    if (ramadanOnly) {
      // Ensure Ramadan streaks can't exceed the number of days in Ramadan so far
      const ramadanStartDate = getRamadanStartDate(userData);
      const currentDate = new Date(baseDate);
      
      // If we're before Ramadan, no streaks are possible
      if (isBeforeRamadan(currentDate, userData)) {
        return { current: 0, best: 0 };
      }
      
      const daysSinceRamadanStart = Math.max(0, Math.floor((currentDate - ramadanStartDate) / (1000 * 60 * 60 * 24)) + 1);
      
      // Cap streaks at the number of days passed in Ramadan
      currentStreak = Math.min(currentStreak, daysSinceRamadanStart);
      const ramadanLength = userData?.ramadanLength || 30;
      bestStreak = Math.min(bestStreak, ramadanLength);
    }
    
  return { current: currentStreak, best: bestStreak };
  } catch (error) {
    console.error(`Error calculating ${activityType} streak:`, error);
    return { current: 0, best: 0 };
  }
};

// Update streak data for user
export const updateStreakData = async (userId, activityType, isCompleted, options = {}) => {
  if (!userId || !activityType) return false;
  const { ramadanOnly = false, baseDate = new Date() } = options;
  
  try {
    // Get user data to pass to isBeforeRamadan
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      return false;
    }
    
    const userData = userSnapshot.data();
    
    // Calculate current streak
    const { current, best } = await calculateStreak(userId, activityType, { ramadanOnly, baseDate });
    
    // Update streak data in Firestore
    const todayFormatted = formatDate(baseDate);
    
    const streakData = {
      [`streaks.${ramadanOnly ? 'ramadan' : 'general'}.${activityType}`]: {
        current: isCompleted ? current : 0,
        best: best,
        lastDate: isCompleted ? todayFormatted : null
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
    if (!userData.streaks || !userData.streaks.general || !userData.streaks.ramadan) {
      const initialStreaks = {
        streaks: {
          general: {
            fasting: { current: 0, best: 0, lastDate: null },
            taraweeh: { current: 0, best: 0, lastDate: null },
            quran: { current: 0, best: 0, lastDate: null }
          },
          ramadan: {
            fasting: { current: 0, best: 0, lastDate: null },
            taraweeh: { current: 0, best: 0, lastDate: null },
            quran: { current: 0, best: 0, lastDate: null }
          }
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

// Get all streaks in a single call
export const getAllStreaks = async (userId, options = {}) => {
  const { ramadanOnly = false, baseDate = new Date() } = options;
  if (!userId) return {
    quran: { current: 0, best: 0 },
    fasting: { current: 0, best: 0 },
    taraweeh: { current: 0, best: 0 }
  };
  
  try {
    const quranStreak = await calculateStreak(userId, 'quran', { ramadanOnly, baseDate });
    const fastingStreak = await calculateStreak(userId, 'fasting', { ramadanOnly, baseDate });
    const taraweehStreak = await calculateStreak(userId, 'taraweeh', { ramadanOnly, baseDate });
    
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

// Get combined streak score across all activities
export const getCombinedStreakScore = async (userId, options = {}) => {
  if (!userId) return 0;
  
  try {
    const allStreaks = await getAllStreaks(userId, options);
    
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
export const getBestStreak = async (userId, options = {}) => {
  if (!userId) return 0;
  
  try {
    const allStreaks = await getAllStreaks(userId, options);
    
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
