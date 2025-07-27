/**
 * Authentication Service
 *
 * Provides authentication functions for Firebase Auth including:
 * - Email/password authentication
 * - Google Sign-in
 * - User profile management
 * - Session management
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  ActionCodeSettings,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserProfile, UserSettings, UserStats } from '../types/firebase';

// =============================================================================
// Authentication Functions
// =============================================================================

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await updateLastActiveTimestamp(result.user.uid);
    return result;
  } catch (error: unknown) {
    const errorCode = (error as { code?: string })?.code || 'unknown';
    throw new Error(getAuthErrorMessage(errorCode));
  }
};

/**
 * Create new account with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Update user profile
    await updateProfile(result.user, { displayName });

    // Create user document in Firestore
    await createUserDocument(result.user, { displayName });

    // Send email verification
    await sendEmailVerification(result.user);

    return result;
  } catch (error: unknown) {
    const errorCode = (error as { code?: string })?.code || 'unknown';
    throw new Error(getAuthErrorMessage(errorCode));
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    const result = await signInWithPopup(auth, provider);

    // Create or update user document
    await createUserDocument(result.user);
    await updateLastActiveTimestamp(result.user.uid);

    return result;
  } catch (error: unknown) {
    const errorCode = (error as { code?: string })?.code || 'unknown';
    throw new Error(getAuthErrorMessage(errorCode));
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    throw new Error('Failed to sign out');
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (error: unknown) {
    const errorCode = (error as { code?: string })?.code || 'unknown';
    throw new Error(getAuthErrorMessage(errorCode));
  }
};

/**
 * Update user password
 */
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('No authenticated user');
  }

  try {
    await updatePassword(auth.currentUser, newPassword);
  } catch (error: unknown) {
    const errorCode = (error as { code?: string })?.code || 'unknown';
    throw new Error(getAuthErrorMessage(errorCode));
  }
};

/**
 * Send email verification
 */
export const sendVerificationEmail = async (): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('No authenticated user');
  }

  try {
    await sendEmailVerification(auth.currentUser);
  } catch (error: unknown) {
    throw new Error('Failed to send verification email');
  }
};

// =============================================================================
// User Document Management
// =============================================================================

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (
  firebaseUser: FirebaseUser,
  additionalData?: { displayName?: string }
): Promise<void> => {
  const userRef = doc(db, 'users', firebaseUser.uid);

  // Check if user document already exists
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    // Update last active timestamp
    await updateLastActiveTimestamp(firebaseUser.uid);
    return;
  }

  // Create new user document
  const userData: Omit<User, 'id'> = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: additionalData?.displayName || firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    profile: createDefaultProfile(),
    settings: createDefaultSettings(),
    stats: createDefaultStats(),
  };

  await setDoc(userRef, userData);
};

/**
 * Get user document from Firestore
 */
export const getUserDocument = async (uid: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return { ...userData, id: userDoc.id } as unknown as User;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user document:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  uid: string,
  profileData: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      profile: profileData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to update user profile');
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (
  uid: string,
  settings: Partial<UserSettings>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      settings,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw new Error('Failed to update user settings');
  }
};

/**
 * Update last active timestamp
 */
export const updateLastActiveTimestamp = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      'stats.lastActiveAt': serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last active timestamp:', error);
  }
};

// =============================================================================
// Authentication State Management
// =============================================================================

/**
 * Subscribe to authentication state changes
 */
export const subscribeToAuthState = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Wait for authentication state to initialize
 */
export const waitForAuthInit = (): Promise<FirebaseUser | null> => {
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    });
  });
};

// =============================================================================
// Default Data Creators
// =============================================================================

const createDefaultProfile = (): UserProfile => ({
  isPublic: true,
});

const createDefaultSettings = (): UserSettings => ({
  notifications: {
    challenges: true,
    messages: true,
    gameUpdates: true,
    marketing: false,
  },
  privacy: {
    showEmail: false,
    showProfile: true,
    allowFriendRequests: true,
  },
  theme: 'auto',
  language: 'en',
});

const createDefaultStats = (): UserStats => ({
  totalChallengesCreated: 0,
  totalChallengesAccepted: 0,
  totalGamesWon: 0,
  totalGamesLost: 0,
  totalGamesPlayed: 0,
  winPercentage: 0,
  averageGuessAccuracy: 0,
  streakCurrent: 0,
  streakBest: 0,
  favoriteRange: {
    min: 1,
    max: 10,
    count: 0,
  },
  lastActiveAt: serverTimestamp() as Timestamp,
});

// =============================================================================
// Error Handling
// =============================================================================

/**
 * Convert Firebase auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please enable popups and try again.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to perform this action.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};
