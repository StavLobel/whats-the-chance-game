/**
 * Authentication Context and Hook
 *
 * Provides authentication state management throughout the React application.
 * Includes user session, loading states, and authentication actions.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  subscribeToAuthState,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutUser,
  resetPassword,
  getUserDocument,
  createUserDocument,
} from '../lib/auth';
import { User } from '../types/firebase';

// =============================================================================
// Types
// =============================================================================

interface AuthContextType {
  // User state
  user: FirebaseUser | null;
  userDoc: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Authentication actions
  signIn: (email: string, password: string) => Promise<void>; // eslint-disable-line no-unused-vars
  signUp: (email: string, password: string, displayName: string) => Promise<void>; // eslint-disable-line no-unused-vars
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>; // eslint-disable-line no-unused-vars

  // State management
  setLoading: (loading: boolean) => void; // eslint-disable-line no-unused-vars
  refreshUserDoc: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// =============================================================================
// Context Creation
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// Auth Provider Component
// =============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Computed state
  const isAuthenticated = !!user && !!userDoc;

  // =============================================================================
  // Authentication Actions
  // =============================================================================

  const signIn = async (_email: string, _password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await signInWithEmail(_email, _password);
      // User state will be updated via the auth state listener
    } catch (error: unknown) {
      setIsLoading(false);
      throw error;
    }
  };

  const signUp = async (_email: string, _password: string, _displayName: string): Promise<void> => {
    setIsLoading(true);
    try {
      await signUpWithEmail(_email, _password, _displayName);
      // User state will be updated via the auth state listener
    } catch (error: unknown) {
      setIsLoading(false);
      throw error;
    }
  };

  const signInWithGoogleProvider = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // User state will be updated via the auth state listener
    } catch (error: unknown) {
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOutUser();
      // User state will be cleared via the auth state listener
    } catch (error: unknown) {
      setIsLoading(false);
      throw error;
    }
  };

  const sendPasswordReset = async (_email: string): Promise<void> => {
    await resetPassword(_email);
  };

  const refreshUserDoc = async (): Promise<void> => {
    if (user) {
      try {
        const doc = await getUserDocument(user.uid);
        setUserDoc(doc);
      } catch (error) {
        console.error('Error refreshing user document:', error);
      }
    }
  };

  // =============================================================================
  // Firebase Auth State Listener
  // =============================================================================

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async firebaseUser => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get or create user document
          await createUserDocument(firebaseUser);
          const doc = await getUserDocument(firebaseUser.uid);
          setUserDoc(doc);
        } catch (error) {
          console.error('Error handling auth state change:', error);
          setUserDoc(null);
        }
      } else {
        setUserDoc(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // =============================================================================
  // Context Value
  // =============================================================================

  const value: AuthContextType = {
    // User state
    user,
    userDoc,
    isLoading,
    isAuthenticated,

    // Authentication actions
    signIn,
    signUp,
    signInWithGoogle: signInWithGoogleProvider,
    signOut,
    sendPasswordReset,

    // State management
    setLoading: setIsLoading,
    refreshUserDoc,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =============================================================================
// Custom Hook
// =============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// =============================================================================
// Helper Hooks
// =============================================================================

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

/**
 * Hook to get current user data
 */
export const useCurrentUser = (): { user: FirebaseUser | null; userDoc: User | null } => {
  const { user, userDoc } = useAuth();
  return { user, userDoc };
};

/**
 * Hook to get authentication loading state
 */
export const useAuthLoading = (): boolean => {
  const { isLoading } = useAuth();
  return isLoading;
};

export default useAuth;
