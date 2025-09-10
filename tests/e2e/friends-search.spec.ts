import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from './utils/auth-helpers';

test.describe('Friends Search Feature', () => {
  let testUser1: any;
  let testUser2: any;

  test.beforeAll(async () => {
    // Create test users
    testUser1 = await createTestUser();
    testUser2 = await createTestUser();
  });

  test.afterAll(async () => {
    // Clean up test users
    if (testUser1) await deleteTestUser(testUser1.uid);
    if (testUser2) await deleteTestUser(testUser2.uid);
  });

  test('should display Add Friend button and open modal', async ({ page }) => {
    // Sign in as test user 1
    await page.goto('/');
    await page.click('text=Start Playing');
    
    // Go to sign in
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', testUser1.email);
    await page.fill('input[type="password"]', testUser1.password);
    await page.click('button:has-text("Sign In"):not([aria-label])');
    
    // Wait for auth to complete
    await page.waitForURL('**/game', { timeout: 10000 });
    
    // Navigate to friends tab
    await page.click('button:has-text("Friends")');
    
    // Check that Add Friend button is visible
    await expect(page.getByRole('button', { name: 'Add new friend' })).toBeVisible();
    
    // Click Add Friend button
    await page.click('button[aria-label="Add new friend"]');
    
    // Check that modal is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add Friends')).toBeVisible();
    await expect(page.getByText('Search for users by name or email to send friend requests.')).toBeVisible();
  });

  test('should search for users in real-time', async ({ page }) => {
    // Sign in as test user 1
    await page.goto('/');
    await page.click('text=Start Playing');
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', testUser1.email);
    await page.fill('input[type="password"]', testUser1.password);
    await page.click('button:has-text("Sign In"):not([aria-label])');
    await page.waitForURL('**/game', { timeout: 10000 });
    
    // Navigate to friends tab and open modal
    await page.click('button:has-text("Friends")');
    await page.click('button[aria-label="Add new friend"]');
    
    // Search for the second test user
    const searchInput = page.getByPlaceholder('Search by name or email...');
    await searchInput.fill(testUser2.email.substring(0, 5));
    
    // Wait for search results (debounced)
    await page.waitForTimeout(500);
    
    // Check that search results appear
    await expect(page.getByText(testUser2.email)).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Friend/i })).toBeVisible();
  });

  test('should send friend request from modal', async ({ page }) => {
    // Sign in as test user 1
    await page.goto('/');
    await page.click('text=Start Playing');
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', testUser1.email);
    await page.fill('input[type="password"]', testUser1.password);
    await page.click('button:has-text("Sign In"):not([aria-label])');
    await page.waitForURL('**/game', { timeout: 10000 });
    
    // Navigate to friends tab and open modal
    await page.click('button:has-text("Friends")');
    await page.click('button[aria-label="Add new friend"]');
    
    // Search for the second test user
    const searchInput = page.getByPlaceholder('Search by name or email...');
    await searchInput.fill(testUser2.email);
    await page.waitForTimeout(500);
    
    // Click Add Friend button
    await page.click('button:has-text("Add Friend")');
    
    // Check for success toast
    await expect(page.getByText('Friend request sent!')).toBeVisible();
    
    // Search should be cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should close modal with ESC key', async ({ page }) => {
    // Sign in
    await page.goto('/');
    await page.click('text=Start Playing');
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', testUser1.email);
    await page.fill('input[type="password"]', testUser1.password);
    await page.click('button:has-text("Sign In"):not([aria-label])');
    await page.waitForURL('**/game', { timeout: 10000 });
    
    // Open modal
    await page.click('button:has-text("Friends")');
    await page.click('button[aria-label="Add new friend"]');
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Press ESC
    await page.keyboard.press('Escape');
    
    // Modal should be closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should show empty state when no results found', async ({ page }) => {
    // Sign in
    await page.goto('/');
    await page.click('text=Start Playing');
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', testUser1.email);
    await page.fill('input[type="password"]', testUser1.password);
    await page.click('button:has-text("Sign In"):not([aria-label])');
    await page.waitForURL('**/game', { timeout: 10000 });
    
    // Open modal and search for non-existent user
    await page.click('button:has-text("Friends")');
    await page.click('button[aria-label="Add new friend"]');
    
    const searchInput = page.getByPlaceholder('Search by name or email...');
    await searchInput.fill('nonexistentuser12345');
    await page.waitForTimeout(500);
    
    // Check empty state
    await expect(page.getByText('No users found')).toBeVisible();
    await expect(page.getByText(/No users found matching/)).toBeVisible();
  });
});
