/**
 * Unit tests for the useUserDisplay hook
 * Tests hook behavior, loading states, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// Mock the userLookupService
vi.mock('@/lib/userLookupService', () => ({
  userLookupService: {
    getUserDisplayInfo: vi.fn(),
    getUsersDisplayInfo: vi.fn(),
  },
}));

import { userLookupService } from '@/lib/userLookupService';
import { useUserDisplay, useMultipleUsersDisplay } from '../useUserDisplay';

describe('useUserDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserDisplay', () => {
    it('should return initial state for null userId', () => {
      const { result } = renderHook(() => useUserDisplay(null));

      expect(result.current).toEqual({
        displayName: 'Unknown User',
        userInfo: null,
        loading: false,
        error: null,
      });
    });

    it('should fetch user info and update state', async () => {
      const mockUserInfo = {
        uid: 'test-user-123',
        displayName: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
      };

      vi.mocked(userLookupService.getUserDisplayInfo).mockResolvedValue(mockUserInfo);

      const { result } = renderHook(() => useUserDisplay('test-user-123'));

      // Initial loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.displayName).toBe('User test-use...');

      // Wait for async operation
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toEqual({
        displayName: 'Test User',
        userInfo: mockUserInfo,
        loading: false,
        error: null,
      });

      expect(userLookupService.getUserDisplayInfo).toHaveBeenCalledWith('test-user-123');
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Network error');
      vi.mocked(userLookupService.getUserDisplayInfo).mockRejectedValue(mockError);

      const { result } = renderHook(() => useUserDisplay('test-user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toEqual({
        displayName: 'User test-use...',
        userInfo: {
          uid: 'test-user-123',
          displayName: 'User test-use...',
        },
        loading: false,
        error: 'Network error',
      });
    });

    it('should update when userId changes', async () => {
      const mockUserInfo1 = {
        uid: 'user1',
        displayName: 'User One',
        username: 'user1',
      };

      const mockUserInfo2 = {
        uid: 'user2',
        displayName: 'User Two',
        username: 'user2',
      };

      vi.mocked(userLookupService.getUserDisplayInfo)
        .mockResolvedValueOnce(mockUserInfo1)
        .mockResolvedValueOnce(mockUserInfo2);

      const { result, rerender } = renderHook(
        ({ userId }) => useUserDisplay(userId),
        { initialProps: { userId: 'user1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.displayName).toBe('User One');

      // Change userId
      rerender({ userId: 'user2' });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.displayName).toBe('User Two');
      expect(userLookupService.getUserDisplayInfo).toHaveBeenCalledTimes(2);
    });
  });

  describe('useMultipleUsersDisplay', () => {
    it('should fetch multiple users', async () => {
      const mockResponse = {
        users: {
          user1: {
            uid: 'user1',
            displayName: 'User One',
            username: 'user1',
          },
          user2: {
            uid: 'user2',
            displayName: 'User Two',
            username: 'user2',
          },
        },
        errors: [],
      };

      vi.mocked(userLookupService.getUsersDisplayInfo).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMultipleUsersDisplay(['user1', 'user2']));

      // Initial loading state
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toEqual({
        users: mockResponse.users,
        loading: false,
        error: null,
      });

      expect(userLookupService.getUsersDisplayInfo).toHaveBeenCalledWith(['user1', 'user2']);
    });

    it('should handle empty user list', () => {
      const { result } = renderHook(() => useMultipleUsersDisplay([]));

      expect(result.current).toEqual({
        users: {},
        loading: false,
        error: null,
      });

      expect(userLookupService.getUsersDisplayInfo).not.toHaveBeenCalled();
    });

    it('should handle errors with fallback users', async () => {
      const mockError = new Error('API Error');
      vi.mocked(userLookupService.getUsersDisplayInfo).mockRejectedValue(mockError);

      const { result } = renderHook(() => useMultipleUsersDisplay(['user1', 'user2']));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toEqual({
        users: {
          user1: {
            uid: 'user1',
            displayName: 'User user1...',
          },
          user2: {
            uid: 'user2',
            displayName: 'User user2...',
          },
        },
        loading: false,
        error: 'API Error',
      });
    });

    it('should handle partial errors', async () => {
      const mockResponse = {
        users: {
          user1: {
            uid: 'user1',
            displayName: 'User One',
            username: 'user1',
          },
          user2: {
            uid: 'user2',
            displayName: 'User user2...',
          },
        },
        errors: ['Failed to lookup user user2'],
      };

      vi.mocked(userLookupService.getUsersDisplayInfo).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMultipleUsersDisplay(['user1', 'user2']));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Some users could not be loaded: Failed to lookup user user2');
      expect(result.current.users).toEqual(mockResponse.users);
    });
  });
});
