import { describe, it, expect } from "vitest";

// Game utility functions (these would normally be in src/lib/game-utils.ts)
const calculateGuessAccuracy = (guess: number, target: number, range: number): number => {
  const difference = Math.abs(guess - target);
  const maxDifference = range;
  const accuracy = Math.max(0, 100 - (difference / maxDifference) * 100);
  return Math.round(accuracy * 100) / 100;
};

const isGuessCorrect = (guess: number, target: number): boolean => {
  return guess === target;
};

const calculatePoints = (accuracy: number, isCorrect: boolean): number => {
  if (isCorrect) {
    return 100; // Bonus points for exact match
  }
  return Math.round(accuracy); // Points based on accuracy
};

describe("Game Utilities", () => {
  describe("calculateGuessAccuracy", () => {
    it("should return 100% for exact match", () => {
      const accuracy = calculateGuessAccuracy(42, 42, 100);
      expect(accuracy).toBe(100);
    });

    it("should return 0% for maximum difference", () => {
      const accuracy = calculateGuessAccuracy(1, 100, 99);
      expect(accuracy).toBe(0);
    });

    it("should return 50% for half the range difference", () => {
      const accuracy = calculateGuessAccuracy(25, 75, 100);
      expect(accuracy).toBe(50);
    });

    it("should handle negative differences", () => {
      const accuracy = calculateGuessAccuracy(75, 25, 100);
      expect(accuracy).toBe(50);
    });

    it("should round to 2 decimal places", () => {
      const accuracy = calculateGuessAccuracy(30, 40, 100);
      expect(accuracy).toBe(90);
    });
  });

  describe("isGuessCorrect", () => {
    it("should return true for exact match", () => {
      const isCorrect = isGuessCorrect(42, 42);
      expect(isCorrect).toBe(true);
    });

    it("should return false for different numbers", () => {
      const isCorrect = isGuessCorrect(42, 43);
      expect(isCorrect).toBe(false);
    });

    it("should handle zero values", () => {
      const isCorrect = isGuessCorrect(0, 0);
      expect(isCorrect).toBe(true);
    });
  });

  describe("calculatePoints", () => {
    it("should return 100 points for correct guess", () => {
      const points = calculatePoints(85.5, true);
      expect(points).toBe(100);
    });

    it("should return accuracy-based points for incorrect guess", () => {
      const points = calculatePoints(85.5, false);
      expect(points).toBe(86);
    });

    it("should round points to nearest integer", () => {
      const points = calculatePoints(85.4, false);
      expect(points).toBe(85);
    });

    it("should return 0 points for 0% accuracy", () => {
      const points = calculatePoints(0, false);
      expect(points).toBe(0);
    });
  });
}); 