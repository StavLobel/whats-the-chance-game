/**
 * Unique ID API Service
 * Service for managing unique user IDs and related operations
 */

import { api } from './api';

export interface UniqueIdValidationResponse {
  valid: boolean;
  exists: boolean;
  error: string | null;
}

export interface UniqueIdResponse {
  unique_id: string;
  message: string;
}

export interface User {
  uid: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  unique_id?: string;
  photo_url?: string;
  email_verified: boolean;
  disabled: boolean;
  created_at: string;
  updated_at: string;
}

class UniqueIdApiService {
  /**
   * Validate if a unique ID has the correct format and exists
   */
  async validateUniqueId(uniqueId: string): Promise<UniqueIdValidationResponse> {
    try {
      const response = await api.get(`/api/friends/unique-id/validate/${uniqueId}`);
      return response.data;
    } catch (error) {
      console.error('Error validating unique ID:', error);
      throw error;
    }
  }

  /**
   * Look up a user by their unique ID
   */
  async lookupUserByUniqueId(uniqueId: string): Promise<User> {
    try {
      const response = await api.get(`/api/friends/unique-id/lookup/${uniqueId}`);
      return response.data;
    } catch (error) {
      console.error('Error looking up user by unique ID:', error);
      throw error;
    }
  }

  /**
   * Generate a new unique ID for the current user
   */
  async generateUniqueId(): Promise<UniqueIdResponse> {
    try {
      const response = await api.post('/api/friends/unique-id/generate');
      return response.data;
    } catch (error) {
      console.error('Error generating unique ID:', error);
      throw error;
    }
  }

  /**
   * Get the current user's unique ID
   * If the user doesn't have one, it will be generated automatically
   */
  async getMyUniqueId(): Promise<UniqueIdResponse> {
    try {
      const response = await api.get('/api/friends/unique-id/my');
      console.log('Unique ID API Response:', response);
      console.log('Response data:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from unique ID API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting unique ID:', error);
      throw error;
    }
  }

  /**
   * Validate unique ID format client-side
   */
  validateUniqueIdFormat(uniqueId: string): { valid: boolean; error?: string } {
    if (!uniqueId) {
      return { valid: false, error: 'Unique ID is required' };
    }

    if (typeof uniqueId !== 'string') {
      return { valid: false, error: 'Unique ID must be a string' };
    }

    const trimmed = uniqueId.trim();
    if (trimmed.length !== 16) {
      return { valid: false, error: 'Unique ID must be exactly 16 digits' };
    }

    if (!/^\d{16}$/.test(trimmed)) {
      return { valid: false, error: 'Unique ID must contain only digits' };
    }

    if (trimmed.startsWith('0')) {
      return { valid: false, error: 'Unique ID cannot start with 0' };
    }

    return { valid: true };
  }

  /**
   * Format unique ID for display (add spaces for readability)
   */
  formatUniqueIdForDisplay(uniqueId: string): string {
    if (!uniqueId || uniqueId.length !== 16) {
      return uniqueId;
    }
    // Format as: 1234 5678 9012 3456
    return uniqueId.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * Remove formatting from unique ID (remove spaces)
   */
  cleanUniqueId(uniqueId: string): string {
    return uniqueId.replace(/\s/g, '');
  }
}

export const uniqueIdApiService = new UniqueIdApiService();
