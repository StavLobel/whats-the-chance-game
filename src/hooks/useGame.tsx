import { useState, useEffect, useCallback } from 'react';
import { gameService } from '@/lib/gameService';
import { Challenge, GameSession } from '@/types/challenge';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useWebSocket } from './useWebSocket';

export function useGame() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribe, isConnected } = useWebSocket();

  // Load challenges for the current user
  useEffect(() => {
    if (!user?.uid) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Set up real-time listener for challenges
    const unsubscribe = gameService.getChallengesForUser(user.uid, 'all');
    
    // Note: getChallengesForUser returns an unsubscribe function, but we need to handle the data
    // Let's create a proper async method to get challenges once
    const loadChallenges = async () => {
      try {
        // For now, we'll use Firebase directly to get challenges
        // This should be replaced with a proper async method in gameService
        const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        const challengesCollection = collection(db, 'challenges');
        const q = query(
          challengesCollection,
          where('to_user', '==', user.uid),
          orderBy('created_at', 'desc')
        );
        
        const snapshot = await getDocs(q);
        const challenges: Challenge[] = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          challenges.push({
            id: doc.id,
            from_user: data.from_user,
            to_user: data.to_user,
            description: data.description,
            status: data.status,
            range: data.range,
            numbers: data.numbers,
            result: data.result,
            created_at: data.created_at?.toDate() || new Date(),
            updated_at: data.updated_at?.toDate() || new Date(),
            completed_at: data.completed_at?.toDate(),
          });
        });
        
        setChallenges(challenges);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load challenges:', err);
        setError(err instanceof Error ? err.message : 'Failed to load challenges');
        setLoading(false);
      }
    };

    loadChallenges();

    return () => {
      // Cleanup will be handled by the real-time listener if implemented
    };
  }, [user?.uid]);

  // Subscribe to WebSocket events for real-time updates
  useEffect(() => {
    if (!user?.uid || !isConnected) return;

    // Subscribe to challenge updates
    const unsubscribeUpdate = subscribe('challenge_updated', (message) => {
      if (message.type === 'challenge_updated' && message.data) {
        setChallenges(prev => prev.map(c => 
          c.id === message.data.id ? message.data : c
        ));
      }
    });

    // Subscribe to new challenges
    const unsubscribeCreate = subscribe('challenge_created', (message) => {
      if (message.type === 'challenge_created' && message.data) {
        const challenge = message.data;
        // Only add if user is involved
        if (challenge.from_user === user.uid || challenge.to_user === user.uid) {
          setChallenges(prev => [challenge, ...prev]);
          
          // Show notification for incoming challenges
          if (challenge.to_user === user.uid) {
            toast({
              title: 'New challenge! 🎲',
              description: `You've been challenged to: ${challenge.description}`,
              action: (
                <button
                  onClick={() => window.location.href = `/game?challengeId=${challenge.id}`}
                  className="text-sm font-medium"
                >
                  View Challenge
                </button>
              ),
            });
          }
        }
      }
    });

    // Subscribe to challenge completion
    const unsubscribeComplete = subscribe('challenge_completed', (message) => {
      if (message.type === 'challenge_completed' && message.data) {
        // Refresh challenges to get updated data
        const loadChallenges = async () => {
          try {
            const updatedChallenges = await gameService.getChallenges(user.uid);
            setChallenges(updatedChallenges);
          } catch (err) {
            console.error('Failed to refresh challenges:', err);
          }
        };
        loadChallenges();
      }
    });

    return () => {
      unsubscribeUpdate();
      unsubscribeCreate();
      unsubscribeComplete();
    };
  }, [user?.uid, isConnected, subscribe, toast]);

  // Create a new challenge
  const createChallenge = useCallback(
    async (toUser: string, description: string, options?: { 
      difficulty?: string; 
      category?: string;
    }) => {
      if (!user?.uid) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to create challenges',
          variant: 'destructive',
        });
        return null;
      }

      try {
        const challengeId = await gameService.createChallenge(
          user.uid, 
          toUser, 
          description,
          options?.category,
          options?.difficulty
        );
        toast({
          title: 'Challenge sent! 🎲',
          description: `Challenge sent successfully!`,
        });
        return challengeId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create challenge';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [user?.uid, toast]
  );

  // Accept a challenge
  const acceptChallenge = useCallback(
    async (challengeId: string, range: { min: number; max: number }) => {
      try {
        await gameService.acceptChallenge(challengeId, range);
        toast({
          title: 'Challenge accepted! 🎯',
          description: 'You can now pick your number',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to accept challenge';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  // Reject a challenge
  const rejectChallenge = useCallback(
    async (challengeId: string) => {
      try {
        await gameService.rejectChallenge(challengeId);
        toast({
          title: 'Challenge declined',
          description: 'You have declined this challenge',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to reject challenge';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [toast]
  );

  // Submit a number for a challenge
  const submitNumber = useCallback(
    async (challengeId: string, number: number) => {
      if (!user?.uid) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to submit numbers',
          variant: 'destructive',
        });
        return;
      }

      try {
        await gameService.submitNumber(challengeId, user.uid, number);
        toast({
          title: 'Number submitted! 🎲',
          description: 'Waiting for the other player...',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit number';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        throw err;
      }
    },
    [user?.uid, toast]
  );

  // Get a specific challenge
  const getChallenge = useCallback(async (challengeId: string): Promise<Challenge | null> => {
    try {
      return await gameService.getChallenge(challengeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get challenge';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Subscribe to real-time updates for a challenge
  const subscribeToChallenge = useCallback(
    (challengeId: string, callback: (challenge: Challenge | null) => void) => {
      return gameService.subscribeToChallenge(challengeId, callback);
    },
    []
  );

  // Get game session for a challenge
  const getGameSession = useCallback(async (challengeId: string): Promise<GameSession | null> => {
    try {
      return await gameService.getGameSession(challengeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get game session';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Filter challenges by type
  const getIncomingChallenges = useCallback(() => {
    return challenges.filter(c => c.to_user === user?.uid && c.status === 'pending');
  }, [challenges, user?.uid]);

  const getOutgoingChallenges = useCallback(() => {
    return challenges.filter(c => c.from_user === user?.uid);
  }, [challenges, user?.uid]);

  const getActiveChallenges = useCallback(() => {
    return challenges.filter(
      challenge => challenge.status === 'accepted' || challenge.status === 'active'
    );
  }, [challenges]);

  const getCompletedChallenges = useCallback(() => {
    return challenges.filter(challenge => challenge.status === 'completed');
  }, [challenges]);

  return {
    // State
    challenges,
    loading,
    error,

    // Actions
    createChallenge,
    acceptChallenge,
    rejectChallenge,
    submitNumber,

    // Queries
    getChallenge,
    subscribeToChallenge,
    getGameSession,

    // Filtered challenges
    getIncomingChallenges,
    getOutgoingChallenges,
    getActiveChallenges,
    getCompletedChallenges,
  };
}
