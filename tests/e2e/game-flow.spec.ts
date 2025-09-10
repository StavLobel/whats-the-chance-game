/**
 * Game Flow E2E Tests
 * Tests for complete challenge creation and resolution flows
 */

import { test, expect, Page } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';
import { TestHelpers } from './utils/test-helpers';
import { StorageHelpers } from './utils/storage-helpers';
import { GamePage } from './pages/GamePage';
import testUsers from './fixtures/test-users';

test.describe('Complete Game Flow E2E Tests', () => {
  let gamePage: GamePage;
  
  test.beforeEach(async ({ page }) => {
    // Set up test storage before any page operations
    await StorageHelpers.setupTestStorage(page);
    
    gamePage = new GamePage(page);
    await gamePage.goto();
    await gamePage.waitForLoad();
    
    // Clear storage after page is ready
    await StorageHelpers.clearStorage(page);
  });

  test('should complete full challenge lifecycle with matching numbers', async ({ browser }) => {
    const challengeDescription = `E2E Test Challenge ${Date.now()}`;
    
    // Create two browser contexts for two users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    const gamePage1 = new GamePage(page1);
    const gamePage2 = new GamePage(page2);
    
    try {
      await test.step('Setup: Login both users', async () => {
        // User 1 login
        await gamePage1.goto();
        await AuthHelpers.login(page1, testUsers.user1);
        
        // User 2 login
        await gamePage2.goto();
        await AuthHelpers.login(page2, testUsers.user2);
      });

      await test.step('User 1 creates a challenge', async () => {
        await gamePage1.createChallenge(challengeDescription, testUsers.user2.email);
        
        // Verify challenge appears in User 1's active challenges
        await gamePage1.waitForChallenge(challengeDescription);
        await gamePage1.verifyChallengeStatus(challengeDescription, 'pending');
      });

      await test.step('User 2 receives and accepts the challenge', async () => {
        // Wait for real-time update
        await gamePage2.waitForChallenge(challengeDescription);
        
        // Find and click on the challenge
        const challenge = await gamePage2.getChallengeByDescription(challengeDescription);
        await challenge?.click();
        
        // Accept with range 1-10
        await gamePage2.acceptChallenge(1, 10);
        
        // Verify status changed to accepted
        await gamePage2.verifyChallengeStatus(challengeDescription, 'accepted');
      });

      await test.step('Both users submit matching numbers', async () => {
        // User 2 submits number 7
        const challenge2 = await gamePage2.getChallengeByDescription(challengeDescription);
        await challenge2?.click();
        await gamePage2.submitNumber(7);
        
        // User 1 should see the challenge is waiting for their number
        await page1.reload(); // Refresh to get latest state
        const challenge1 = await gamePage1.getChallengeByDescription(challengeDescription);
        await challenge1?.click();
        await gamePage1.submitNumber(7);
      });

      await test.step('Verify match result', async () => {
        // Both users should see the match result
        await expect(page1.getByText(/match/i)).toBeVisible({ timeout: 10000 });
        await expect(page2.getByText(/match/i)).toBeVisible({ timeout: 10000 });
        
        // Challenge should be completed
        await gamePage1.switchToTab('past');
        await gamePage1.verifyChallengeStatus(challengeDescription, 'completed');
        
        await gamePage2.switchToTab('past');
        await gamePage2.verifyChallengeStatus(challengeDescription, 'completed');
      });
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should handle challenge rejection', async ({ browser }) => {
    const challengeDescription = `Rejection Test ${Date.now()}`;
    
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    const gamePage1 = new GamePage(page1);
    const gamePage2 = new GamePage(page2);
    
    try {
      await test.step('Setup: Login both users', async () => {
        await gamePage1.goto();
        await AuthHelpers.login(page1, testUsers.user1);
        
        await gamePage2.goto();
        await AuthHelpers.login(page2, testUsers.user2);
      });

      await test.step('User 1 creates a challenge', async () => {
        await gamePage1.createChallenge(challengeDescription, testUsers.user2.email);
        await gamePage1.waitForChallenge(challengeDescription);
      });

      await test.step('User 2 rejects the challenge', async () => {
        await gamePage2.waitForChallenge(challengeDescription);
        
        const challenge = await gamePage2.getChallengeByDescription(challengeDescription);
        await challenge?.click();
        
        await gamePage2.rejectChallenge();
      });

      await test.step('Verify rejection', async () => {
        // Both users should see rejected status
        await page1.reload();
        await gamePage1.verifyChallengeStatus(challengeDescription, 'rejected');
        
        await gamePage2.verifyChallengeStatus(challengeDescription, 'rejected');
      });
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should handle non-matching numbers', async ({ browser }) => {
    const challengeDescription = `No Match Test ${Date.now()}`;
    
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    const gamePage1 = new GamePage(page1);
    const gamePage2 = new GamePage(page2);
    
    try {
      await test.step('Setup and create challenge', async () => {
        await gamePage1.goto();
        await AuthHelpers.login(page1, testUsers.user1);
        
        await gamePage2.goto();
        await AuthHelpers.login(page2, testUsers.user2);
        
        await gamePage1.createChallenge(challengeDescription, testUsers.user2.email);
      });

      await test.step('Accept and submit different numbers', async () => {
        await gamePage2.waitForChallenge(challengeDescription);
        const challenge2 = await gamePage2.getChallengeByDescription(challengeDescription);
        await challenge2?.click();
        await gamePage2.acceptChallenge(1, 10);
        await gamePage2.submitNumber(3);
        
        await page1.reload();
        const challenge1 = await gamePage1.getChallengeByDescription(challengeDescription);
        await challenge1?.click();
        await gamePage1.submitNumber(7);
      });

      await test.step('Verify no match result', async () => {
        await expect(page1.getByText(/no match|didn't match/i)).toBeVisible({ timeout: 10000 });
        await expect(page2.getByText(/no match|didn't match/i)).toBeVisible({ timeout: 10000 });
        
        // Challenge should still be completed
        await gamePage1.switchToTab('past');
        await gamePage1.verifyChallengeStatus(challengeDescription, 'completed');
      });
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should update notification count in real-time', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    const gamePage1 = new GamePage(page1);
    const gamePage2 = new GamePage(page2);
    
    try {
      await test.step('Setup: Login both users', async () => {
        await gamePage1.goto();
        await AuthHelpers.login(page1, testUsers.user1);
        
        await gamePage2.goto();
        await AuthHelpers.login(page2, testUsers.user2);
      });

      await test.step('Check initial notification count', async () => {
        const initialCount = await gamePage2.getNotificationCount();
        expect(initialCount).toBe(0);
      });

      await test.step('Create challenge and verify notification', async () => {
        await gamePage1.createChallenge(
          'Notification Test Challenge',
          testUsers.user2.email
        );
        
        // Wait for notification to appear
        await page2.waitForTimeout(2000);
        
        const newCount = await gamePage2.getNotificationCount();
        expect(newCount).toBeGreaterThan(0);
      });
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('should persist challenge state across sessions', async ({ page }) => {
    const challengeDescription = `Persistence Test ${Date.now()}`;
    
    await test.step('Login and create challenge', async () => {
      await AuthHelpers.login(page, testUsers.user1);
      await gamePage.createChallenge(challengeDescription, testUsers.user2.email);
      await gamePage.waitForChallenge(challengeDescription);
    });

    await test.step('Logout and login again', async () => {
      await AuthHelpers.logout(page);
      await page.reload();
      await AuthHelpers.login(page, testUsers.user1);
    });

    await test.step('Verify challenge still exists', async () => {
      await gamePage.waitForChallenge(challengeDescription);
      await gamePage.verifyChallengeStatus(challengeDescription, 'pending');
    });
  });

  test('should handle concurrent challenge operations', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();
    
    try {
      await test.step('Setup: Login three users', async () => {
        await page1.goto('/');
        await AuthHelpers.login(page1, testUsers.user1);
        
        await page2.goto('/');
        await AuthHelpers.login(page2, testUsers.user2);
        
        // For the third user, we'll reuse admin user
        await page3.goto('/');
        await AuthHelpers.login(page3, testUsers.admin);
      });

      await test.step('Create multiple challenges simultaneously', async () => {
        const gamePage1 = new GamePage(page1);
        const gamePage2 = new GamePage(page2);
        const gamePage3 = new GamePage(page3);
        
        // All users create challenges at the same time
        await Promise.all([
          gamePage1.createChallenge('Concurrent Test 1', testUsers.user2.email),
          gamePage2.createChallenge('Concurrent Test 2', testUsers.admin.email),
          gamePage3.createChallenge('Concurrent Test 3', testUsers.user1.email)
        ]);
      });

      await test.step('Verify all challenges were created', async () => {
        // Each user should have received one challenge
        await page1.reload();
        await page2.reload();
        await page3.reload();
        
        const gamePage1 = new GamePage(page1);
        const gamePage2 = new GamePage(page2);
        const gamePage3 = new GamePage(page3);
        
        const count1 = await gamePage1.getChallengeCount();
        const count2 = await gamePage2.getChallengeCount();
        const count3 = await gamePage3.getChallengeCount();
        
        expect(count1).toBeGreaterThanOrEqual(2); // Created one, received one
        expect(count2).toBeGreaterThanOrEqual(2);
        expect(count3).toBeGreaterThanOrEqual(2);
      });
    } finally {
      await context1.close();
      await context2.close();
      await context3.close();
    }
  });
});
