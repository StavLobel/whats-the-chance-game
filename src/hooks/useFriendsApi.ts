/**
 * Friends API React Query Hooks
 * Provides hooks for managing friend-related operations with caching and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsApiService } from '@/lib/friendsApiService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type {
  FriendRequestCreate,
  FriendRequestUpdate,
  FriendSearch,
  BlockUserRequest,
  FriendPrivacySettings,
} from '@/types/friends';

// Query keys
const FRIENDS_KEYS = {
  all: ['friends'] as const,
  lists: () => [...FRIENDS_KEYS.all, 'list'] as const,
  list: (page?: number, perPage?: number, onlineOnly?: boolean) =>
    [...FRIENDS_KEYS.lists(), { page, perPage, onlineOnly }] as const,
  requests: () => [...FRIENDS_KEYS.all, 'requests'] as const,
  received: (page?: number, perPage?: number) =>
    [...FRIENDS_KEYS.requests(), 'received', { page, perPage }] as const,
  sent: (page?: number, perPage?: number) =>
    [...FRIENDS_KEYS.requests(), 'sent', { page, perPage }] as const,
  suggestions: (limit?: number) =>
    [...FRIENDS_KEYS.all, 'suggestions', { limit }] as const,
  search: (params: FriendSearch) =>
    [...FRIENDS_KEYS.all, 'search', params] as const,
};

/**
 * Hook to search for users
 */
export const useSearchUsers = (params: FriendSearch, enabled = true) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: FRIENDS_KEYS.search(params),
    queryFn: () => friendsApiService.searchUsers(params),
    enabled: enabled && params.query.length > 0 && isAuthenticated,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get friends list
 */
export const useFriendsList = (page = 1, perPage = 20, onlineOnly = false) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: FRIENDS_KEYS.list(page, perPage, onlineOnly),
    queryFn: () => friendsApiService.getFriendsList(page, perPage, onlineOnly),
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to get received friend requests
 */
export const useReceivedFriendRequests = (page = 1, perPage = 20) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: FRIENDS_KEYS.received(page, perPage),
    queryFn: () => friendsApiService.getReceivedRequests(page, perPage),
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get sent friend requests
 */
export const useSentFriendRequests = (page = 1, perPage = 20) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: FRIENDS_KEYS.sent(page, perPage),
    queryFn: () => friendsApiService.getSentRequests(page, perPage),
    enabled: isAuthenticated,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to get friend suggestions
 */
export const useFriendSuggestions = (limit = 10) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: FRIENDS_KEYS.suggestions(limit),
    queryFn: () => friendsApiService.getFriendSuggestions(limit),
    enabled: isAuthenticated,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to send a friend request
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: FriendRequestCreate) =>
      friendsApiService.sendFriendRequest(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEYS.requests() });
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEYS.all });
      
      toast({
        title: 'Friend request sent!',
        description: 'Your friend request has been sent successfully.',
      });
    },
    onError: (error: any) => {
      const errorMessage = typeof error?.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : typeof error?.message === 'string' 
        ? error.message 
        : 'Something went wrong';
      
      toast({
        title: 'Failed to send request',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update friend request (accept/reject)
 */
export const useUpdateFriendRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      requestId,
      update,
    }: {
      requestId: string;
      update: FriendRequestUpdate;
    }) => friendsApiService.updateFriendRequest(requestId, update),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEYS.requests() });
      
      if (variables.update.status === 'accepted') {
        queryClient.invalidateQueries({ queryKey: FRIENDS_KEYS.lists() });
        toast({
          title: 'Friend request accepted!',
          description: 'You are now friends.',
        });
      } else {
        toast({
          title: 'Friend request rejected',
          description: 'The friend request has been rejected.',
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = typeof error?.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : typeof error?.message === 'string' 
        ? error.message 
        : 'Something went wrong';
      
      toast({
        title: 'Failed to update request',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to remove a friend
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (friendId: string) => friendsApiService.removeFriend(friendId),
    onSuccess: () => {
      // Invalidate friends list
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEYS.lists() });
      
      toast({
        title: 'Friend removed',
        description: 'The friend has been removed from your list.',
      });
    },
    onError: (error: any) => {
      const errorMessage = typeof error?.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : typeof error?.message === 'string' 
        ? error.message 
        : 'Something went wrong';
      
      toast({
        title: 'Failed to remove friend',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to block a user
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (request: BlockUserRequest) =>
      friendsApiService.blockUser(request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEYS.all });
      
      toast({
        title: 'User blocked',
        description: 'The user has been blocked successfully.',
      });
    },
    onError: (error: any) => {
      const errorMessage = typeof error?.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : typeof error?.message === 'string' 
        ? error.message 
        : 'Something went wrong';
      
      toast({
        title: 'Failed to block user',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to unblock a user
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (blockedId: string) => friendsApiService.unblockUser(blockedId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEYS.all });
      
      toast({
        title: 'User unblocked',
        description: 'The user has been unblocked successfully.',
      });
    },
    onError: (error: any) => {
      const errorMessage = typeof error?.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : typeof error?.message === 'string' 
        ? error.message 
        : 'Something went wrong';
      
      toast({
        title: 'Failed to unblock user',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update privacy settings
 */
export const useUpdatePrivacySettings = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (settings: FriendPrivacySettings) =>
      friendsApiService.updatePrivacySettings(settings),
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Your privacy settings have been updated.',
      });
    },
    onError: (error: any) => {
      const errorMessage = typeof error?.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : typeof error?.message === 'string' 
        ? error.message 
        : 'Something went wrong';
      
      toast({
        title: 'Failed to update settings',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Convenience hook to get all friends data
 */
export const useFriends = () => {
  const friendsList = useFriendsList();
  const receivedRequests = useReceivedFriendRequests();
  const sentRequests = useSentFriendRequests();
  const suggestions = useFriendSuggestions();

  return {
    friendsList,
    receivedRequests,
    sentRequests,
    suggestions,
    isLoading:
      friendsList.isLoading ||
      receivedRequests.isLoading ||
      sentRequests.isLoading ||
      suggestions.isLoading,
    isError:
      friendsList.isError ||
      receivedRequests.isError ||
      sentRequests.isError ||
      suggestions.isError,
  };
};
