export interface User {
  id: string;
  username: string;
}

export interface Challenge {
  id: string;
  from_user: string;
  to_user: string;
  description: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'in_progress';
  range?: number;
  from_number?: number;
  to_number?: number;
  created_at: string;
  result?: 'match' | 'no_match';
}

export interface MockGameState {
  currentUser: User;
  challenges: Challenge[];
}
