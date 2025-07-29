/**
 * E2E Tests for Challenge Lifecycle - Following STP.md Specifications
 *
 * Test Suite: E2E Playwright
 * Coverage: Full user flow with test users and real-time game states
 *
 * Tests follow STP.md specifications:
 * - E2E-01: Login with test user
 * - E2E-02: Create & resolve challenge
 * - E2E-03: Notification badge & toast
 * - E2E-04: Language switch & RTL check
 * - E2E-05: Theme switch
 */

import { test, expect } from '@playwright/test';

test.describe('Challenge Lifecycle E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('E2E-01: Login with test user', async ({ page }) => {
    // Visit login page and enter test credentials
    await page.click('[data-testid="login-button"]');

    // Assert that login modal is opened
    await expect(page.getByTestId('auth-modal')).toBeVisible();

    // Fill in test credentials
    await page.fill('[data-testid="email-input"]', 'testuser1@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');

    // Submit login form
    await page.click('[data-testid="submit-login"]');

    // Assert dashboard loads
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByText('Welcome back')).toBeVisible();

    // Verify user is authenticated
    await expect(page.getByTestId('user-menu')).toBeVisible();
  });

  test('E2E-02: Create & resolve challenge', async ({ page }) => {
    // Login as User1
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'testuser1@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="submit-login"]');

    await expect(page.getByTestId('dashboard')).toBeVisible();

    // User1 creates a challenge
    await page.click('[data-testid="create-challenge-button"]');
    await expect(page.getByTestId('create-challenge-modal')).toBeVisible();

    // Fill challenge details
    await page.fill('[data-testid="challenge-title"]', 'E2E Test Challenge');
    await page.fill(
      '[data-testid="challenge-description"]',
      "What's the chance you'll complete this E2E test?"
    );
    await page.selectOption('[data-testid="challenge-category"]', 'funny');
    await page.selectOption('[data-testid="challenge-difficulty"]', 'easy');

    // Submit challenge
    await page.click('[data-testid="submit-challenge"]');

    // Verify challenge was created
    await expect(page.getByText('E2E Test Challenge')).toBeVisible();
    await expect(page.getByText('Challenge created successfully')).toBeVisible();

    // Open a new context for User2
    const context2 = await page.context().browser()?.newContext();
    const user2Page = await context2?.newPage();

    if (user2Page) {
      // User2 logs in
      await user2Page.goto('/');
      await user2Page.click('[data-testid="login-button"]');
      await user2Page.fill('[data-testid="email-input"]', 'testuser2@example.com');
      await user2Page.fill('[data-testid="password-input"]', 'testpassword123');
      await user2Page.click('[data-testid="submit-login"]');

      await expect(user2Page.getByTestId('dashboard')).toBeVisible();

      // User2 accepts the challenge
      await user2Page.click('[data-testid="available-challenges"]');
      await expect(user2Page.getByText('E2E Test Challenge')).toBeVisible();
      await user2Page.click('[data-testid="accept-challenge"]');

      // Set game range
      await user2Page.fill('[data-testid="range-min"]', '1');
      await user2Page.fill('[data-testid="range-max"]', '10');
      await user2Page.click('[data-testid="confirm-range"]');

      // Both users pick numbers
      await user2Page.fill('[data-testid="user-number"]', '7');
      await user2Page.click('[data-testid="submit-number"]');

      // Switch back to User1
      await page.bringToFront();
      await expect(page.getByText('Pick your number')).toBeVisible();
      await page.fill('[data-testid="user-number"]', '7');
      await page.click('[data-testid="submit-number"]');

      // Numbers are revealed and result is asserted
      await expect(page.getByText("It's a match!")).toBeVisible();
      await expect(user2Page.getByText("It's a match!")).toBeVisible();

      // Verify challenge must be completed
      await expect(page.getByText('Time to complete the challenge!')).toBeVisible();

      await context2?.close();
    }
  });

  test('E2E-03: Notification badge & toast', async ({ page }) => {
    // Login as test user
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'testuser1@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="submit-login"]');

    await expect(page.getByTestId('dashboard')).toBeVisible();

    // Trigger notification event (simulate receiving a challenge)
    // This would typically involve another user creating a challenge for this user

    // Assert notification bell count updates
    await expect(page.getByTestId('notification-bell')).toBeVisible();
    await expect(page.getByTestId('notification-count')).toHaveText('1');

    // Assert in-app toast shows
    await expect(page.getByTestId('notification-toast')).toBeVisible();
    await expect(page.getByText('New challenge received!')).toBeVisible();

    // Click notification to view details
    await page.click('[data-testid="notification-bell"]');
    await expect(page.getByTestId('notifications-panel')).toBeVisible();
  });

  test.skip('E2E-04: Language switch & RTL check', async ({ page }) => {
    // TODO: Implement RTL language support
    // This test is skipped until RTL functionality is implemented

    // Login as test user
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'testuser1@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="submit-login"]');

    // Toggle language to Hebrew
    await page.click('[data-testid="language-toggle"]');
    await page.selectOption('[data-testid="language-select"]', 'he');

    // Verify layout direction changes to RTL
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Verify content updates to Hebrew
    await expect(page.getByText('ברוכים הבאים')).toBeVisible(); // "Welcome" in Hebrew

    // Verify navigation items are in correct RTL order
    const navItems = await page.locator('[data-testid="nav-item"]').all();
    expect(navItems.length).toBeGreaterThan(0);
  });

  test('E2E-05: Theme switch', async ({ page }) => {
    // Toggle theme to dark mode
    await page.click('[data-testid="theme-toggle"]');

    // Verify dark theme class is applied
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Verify theme is persisted on reload
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle back to light theme
    await page.click('[data-testid="theme-toggle"]');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test.skip('E2E-06: Retry logic on failed FCM', async ({ page }) => {
    // TODO: Implement FCM retry logic testing
    // This test is skipped until FCM retry functionality is implemented

    // Simulate offline scenario
    await page.context().setOffline(true);

    // Trigger notification that should fail
    // Verify it gets queued for retry

    // Simulate going back online
    await page.context().setOffline(false);

    // Verify retry queue processes notifications
    await expect(page.getByTestId('notification-toast')).toBeVisible();
  });

  test('E2E-07: Session persists on reload', async ({ page }) => {
    // Login as test user
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'testuser1@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="submit-login"]');

    await expect(page.getByTestId('dashboard')).toBeVisible();

    // Reload the application
    await page.reload();

    // Assert user is still logged in
    await expect(page.getByTestId('dashboard')).toBeVisible();
    await expect(page.getByTestId('user-menu')).toBeVisible();
    await expect(page.getByTestId('login-button')).not.toBeVisible();
  });

  test.skip('E2E-08: Firebase write blocked', async ({ page }) => {
    // TODO: Implement Firebase security rule testing
    // This test is skipped until Firebase security rules are fully configured

    // Login as test user
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'testuser1@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="submit-login"]');

    // Attempt to write to forbidden path
    // This would require access to the Firebase client in the browser context

    // Assert 403 error or appropriate security response
    await expect(page.getByText('Access denied')).toBeVisible();
  });
});

test.describe('Challenge Lifecycle Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('I-01: Challenge creation & sync', async ({ page, context }) => {
    // User1 creates challenge
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'testuser1@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword123');
    await page.click('[data-testid="submit-login"]');

    // Create new challenge
    await page.click('[data-testid="create-challenge-button"]');
    await page.fill('[data-testid="challenge-title"]', 'Integration Test Challenge');
    await page.fill('[data-testid="challenge-description"]', 'Test real-time sync');
    await page.selectOption('[data-testid="challenge-category"]', 'funny');
    await page.click('[data-testid="submit-challenge"]');

    // Open second browser context for User2
    const user2Context = await context.browser()?.newContext();
    const user2Page = await user2Context?.newPage();

    if (user2Page) {
      await user2Page.goto('/');
      await user2Page.click('[data-testid="login-button"]');
      await user2Page.fill('[data-testid="email-input"]', 'testuser2@example.com');
      await user2Page.fill('[data-testid="password-input"]', 'testpassword123');
      await user2Page.click('[data-testid="submit-login"]');

      // Verify User2 receives the challenge instantly via real-time DB
      await expect(user2Page.getByText('Integration Test Challenge')).toBeVisible({
        timeout: 10000,
      });

      await user2Context?.close();
    }
  });

  test.skip('I-02: Push notification delivered', async () => {
    // TODO: Implement FCM testing
    // This test is skipped until FCM integration is completed
    // Trigger FCM notification
    // Check it reaches the user
  });

  test.skip('I-03: Challenge read only by owner', async () => {
    // TODO: Implement security testing
    // This test is skipped until proper authorization is implemented
    // Login as User1
    // Create private challenge
    // Login as User2
    // Verify User2 cannot access User1's private challenges
  });
});
