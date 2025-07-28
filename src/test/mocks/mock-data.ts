import { User } from 'firebase/auth';
import { vi } from 'vitest';

// Mock user data
export const mockUsers = {
  user1: {
    uid: 'user-1',
    email: 'user1@example.com',
    displayName: 'User One',
    photoURL: 'https://example.com/avatar1.jpg',
  },
  user2: {
    uid: 'user-2',
    email: 'user2@example.com',
    displayName: 'User Two',
    photoURL: 'https://example.com/avatar2.jpg',
  },
  admin: {
    uid: 'admin-1',
    email: 'admin@example.com',
    displayName: 'Admin User',
    photoURL: 'https://example.com/admin.jpg',
  },
};

// Mock challenge data
export const mockChallenges = {
  active: {
    id: 'challenge-1',
    title: 'Guess the Number',
    description: 'Can you guess the number between 1 and 100?',
    creatorId: 'user-1',
    targetNumber: 42,
    createdAt: '2025-01-01T10:00:00Z',
    expiresAt: '2025-01-02T10:00:00Z',
    status: 'active',
    participants: ['user-1', 'user-2'],
    responses: [
      {
        userId: 'user-2',
        guess: 35,
        submittedAt: '2025-01-01T11:00:00Z',
      },
    ],
  },
  expired: {
    id: 'challenge-2',
    title: "Time's Up",
    description: 'This challenge has expired',
    creatorId: 'user-1',
    targetNumber: 7,
    createdAt: '2025-01-01T00:00:00Z',
    expiresAt: '2025-01-01T01:00:00Z',
    status: 'expired',
    participants: ['user-1'],
    responses: [],
  },
  completed: {
    id: 'challenge-3',
    title: 'Completed Challenge',
    description: 'This challenge has been completed',
    creatorId: 'user-2',
    targetNumber: 15,
    createdAt: '2025-01-01T10:00:00Z',
    expiresAt: '2025-01-02T10:00:00Z',
    status: 'completed',
    participants: ['user-1', 'user-2'],
    responses: [
      {
        userId: 'user-1',
        guess: 15,
        submittedAt: '2025-01-01T11:00:00Z',
        isCorrect: true,
      },
    ],
    winner: 'user-1',
  },
};

// Mock notification data
export const mockNotifications = {
  newChallenge: {
    id: 'notif-1',
    userId: 'user-2',
    type: 'new_challenge',
    title: 'New Challenge Available',
    message: 'User One has created a new challenge: Guess the Number',
    data: {
      challengeId: 'challenge-1',
      creatorId: 'user-1',
    },
    read: false,
    createdAt: '2025-01-01T10:05:00Z',
  },
  challengeResponse: {
    id: 'notif-2',
    userId: 'user-1',
    type: 'challenge_response',
    title: 'Challenge Response',
    message: 'User Two has responded to your challenge',
    data: {
      challengeId: 'challenge-1',
      responderId: 'user-2',
    },
    read: false,
    createdAt: '2025-01-01T11:05:00Z',
  },
  challengeWon: {
    id: 'notif-3',
    userId: 'user-1',
    type: 'challenge_won',
    title: 'Congratulations!',
    message: 'You won the challenge: Completed Challenge',
    data: {
      challengeId: 'challenge-3',
    },
    read: false,
    createdAt: '2025-01-01T12:00:00Z',
  },
};

// Mock game statistics
export const mockStats = {
  user1: {
    userId: 'user-1',
    totalChallenges: 5,
    challengesWon: 3,
    challengesLost: 2,
    averageGuessAccuracy: 85.5,
    totalPoints: 150,
    rank: 2,
  },
  user2: {
    userId: 'user-2',
    totalChallenges: 3,
    challengesWon: 1,
    challengesLost: 2,
    averageGuessAccuracy: 72.3,
    totalPoints: 75,
    rank: 5,
  },
};

// Helper functions to generate mock data
export const createMockUser = (overrides = {}): User =>
  ({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: '2025-01-01T00:00:00Z',
      lastSignInTime: '2025-01-01T10:00:00Z',
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    phoneNumber: null,
    providerId: 'password',
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    ...overrides,
  }) as User;

export const createMockChallenge = (overrides = {}) => ({
  id: 'test-challenge-id',
  title: 'Test Challenge',
  description: 'This is a test challenge',
  creatorId: 'test-user-id',
  targetNumber: 42,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  status: 'active',
  participants: [],
  responses: [],
  ...overrides,
});

export const createMockNotification = (overrides = {}) => ({
  id: 'test-notification-id',
  userId: 'test-user-id',
  type: 'new_challenge',
  title: 'Test Notification',
  message: 'This is a test notification',
  data: {},
  read: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Mock Firebase responses
export const mockFirebaseResponses = {
  auth: {
    currentUser: createMockUser(),
    onAuthStateChanged: vi.fn(),
  },
  firestore: {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    onSnapshot: vi.fn(),
  },
};
