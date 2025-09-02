/**
 * Friend ID Hooks
 * React hooks for managing Friend IDs with updated terminology
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendIdApiService, FriendIdValidationResponse, FriendIdResponse, User } from '@/lib/friendIdApiService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Query keys for caching
export const FRIEND_ID_KEYS = {
  all: ['friend-id'] as const,
  my: () => [...FRIEND_ID_KEYS.all, 'my'] as const,
  validate: (id: string) => [...FRIEND_ID_KEYS.all, 'validate', id] as const,
  lookup: (id: string) => [...FRIEND_ID_KEYS.all, 'lookup', id] as const,
};

/**
 * Hook to get the current user's Friend ID
 */
export const useMyFriendId = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: FRIEND_ID_KEYS.my(),
    queryFn: async () => {
      const result = await friendIdApiService.getMyFriendId();
      // Ensure we always return a valid object
      if (!result) {
        throw new Error('No Friend ID data received from server');
      }
      return result;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook to validate a Friend ID
 */
export const useValidateFriendId = (friendId: string, enabled: boolean = true) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: FRIEND_ID_KEYS.validate(friendId),
    queryFn: () => friendIdApiService.validateFriendId(friendId),
    enabled: enabled && isAuthenticated && Boolean(friendId) && friendId.length === 16,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on client-side validation errors
      if (error?.response?.status === 400) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook to look up a user by Friend ID
 */
export const useLookupUserByFriendId = (friendId: string, enabled: boolean = false) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: FRIEND_ID_KEYS.lookup(friendId),
    queryFn: () => friendIdApiService.lookupUserByFriendId(friendId),
    enabled: enabled && isAuthenticated && Boolean(friendId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on not found errors
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Hook to generate a new Friend ID for the current user
 */
export const useGenerateFriendId = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => friendIdApiService.generateFriendId(),
    onSuccess: (data: FriendIdResponse) => {
      // Invalidate and refetch the user's Friend ID
      queryClient.invalidateQueries({ queryKey: FRIEND_ID_KEYS.my() });
      
      toast({
        title: 'Success',
        description: data.message,
      });
    },
    onError: (error: any) => {
      const errorMessage = typeof error?.response?.data?.detail === 'string'
        ? error.response.data.detail
        : typeof error?.message === 'string'
        ? error.message
        : 'Failed to generate Friend ID';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook for client-side Friend ID validation
 */
export const useFriendIdValidation = () => {
  const validateFormat = (friendId: string) => {
    return friendIdApiService.validateFriendIdFormat(friendId);
  };

  const formatForDisplay = (friendId: string) => {
    return friendIdApiService.formatFriendIdForDisplay(friendId);
  };

  const cleanFriendId = (friendId: string) => {
    return friendIdApiService.cleanFriendId(friendId);
  };

  return {
    validateFormat,
    formatForDisplay,
    cleanFriendId,
  };
};
