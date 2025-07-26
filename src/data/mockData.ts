import { Challenge, User, MockGameState } from "@/types/challenge";

export const mockUser: User = {
  id: "user_1",
  username: "alice"
};

export const mockChallenges: Challenge[] = [
  {
    id: "ch_001",
    from_user: "bob",
    to_user: "alice",
    description: "Do a handstand for 30 seconds",
    status: "pending",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "ch_002", 
    from_user: "charlie",
    to_user: "alice",
    description: "Sing your favorite song loudly",
    status: "pending",
    created_at: "2024-01-15T09:15:00Z"
  },
  {
    id: "ch_003",
    from_user: "alice",
    to_user: "david",
    description: "Do 20 push-ups",
    status: "accepted",
    range: 10,
    created_at: "2024-01-14T16:45:00Z"
  },
  {
    id: "ch_004",
    from_user: "alice",
    to_user: "emma",
    description: "Dance for 1 minute",
    status: "completed",
    range: 25,
    from_number: 13,
    to_number: 13,
    result: "match",
    created_at: "2024-01-14T14:20:00Z"
  },
  {
    id: "ch_005",
    from_user: "frank",
    to_user: "alice",
    description: "Tell a joke to the group",
    status: "rejected",
    created_at: "2024-01-14T11:10:00Z"
  }
];

export const mockGameState: MockGameState = {
  currentUser: mockUser,
  challenges: mockChallenges
};