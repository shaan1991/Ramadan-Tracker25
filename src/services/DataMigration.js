// src/services/DataMigration.js
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatDate } from './historyTracker';

// Run on app startup to ensure user data is in the latest format
export const runDataMigrations = async (userId) => {
  if (!userId) return false;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) return false;
    
    const userData = userSnapshot.data();
    
    // Check data schema version
    const currentVersion = userData.schemaVersion || 1;
    const today = formatDate(new Date());
    let migrationPerformed = false;
    
    // Migrations to run for schema v1 (Add lastActiveDate)
    if (currentVersion < 2) {
      console.log('Running migration: Adding lastActiveDate field');
      
      await updateDoc(userDocRef, {
        lastActiveDate: today,
        schemaVersion: 2
      });
      
      migrationPerformed = true;
    }
    
    // Migration for adding juzHistory
    if ((currentVersion < 3 || !userData.juzHistory) && userData.completedJuzs?.length > 0) {
      console.log('Running migration: Creating juzHistory structure');
      
      // Create juzHistory structure
      const juzHistory = {};
      
      // Place all existing juz in today's record
      juzHistory[today] = userData.completedJuzs;
      
      await updateDoc(userDocRef, {
        juzHistory,
        schemaVersion: 3
      });
      
      migrationPerformed = true;
    }
    
    // Migration for adding streaks tracking
    if (currentVersion < 4) {
      console.log('Running migration: Adding streaks tracking');
      
      await updateDoc(userDocRef, {
        streaks: {
          current: 0,
          longest: 0,
          lastReadDate: null
        },
        schemaVersion: 4
      });
      
      migrationPerformed = true;
    }
    
    return migrationPerformed;
  } catch (error) {
    console.error('Error running data migrations:', error);
    return false;
  }
};

// Example function to initialize a brand new user with latest schema
export const initializeUserWithLatestSchema = async (userId, displayName) => {
  if (!userId) return false;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);
    
    // Only create if user doesn't exist
    if (!userSnapshot.exists()) {
      const today = formatDate(new Date());
      
      // Calculate Ramadan day
      const startDate = new Date('2025-02-23'); // Example: Ramadan start date
      const diffTime = Math.abs(new Date() - startDate);
      const ramadanDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const currentDay = ramadanDay > 30 ? 30 : ramadanDay;
      
      const initialData = {
        userId,
        displayName,
        createdAt: new Date().toISOString(),
        day: currentDay,
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
        completedJuzs: [],
        history: {},
        juzHistory: {},
        streaks: {
          current: 0,
          longest: 0,
          lastReadDate: null
        },
        lastActiveDate: today,
        schemaVersion: 4,
        duas: [
          'O Allah, Guardian of my soul, envelop me in Your divine protection and shield me from all forms of harm, negativity, and malignance that seek to disrupt my path.',
          'O Most Merciful, bestow upon me the companionship of a righteous spouse whose heart is filled with faith, love, and kindness.',
          'O Allah, Guardian of my soul, envelop me in Your divine protection and shield me from all forms of harm, negativity, and malignance that seek to disrupt my path.'
        ]
      };
      
      await setDoc(userDocRef, initialData);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error initializing user with latest schema:', error);
    return false;
  }
};