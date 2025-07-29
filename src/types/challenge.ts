export interface User {
  id: string;
  username: string;
}

export interface Challenge {
  id: string;
  from_user: string;
  to_user: string;
  description: string;
  status: 'pending' | 'accepted' | 'active' | 'completed';
  range?: { min: number; max: number };
  numbers?: { from_user: number; to_user: number };
  result?: 'match' | 'no_match';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  resolved_at?: string;
}

export interface GameSession {
  id: string;
  challengeId: string;
  players: string[];
  status: 'waiting' | 'active' | 'completed';
  numbers: Record<string, number>;
  result?: boolean;
}

export interface MockGameState {
  currentUser: User;
  challenges: Challenge[];
}
