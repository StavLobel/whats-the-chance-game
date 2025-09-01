/**
 * Friends API Service
 * Handles all API calls related to friends functionality
 */

import { apiClient } from './api';
import type {
  FriendRequest,
  FriendRequestCreate,
  FriendRequestUpdate,
  FriendRequestList,
  FriendList,
  FriendSearch,
  FriendSuggestionList,
  BlockedUser,
  BlockUserRequest,
  FriendPrivacySettings,
} from '@/types/friends';
import type { UserSearchResult } from '@/types/firebase';

export const friendsApiService = {
  /**
   * Search for users
   */
  searchUsers: async (params: FriendSearch): Promise<UserSearchResult[]> => {
    const response = await apiClient.post('/api/friends/search', params);
    return response.data;
  },

  /**
   * Send a friend request
   */
  sendFriendRequest: async (request: FriendRequestCreate): Promise<FriendRequest> => {
    const response = await apiClient.post('/api/friends/request', request);
    return response.data;
  },

  /**
   * Get received friend requests
   */
  getReceivedRequests: async (page = 1, perPage = 20): Promise<FriendRequestList> => {
    const response = await apiClient.get('/api/friends/requests/received', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  /**
   * Get sent friend requests
   */
  getSentRequests: async (page = 1, perPage = 20): Promise<FriendRequestList> => {
    const response = await apiClient.get('/api/friends/requests/sent', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  /**
   * Update friend request (accept/reject)
   */
  updateFriendRequest: async (
    requestId: string,
    update: FriendRequestUpdate
  ): Promise<FriendRequest> => {
    const response = await apiClient.put(`/api/friends/request/${requestId}`, update);
    return response.data;
  },

  /**
   * Get friends list
   */
  getFriendsList: async (
    page = 1,
    perPage = 20,
    onlineOnly = false
  ): Promise<FriendList> => {
    const response = await apiClient.get('/api/friends/list', {
      params: { page, per_page: perPage, online_only: onlineOnly },
    });
    return response.data;
  },

  /**
   * Remove a friend
   */
  removeFriend: async (friendId: string): Promise<void> => {
    await apiClient.delete(`/api/friends/${friendId}`);
  },

  /**
   * Get friend suggestions
   */
  getFriendSuggestions: async (limit = 10): Promise<FriendSuggestionList> => {
    const response = await apiClient.get('/api/friends/suggestions', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Block a user
   */
  blockUser: async (request: BlockUserRequest): Promise<BlockedUser> => {
    const response = await apiClient.post('/api/friends/block', request);
    return response.data;
  },

  /**
   * Unblock a user
   */
  unblockUser: async (blockedId: string): Promise<void> => {
    await apiClient.delete(`/api/friends/block/${blockedId}`);
  },

  /**
   * Update privacy settings
   */
  updatePrivacySettings: async (
    settings: FriendPrivacySettings
  ): Promise<FriendPrivacySettings> => {
    const response = await apiClient.put('/api/friends/privacy', settings);
    return response.data;
  },
};
