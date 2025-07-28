export interface User {
  id: string;
  username: string;
}

export interface Challenge {
  id: string;
  fromUser: string;
  toUser: string;
  description: string;
  status: 'pending' | 'accepted' | 'active' | 'completed';
  range?: { min: number; max: number };
  numbers?: { fromUser: number; toUser: number };
  result?: 'match' | 'no_match';
  createdAt: Date;
  completedAt?: Date;
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
