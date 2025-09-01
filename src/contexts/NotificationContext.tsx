/**
 * Notification Context
 * Manages push notifications and in-app notifications
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fcmService } from '@/lib/fcm';
import { useToast } from '@/hooks/use-toast';

interface NotificationContextType {
  hasPermission: boolean;
  fcmToken: string | null;
  requestPermission: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted');
    }
  }, []);

  // Request notification permission and get token
  const requestPermission = useCallback(async () => {
    if (!user || !fcmService.notificationsSupported) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await fcmService.requestPermission();
      
      if (token) {
        setFcmToken(token);
        setHasPermission(true);

        // Register token with backend
        const registered = await fcmService.registerToken(user.uid, token);
        
        if (!registered) {
          throw new Error('Failed to register notification token');
        }

        toast({
          title: 'Notifications enabled',
          description: 'You will now receive push notifications for new challenges',
        });
      } else {
        setHasPermission(false);
        toast({
          title: 'Notifications disabled',
          description: 'You won\'t receive push notifications',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable notifications';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Set up foreground message listener
  useEffect(() => {
    if (!hasPermission || !user) {
      return;
    }

    const unsubscribe = fcmService.onForegroundMessage((payload) => {
      // Show in-app notification
      const { notification, data } = payload;
      
      if (notification) {
        toast({
          title: notification.title || 'New notification',
          description: notification.body,
          action: data?.challengeId ? (
            <button
              onClick={() => {
                // Navigate to challenge
                window.location.href = `/game?challengeId=${data.challengeId}`;
              }}
              className="text-sm font-medium"
            >
              View Challenge
            </button>
          ) : undefined,
        });
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [hasPermission, user, toast]);

  // Clean up token on logout
  useEffect(() => {
    if (!user && fcmToken) {
      fcmService.unregisterToken(fcmToken).then(() => {
        setFcmToken(null);
        setHasPermission(false);
      });
    }
  }, [user, fcmToken]);

  const value = {
    hasPermission,
    fcmToken,
    requestPermission,
    isLoading,
    error,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
