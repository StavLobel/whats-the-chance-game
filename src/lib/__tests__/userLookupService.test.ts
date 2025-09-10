/**
 * Unit tests for the User Lookup Service
 * Tests caching, fallback logic, and API integration
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
import { userLookupService, UserDisplayInfo } from '../userLookupService';

describe('UserLookupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userLookupService.clearCache();
  });

  describe('getUserDisplayInfo', () => {
    it('should fetch and cache user display info', async () => {
      const mockUserData = {
        uid: 'test-user-123',
        username: 'testuser',
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
      };

      vi.mocked(api.get).mockResolvedValue(mockUserData);

      const result = await userLookupService.getUserDisplayInfo('test-user-123');

      expect(result).toEqual({
        uid: 'test-user-123',
        displayName: 'testuser', // Should use username as priority
        username: 'testuser',
        email: 'test@example.com',
        photoURL: 'https://example.com/photo.jpg',
      });

      expect(api.get).toHaveBeenCalledWith('/api/users/test-user-123');
    });

    it('should return cached user info on second call', async () => {
      const mockUserData = {
        uid: 'test-user-123',
        username: 'testuser',
        displayName: 'Test User',
      };

      vi.mocked(api.get).mockResolvedValue(mockUserData);

      // First call
      await userLookupService.getUserDisplayInfo('test-user-123');
      
      // Second call should use cache
      const result = await userLookupService.getUserDisplayInfo('test-user-123');

      expect(result.displayName).toBe('testuser');
      expect(api.get).toHaveBeenCalledTimes(1); // Should only call API once
    });

    it('should create fallback user when API fails', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('API Error'));

      const result = await userLookupService.getUserDisplayInfo('test-user-123');

      expect(result).toEqual({
        uid: 'test-user-123',
        displayName: 'User test-use...',
      });
    });

    it('should prioritize display name fields correctly', async () => {
      const testCases = [
        {
          userData: { uid: '1', username: 'user1' },
          expectedDisplayName: 'user1',
        },
        {
          userData: { uid: '2', displayName: 'Display Name' },
          expectedDisplayName: 'Display Name',
        },
        {
          userData: { uid: '3', display_name: 'Display Name Alt' },
          expectedDisplayName: 'Display Name Alt',
        },
        {
          userData: { uid: '4', email: 'user@example.com' },
          expectedDisplayName: 'user',
        },
        {
          userData: { uid: '5' },
          expectedDisplayName: 'Unknown User',
        },
      ];

      for (const testCase of testCases) {
        vi.mocked(api.get).mockResolvedValue(testCase.userData);
        userLookupService.clearCache();

        const result = await userLookupService.getUserDisplayInfo(testCase.userData.uid);
        expect(result.displayName).toBe(testCase.expectedDisplayName);
      }
    });
  });

  describe('getUsersDisplayInfo', () => {
    it('should fetch multiple users efficiently', async () => {
      const mockResponse = {
        users: [
          {
            uid: 'user1',
            displayName: 'User One',
            username: 'user1',
          },
          {
            uid: 'user2',
            displayName: 'User Two',
            username: 'user2',
          },
        ],
        errors: [],
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await userLookupService.getUsersDisplayInfo(['user1', 'user2']);

      expect(result.users).toEqual({
        user1: {
          uid: 'user1',
          displayName: 'user1', // Should use username as priority
          username: 'user1',
        },
        user2: {
          uid: 'user2',
          displayName: 'user2',
          username: 'user2',
        },
      });

      expect(api.post).toHaveBeenCalledWith('/api/users/lookup', {
        user_ids: ['user1', 'user2'],
      });
    });

    it('should handle mixed cached and uncached users', async () => {
      // Pre-populate cache with user1
      const cachedUser = {
        uid: 'user1',
        displayName: 'Cached User',
        username: 'cached',
      };
      
      vi.mocked(api.get).mockResolvedValue(cachedUser);
      await userLookupService.getUserDisplayInfo('user1');
      vi.clearAllMocks();

      // Mock API response for user2 only
      const mockResponse = {
        users: [
          {
            uid: 'user2',
            displayName: 'New User',
            username: 'newuser',
          },
        ],
        errors: [],
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await userLookupService.getUsersDisplayInfo(['user1', 'user2']);

      expect(result.users).toEqual({
        user1: cachedUser, // From cache
        user2: {
          uid: 'user2',
          displayName: 'newuser',
          username: 'newuser',
        },
      });

      // Should only fetch user2
      expect(api.post).toHaveBeenCalledWith('/api/users/lookup', {
        user_ids: ['user2'],
      });
    });

    it('should create fallback users when API fails', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network Error'));

      const result = await userLookupService.getUsersDisplayInfo(['user1', 'user2']);

      expect(result.users).toEqual({
        user1: {
          uid: 'user1',
          displayName: 'User user1...',
        },
        user2: {
          uid: 'user2',
          displayName: 'User user2...',
        },
      });

      expect(result.errors).toHaveLength(2);
    });
  });

  describe('cache management', () => {
    it('should clear cache correctly', async () => {
      const mockUserData = {
        uid: 'test-user-123',
        username: 'testuser',
      };

      vi.mocked(api.get).mockResolvedValue(mockUserData);

      // Populate cache
      await userLookupService.getUserDisplayInfo('test-user-123');
      expect(api.get).toHaveBeenCalledTimes(1);

      // Should use cache
      await userLookupService.getUserDisplayInfo('test-user-123');
      expect(api.get).toHaveBeenCalledTimes(1);

      // Clear cache
      userLookupService.clearCache();

      // Should call API again
      await userLookupService.getUserDisplayInfo('test-user-123');
      expect(api.get).toHaveBeenCalledTimes(2);
    });

    it('should preload users correctly', async () => {
      const mockResponse = {
        users: [
          { uid: 'user1', displayName: 'User One', username: 'user1' },
          { uid: 'user2', displayName: 'User Two', username: 'user2' },
        ],
        errors: [],
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      await userLookupService.preloadUsers(['user1', 'user2']);

      // Should be cached now
      vi.clearAllMocks();
      const result = await userLookupService.getUserDisplayInfo('user1');

      expect(result.displayName).toBe('user1');
      expect(api.get).not.toHaveBeenCalled(); // Should use cache
      expect(api.post).not.toHaveBeenCalled(); // Should use cache
    });
  });
});
