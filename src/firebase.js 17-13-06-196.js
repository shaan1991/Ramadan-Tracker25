// File: src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration (replace with your own config)
const firebaseConfig = {
    apiKey: "AIzaSyDrHX9j-dHGUIbphwEwboa-qoVmCI6hGh0",
    authDomain: "ramadan-tracker.firebaseapp.com",
    projectId: "ramadan-tracker",
    storageBucket: "ramadan-tracker.firebasestorage.app",
    messagingSenderId: "952298069421",
    appId: "1:952298069421:web:d14b28df1ea1db54661524",
    measurementId: "G-W5S47KYVTN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get or create user document
export const getUserData = async (userId) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Initialize a new user with default data
    const currentDate = new Date();
    const ramadanDay = getCurrentRamadanDay(); // You'll need to implement this function
    
    const newUserData = {
      userId,
      displayName: auth.currentUser.displayName,
      email: auth.currentUser.email,
      photoURL: auth.currentUser.photoURL,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      ramadanData: {
        currentDay: ramadanDay,
        salah: { completed: 0, total: 5 },
        roza: true, // Default to fasting
        taraweeh: false,
        quran: { completed: 0, total: 30 },
      },
      dailyProgress: {
        [`day_${ramadanDay}`]: {
          date: currentDate.toISOString().split('T')[0],
          namaz: {
            fajr: false,
            zuhr: false,
            asr: false,
            maghrib: false,
            isha: false
          },
          fasting: true,
          taraweeh: false,
          juzCompleted: 0,
          timestamp: serverTimestamp()
        }
      }
    };
    
    await setDoc(docRef, newUserData);
    return newUserData;
  }
};

// Update user data
export const updateUserData = async (userId, data) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
};

// Update daily progress
export const updateDailyProgress = async (userId, day, data) => {
  const userRef = doc(db, 'users', userId);
  const userData = await getUserData(userId);
  
  const updatedData = {
    dailyProgress: {
      ...userData.dailyProgress,
      [`day_${day}`]: {
        ...userData.dailyProgress[`day_${day}`],
        ...data,
        timestamp: serverTimestamp()
      }
    }
  };
  
  await updateDoc(userRef, updatedData);
  return updatedData;
};

// Calculate current Ramadan day (simplified - you might need to adjust this)
export const getCurrentRamadanDay = () => {
  // This is a simplified example - in a real app, you'd use proper Hijri calendar calculations
  // or an API to determine the current day of Ramadan
  
  // For demonstration purposes, we'll calculate based on a fixed Ramadan start date
  // Replace with the actual Ramadan start date for your app
  const ramadanStartDate = new Date('2026-02-23'); // Example date - update with correct one
  const currentDate = new Date();
  
  // Calculate the difference in days
  const diffTime = currentDate - ramadanStartDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Return the current day of Ramadan (1-30)
  return Math.max(1, Math.min(diffDays + 1, 30));
};

// Authentication functions
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // The user is now signed in
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signInWithApple = async () => {
  const provider = new OAuthProvider('apple.com');
  try {
    const result = await signInWithPopup(auth, provider);
    // The user is now signed in
    return result.user;
  } catch (error) {
    console.error("Error signing in with Apple:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export { auth, db };