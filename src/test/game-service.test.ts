import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameService } from '@/lib/gameService';
import { addDoc, updateDoc, getDoc, getDocs } from 'firebase/firestore';

// Mock Firebase functions
const mockAddDoc = vi.mocked(addDoc);
const mockUpdateDoc = vi.mocked(updateDoc);
const mockGetDoc = vi.mocked(getDoc);
const mockGetDocs = vi.mocked(getDocs);

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  doc: vi.fn(() => ({})),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
}));

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    vi.clearAllMocks();
    gameService = new GameService();
  });

  describe('createChallenge', () => {
    it('should create a new challenge with correct data', async () => {
      const mockDocRef = { id: 'challenge-123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef);

      const result = await gameService.createChallenge('user1', 'user2', 'Test challenge');

      expect(addDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          fromUser: 'user1',
          toUser: 'user2',
          description: 'Test challenge',
          status: 'pending',
          createdAt: expect.any(Date),
        }
      );
      expect(result).toBe('challenge-123');
    });
  });

  describe('acceptChallenge', () => {
    it('should accept a challenge and set range', async () => {
      const mockChallengeData = {
        fromUser: 'user1',
        toUser: 'user2',
        description: 'Test challenge',
        status: 'pending',
      };
      
      mockGetDoc.mockResolvedValue({
        data: () => mockChallengeData,
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      mockAddDoc.mockResolvedValue({ id: 'session-123' });

      await gameService.acceptChallenge('challenge-123', { min: 1, max: 10 });

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          status: 'accepted',
          range: { min: 1, max: 10 },
        }
      );
    });
  });

  describe('submitNumber', () => {
    it('should submit a number for a challenge', async () => {
      const mockChallengeData = {
        fromUser: 'user1',
        toUser: 'user2',
        description: 'Test challenge',
        status: 'accepted',
        numbers: {},
      };
      
      mockGetDoc.mockResolvedValue({
        data: () => mockChallengeData,
      });
      mockUpdateDoc.mockResolvedValue(undefined);

      await gameService.submitNumber('challenge-123', 'user1', 5);

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          numbers: { user1: 5 },
          status: 'active',
        }
      );
    });

    it('should calculate result when both players have submitted numbers', async () => {
      const mockChallengeData = {
        fromUser: 'user1',
        toUser: 'user2',
        description: 'Test challenge',
        status: 'accepted',
        numbers: { user1: 5 },
      };
      
      mockGetDoc.mockResolvedValue({
        data: () => mockChallengeData,
      });
      mockUpdateDoc.mockResolvedValue(undefined);
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{ id: 'session-123' }],
      });

      await gameService.submitNumber('challenge-123', 'user2', 5);

      // Should call calculateResult which updates the challenge status
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          status: 'completed',
          result: 'match',
          completedAt: expect.any(Date),
        }
      );
    });
  });

  describe('rejectChallenge', () => {
    it('should reject a challenge', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);

      await gameService.rejectChallenge('challenge-123');

      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.any(Object),
        {
          status: 'rejected',
        }
      );
    });
  });
}); 