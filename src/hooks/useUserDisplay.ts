import { useState, useEffect, useCallback } from 'react';
import { userLookupService, UserDisplayInfo } from '@/lib/userLookupService';

interface UseUserDisplayResult {
  displayName: string;
  userInfo: UserDisplayInfo | null;
  loading: boolean;
  error: string | null;
}

interface UseMultipleUsersDisplayResult {
  users: Record<string, UserDisplayInfo>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get display information for a single user
 */
export function useUserDisplay(userId: string | null | undefined): UseUserDisplayResult {
  const [userInfo, setUserInfo] = useState<UserDisplayInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserInfo(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    userLookupService
      .getUserDisplayInfo(userId)
      .then((info) => {
        setUserInfo(info);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to get user display info:', err);
        setError(err.message || 'Failed to load user info');
        setUserInfo({
          uid: userId,
          displayName: `User ${userId.substring(0, 8)}...`,
        });
        setLoading(false);
      });
  }, [userId]);

  const displayName = userInfo?.displayName || 
                     (userId ? `User ${userId.substring(0, 8)}...` : 'Unknown User');

  return {
    displayName,
    userInfo,
    loading,
    error,
  };
}

/**
 * Hook to get display information for multiple users efficiently
 */
export function useMultipleUsersDisplay(userIds: string[]): UseMultipleUsersDisplayResult {
  const [users, setUsers] = useState<Record<string, UserDisplayInfo>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setUsers({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await userLookupService.getUsersDisplayInfo(ids);
      setUsers(result.users);
      
      if (result.errors.length > 0) {
        setError(`Some users could not be loaded: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      console.error('Failed to get users display info:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
      
      // Create fallback entries
      const fallbackUsers: Record<string, UserDisplayInfo> = {};
      for (const uid of ids) {
        fallbackUsers[uid] = {
          uid,
          displayName: `User ${uid.substring(0, 8)}...`,
        };
      }
      setUsers(fallbackUsers);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(userIds);
  }, [userIds, fetchUsers]);

  return {
    users,
    loading,
    error,
  };
}

/**
 * Utility hook for getting display name with fallback
 */
export function useDisplayName(userId: string | null | undefined): string {
  const { displayName } = useUserDisplay(userId);
  return displayName;
}
