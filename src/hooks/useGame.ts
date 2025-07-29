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

    const loadChallenges = async () => {
      try {
        // Fetch challenges from the backend API
        // Use localhost for browser requests since browser runs on host machine
        const apiUrl = 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/challenges/test?user_id=${user.uid}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const challengesData = await response.json();
        setChallenges(challengesData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load challenges:', err);
        setError(err instanceof Error ? err.message : 'Failed to load challenges');
        setLoading(false);
      }
    };

    loadChallenges();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(loadChallenges, 30000);

    return () => {
      clearInterval(interval);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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