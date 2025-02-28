// src/services/notificationService.js
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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

// Show in-app notification
export const showInAppNotification = (title, body, isBackup = false) => {
  // Don't show duplicate notifications within a short timeframe
  const notificationKey = `${title}-${body}`;
  const now = Date.now();
  const lastShown = window.lastNotificationTime?.[notificationKey] || 0;
  
  // Prevent showing same notification within 5 seconds
  if (now - lastShown < 5000) {
    console.log('Skipping duplicate notification:', notificationKey);
    return;
  }
  
  // Check if we already have an in-app notification
  const existingNotification = document.getElementById('in-app-notification');
  if (existingNotification && isBackup) {
    // If this is a backup notification and there's already one, don't show duplicate
    return;
  }
  
  if (existingNotification) {
    document.body.removeChild(existingNotification);
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
    <h3 style="margin-top:0;margin-bottom:8px;font-size:16px;">${title}</h3>
    <p style="margin:0;font-size:14px;">${body}</p>
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
  closeButton.onclick = (e) => {
    e.stopPropagation();
    notificationDiv.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => {
      if (document.body.contains(notificationDiv)) {
        document.body.removeChild(notificationDiv);
      }
    }, 300);
  };
  
  notificationDiv.appendChild(closeButton);
  document.body.appendChild(notificationDiv);
  
  // Track when this notification was shown
  if (!window.lastNotificationTime) {
    window.lastNotificationTime = {};
  }
  window.lastNotificationTime[notificationKey] = now;
  
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
  }, 7000);
  
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

// Send an in-app notification
export const sendInAppNotification = (title, body) => {
  showInAppNotification(title, body);
  return true;
};

// Try to send a browser notification
export const sendBrowserNotification = async (title, body, icon = '/logo192.png') => {
  // Check permission
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }
  
  // If permission not granted, request it
  if (Notification.permission !== 'granted') {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  // Send notification
  try {
    const notification = new Notification(title, {
      body: body,
      icon: icon
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return true;
  } catch (error) {
    console.error('Error showing notification:', error);
    return false;
  }
};

// Hybrid approach - tries browser notification first, falls back to in-app
export const sendHybridNotification = async (title, body) => {
  const browserSuccess = await sendBrowserNotification(title, body);
  
  if (!browserSuccess) {
    sendInAppNotification(title, body);
  }
  
  return true;
};

// Check if Firebase messaging is available
const isMessagingSupported = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request notification permission and set up FCM
export const setupNotifications = async (userId) => {
  if (!userId) return false;
  
  try {
    // Step 1: Get notification permission
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    let permissionGranted = false;
    
    if (Notification.permission === 'granted') {
      permissionGranted = true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionGranted = permission === 'granted';
    }
    
    if (!permissionGranted) {
      console.log('Notification permission denied');
      return false;
    }
    
    // Save permission status to user record
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      notificationPermission: 'granted',
      notificationPermissionDate: serverTimestamp()
    });
    
    // Step 2: Register service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        
        console.log('Service worker registered:', registration);
        
        // Step 3: Get FCM token (if applicable)
        if (isMessagingSupported()) {
          try {
            const messaging = getMessaging();
            
            // Setup foreground message handler
            onMessage(messaging, (payload) => {
              console.log('Foreground message received:', payload);
              const { title, body } = payload.notification || {};
              if (title && body) {
                showInAppNotification(title, body);
              }
            });
            
            // Get token - use your Firebase config's vapidKey if available
            const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY || 
                             'BID5Q3fLOo7nFV0ccrGCqMgCvMHdSWxM6o_XwS-j2Ixz9NVrxKjGYDZxSf_Y72fnz_ieK0fRnZNwB6gPT7_VH5s';
            
            try {
              const token = await getToken(messaging, { 
                vapidKey,
                serviceWorkerRegistration: registration
              });
              
              if (token) {
                // Save the token to the user's document
                await updateDoc(userDocRef, {
                  fcmToken: token,
                  tokenCreatedAt: serverTimestamp(),
                  notificationsEnabled: true
                });
                
                console.log('FCM token obtained and saved');
                return true;
              } else {
                console.log('No FCM token received');
              }
            } catch (tokenError) {
              console.error('Error getting FCM token:', tokenError);
              // Continue with basic notifications
            }
          } catch (messagingError) {
            console.error('Error setting up Firebase messaging:', messagingError);
            // Continue with basic notifications
          }
        }
        
        // Even if FCM fails, we have permission for basic notifications
        return true;
      } catch (swError) {
        console.error('Service worker registration failed:', swError);
        // Use basic browser notifications instead
        return permissionGranted;
      }
    }
    
    // Default to basic browser notifications if SW not supported
    return permissionGranted;
  } catch (error) {
    console.error('Error setting up notifications:', error);
    // Try to show a test notification to see what works
    try {
      const randomMessage = getRandomNotificationMessage();
      sendInAppNotification('Testing Notifications', randomMessage);
    } catch (e) {
      console.error('Even in-app notification failed:', e);
    }
    return false;
  }
};

// Schedule a notification between Maghrib and Isha
export const scheduleNotification = async (userId, prayerTimes) => {
  if (!userId) return false;
  
  try {
    // Check if notifications are already scheduled for this session
    if (window.notificationScheduled) {
      console.log('Notification already scheduled for this session');
      return true;
    }
    
    // Validate prayer times
    if (!prayerTimes || !prayerTimes.maghrib || !prayerTimes.isha) {
      console.log('Invalid prayer times for notification scheduling');
      return false;
    }
    
    // Parse prayer times and create notification time
    const now = new Date();
    const today = formatDate(now);
    
    // Parse times - check format (12h vs 24h)
    const parseTime = (timeStr) => {
      let hours, minutes;
      
      // Check if it's in 12-hour format (e.g., "7:30pm")
      if (/am|pm/i.test(timeStr)) {
        const [time, period] = timeStr.match(/(\d+:\d+)([ap]m)/i).slice(1);
        [hours, minutes] = time.split(':').map(Number);
        if (period.toLowerCase() === 'pm' && hours < 12) hours += 12;
        if (period.toLowerCase() === 'am' && hours === 12) hours = 0;
      } else {
        // Assume 24-hour format
        [hours, minutes] = timeStr.split(':').map(Number);
      }
      
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    };
    
    // Get maghrib and isha times
    let maghribTime, ishaTime;
    try {
      maghribTime = parseTime(prayerTimes.maghrib);
      ishaTime = parseTime(prayerTimes.isha);
    } catch (parseError) {
      console.error('Error parsing prayer times:', parseError, prayerTimes);
      return false;
    }
    
    // Set notification for 20 minutes after Maghrib
    const notifyTime = new Date(maghribTime);
    notifyTime.setMinutes(maghribTime.getMinutes() + 20);
    
    // If it's already past notification time, schedule for tomorrow
    if (now > notifyTime) {
      console.log('Already past notification time for today');
      // You could set up tomorrow's notification here if needed
      return false;
    }
    
    // Check if notification already scheduled in database for today
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.notificationSchedule && 
          userData.notificationSchedule[today] && 
          userData.notificationSchedule[today].sent) {
        console.log('Notification already sent today');
        window.notificationScheduled = true;
        return true;
      }
    }
    
    // Save schedule to user document
    await updateDoc(userDocRef, {
      [`notificationSchedule.${today}`]: {
        maghrib: maghribTime.toISOString(),
        isha: ishaTime.toISOString(),
        scheduledFor: notifyTime.toISOString(),
        scheduledAt: serverTimestamp(),
      }
    });
    
    // Calculate delay until notification time
    const delay = notifyTime.getTime() - now.getTime();
    console.log(`Notification scheduled in ${Math.round(delay/60000)} minutes`);
    
    // Set timeout to trigger the notification
    window.notificationTimeout = setTimeout(() => {
      const message = getRandomNotificationMessage();
      sendHybridNotification('Ramadan Tracker', message)
        .then(async (success) => {
          if (success) {
            // Update notification status
            try {
              await updateDoc(userDocRef, {
                [`notificationSchedule.${today}.sent`]: true,
                [`notificationSchedule.${today}.sentAt`]: serverTimestamp(),
                [`notificationSchedule.${today}.message`]: message
              });
            } catch (updateError) {
              console.error('Error updating notification status:', updateError);
            }
          }
        });
    }, delay);
    
    // Mark as scheduled for this session
    window.notificationScheduled = true;
    
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

// Clean up notifications and timers
export const cleanupNotifications = () => {
  // Clear any scheduled notification timeouts
  if (window.notificationTimeout) {
    clearTimeout(window.notificationTimeout);
  }
  
  // Remove any existing in-app notifications
  const existingNotification = document.getElementById('in-app-notification');
  if (existingNotification) {
    document.body.removeChild(existingNotification);
  }
  
  // Remove any notification test buttons
  const notificationButton = document.getElementById('notification-test-button');
  if (notificationButton) {
    document.body.removeChild(notificationButton);
  }
};

// Try to send an immediate notification (useful for testing)
export const testNotification = async () => {
  const message = getRandomNotificationMessage();
  return await sendHybridNotification('Ramadan Tracker', message);
};

// Add a button to request/test notifications
export const addNotificationButton = () => {
  // Check if button already exists
  if (document.getElementById('notification-test-button')) {
    return;
  }
  
  // Check if the button was already added in this session
  if (window.notificationButtonAdded) {
    return;
  }
  
  const button = document.createElement('button');
  button.id = 'notification-test-button';
  button.innerText = 'Enable Notifications';
  button.style.position = 'fixed';
  button.style.bottom = '160px';
  button.style.right = '20px';
  button.style.zIndex = '1000';
  button.style.padding = '10px';
  button.style.borderRadius = '50%';
  button.style.width = '50px';
  button.style.height = '50px';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  button.style.cursor = 'pointer';
  button.style.display = 'flex';
  button.style.alignItems = 'center';
  button.style.justifyContent = 'center';
  
  // Add bell icon
  // button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  //   <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="white"/>
  // </svg>`;
  
  button.onclick = async () => {
    const userSnap = await getDoc(doc(db, 'users', localStorage.getItem('userId') || 'unknown'));
    if (userSnap.exists()) {
      const userId = userSnap.id;
      const result = await setupNotifications(userId);
      if (result) {
        await testNotification();
        button.innerText = '✓';
        // Mark notifications as initialized for this session
        window.notificationsInitialized = true;
        setTimeout(() => {
          if (document.body.contains(button)) {
            document.body.removeChild(button);
          }
        }, 2000);
      } else {
        button.innerText = '×';
        setTimeout(() => {
          if (document.body.contains(button)) {
            button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="white"/>
            </svg>`;
          }
        }, 2000);
      }
    } else {
      showInAppNotification('Error', 'Please log in first to enable notifications');
    }
  };
  
  document.body.appendChild(button);
  
  // Mark the button as added in this session
  window.notificationButtonAdded = true;
};