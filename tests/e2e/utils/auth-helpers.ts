/**
 * Authentication Test Helpers
 * Utilities for handling authentication in E2E tests
 */

import { Page } from '@playwright/test';
import { TestUser } from '../fixtures/test-users';

// For creating/deleting test users
interface CreatedTestUser extends TestUser {
  uid: string;
}

export class AuthHelpers {
  /**
   * Login a test user
   */
  static async login(page: Page, user: TestUser) {
    // First check if we're on the home page or game page
    const startPlayingButton = page.locator('[data-testid="start-playing-button"]');
    if (await startPlayingButton.isVisible({ timeout: 1000 })) {
      // We're on the home page, click start playing first
      await startPlayingButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Now look for the sign in button
    const signInButton = page.locator('[data-testid="sign-in-button"]');
    await signInButton.click();
    
    // Wait for auth modal to appear
    await page.waitForSelector('[data-testid="auth-modal"]');
    
    // Fill in credentials
    await page.getByPlaceholder(/email/i).fill(user.email);
    await page.getByPlaceholder(/password/i).fill(user.password);
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).last().click();
    
    // Wait for auth to complete and modal to close
    await page.waitForSelector('[data-testid="auth-modal"]', { state: 'hidden' });
    
    // Verify user is logged in by checking for user menu
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
  }

  /**
   * Logout the current user
   */
  static async logout(page: Page) {
    // Click on user menu
    await page.locator('[data-testid="user-menu"]').click();
    
    // Click logout option
    await page.getByRole('menuitem', { name: /sign out/i }).click();
    
    // Wait for logout to complete
    await page.waitForSelector('[data-testid="sign-in-button"]', { timeout: 5000 });
  }

  /**
   * Sign up a new user
   */
  static async signUp(page: Page, user: TestUser) {
    // First check if we're on the home page or game page
    const startPlayingButton = page.locator('[data-testid="start-playing-button"]');
    if (await startPlayingButton.isVisible({ timeout: 1000 })) {
      // We're on the home page, click start playing first
      await startPlayingButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Click on sign in button
    await page.locator('[data-testid="sign-in-button"]').click();
    
    // Wait for auth modal
    await page.waitForSelector('[data-testid="auth-modal"]');
    
    // Switch to sign up by clicking the link
    await page.getByRole('button', { name: /sign up/i }).click();
    
    // Fill in sign up form
    await page.getByPlaceholder(/name/i).fill(user.displayName);
    await page.getByPlaceholder(/email/i).fill(user.email);
    await page.getByPlaceholder(/password/i).fill(user.password);
    
    // Submit form
    await page.getByRole('button', { name: /sign up/i }).last().click();
    
    // Wait for auth to complete
    await page.waitForSelector('[data-testid="auth-modal"]', { state: 'hidden' });
    await page.waitForSelector('[data-testid="user-menu"]', { timeout: 10000 });
  }

  /**
   * Get current user info from the page
   */
  static async getCurrentUser(page: Page): Promise<string | null> {
    try {
      // Check if user menu button exists
      const userButton = await page.locator('[data-testid="user-menu"]').first();
      if (await userButton.isVisible()) {
        // Get the user initial from the avatar
        const userInitial = await userButton.textContent();
        return userInitial;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(page: Page): Promise<boolean> {
    try {
      // Check for user menu button
      await page.waitForSelector('[data-testid="user-menu"]', { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Setup authentication state for parallel tests
   */
  static async setupAuthState(page: Page, user: TestUser) {
    // This would typically involve setting up Firebase auth state
    // For now, we'll use the UI login flow
    await this.login(page, user);
  }

  /**
   * Clear authentication state
   */
  static async clearAuthState(page: Page) {
    // Clear local storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Clear cookies
    await page.context().clearCookies();
    
    // Reload page
    await page.reload();
  }
}

/**
 * Create a test user for E2E testing
 */
export async function createTestUser(): Promise<CreatedTestUser> {
  // Generate a unique test user
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  
  return {
    uid: `test_${timestamp}_${randomId}`,
    email: `test_${timestamp}_${randomId}@example.com`,
    password: 'TestPassword123!',
    displayName: `Test User ${timestamp}`,
    friendId: `test_${randomId}`
  };
}

/**
 * Delete a test user (cleanup)
 */
export async function deleteTestUser(uid: string): Promise<void> {
  // In a real implementation, this would call the backend API to delete the user
  // For now, this is a placeholder for cleanup
  console.log(`Cleaning up test user: ${uid}`);
  
  // TODO: Implement actual user deletion via API call
  // This might involve calling your backend's user deletion endpoint
}
