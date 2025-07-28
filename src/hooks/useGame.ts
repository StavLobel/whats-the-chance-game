import { useState, useEffect, useCallback } from 'react';
import { gameService } from '@/lib/gameService';
import { Challenge, GameSession } from '@/types/challenge';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useGame() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load challenges for the current user
  useEffect(() => {
    if (!user?.uid) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = gameService.getChallengesForUser(user.uid, 'all');
    
    // Note: The current implementation returns a function, but we need to handle the snapshot
    // For now, we'll use a different approach to get challenges
    const loadChallenges = async () => {
      try {
        // This is a temporary implementation - we'll need to modify the service
        // to properly return challenges from the snapshot
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenges');
        setLoading(false);
      }
    };

    loadChallenges();

    return () => {
      // Cleanup subscription when component unmounts
    };
  }, [user?.uid]);

  // Create a new challenge
  const createChallenge = useCallback(async (toUser: string, description: string) => {
    if (!user?.uid) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create challenges',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const challengeId = await gameService.createChallenge(user.uid, toUser, description);
      toast({
        title: 'Challenge sent! 🎲',
        description: `${toUser} has been challenged to: ${description}`,
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
  }, [user?.uid, toast]);

  // Accept a challenge
  const acceptChallenge = useCallback(async (challengeId: string, range: { min: number; max: number }) => {
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
  }, [toast]);

  // Reject a challenge
  const rejectChallenge = useCallback(async (challengeId: string) => {
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
  }, [toast]);

  // Submit a number for a challenge
  const submitNumber = useCallback(async (challengeId: string, number: number) => {
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
  }, [user?.uid, toast]);

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
  const subscribeToChallenge = useCallback((challengeId: string, callback: (challenge: Challenge | null) => void) => {
    return gameService.subscribeToChallenge(challengeId, callback);
  }, []);

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
    return challenges.filter(challenge => 
      challenge.toUser === user?.uid && challenge.status === 'pending'
    );
  }, [challenges, user?.uid]);

  const getOutgoingChallenges = useCallback(() => {
    return challenges.filter(challenge => 
      challenge.fromUser === user?.uid
    );
  }, [challenges, user?.uid]);

  const getActiveChallenges = useCallback(() => {
    return challenges.filter(challenge => 
      challenge.status === 'accepted' || challenge.status === 'active'
    );
  }, [challenges]);

  const getCompletedChallenges = useCallback(() => {
    return challenges.filter(challenge => 
      challenge.status === 'completed'
    );
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