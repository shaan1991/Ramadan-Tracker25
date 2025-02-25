// src/firebase.js
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDrHX9j-dHGUIbphwEwboa-qoVmCI6hGh0",
    authDomain: "ramadan-tracker.firebaseapp.com",
    projectId: "ramadan-tracker",
    storageBucket: "ramadan-tracker.firebasestorage.app",
    messagingSenderId: "952298069421",
    appId: "1:952298069421:web:d14b28df1ea1db54661524",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();