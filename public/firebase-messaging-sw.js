/**
 * Firebase Messaging Service Worker
 * Handles background notifications
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (will be replaced by actual config)
const firebaseConfig = {
  apiKey: self.VITE_FIREBASE_API_KEY,
  authDomain: self.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: self.VITE_FIREBASE_PROJECT_ID,
  storageBucket: self.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: self.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[Service Worker] Received background message:', payload);

  const { notification, data } = payload;
  
  // Customize notification
  const notificationTitle = notification?.title || 'What\'s the Chance?';
  const notificationOptions = {
    body: notification?.body || 'You have a new notification',
    icon: '/icon.png',
    badge: '/badge.png',
    tag: data?.challengeId || 'default',
    data: data,
    actions: data?.challengeId ? [
      {
        action: 'view',
        title: 'View Challenge',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ] : [],
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);

  event.notification.close();

  const { action, notification } = event;
  const data = notification.data;

  if (action === 'view' && data?.challengeId) {
    // Open challenge page
    event.waitUntil(
      clients.openWindow(`/game?challengeId=${data.challengeId}`)
    );
  } else if (!action && data?.challengeId) {
    // Default click - also open challenge
    event.waitUntil(
      clients.openWindow(`/game?challengeId=${data.challengeId}`)
    );
  } else {
    // Open app home page
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_FIREBASE_CONFIG') {
    // Update Firebase config with actual values
    Object.assign(firebaseConfig, event.data.config);
    
    // Re-initialize Firebase with new config
    firebase.initializeApp(firebaseConfig);
  }
});
