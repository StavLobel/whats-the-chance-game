/**
 * Friend ID API Service
 * Service for managing Friend IDs and related operations
 */

import { api } from './api';

export interface FriendIdValidationResponse {
  valid: boolean;
  exists: boolean;
  error: string | null;
}

export interface FriendIdResponse {
  friend_id: string;
  message: string;
}

export interface User {
  uid: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  friend_id?: string;
  photo_url?: string;
  email_verified: boolean;
  disabled: boolean;
  created_at: string;
  updated_at: string;
}

class FriendIdApiService {
  /**
   * Validate if a Friend ID has the correct format and exists
   */
  async validateFriendId(friendId: string): Promise<FriendIdValidationResponse> {
    try {
      // api.get returns raw JSON, not an axios-like object
      const response = await api.get(`/api/friends/unique-id/validate/${friendId}`);
      return response as unknown as FriendIdValidationResponse;
    } catch (error) {
      console.error('Error validating Friend ID:', error);
      throw error;
    }
  }

  /**
   * Look up a user by their Friend ID
   */
  async lookupUserByFriendId(friendId: string): Promise<User> {
    try {
      const response = await api.get(`/api/friends/unique-id/lookup/${friendId}`);
      return response as unknown as User;
    } catch (error) {
      console.error('Error looking up user by Friend ID:', error);
      throw error;
    }
  }

  /**
   * Generate a new Friend ID for the current user
   */
  async generateFriendId(): Promise<FriendIdResponse> {
    try {
      const response = await api.post('/api/friends/unique-id/generate');
      console.log('Generate Friend ID Response:', response);
      
      if (!response || !(response as any).unique_id) {
        throw new Error('Invalid response from generate Friend ID API');
      }
      
      return {
        friend_id: (response as any).unique_id,
        message: (response as any).message || 'Friend ID generated'
      };
    } catch (error) {
      console.error('Error generating Friend ID:', error);
      throw error;
    }
  }

  /**
   * Get the current user's Friend ID
   * If the user doesn't have one, it will be generated automatically
   */
  async getMyFriendId(): Promise<FriendIdResponse> {
    try {
      const response = await api.get('/api/friends/unique-id/my');
      console.log('Friend ID API Response:', response);
      
      if (!response) {
        throw new Error('No data received from Friend ID API');
      }
      
      // Handle the actual backend response format
      const data: any = response;
      if (!data.unique_id) {
        throw new Error('Invalid response format: missing unique_id');
      }
      
      return {
        friend_id: data.unique_id,
        message: data.message || 'Friend ID retrieved'
      };
    } catch (error) {
      console.error('Error getting Friend ID:', error);
      throw error;
    }
  }

  /**
   * Validate Friend ID format client-side
   */
  validateFriendIdFormat(friendId: string): { valid: boolean; error?: string } {
    if (!friendId) {
      return { valid: false, error: 'Friend ID is required' };
    }

    if (typeof friendId !== 'string') {
      return { valid: false, error: 'Friend ID must be a string' };
    }

    const trimmed = friendId.trim();
    if (trimmed.length !== 16) {
      return { valid: false, error: 'Friend ID must be exactly 16 digits' };
    }

    if (!/^\d{16}$/.test(trimmed)) {
      return { valid: false, error: 'Friend ID must contain only digits' };
    }

    if (trimmed.startsWith('0')) {
      return { valid: false, error: 'Friend ID cannot start with 0' };
    }

    return { valid: true };
  }

  /**
   * Format Friend ID for display (add spaces for readability)
   */
  formatFriendIdForDisplay(friendId: string): string {
    if (!friendId || friendId.length !== 16) {
      return friendId;
    }
    // Format as: 1234 5678 9012 3456
    return friendId.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * Remove formatting from Friend ID (remove spaces)
   */
  cleanFriendId(friendId: string): string {
    return friendId.replace(/\s/g, '');
  }
}

export const friendIdApiService = new FriendIdApiService();
