/**
 * Firebase Cloud Messaging (FCM) Service
 * Handles push notifications for the app
 */

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import app, { messaging } from './firebase';
import { api } from './api';

// FCM VAPID key (you'll need to get this from Firebase console)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

class FCMService {
  private messaging: Messaging | null = null;
  private isSupported = false;

  constructor() {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.isSupported = true;
      this.messaging = messaging || getMessaging(app);
    }
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestPermission(): Promise<string | null> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return null;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        return await this.getToken();
      } else {
        console.warn('Notification permission denied');
        return null;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }

  /**
   * Get FCM token
   */
  async getToken(): Promise<string | null> {
    if (!this.messaging || !VAPID_KEY) {
      console.error('FCM not initialized or VAPID key missing');
      return null;
    }

    try {
      const currentToken = await getToken(this.messaging, { vapidKey: VAPID_KEY });
      
      if (currentToken) {
        console.log('FCM token obtained:', currentToken);
        return currentToken;
      } else {
        console.warn('No registration token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Register FCM token with backend
   */
  async registerToken(userId: string, token: string): Promise<boolean> {
    try {
      const response = await api.post('/notifications/tokens', {
        user_id: userId,
        token,
        device_type: this.getDeviceType(),
      });

      return response.data.success === true;
    } catch (error) {
      console.error('Error registering FCM token:', error);
      return false;
    }
  }

  /**
   * Unregister FCM token
   */
  async unregisterToken(token: string): Promise<boolean> {
    try {
      const response = await api.delete(`/notifications/tokens/${token}`);
      return response.data.success === true;
    } catch (error) {
      console.error('Error unregistering FCM token:', error);
      return false;
    }
  }

  /**
   * Subscribe to topic
   */
  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      const response = await api.post(`/notifications/topics/${topic}/subscribe`);
      return response.data.success === true;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      const response = await api.post(`/notifications/topics/${topic}/unsubscribe`);
      return response.data.success === true;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }

  /**
   * Listen for foreground messages
   */
  onForegroundMessage(callback: (payload: any) => void): (() => void) | null {
    if (!this.messaging) {
      return null;
    }

    return onMessage(this.messaging, (payload) => {
      console.log('Received foreground message:', payload);
      callback(payload);
    });
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/android/.test(userAgent)) {
      return 'android';
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    } else {
      return 'web';
    }
  }

  /**
   * Check if notifications are supported
   */
  get notificationsSupported(): boolean {
    return this.isSupported;
  }
}

// Export singleton instance
export const fcmService = new FCMService();
