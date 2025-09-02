/**
 * Friend ID API Service Tests
 * Tests for the Friend ID system with updated terminology
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module
vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '../api';

// This will be the updated service with Friend ID terminology
class FriendIdApiService {
  /**
   * Validate if a Friend ID has the correct format and exists
   */
  async validateFriendId(friendId: string): Promise<{ valid: boolean; exists: boolean; error: string | null }> {
    try {
      const response = await api.get(`/api/friends/friend-id/validate/${friendId}`);
      return response.data;
    } catch (error) {
      console.error('Error validating Friend ID:', error);
      throw error;
    }
  }

  /**
   * Look up a user by their Friend ID
   */
  async lookupUserByFriendId(friendId: string): Promise<any> {
    try {
      const response = await api.get(`/api/friends/friend-id/lookup/${friendId}`);
      return response.data;
    } catch (error) {
      console.error('Error looking up user by Friend ID:', error);
      throw error;
    }
  }

  /**
   * Get the current user's Friend ID
   */
  async getMyFriendId(): Promise<{ friend_id: string; message: string }> {
    try {
      const response = await api.get('/api/friends/friend-id/my');
      return response.data;
    } catch (error) {
      console.error('Error getting Friend ID:', error);
      throw error;
    }
  }

  /**
   * Generate a new Friend ID for the current user
   */
  async generateFriendId(): Promise<{ friend_id: string; message: string }> {
    try {
      const response = await api.post('/api/friends/friend-id/generate');
      return response.data;
    } catch (error) {
      console.error('Error generating Friend ID:', error);
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

const friendIdApiService = new FriendIdApiService();

describe('FriendIdApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFriendIdFormat', () => {
    it('should return valid for correct 16-digit Friend ID', () => {
      const result = friendIdApiService.validateFriendIdFormat('1234567890123456');
      expect(result.valid).toBe(true);
    });

    it('should return invalid for empty string', () => {
      const result = friendIdApiService.validateFriendIdFormat('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Friend ID is required');
    });

    it('should return invalid for non-string input', () => {
      const result = friendIdApiService.validateFriendIdFormat(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Friend ID must be a string');
    });

    it('should return invalid for wrong length', () => {
      const result = friendIdApiService.validateFriendIdFormat('12345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Friend ID must be exactly 16 digits');
    });

    it('should return invalid for non-digits', () => {
      const result = friendIdApiService.validateFriendIdFormat('abcd567890123456');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Friend ID must contain only digits');
    });

    it('should return invalid for ID starting with 0', () => {
      const result = friendIdApiService.validateFriendIdFormat('0123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Friend ID cannot start with 0');
    });
  });

  describe('formatFriendIdForDisplay', () => {
    it('should format 16-digit Friend ID with spaces', () => {
      const result = friendIdApiService.formatFriendIdForDisplay('1234567890123456');
      expect(result).toBe('1234 5678 9012 3456');
    });

    it('should return original string for invalid length', () => {
      const result = friendIdApiService.formatFriendIdForDisplay('12345');
      expect(result).toBe('12345');
    });

    it('should return original string for empty input', () => {
      const result = friendIdApiService.formatFriendIdForDisplay('');
      expect(result).toBe('');
    });
  });

  describe('cleanFriendId', () => {
    it('should remove spaces from formatted Friend ID', () => {
      const result = friendIdApiService.cleanFriendId('1234 5678 9012 3456');
      expect(result).toBe('1234567890123456');
    });

    it('should handle Friend ID without spaces', () => {
      const result = friendIdApiService.cleanFriendId('1234567890123456');
      expect(result).toBe('1234567890123456');
    });

    it('should handle empty string', () => {
      const result = friendIdApiService.cleanFriendId('');
      expect(result).toBe('');
    });
  });

  describe('validateFriendId', () => {
    it('should call API with correct endpoint for Friend ID validation', async () => {
      const mockResponse = { data: { valid: true, exists: true, error: null } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await friendIdApiService.validateFriendId('1234567890123456');

      expect(api.get).toHaveBeenCalledWith('/api/friends/friend-id/validate/1234567890123456');
      expect(result).toEqual({ valid: true, exists: true, error: null });
    });

    it('should handle API errors for Friend ID validation', async () => {
      const mockError = new Error('API Error');
      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(friendIdApiService.validateFriendId('1234567890123456'))
        .rejects.toThrow('API Error');
    });
  });

  describe('lookupUserByFriendId', () => {
    it('should call API with correct endpoint for Friend ID lookup', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        display_name: 'Test User',
        friend_id: '1234567890123456',
        email_verified: true,
        disabled: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };
      const mockResponse = { data: mockUser };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await friendIdApiService.lookupUserByFriendId('1234567890123456');

      expect(api.get).toHaveBeenCalledWith('/api/friends/friend-id/lookup/1234567890123456');
      expect(result).toEqual(mockUser);
    });

    it('should handle API errors for Friend ID lookup', async () => {
      const mockError = new Error('User not found');
      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(friendIdApiService.lookupUserByFriendId('1234567890123456'))
        .rejects.toThrow('User not found');
    });
  });

  describe('getMyFriendId', () => {
    it('should call API with correct endpoint to get user\'s own Friend ID', async () => {
      const mockResponse = { 
        data: { 
          friend_id: '1234567890123456', 
          message: 'Existing Friend ID retrieved' 
        } 
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await friendIdApiService.getMyFriendId();

      expect(api.get).toHaveBeenCalledWith('/api/friends/friend-id/my');
      expect(result).toEqual({ 
        friend_id: '1234567890123456', 
        message: 'Existing Friend ID retrieved' 
      });
    });

    it('should handle errors when getting user\'s Friend ID', async () => {
      const mockError = new Error('Authentication failed');
      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(friendIdApiService.getMyFriendId())
        .rejects.toThrow('Authentication failed');
    });
  });

  describe('generateFriendId', () => {
    it('should call API with correct endpoint to generate new Friend ID', async () => {
      const mockResponse = { 
        data: { 
          friend_id: '9876543210987654', 
          message: 'Friend ID generated successfully' 
        } 
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await friendIdApiService.generateFriendId();

      expect(api.post).toHaveBeenCalledWith('/api/friends/friend-id/generate');
      expect(result).toEqual({ 
        friend_id: '9876543210987654', 
        message: 'Friend ID generated successfully' 
      });
    });

    it('should handle errors when generating Friend ID', async () => {
      const mockError = new Error('Generation failed');
      vi.mocked(api.post).mockRejectedValue(mockError);

      await expect(friendIdApiService.generateFriendId())
        .rejects.toThrow('Generation failed');
    });
  });

  describe('Client-side validation edge cases', () => {
    it('should handle Friend ID with leading/trailing whitespace', () => {
      const result = friendIdApiService.validateFriendIdFormat('  1234567890123456  ');
      expect(result.valid).toBe(true);
    });

    it('should reject Friend ID with special characters', () => {
      const result = friendIdApiService.validateFriendIdFormat('1234-5678-9012-3456');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Friend ID must contain only digits');
    });

    it('should reject Friend ID that is too long', () => {
      const result = friendIdApiService.validateFriendIdFormat('12345678901234567');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Friend ID must be exactly 16 digits');
    });
  });

  describe('Formatting edge cases', () => {
    it('should handle already formatted Friend ID', () => {
      const result = friendIdApiService.cleanFriendId('1234 5678 9012 3456');
      expect(result).toBe('1234567890123456');
      
      const formatted = friendIdApiService.formatFriendIdForDisplay(result);
      expect(formatted).toBe('1234 5678 9012 3456');
    });

    it('should handle Friend ID with multiple spaces', () => {
      const result = friendIdApiService.cleanFriendId('1234  5678   9012    3456');
      expect(result).toBe('1234567890123456');
    });

    it('should preserve non-16-digit strings when formatting', () => {
      const result = friendIdApiService.formatFriendIdForDisplay('123');
      expect(result).toBe('123');
    });
  });
});
