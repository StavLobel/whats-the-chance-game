/**
 * Authentication E2E Tests
 * Tests for user authentication flows
 */

import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';
import { TestHelpers } from './utils/test-helpers';
import testUsers from './fixtures/test-users';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await TestHelpers.clearLocalStorage(page);
    await TestHelpers.waitForPageLoad(page);
  });

  test('should allow user to sign up with valid credentials', async ({ page }) => {
    const newUser = {
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
      displayName: 'New Test User'
    };

    await test.step('Open sign up form', async () => {
      await page.getByRole('button', { name: /sign in/i }).click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await page.getByRole('tab', { name: /sign up/i }).click();
    });

    await test.step('Fill sign up form', async () => {
      await page.getByPlaceholder(/name/i).fill(newUser.displayName);
      await page.getByPlaceholder(/email/i).fill(newUser.email);
      await page.getByPlaceholder(/password/i).fill(newUser.password);
    });

    await test.step('Submit and verify', async () => {
      await page.getByRole('button', { name: /sign up/i }).last().click();
      
      // Wait for auth to complete
      await page.waitForSelector('[role="dialog"]', { state: 'hidden' });
      
      // Verify user is logged in
      await expect(page.locator('button[aria-haspopup="true"]')).toBeVisible();
      
      // Verify user initial in avatar
      const userButton = page.locator('button[aria-haspopup="true"]').first();
      await expect(userButton).toContainText('N'); // First letter of "New"
    });
  });

  test('should allow user to sign in with existing credentials', async ({ page }) => {
    await test.step('Login with test user', async () => {
      await AuthHelpers.login(page, testUsers.user1);
    });

    await test.step('Verify user is logged in', async () => {
      const isAuth = await AuthHelpers.isAuthenticated(page);
      expect(isAuth).toBe(true);
      
      // Verify user initial
      const userInitial = await AuthHelpers.getCurrentUser(page);
      expect(userInitial).toBe('T'); // First letter of "Test User 1"
    });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await test.step('Try to login with invalid credentials', async () => {
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForSelector('[role="dialog"]');
      
      await page.getByPlaceholder(/email/i).fill('invalid@example.com');
      await page.getByPlaceholder(/password/i).fill('wrongpassword');
      
      await page.getByRole('button', { name: /sign in/i }).last().click();
    });

    await test.step('Verify error message', async () => {
      await expect(page.getByText(/invalid.*credentials|wrong.*password|user.*not.*found/i)).toBeVisible({
        timeout: 5000
      });
      
      // Modal should still be open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    });
  });

  test('should validate sign up form fields', async ({ page }) => {
    await test.step('Open sign up form', async () => {
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.getByRole('tab', { name: /sign up/i }).click();
    });

    await test.step('Test email validation', async () => {
      await page.getByPlaceholder(/email/i).fill('invalid-email');
      await page.getByPlaceholder(/email/i).blur();
      
      // Should show email validation error
      await expect(page.getByText(/valid.*email/i)).toBeVisible();
    });

    await test.step('Test password validation', async () => {
      await page.getByPlaceholder(/password/i).fill('weak');
      await page.getByPlaceholder(/password/i).blur();
      
      // Should show password validation error
      await expect(page.getByText(/password.*must|at least.*characters/i)).toBeVisible();
    });

    await test.step('Test name validation', async () => {
      await page.getByPlaceholder(/name/i).fill('');
      await page.getByPlaceholder(/name/i).blur();
      
      // Should show name required error
      await expect(page.getByText(/name.*required/i)).toBeVisible();
    });
  });

  test('should allow user to logout', async ({ page }) => {
    await test.step('Login first', async () => {
      await AuthHelpers.login(page, testUsers.user1);
      await expect(page.locator('button[aria-haspopup="true"]')).toBeVisible();
    });

    await test.step('Logout', async () => {
      await AuthHelpers.logout(page);
    });

    await test.step('Verify logged out state', async () => {
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
      const isAuth = await AuthHelpers.isAuthenticated(page);
      expect(isAuth).toBe(false);
    });
  });

  test('should persist authentication on page reload', async ({ page }) => {
    await test.step('Login', async () => {
      await AuthHelpers.login(page, testUsers.user1);
    });

    await test.step('Reload page', async () => {
      await page.reload();
      await TestHelpers.waitForPageLoad(page);
    });

    await test.step('Verify still authenticated', async () => {
      const isAuth = await AuthHelpers.isAuthenticated(page);
      expect(isAuth).toBe(true);
      
      // User menu should still be visible
      await expect(page.locator('button[aria-haspopup="true"]')).toBeVisible();
    });
  });

  test('should handle auth state across multiple tabs', async ({ context, page }) => {
    await test.step('Login in first tab', async () => {
      await AuthHelpers.login(page, testUsers.user1);
    });

    await test.step('Open second tab and verify auth', async () => {
      const page2 = await context.newPage();
      await page2.goto('/');
      await TestHelpers.waitForPageLoad(page2);
      
      // Should be authenticated in second tab
      const isAuth = await AuthHelpers.isAuthenticated(page2);
      expect(isAuth).toBe(true);
      
      await page2.close();
    });
  });

  test('should redirect to requested page after login', async ({ page }) => {
    // This test would require protected routes to be implemented
    // For now, we'll skip it
    test.skip();
    
    await test.step('Navigate to protected route', async () => {
      await page.goto('/protected-route');
    });

    await test.step('Should redirect to login', async () => {
      // Verify redirect to login
    });

    await test.step('Login and verify redirect back', async () => {
      await AuthHelpers.login(page, testUsers.user1);
      
      // Should be back on protected route
      expect(page.url()).toContain('/protected-route');
    });
  });

  test('should handle concurrent auth operations gracefully', async ({ page }) => {
    await test.step('Start multiple auth operations', async () => {
      // Click sign in button multiple times quickly
      const signInButton = page.getByRole('button', { name: /sign in/i });
      
      await Promise.all([
        signInButton.click(),
        signInButton.click(),
        signInButton.click()
      ]);
    });

    await test.step('Verify only one modal opens', async () => {
      // Should only have one modal open
      const modals = await page.locator('[role="dialog"]').all();
      expect(modals.length).toBeLessThanOrEqual(1);
    });
  });

  test('should clear sensitive data on logout', async ({ page }) => {
    await test.step('Login and store some data', async () => {
      await AuthHelpers.login(page, testUsers.user1);
      
      // Simulate storing sensitive data
      await page.evaluate(() => {
        localStorage.setItem('userToken', 'sensitive-token');
        sessionStorage.setItem('userData', 'sensitive-data');
      });
    });

    await test.step('Logout', async () => {
      await AuthHelpers.logout(page);
    });

    await test.step('Verify data is cleared', async () => {
      const localData = await page.evaluate(() => {
        return {
          token: localStorage.getItem('userToken'),
          userData: sessionStorage.getItem('userData')
        };
      });
      
      expect(localData.token).toBeNull();
      expect(localData.userData).toBeNull();
    });
  });
});
