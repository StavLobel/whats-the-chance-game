/**
 * Unique ID API Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uniqueIdApiService } from '../uniqueIdApiService';

// Mock the api module
vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '../api';

describe('UniqueIdApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateUniqueIdFormat', () => {
    it('should return valid for correct 16-digit ID', () => {
      const result = uniqueIdApiService.validateUniqueIdFormat('1234567890123456');
      expect(result.valid).toBe(true);
    });

    it('should return invalid for empty string', () => {
      const result = uniqueIdApiService.validateUniqueIdFormat('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unique ID is required');
    });

    it('should return invalid for non-string input', () => {
      const result = uniqueIdApiService.validateUniqueIdFormat(123 as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unique ID must be a string');
    });

    it('should return invalid for wrong length', () => {
      const result = uniqueIdApiService.validateUniqueIdFormat('12345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unique ID must be exactly 16 digits');
    });

    it('should return invalid for non-digits', () => {
      const result = uniqueIdApiService.validateUniqueIdFormat('abcd567890123456');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unique ID must contain only digits');
    });

    it('should return invalid for ID starting with 0', () => {
      const result = uniqueIdApiService.validateUniqueIdFormat('0123456789012345');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unique ID cannot start with 0');
    });
  });

  describe('formatUniqueIdForDisplay', () => {
    it('should format 16-digit ID with spaces', () => {
      const result = uniqueIdApiService.formatUniqueIdForDisplay('1234567890123456');
      expect(result).toBe('1234 5678 9012 3456');
    });

    it('should return original string for invalid length', () => {
      const result = uniqueIdApiService.formatUniqueIdForDisplay('12345');
      expect(result).toBe('12345');
    });

    it('should return original string for empty input', () => {
      const result = uniqueIdApiService.formatUniqueIdForDisplay('');
      expect(result).toBe('');
    });
  });

  describe('cleanUniqueId', () => {
    it('should remove spaces from formatted ID', () => {
      const result = uniqueIdApiService.cleanUniqueId('1234 5678 9012 3456');
      expect(result).toBe('1234567890123456');
    });

    it('should handle ID without spaces', () => {
      const result = uniqueIdApiService.cleanUniqueId('1234567890123456');
      expect(result).toBe('1234567890123456');
    });

    it('should handle empty string', () => {
      const result = uniqueIdApiService.cleanUniqueId('');
      expect(result).toBe('');
    });
  });

  describe('validateUniqueId', () => {
    it('should call API with correct endpoint', async () => {
      const mockResponse = { data: { valid: true, exists: true, error: null } };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await uniqueIdApiService.validateUniqueId('1234567890123456');

      expect(api.get).toHaveBeenCalledWith('/api/friends/unique-id/validate/1234567890123456');
      expect(result).toEqual({ valid: true, exists: true, error: null });
    });

    it('should handle API errors', async () => {
      const mockError = new Error('API Error');
      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(uniqueIdApiService.validateUniqueId('1234567890123456'))
        .rejects.toThrow('API Error');
    });
  });

  describe('lookupUserByUniqueId', () => {
    it('should call API with correct endpoint', async () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        display_name: 'Test User',
        unique_id: '1234567890123456',
        email_verified: true,
        disabled: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };
      const mockResponse = { data: mockUser };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await uniqueIdApiService.lookupUserByUniqueId('1234567890123456');

      expect(api.get).toHaveBeenCalledWith('/api/friends/unique-id/lookup/1234567890123456');
      expect(result).toEqual(mockUser);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('User not found');
      vi.mocked(api.get).mockRejectedValue(mockError);

      await expect(uniqueIdApiService.lookupUserByUniqueId('1234567890123456'))
        .rejects.toThrow('User not found');
    });
  });

  describe('getMyUniqueId', () => {
    it('should call API with correct endpoint', async () => {
      const mockResponse = { 
        data: { 
          unique_id: '1234567890123456', 
          message: 'Existing unique ID retrieved' 
        } 
      };
      vi.mocked(api.get).mockResolvedValue(mockResponse);

      const result = await uniqueIdApiService.getMyUniqueId();

      expect(api.get).toHaveBeenCalledWith('/api/friends/unique-id/my');
      expect(result).toEqual({ 
        unique_id: '1234567890123456', 
        message: 'Existing unique ID retrieved' 
      });
    });
  });

  describe('generateUniqueId', () => {
    it('should call API with correct endpoint', async () => {
      const mockResponse = { 
        data: { 
          unique_id: '9876543210987654', 
          message: 'Unique ID generated successfully' 
        } 
      };
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await uniqueIdApiService.generateUniqueId();

      expect(api.post).toHaveBeenCalledWith('/api/friends/unique-id/generate');
      expect(result).toEqual({ 
        unique_id: '9876543210987654', 
        message: 'Unique ID generated successfully' 
      });
    });
  });
});
