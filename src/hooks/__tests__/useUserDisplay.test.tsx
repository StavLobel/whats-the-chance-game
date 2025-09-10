import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserDisplay, useMultipleUsersDisplay } from '../useUserDisplay';
import { userLookupService } from '@/lib/userLookupService';

// Mock the userLookupService
vi.mock('@/lib/userLookupService', () => ({
  userLookupService: {
    getUserDisplayInfo: vi.fn(),
    getUsersDisplayInfo: vi.fn(),
  },
}));

describe('useUserDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(userLookupService.getUserDisplayInfo).mockResolvedValue({
      uid: 'user123',
      displayName: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      photoURL: 'https://example.com/photo.jpg'
    });

    const { result } = renderHook(() => useUserDisplay('user123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.displayName).toBe('User user123...');
    expect(result.current.userInfo).toBe(null);
  });

  it('should return user info after successful lookup', async () => {
    const mockUserInfo = {
      uid: 'user123',
      displayName: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      photoURL: 'https://example.com/photo.jpg'
    };

    vi.mocked(userLookupService.getUserDisplayInfo).mockResolvedValue(mockUserInfo);

    const { result } = renderHook(() => useUserDisplay('user123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.displayName).toBe('John Doe');
    expect(result.current.userInfo).toEqual(mockUserInfo);
    expect(result.current.error).toBe(null);
  });

  it('should handle lookup errors gracefully', async () => {
    vi.mocked(userLookupService.getUserDisplayInfo).mockRejectedValue(new Error('User not found'));

    const { result } = renderHook(() => useUserDisplay('user123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.displayName).toBe('User user123...');
    expect(result.current.userInfo).toEqual({
      uid: 'user123',
      displayName: 'User user123...',
    });
    expect(result.current.error).toBe('User not found');
  });

  it('should handle null userId', () => {
    const { result } = renderHook(() => useUserDisplay(null));

    expect(result.current.loading).toBe(false);
    expect(result.current.displayName).toBe('Unknown User');
    expect(result.current.userInfo).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should handle undefined userId', () => {
    const { result } = renderHook(() => useUserDisplay(undefined));

    expect(result.current.loading).toBe(false);
    expect(result.current.displayName).toBe('Unknown User');
    expect(result.current.userInfo).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should refetch when userId changes', async () => {
    const mockUserInfo1 = {
      uid: 'user1',
      displayName: 'John Doe',
      username: 'johndoe',
    };

    const mockUserInfo2 = {
      uid: 'user2',
      displayName: 'Jane Smith',
      username: 'janesmith',
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

    expect(result.current.displayName).toBe('John Doe');

    // Change userId
    rerender({ userId: 'user2' });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.displayName).toBe('Jane Smith');
  });
});

describe('useMultipleUsersDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(userLookupService.getUsersDisplayInfo).mockResolvedValue({
      users: {},
      errors: []
    });

    const { result } = renderHook(() => useMultipleUsersDisplay(['user1', 'user2']));

    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual({});
  });

  it('should return users after successful lookup', async () => {
    const mockUsers = {
      user1: {
        uid: 'user1',
        displayName: 'John Doe',
        username: 'johndoe',
      },
      user2: {
        uid: 'user2',
        displayName: 'Jane Smith',
        username: 'janesmith',
      }
    };

    vi.mocked(userLookupService.getUsersDisplayInfo).mockResolvedValue({
      users: mockUsers,
      errors: []
    });

    const { result } = renderHook(() => useMultipleUsersDisplay(['user1', 'user2']));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBe(null);
  });

  it('should handle partial failures', async () => {
    const mockUsers = {
      user1: {
        uid: 'user1',
        displayName: 'John Doe',
        username: 'johndoe',
      }
    };

    vi.mocked(userLookupService.getUsersDisplayInfo).mockResolvedValue({
      users: mockUsers,
      errors: ['Failed to lookup user user2']
    });

    const { result } = renderHook(() => useMultipleUsersDisplay(['user1', 'user2']));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.error).toBe('Some users could not be loaded: Failed to lookup user user2');
  });

  it('should handle complete failure with fallbacks', async () => {
    vi.mocked(userLookupService.getUsersDisplayInfo).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useMultipleUsersDisplay(['user1', 'user2']));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toHaveProperty('user1');
    expect(result.current.users).toHaveProperty('user2');
    expect(result.current.users.user1.displayName).toBe('User user1...');
    expect(result.current.users.user2.displayName).toBe('User user2...');
    expect(result.current.error).toBe('API Error');
  });

  it('should handle empty userIds array', async () => {
    const { result } = renderHook(() => useMultipleUsersDisplay([]));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.users).toEqual({});
    expect(result.current.error).toBe(null);
  });
});
