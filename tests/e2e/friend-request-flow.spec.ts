import { test, expect, Page } from '@playwright/test';

// Test users from the database
const TEST_USER_1 = {
  email: 'testuser1@example.com',
  password: 'TestPassword123!',
  displayName: 'John Doe',
  username: 'johndoe',
  friendId: '8638712740019442'
};

const TEST_USER_2 = {
  email: 'testuser2@example.com', 
  password: 'TestPassword123!',
  displayName: 'Jane Smith',
  username: 'janesmith',
  friendId: '5729384061528374'
};

/**
 * Helper function to login a user
 */
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/');
  
  // Wait for auth to load
  await page.waitForTimeout(2000);
  
  // Check if already logged in
  const isLoggedIn = await page.locator('[data-testid="user-profile"]').isVisible().catch(() => false);
  
  if (!isLoggedIn) {
    // Click login/signup button
    await page.click('button:has-text("Sign In")');
    
    // Fill in credentials
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
  }
  
  // Verify login success by checking for user interface
  await expect(page.locator('body')).toContainText('Friends', { timeout: 10000 });
}

/**
 * Helper function to logout current user
 */
async function logoutUser(page: Page) {
  // Try to find and click logout button
  try {
    await page.click('[data-testid="user-menu"]');
    await page.click('button:has-text("Sign Out")');
    await page.waitForTimeout(2000);
  } catch {
    // If logout button not found, clear storage and reload
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(2000);
  }
}

test.describe('Friend Request Flow E2E', () => {
  test('Complete friend request lifecycle: send, accept, verify friendship', async ({ page, context }) => {
    // Step 1: Login as User 1 (sender)
    await test.step('User 1 logs in', async () => {
      await loginUser(page, TEST_USER_1.email, TEST_USER_1.password);
      await expect(page).toHaveURL('/game');
    });

    // Step 2: Navigate to Friends tab and send friend request
    await test.step('User 1 sends friend request to User 2', async () => {
      // Navigate to Friends tab
      await page.click('button:has-text("Friends")');
      await page.waitForTimeout(1000);
      
      // Click Add Friend button
      await page.click('button:has-text("Add Friend")');
      
      // Switch to Unique ID tab
      await page.click('button:has-text("Unique ID")');
      
      // Enter User 2's friend ID
      await page.fill('input[placeholder*="Enter friend"]', TEST_USER_2.friendId);
      
      // Send the request
      await page.click('button:has-text("Send Request")');
      
      // Wait for success message
      await expect(page.locator('text=Friend request sent')).toBeVisible({ timeout: 5000 });
      
      // Close the modal
      await page.keyboard.press('Escape');
      
      // Verify request appears in Sent Requests
      await expect(page.locator('text=Jane Smith')).toBeVisible({ timeout: 5000 });
    });

    // Step 3: Logout User 1
    await test.step('User 1 logs out', async () => {
      await logoutUser(page);
    });

    // Step 4: Login as User 2 (recipient)
    await test.step('User 2 logs in', async () => {
      await loginUser(page, TEST_USER_2.email, TEST_USER_2.password);
      await expect(page).toHaveURL('/game');
    });

    // Step 5: User 2 accepts the friend request
    await test.step('User 2 accepts the friend request', async () => {
      // Navigate to Friends tab
      await page.click('button:has-text("Friends")');
      await page.waitForTimeout(1000);
      
      // Verify friend request is visible in received requests
      await expect(page.locator('text=John Doe')).toBeVisible({ timeout: 5000 });
      
      // Click Accept button
      await page.click('button:has-text("Accept")');
      
      // Wait for success message
      await expect(page.locator('text=Friend request accepted')).toBeVisible({ timeout: 5000 });
      
      // Wait for UI to update
      await page.waitForTimeout(2000);
    });

    // Step 6: Verify User 2 sees User 1 in friends list
    await test.step('User 2 sees User 1 in friends list', async () => {
      // Check if John Doe appears in the friends list
      await expect(page.locator('text=John Doe')).toBeVisible({ timeout: 10000 });
      
      // Verify it's in the actual friends section (not requests)
      const friendsSection = page.locator('[data-testid="friends-list"]').or(page.locator('text=Your Friends').locator('..'));
      await expect(friendsSection.locator('text=John Doe')).toBeVisible({ timeout: 5000 });
    });

    // Step 7: Logout User 2 and login as User 1
    await test.step('Switch back to User 1', async () => {
      await logoutUser(page);
      await loginUser(page, TEST_USER_1.email, TEST_USER_1.password);
    });

    // Step 8: Verify User 1 also sees User 2 in friends list
    await test.step('User 1 sees User 2 in friends list', async () => {
      // Navigate to Friends tab
      await page.click('button:has-text("Friends")');
      await page.waitForTimeout(2000);
      
      // Check if Jane Smith appears in the friends list
      await expect(page.locator('text=Jane Smith')).toBeVisible({ timeout: 10000 });
      
      // Verify it's in the actual friends section (not requests)
      const friendsSection = page.locator('[data-testid="friends-list"]').or(page.locator('text=Your Friends').locator('..'));
      await expect(friendsSection.locator('text=Jane Smith')).toBeVisible({ timeout: 5000 });
      
      // Verify the sent request is no longer showing (it should be moved to friends)
      const sentRequestsSection = page.locator('text=Sent Requests').locator('..');
      await expect(sentRequestsSection.locator('text=Jane Smith')).not.toBeVisible({ timeout: 2000 });
    });

    // Step 9: Test friendship functionality
    await test.step('Verify friendship features work', async () => {
      // Try to send a challenge to the friend (if this feature exists)
      // This is a placeholder for future friendship features
      console.log('Friendship established successfully between', TEST_USER_1.displayName, 'and', TEST_USER_2.displayName);
    });
  });

  test('Friend request rejection flow', async ({ page }) => {
    // Step 1: Login as User 1 and send another request
    await test.step('User 1 sends friend request', async () => {
      await loginUser(page, TEST_USER_1.email, TEST_USER_1.password);
      
      await page.click('button:has-text("Friends")');
      await page.click('button:has-text("Add Friend")');
      await page.click('button:has-text("Unique ID")');
      await page.fill('input[placeholder*="Enter friend"]', TEST_USER_2.friendId);
      await page.click('button:has-text("Send Request")');
      
      await expect(page.locator('text=Friend request sent')).toBeVisible({ timeout: 5000 });
      await page.keyboard.press('Escape');
    });

    // Step 2: Switch to User 2 and reject
    await test.step('User 2 rejects the friend request', async () => {
      await logoutUser(page);
      await loginUser(page, TEST_USER_2.email, TEST_USER_2.password);
      
      await page.click('button:has-text("Friends")');
      await page.waitForTimeout(1000);
      
      // Click Reject button
      await page.click('button:has-text("Reject")');
      
      // Wait for success message
      await expect(page.locator('text=Friend request rejected')).toBeVisible({ timeout: 5000 });
      
      // Verify request disappears
      await expect(page.locator('text=John Doe')).not.toBeVisible({ timeout: 5000 });
    });
  });
});
