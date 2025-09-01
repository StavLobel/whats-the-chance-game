/**
 * Friends Feature Type Definitions
 * Types for friend requests, friendships, and related operations
 */

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FriendRequestWithUsers extends FriendRequest {
  fromUser: User;
  toUser: User;
}

export interface FriendRequestCreate {
  toUserId: string;
  message?: string;
}

export interface FriendRequestUpdate {
  status: 'accepted' | 'rejected';
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  category?: string;
  createdAt: Date | string;
  isActive: boolean;
}

export interface FriendshipWithUser extends Friendship {
  friend: User;
  onlineStatus: boolean;
  lastActive?: Date | string;
}

export interface FriendSearch {
  query: string;
  onlineOnly?: boolean;
  mutualFriendsOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface FriendSuggestion {
  userId: string;
  user: User;
  mutualFriendsCount: number;
  suggestionReason: string;
  score: number;
}

export interface FriendActivity {
  friendId: string;
  friend: User;
  activityType: string;
  activityDescription: string;
  activityData?: Record<string, any>;
  timestamp: Date | string;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  reason?: string;
  createdAt: Date | string;
}

export interface BlockUserRequest {
  userId: string;
  reason?: string;
}

export interface FriendPrivacySettings {
  isPublic: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
  showActivity: boolean;
  friendListVisibility: 'public' | 'friends' | 'private';
}

export interface FriendRequestList {
  requests: FriendRequestWithUsers[];
  total: number;
  page: number;
  perPage: number;
}

export interface FriendList {
  friends: FriendshipWithUser[];
  total: number;
  page: number;
  perPage: number;
  onlineCount: number;
}

export interface FriendSuggestionList {
  suggestions: FriendSuggestion[];
  total: number;
}

export interface FriendActivityList {
  activities: FriendActivity[];
  total: number;
  page: number;
  perPage: number;
}

// Import User type from firebase types
import type { User } from './firebase';
