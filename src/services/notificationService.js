// src/services/notificationService.js
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Array of creative notification messages
const NOTIFICATION_MESSAGES = [
  "✨ Sacred moments await! Update your Ramadan journey before the night embraces you.",
  "🌙 The stars are watching your progress! Take a moment to reflect and update your tracker.",
  "🕌 Before Isha calls, let's record today's blessings and achievements!",
  "💫 Your Ramadan story is being written - add today's beautiful chapter now.",
  "🤲 The gates of heaven are open - so is your Ramadan app! Time to update."
];

// Get a random notification message
export const getRandomNotificationMessage = () => {
  const randomIndex = Math.floor(Math.random() * NOTIFICATION_MESSAGES.length);
  return NOTIFICATION_MESSAGES[randomIndex];
};

// Format date consistently
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Hybrid notification approach that combines system and in-app notifications
export const sendHybridNotification = (title, body) => {
  // Try system notification first
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body: body,
        icon: '/logo192.png',
        requireInteraction: true
      });
      
      console.log('System notification sent');
      
      // If system notification fails silently, we may never reach this point
      // So we'll also show in-app notification after a short delay as backup
      setTimeout(() => {
        showInAppNotification(title, body, true); // true means "backup mode"
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('System notification failed:', error);
      // Fall back to in-app notification
      showInAppNotification(title, body);
      return false;
    }
  } else {
    // Fall back to in-app notification if permission not granted
    showInAppNotification(title, body);
    return false;
  }
};

// In-app notification function
export const showInAppNotification = (title, body, isBackup = false) => {
  // Check if we already have an in-app notification
  const existingNotification = document.getElementById('in-app-notification');
  if (existingNotification && isBackup) {
    // If this is a backup notification and there's already one, don't show duplicate
    return;
  }
  
  // Create notification element
  const notificationDiv = document.createElement('div');
  notificationDiv.id = 'in-app-notification';
  notificationDiv.style.position = 'fixed';
  notificationDiv.style.top = '20px';
  notificationDiv.style.right = '20px';
  notificationDiv.style.backgroundColor = '#4CAF50';
  notificationDiv.style.color = 'white';
  notificationDiv.style.padding = '15px';
  notificationDiv.style.borderRadius = '8px';
  notificationDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
  notificationDiv.style.zIndex = '9999';
  notificationDiv.style.maxWidth = '300px';
  notificationDiv.style.animation = 'slideIn 0.3s forwards';
  
  // Add animation styles if they don't exist
  if (!document.getElementById('notification-animations')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'notification-animations';
    styleEl.innerHTML = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(styleEl);
  }
  
  notificationDiv.innerHTML = `
    <h3 style="margin-top:0;margin-bottom:8px;">${title}</h3>
    <p style="margin:0;">${body}</p>
  `;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = 'white';
  closeButton.style.fontSize = '20px';
  closeButton.style.cursor = 'pointer';
  
  // Handle close with animation
  closeButton.onclick = () => {
    notificationDiv.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => {
      if (document.body.contains(notificationDiv)) {
        document.body.removeChild(notificationDiv);
      }
    }, 300);
  };
  
  notificationDiv.appendChild(closeButton);
  document.body.appendChild(notificationDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notificationDiv)) {
      notificationDiv.style.animation = 'slideOut 0.3s forwards';
      setTimeout(() => {
        if (document.body.contains(notificationDiv)) {
          document.body.removeChild(notificationDiv);
        }
      }, 300);
    }
  }, 5000);
  
  // Make notification clickable to navigate to app
  notificationDiv.addEventListener('click', (e) => {
    if (e.target !== closeButton) {
      window.focus();
      window.location.href = '/';
      
      // Remove the notification after click
      setTimeout(() => {
        if (document.body.contains(notificationDiv)) {
          document.body.removeChild(notificationDiv);
        }
      }, 100);
    }
  });
  
  // Add cursor style to indicate clickability
  notificationDiv.style.cursor = 'pointer';
};

// Request notification permission and set up FCM
export const setupNotifications = async (userId) => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    // Request permission if not granted
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }
    }
    
    // Try to register service worker for FCM (but don't let it block the app)
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered with scope:', registration.scope);
      }
    } catch (err) {
      console.error('Service Worker registration failed:', err);
      // Continue anyway since we have hybrid notifications as backup
    }
    
    // Try to get FCM token (optional, only used for server-side notifications)
    try {
      const messaging = getMessaging();
      if (messaging && process.env.REACT_APP_FIREBASE_VAPID_KEY) {
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });
        
        if (currentToken && userId) {
          // Save token to user document
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, {
            fcmToken: currentToken,
            notificationsEnabled: true,
            lastTokenUpdate: new Date().toISOString()
          });
          
          console.log('FCM token saved successfully');
        }
      }
    } catch (fcmError) {
      console.error('FCM setup failed:', fcmError);
      // Continue anyway since we have hybrid notifications as backup
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    return false;
  }
};

// Schedule a notification between Maghrib and Isha
export const scheduleNotification = async (userId, prayerTimes) => {
  if (!userId || !prayerTimes || !prayerTimes.maghrib || !prayerTimes.isha) {
    console.error('Missing userId or prayer times');
    return false;
  }
  
  try {
    // Parse prayer times (assuming format HH:MM)
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    };
    
    const maghribTime = parseTime(prayerTimes.maghrib);
    const ishaTime = parseTime(prayerTimes.isha);
    
    // Calculate notification time (20 minutes after Maghrib)
    const notificationTime = new Date(maghribTime);
    notificationTime.setMinutes(maghribTime.getMinutes() + 20);
    
    // Check if we're already past notification time or Isha
    const now = new Date();
    if (now > ishaTime) {
      console.log('Already past Isha, not scheduling notification');
      return false;
    }
    
    // Check if notification already scheduled for today
    const today = formatDate(new Date());
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    
    // Check if already scheduled/sent today
    if (userData.notificationHistory && 
        userData.notificationHistory[today] && 
        (userData.notificationHistory[today].scheduled || userData.notificationHistory[today].sent)) {
      console.log('Notification already scheduled or sent today');
      return false;
    }
    
    // Update document to mark as scheduled
    await updateDoc(userDocRef, {
      [`notificationHistory.${today}`]: {
        scheduled: true,
        scheduledTime: notificationTime.toISOString()
      }
    });
    
    console.log(`Notification scheduled for ${notificationTime.toLocaleTimeString()}`);
    
    // Calculate delay until notification time
    const delay = notificationTime.getTime() - now.getTime();
    
    if (delay <= 0) {
      console.log('Notification time already passed, sending immediately');
      return await sendScheduledNotification(userId);
    }
    
    // Set timeout to send notification at the calculated time
    setTimeout(async () => {
      await sendScheduledNotification(userId);
    }, delay);
    
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

// Send a scheduled notification
export const sendScheduledNotification = async (userId) => {
  try {
    if (!userId) return false;
    
    // Get user document
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('User document not found');
      return false;
    }
    
    // Get a random message
    const message = getRandomNotificationMessage();
    const title = 'Ramadan Tracker';
    const today = formatDate(new Date());
    
    // Send the hybrid notification
    sendHybridNotification(title, message);
    
    // Update notification history
    await updateDoc(userDocRef, {
      [`notificationHistory.${today}`]: {
        scheduled: true,
        sent: true,
        message: message,
        sentTime: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error sending scheduled notification:', error);
    return false;
  }
};

// Test notification function for debugging
export const testNotification = () => {
  const message = getRandomNotificationMessage();
  sendHybridNotification('Ramadan Tracker', message);
  return true;
};