import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Challenge, GameSession } from '@/types/challenge';

/**
 * Game Service - Handles all core game logic and Firebase interactions
 */
export class GameService {
  private challengesCollection = collection(db, 'challenges');
  private sessionsCollection = collection(db, 'gameSessions');

  /**
   * Create a new challenge
   */
  async createChallenge(fromUser: string, toUser: string, description: string): Promise<string> {
    const challengeData = {
      fromUser,
      toUser,
      description,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(this.challengesCollection, challengeData);
    return docRef.id;
  }

  /**
   * Accept a challenge and set the number range
   */
  async acceptChallenge(challengeId: string, range: { min: number; max: number }): Promise<void> {
    const challengeRef = doc(this.challengesCollection, challengeId);
    await updateDoc(challengeRef, {
      status: 'accepted',
      range,
    });

    // Create a game session
    const challengeDoc = await getDoc(challengeRef);
    const challengeData = challengeDoc.data() as Challenge;
    
    await addDoc(this.sessionsCollection, {
      challengeId,
      players: [challengeData.fromUser, challengeData.toUser],
      status: 'waiting',
      numbers: {},
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Reject a challenge
   */
  async rejectChallenge(challengeId: string): Promise<void> {
    const challengeRef = doc(this.challengesCollection, challengeId);
    await updateDoc(challengeRef, {
      status: 'rejected',
    });
  }

  /**
   * Submit a number for a challenge
   */
  async submitNumber(challengeId: string, userId: string, number: number): Promise<void> {
    // Update the challenge with the number
    const challengeRef = doc(this.challengesCollection, challengeId);
    const challengeDoc = await getDoc(challengeRef);
    const challengeData = challengeDoc.data() as Challenge;

    const numbers = challengeData.numbers || {};
    (numbers as Record<string, number>)[userId] = number;

    await updateDoc(challengeRef, {
      numbers,
      status: 'active',
    });

    // Check if both players have submitted numbers
    if (Object.keys(numbers).length === 2) {
      await this.calculateResult(challengeId, numbers);
    }
  }

  /**
   * Calculate the result of a challenge
   */
  private async calculateResult(challengeId: string, numbers: Record<string, number>): Promise<void> {
    const challengeRef = doc(this.challengesCollection, challengeId);

    const numberValues = Object.values(numbers);
    const isMatch = numberValues[0] === numberValues[1];

    await updateDoc(challengeRef, {
      status: 'completed',
      result: isMatch ? 'match' : 'no_match',
      completedAt: serverTimestamp(),
    });

    // Update game session
    const sessionQuery = query(
      this.sessionsCollection,
      where('challengeId', '==', challengeId)
    );
    const sessionDocs = await getDocs(sessionQuery);
    if (!sessionDocs.empty && sessionDocs.docs[0]) {
      const sessionRef = doc(this.sessionsCollection, sessionDocs.docs[0].id);
      await updateDoc(sessionRef, {
        status: 'completed',
        result: isMatch,
        numbers,
      });
    }
  }

  /**
   * Get challenges for a user (incoming, outgoing, or all)
   */
  getChallengesForUser(userId: string, type: 'incoming' | 'outgoing' | 'all' = 'all') {
    let q;
    
    switch (type) {
      case 'incoming':
        q = query(
          this.challengesCollection,
          where('toUser', '==', userId),
          orderBy('createdAt', 'desc')
        );
        break;
      case 'outgoing':
        q = query(
          this.challengesCollection,
          where('fromUser', '==', userId),
          orderBy('createdAt', 'desc')
        );
        break;
      default:
        q = query(
          this.challengesCollection,
          where('toUser', '==', userId),
          orderBy('createdAt', 'desc')
        );
    }

    return onSnapshot(q, (snapshot) => {
      const challenges: Challenge[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        challenges.push({
          id: doc.id,
          fromUser: data.fromUser,
          toUser: data.toUser,
          description: data.description,
          status: data.status,
          range: data.range,
          numbers: data.numbers,
          result: data.result,
          createdAt: data.createdAt?.toDate() || new Date(),
          completedAt: data.completedAt?.toDate(),
        });
      });
      return challenges;
    });
  }

  /**
   * Get a specific challenge by ID
   */
  async getChallenge(challengeId: string): Promise<Challenge | null> {
    const challengeRef = doc(this.challengesCollection, challengeId);
    const challengeDoc = await getDoc(challengeRef);
    
    if (!challengeDoc.exists()) {
      return null;
    }

    const data = challengeDoc.data();
    return {
      id: challengeDoc.id,
      fromUser: data.fromUser,
      toUser: data.toUser,
      description: data.description,
      status: data.status,
      range: data.range,
      numbers: data.numbers,
      result: data.result,
      createdAt: data.createdAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
    };
  }

  /**
   * Listen to real-time updates for a specific challenge
   */
  subscribeToChallenge(challengeId: string, callback: (challenge: Challenge | null) => void) { // eslint-disable-line no-unused-vars
    const challengeRef = doc(this.challengesCollection, challengeId);
    
    return onSnapshot(challengeRef, (doc) => {
      if (!doc.exists()) {
        callback(null);
        return;
      }

      const data = doc.data();
      const challenge: Challenge = {
        id: doc.id,
        fromUser: data.fromUser,
        toUser: data.toUser,
        description: data.description,
        status: data.status,
        range: data.range,
        numbers: data.numbers,
        result: data.result,
        createdAt: data.createdAt?.toDate() || new Date(),
        completedAt: data.completedAt?.toDate(),
      };
      
      callback(challenge);
    });
  }

  /**
   * Get game session for a challenge
   */
  async getGameSession(challengeId: string): Promise<GameSession | null> {
    const sessionQuery = query(
      this.sessionsCollection,
      where('challengeId', '==', challengeId)
    );
    const sessionDocs = await getDocs(sessionQuery);
    
    if (sessionDocs.empty) {
      return null;
    }

    const doc = sessionDocs.docs[0];
    if (!doc) return null;
    
    const data = doc.data();
    
    return {
      id: doc.id,
      challengeId: data.challengeId,
      players: data.players,
      status: data.status,
      numbers: data.numbers || {},
      result: data.result,
    };
  }
}

// Export singleton instance
export const gameService = new GameService(); 