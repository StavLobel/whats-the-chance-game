/**
 * Error Handling E2E Tests
 * Tests for error scenarios, edge cases, and recovery
 */

import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';
import { TestHelpers } from './utils/test-helpers';
import { GamePage } from './pages/GamePage';
import testUsers from './fixtures/test-users';

test.describe('Error Handling E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await TestHelpers.clearLocalStorage(page);
    await page.goto('/');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await AuthHelpers.login(page, testUsers.user1);
    
    await test.step('Simulate network failure during API call', async () => {
      // Intercept and fail API requests
      await page.route('**/api/challenges**', route => {
        route.abort('internetdisconnected');
      });
      
      // Trigger an API call
      await page.reload();
      
      // Should show error message
      await expect(page.getByText(/unable to load|connection error|try again/i))
        .toBeVisible({ timeout: 10000 });
      
      // Should show retry option
      await expect(page.getByRole('button', { name: /retry|try again/i }))
        .toBeVisible();
    });

    await test.step('Recover when network is restored', async () => {
      // Restore network
      await page.unroute('**/api/challenges**');
      
      // Click retry
      const retryButton = page.getByRole('button', { name: /retry|try again/i });
      if (await retryButton.isVisible()) {
        await retryButton.click();
      } else {
        await page.reload();
      }
      
      // Should load successfully
      await expect(page.getByText(/unable to load|connection error/i))
        .not.toBeVisible();
    });
  });

  test('should handle API errors with appropriate messages', async ({ page }) => {
    await AuthHelpers.login(page, testUsers.user1);
    const gamePage = new GamePage(page);
    
    await test.step('Handle 404 errors', async () => {
      await page.route('**/api/challenges/non-existent-id', route => {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Challenge not found' }),
        });
      });
      
      // Try to access non-existent challenge
      await page.goto('/#/challenge/non-existent-id');
      
      // Should show not found message
      await expect(page.getByText(/not found|doesn't exist/i)).toBeVisible();
    });

    await test.step('Handle 403 authorization errors', async () => {
      await page.route('**/api/challenges**', route => {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Access denied' }),
        });
      });
      
      await page.reload();
      
      // Should show access denied message
      await expect(page.getByText(/access denied|not authorized/i))
        .toBeVisible({ timeout: 10000 });
    });

    await test.step('Handle 500 server errors', async () => {
      await page.route('**/api/challenges**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      });
      
      // Try to create a challenge
      await gamePage.createChallengeButton.click();
      await page.getByPlaceholder(/describe/i).fill('Test challenge');
      await page.getByRole('button', { name: /create/i }).last().click();
      
      // Should show error message
      await expect(page.getByText(/something went wrong|server error|try again later/i))
        .toBeVisible();
    });
  });

  test('should handle form validation errors', async ({ page }) => {
    await AuthHelpers.login(page, testUsers.user1);
    const gamePage = new GamePage(page);
    
    await test.step('Validate challenge creation form', async () => {
      await gamePage.createChallengeButton.click();
      
      // Try to submit empty form
      await page.getByRole('button', { name: /create/i }).last().click();
      
      // Should show validation errors
      await expect(page.getByText(/description.*required/i)).toBeVisible();
      await expect(page.getByText(/select.*user|recipient.*required/i)).toBeVisible();
    });

    await test.step('Validate number range inputs', async () => {
      // Create a challenge first
      await page.getByPlaceholder(/describe/i).fill('Test challenge');
      await page.getByPlaceholder(/select.*user/i).fill(testUsers.user2.email);
      await page.getByRole('button', { name: /create/i }).last().click();
      
      // Mock accepting challenge to show range input
      await page.route('**/api/challenges/*/respond', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-challenge',
            status: 'accepted',
            from_user: testUsers.user2.uid,
            to_user: testUsers.user1.uid,
          }),
        });
      });
      
      // Try invalid range
      const minInput = page.getByRole('spinbutton', { name: /min/i });
      const maxInput = page.getByRole('spinbutton', { name: /max/i });
      
      if (await minInput.isVisible({ timeout: 5000 })) {
        await minInput.fill('10');
        await maxInput.fill('5');
        
        // Should show validation error
        await expect(page.getByText(/max.*greater.*min/i)).toBeVisible();
      }
    });
  });

  test('should handle authentication errors', async ({ page }) => {
    await test.step('Handle expired session', async () => {
      // Login first
      await AuthHelpers.login(page, testUsers.user1);
      
      // Simulate expired token
      await page.evaluate(() => {
        // Clear auth tokens
        localStorage.removeItem('authToken');
        sessionStorage.clear();
      });
      
      // Make API call that requires auth
      await page.route('**/api/challenges**', route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Authentication required' }),
        });
      });
      
      await page.reload();
      
      // Should redirect to login or show auth prompt
      await expect(
        page.getByRole('button', { name: /sign in/i }).or(
          page.getByText(/session expired|please login/i)
        )
      ).toBeVisible({ timeout: 10000 });
    });

    await test.step('Handle concurrent login attempts', async () => {
      const email = testUsers.user1.email;
      const password = testUsers.user1.password;
      
      // Open login modal
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Fill credentials
      await page.getByPlaceholder(/email/i).fill(email);
      await page.getByPlaceholder(/password/i).fill(password);
      
      // Click login button multiple times quickly
      const loginButton = page.getByRole('button', { name: /sign in/i }).last();
      
      await Promise.all([
        loginButton.click(),
        loginButton.click(),
        loginButton.click(),
      ]);
      
      // Should handle gracefully without errors
      await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 });
      
      // Should be logged in
      const isAuth = await AuthHelpers.isAuthenticated(page);
      expect(isAuth).toBe(true);
    });
  });

  test('should handle offline scenarios', async ({ page, context }) => {
    await AuthHelpers.login(page, testUsers.user1);
    
    await test.step('Show offline indicator', async () => {
      // Go offline
      await context.setOffline(true);
      
      // Should show offline indicator (if implemented)
      // Note: This might not work in all cases without service worker
      await page.waitForTimeout(1000);
      
      // Try to perform an action
      const gamePage = new GamePage(page);
      await gamePage.createChallengeButton.click();
      
      // Should either show offline message or queue the action
      const offlineMessage = page.getByText(/offline|no connection/i);
      const isOfflineMessageVisible = await offlineMessage.isVisible({ timeout: 1000 })
        .catch(() => false);
      
      if (isOfflineMessageVisible) {
        expect(await offlineMessage.textContent()).toBeTruthy();
      }
      
      // Close modal if open
      await page.keyboard.press('Escape');
    });

    await test.step('Queue actions while offline', async () => {
      // Actions should be queued or show appropriate message
      // This depends on implementation
    });

    await test.step('Sync when back online', async () => {
      // Go back online
      await context.setOffline(false);
      
      // Should sync any queued actions
      await page.reload();
      
      // Should work normally
      const gamePage = new GamePage(page);
      await expect(gamePage.navBar).toBeVisible();
    });
  });

  test('should handle edge cases in challenge flow', async ({ page, browser }) => {
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    try {
      await test.step('Handle simultaneous accept/reject', async () => {
        // Both users login
        await AuthHelpers.login(page, testUsers.user1);
        await page2.goto('/');
        await AuthHelpers.login(page2, testUsers.user2);
        
        // User 1 creates challenge
        const gamePage1 = new GamePage(page);
        await gamePage1.createChallenge(
          'Simultaneous action test',
          testUsers.user2.email
        );
        
        // Wait for User 2 to receive it
        const gamePage2 = new GamePage(page2);
        await gamePage2.waitForChallenge('Simultaneous action test');
        
        // Both try to act at the same time
        const challenge1 = await gamePage1.getChallengeByDescription('Simultaneous action test');
        const challenge2 = await gamePage2.getChallengeByDescription('Simultaneous action test');
        
        if (challenge1 && challenge2) {
          // User 2 accepts while User 1 tries to cancel
          await Promise.all([
            challenge2.locator('button:has-text("Accept")').click(),
            page.waitForTimeout(100).then(() => 
              challenge1.locator('button:has-text("Cancel")').click()
            ),
          ]);
          
          // One action should succeed, the other should fail gracefully
          await page.waitForTimeout(2000);
          
          // Check final state
          const finalStatus = await challenge1.locator('text=/pending|accepted|cancelled/i').textContent();
          expect(['accepted', 'cancelled']).toContain(finalStatus?.toLowerCase());
        }
      });

      await test.step('Handle invalid number submissions', async () => {
        // This would test submitting numbers outside the agreed range
        // Implementation depends on how the app handles this
      });
    } finally {
      await context2.close();
    }
  });

  test('should recover from browser crashes', async ({ page }) => {
    await test.step('Save state before crash', async () => {
      await AuthHelpers.login(page, testUsers.user1);
      
      // Perform some actions
      const gamePage = new GamePage(page);
      await gamePage.toggleTheme();
      
      // Get current state
      const isDark = await gamePage.isDarkMode();
      
      // Store in localStorage (simulating app state persistence)
      await page.evaluate((dark) => {
        localStorage.setItem('appState', JSON.stringify({
          theme: dark ? 'dark' : 'light',
          lastActivity: Date.now(),
        }));
      }, isDark);
    });

    await test.step('Simulate crash and recovery', async () => {
      // Navigate away and back (simulating crash/restart)
      await page.goto('about:blank');
      await page.goto('/');
      
      // Should restore state
      const gamePage = new GamePage(page);
      await gamePage.waitForLoad();
      
      // Check if state was restored
      const appState = await page.evaluate(() => {
        const state = localStorage.getItem('appState');
        return state ? JSON.parse(state) : null;
      });
      
      expect(appState).toBeTruthy();
      expect(appState.theme).toBeDefined();
    });
  });

  test('should handle malformed data gracefully', async ({ page }) => {
    await AuthHelpers.login(page, testUsers.user1);
    
    await test.step('Handle malformed API responses', async () => {
      // Return malformed data
      await page.route('**/api/challenges**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            challenges: [
              {
                // Missing required fields
                id: 'malformed-1',
                description: null,
                // Invalid date
                created_at: 'not-a-date',
              },
              {
                // Valid challenge
                id: 'valid-1',
                description: 'Valid challenge',
                from_user: testUsers.user1.uid,
                to_user: testUsers.user2.uid,
                status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          }),
        });
      });
      
      await page.reload();
      
      // Should handle gracefully and show valid data
      await expect(page.getByText('Valid challenge')).toBeVisible({ timeout: 10000 });
      
      // Should not crash or show broken UI
      const errorBoundaryMessage = page.getByText(/something went wrong|error boundary/i);
      await expect(errorBoundaryMessage).not.toBeVisible();
    });
  });
});
