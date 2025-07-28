import { Challenge, User, MockGameState } from '@/types/challenge';

export const mockUser: User = {
  id: 'user_1',
  username: 'alice',
};

export const mockChallenges: Challenge[] = [
  {
    id: 'ch_001',
    from_user: 'bob',
    to_user: 'alice',
    description: 'עשה עמידת ידיים למשך 30 שניות',
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 'ch_002',
    from_user: 'charlie',
    to_user: 'alice',
    description: 'שיר את השיר האהוב עליך בקול רם',
    status: 'pending',
    created_at: '2024-01-15T09:15:00Z',
  },
  {
    id: 'ch_003',
    from_user: 'alice',
    to_user: 'david',
    description: 'עשה 20 שכיבות סמיכה',
    status: 'accepted',
    range: 10,
    created_at: '2024-01-14T16:45:00Z',
  },
  {
    id: 'ch_004',
    from_user: 'alice',
    to_user: 'emma',
    description: 'רקד במשך דקה אחת',
    status: 'completed',
    range: 25,
    from_number: 13,
    to_number: 13,
    result: 'match',
    created_at: '2024-01-14T14:20:00Z',
  },
  {
    id: 'ch_005',
    from_user: 'frank',
    to_user: 'alice',
    description: 'ספר בדיחה לקבוצה',
    status: 'rejected',
    created_at: '2024-01-14T11:10:00Z',
  },
];

export const mockGameState: MockGameState = {
  currentUser: mockUser,
  challenges: mockChallenges,
};
