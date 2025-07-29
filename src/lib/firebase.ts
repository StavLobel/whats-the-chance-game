/**
 * Firebase Configuration and Initialization
 *
 * This file configures Firebase for:
 * - Authentication (email/password, Google, etc.)
 * - Firestore Database (game history, statistics, user data)
 * - Cloud Messaging (notifications)
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'whats-the-chance-demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'whats-the-chance-demo',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'whats-the-chance-demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

// Initialize Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Cloud Messaging (optional)
let messaging: ReturnType<typeof getMessaging> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      messaging = getMessaging(app);
    }
  });
}

export { messaging };

// Connect to emulators in development (disabled for now)
// if (import.meta.env.DEV) {
//   try {
//     // Connect to Auth emulator
//     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });

//     // Connect to Firestore emulator
//     connectFirestoreEmulator(db, 'localhost', 8080);
//   } catch (error) {
//     console.log('Firebase emulators not available, using production services');
//   }
// }

export default app;
