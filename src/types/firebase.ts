/**
 * Firebase Data Model Types
 *
 * TypeScript interfaces for all Firebase Firestore collections
 * and documents used in the What's the Chance game.
 */

import { Timestamp } from 'firebase/firestore';

// =============================================================================
// User Types
// =============================================================================

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  profile: UserProfile;
  settings: UserSettings;
  stats: UserStats;
  // Additional fields for friends feature
  firstName?: string;
  lastName?: string;
  username?: string;
  mutualFriendsCount?: number;
  isOnline?: boolean;
  lastActive?: Timestamp | string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  birthDate?: string;
  isPublic: boolean;
}

export interface UserSettings {
  notifications: {
    challenges: boolean;
    messages: boolean;
    gameUpdates: boolean;
    marketing: boolean;
  };
  privacy: {
    showEmail: boolean;
    showProfile: boolean;
    allowFriendRequests: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface UserStats {
  totalChallengesCreated: number;
  totalChallengesAccepted: number;
  totalGamesWon: number;
  totalGamesLost: number;
  totalGamesPlayed: number;
  winPercentage: number;
  averageGuessAccuracy: number;
  streakCurrent: number;
  streakBest: number;
  favoriteRange: {
    min: number;
    max: number;
    count: number;
  };
  lastActiveAt: Timestamp;
}

// =============================================================================
// Challenge Types
// =============================================================================

export interface Challenge {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorDisplayName: string;
  targetUserId?: string; // Optional: specific user challenge
  targetUserDisplayName?: string;
  isPublic: boolean;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  tags: string[];
  createdAt: Timestamp;
  expiresAt: Timestamp;
  status: ChallengeStatus;
  gameId?: string; // Reference to game if accepted
  metadata: ChallengeMetadata;
}

export type ChallengeCategory =
  | 'funny'
  | 'dare'
  | 'creative'
  | 'physical'
  | 'mental'
  | 'social'
  | 'other';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export type ChallengeStatus =
  | 'active' // Challenge is open for acceptance
  | 'accepted' // Challenge accepted, game in progress
  | 'completed' // Challenge completed (game finished)
  | 'expired' // Challenge expired without acceptance
  | 'cancelled'; // Challenge cancelled by creator

export interface ChallengeMetadata {
  views: number;
  likes: number;
  shares: number;
  reports: number;
  acceptanceCount: number;
  completionRate: number;
}

// =============================================================================
// Game Types
// =============================================================================

export interface Game {
  id: string;
  challengeId: string;
  challengeTitle: string;
  challengeDescription: string;
  creatorId: string;
  creatorDisplayName: string;
  acceptorId: string;
  acceptorDisplayName: string;
  range: GameRange;
  guesses: GameGuesses;
  result: GameResult;
  status: GameStatus;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  metadata: GameMetadata;
}

export interface GameRange {
  min: number;
  max: number;
  total: number; // max - min + 1
}

export interface GameGuesses {
  creator: {
    number: number;
    submittedAt: Timestamp;
    isRevealed: boolean;
  };
  acceptor: {
    number: number;
    submittedAt: Timestamp;
    isRevealed: boolean;
  };
  allSubmitted: boolean;
  bothRevealed: boolean;
}

export interface GameResult {
  isMatch: boolean;
  winnerId?: string;
  winnerDisplayName?: string;
  loserId?: string;
  loserDisplayName?: string;
  challengeCompleted: boolean;
  completionProof?: {
    type: 'text' | 'image' | 'video';
    content: string;
    uploadedAt: Timestamp;
  };
}

export type GameStatus =
  | 'waiting_for_guesses' // Waiting for both players to submit numbers
  | 'ready_to_reveal' // Both numbers submitted, ready to reveal
  | 'revealing' // Numbers are being revealed
  | 'waiting_for_completion' // Match found, waiting for challenge completion
  | 'completed' // Game fully completed
  | 'abandoned'; // Game abandoned by one or both players

export interface GameMetadata {
  duration: number; // Game duration in seconds
  guessAccuracy: {
    creator: number;
    acceptor: number;
  };
  reactions: {
    surprise: number;
    laugh: number;
    applause: number;
    shock: number;
  };
  spectators: string[]; // User IDs watching the game
}

// =============================================================================
// Notification Types
// =============================================================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export type NotificationType =
  | 'challenge_received'
  | 'challenge_accepted'
  | 'game_ready'
  | 'game_completed'
  | 'friend_request'
  | 'achievement'
  | 'system';

export interface NotificationData {
  challengeId?: string;
  gameId?: string;
  userId?: string;
  achievementId?: string;
  actionUrl?: string;
  [key: string]: unknown;
}

// =============================================================================
// Statistics & Analytics Types
// =============================================================================

export interface GameStatistics {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: string; // YYYY-MM-DD format
  userId?: string; // Optional: user-specific stats
  metrics: StatisticsMetrics;
  createdAt: Timestamp;
}

export interface StatisticsMetrics {
  totalGames: number;
  totalUsers: number;
  totalChallenges: number;
  averageGameDuration: number;
  popularRanges: Array<{
    min: number;
    max: number;
    count: number;
  }>;
  categoryDistribution: Record<ChallengeCategory, number>;
  completionRate: number;
  userRetentionRate: number;
  peakActiveUsers: number;
}

// =============================================================================
// Friendship Types
// =============================================================================

export interface Friendship {
  id: string;
  requesterUid: string;
  addresseeUid: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// =============================================================================
// Utility Types
// =============================================================================

// Firebase Firestore document with ID
export interface FirebaseDocument {
  id: string;
}

// Common timestamp fields for all documents
export interface TimestampFields {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Paginated response type
export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  lastDoc?: unknown;
  total?: number;
}

// Real-time subscription callback
export type SubscriptionCallback<T> = (data: T) => void;

// Firebase error with context
export interface FirebaseError extends Error {
  code: string;
  message: string;
  context?: string;
}

// User search result type
export interface UserSearchResult extends User {
  mutualFriendsCount?: number;
  isFriend?: boolean;
  hasPendingRequest?: boolean;
}

// API search response type
export interface UserSearchResponse {
  users: UserSearchResult[];
  total: number;
  query: string;
}
