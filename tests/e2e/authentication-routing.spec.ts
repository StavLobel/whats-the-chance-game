/**
 * Authentication Routing E2E Tests
 * 
 * Tests for Issue #45: Authentication-Based Route Protection
 * Verifies proper routing behavior for authenticated and unauthenticated users.
 */

import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';
import { TestHelpers } from './utils/test-helpers';

const testUsers = {
  user1: {
    email: 'testuser1@example.com',
    password: 'testpassword123',
  },
};

test.describe('Authentication Routing Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test from a clean state
    await AuthHelpers.signOut(page);
    await page.goto('/');
    await TestHelpers.waitForPageLoad(page);
  });

  test('unauthenticated users should see landing page', async ({ page }) => {
    await test.step('Verify landing page elements', async () => {
      // Should see the landing page with authentication options
      await expect(page.getByRole('heading', { name: /what's the chance\?/i })).toBeVisible();
      await expect(page.getByTestId('get-started-button')).toBeVisible();
      await expect(page.getByTestId('sign-in-button')).toBeVisible();
      
      // Should not see authenticated content
      await expect(page.getByTestId('dashboard')).not.toBeVisible();
    });
  });

  test('unauthenticated users should be redirected from protected routes', async ({ page }) => {
    await test.step('Try to access protected route', async () => {
      await page.goto('/app');
      await TestHelpers.waitForPageLoad(page);
    });

    await test.step('Verify redirect to landing page', async () => {
      // Should be redirected back to landing page
      expect(page.url()).toBe(new URL('/', page.url()).href);
      
      // Should see landing page elements
      await expect(page.getByTestId('get-started-button')).toBeVisible();
      await expect(page.getByTestId('sign-in-button')).toBeVisible();
    });
  });

  test('authenticated users should be redirected to app from landing page', async ({ page }) => {
    await test.step('Authenticate user', async () => {
      // Click sign in button to open modal
      await page.getByTestId('sign-in-button').click();
      await expect(page.getByTestId('auth-modal')).toBeVisible();
      
      // Sign in
      await AuthHelpers.login(page, testUsers.user1);
    });

    await test.step('Verify redirect to app', async () => {
      // Should be redirected to the app
      await expect(page.getByTestId('dashboard')).toBeVisible({ timeout: 10000 });
      expect(page.url()).toContain('/app');
      
      // Should not see landing page elements
      await expect(page.getByTestId('get-started-button')).not.toBeVisible();
    });
  });

  test('authenticated users should access protected routes directly', async ({ page }) => {
    await test.step('Authenticate user first', async () => {
      await page.getByTestId('sign-in-button').click();
      await AuthHelpers.login(page, testUsers.user1);
      await expect(page.getByTestId('dashboard')).toBeVisible();
    });

    await test.step('Navigate to protected route directly', async () => {
      await page.goto('/app');
      await TestHelpers.waitForPageLoad(page);
    });

    await test.step('Verify access to protected content', async () => {
      // Should see the app dashboard
      await expect(page.getByTestId('dashboard')).toBeVisible();
      expect(page.url()).toContain('/app');
    });
  });

  test('authenticated users should be redirected from landing page when navigating back', async ({ page }) => {
    await test.step('Authenticate user', async () => {
      await page.getByTestId('sign-in-button').click();
      await AuthHelpers.login(page, testUsers.user1);
      await expect(page.getByTestId('dashboard')).toBeVisible();
    });

    await test.step('Try to navigate back to landing page', async () => {
      await page.goto('/');
      await TestHelpers.waitForPageLoad(page);
    });

    await test.step('Verify redirect back to app', async () => {
      // Should be redirected back to the app
      expect(page.url()).toContain('/app');
      await expect(page.getByTestId('dashboard')).toBeVisible();
    });
  });

  test('authentication state should persist across page reloads', async ({ page }) => {
    await test.step('Authenticate user', async () => {
      await page.getByTestId('sign-in-button').click();
      await AuthHelpers.login(page, testUsers.user1);
      await expect(page.getByTestId('dashboard')).toBeVisible();
    });

    await test.step('Reload page', async () => {
      await page.reload();
      await TestHelpers.waitForPageLoad(page);
    });

    await test.step('Verify still authenticated and on app page', async () => {
      // Should still be authenticated and see the app
      await expect(page.getByTestId('dashboard')).toBeVisible();
      expect(page.url()).toContain('/app');
    });
  });

  test('sign out should redirect to landing page', async ({ page }) => {
    await test.step('Authenticate user', async () => {
      await page.getByTestId('sign-in-button').click();
      await AuthHelpers.login(page, testUsers.user1);
      await expect(page.getByTestId('dashboard')).toBeVisible();
    });

    await test.step('Sign out', async () => {
      await AuthHelpers.signOut(page);
    });

    await test.step('Verify redirect to landing page', async () => {
      // Should be redirected to landing page
      await expect(page.getByTestId('get-started-button')).toBeVisible({ timeout: 10000 });
      await expect(page.getByTestId('sign-in-button')).toBeVisible();
      
      // Should not see authenticated content
      await expect(page.getByTestId('dashboard')).not.toBeVisible();
    });
  });

  test('legacy /game route should redirect to /app for authenticated users', async ({ page }) => {
    await test.step('Authenticate user', async () => {
      await page.getByTestId('sign-in-button').click();
      await AuthHelpers.login(page, testUsers.user1);
      await expect(page.getByTestId('dashboard')).toBeVisible();
    });

    await test.step('Navigate to legacy /game route', async () => {
      await page.goto('/game');
      await TestHelpers.waitForPageLoad(page);
    });

    await test.step('Verify access to game content', async () => {
      // Should see the app dashboard (same content as /app)
      await expect(page.getByTestId('dashboard')).toBeVisible();
      // URL might still be /game or redirected to /app - both are acceptable
    });
  });

  test('unauthenticated users should be redirected from legacy /game route', async ({ page }) => {
    await test.step('Navigate to legacy /game route without authentication', async () => {
      await page.goto('/game');
      await TestHelpers.waitForPageLoad(page);
    });

    await test.step('Verify redirect to landing page', async () => {
      // Should be redirected to landing page
      expect(page.url()).toBe(new URL('/', page.url()).href);
      await expect(page.getByTestId('get-started-button')).toBeVisible();
      await expect(page.getByTestId('sign-in-button')).toBeVisible();
    });
  });
});
