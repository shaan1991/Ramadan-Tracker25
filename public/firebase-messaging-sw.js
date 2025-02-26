// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

// Firebase configuration for the service worker
const firebaseConfig = {
  apiKey: "AIzaSyDrHX9j-dHGUIbphwEwboa-qoVmCI6hGh0",
  authDomain: "ramadan-tracker.firebaseapp.com",
  projectId: "ramadan-tracker",
  storageBucket: "ramadan-tracker.firebasestorage.app",
  messagingSenderId: "952298069421",
  appId: "1:952298069421:web:d14b28df1ea1db54661524"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  // Show notification 
  const notificationTitle = payload.notification.title || 'Ramadan Tracker';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Try to open or focus the app
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then((clientList) => {
      // If a window client is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});