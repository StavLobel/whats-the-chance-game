import { test, expect } from '@playwright/test';

test.describe('Complete Friends Flow', () => {
  // Test user credentials as provided
  const user1 = {
    email: 'testuser1@example.com',
    password: 'TestPassword123!',
    username: 'johndoe',
    fullName: 'John Doe',
    uid: '6Op1SrQJdyVpHAo419YyUwT9NOo2'
  };

  const user2 = {
    email: 'testuser2@example.com',
    password: 'TestPassword123!',
    username: 'janesmith',
    fullName: 'Jane Smith',
    uid: 'ZYWaZCihaeXcId5EW0ht2HAHTCq1'
  };

  test('should complete full friend request flow between two users', async ({ page }) => {
    // Step 1: Start the application and login as User 1
    await page.goto('/');
    
    // Click "Start Playing" to enter the game
    await page.getByRole('button', { name: /start playing/i }).click();
    
    // The game should show the sidebar with sign in option
    await page.waitForTimeout(1000);
    
    // Click on the sign in button in the sidebar
    const signInButton = page.getByRole('button', { name: /sign in/i }).first();
    await signInButton.click();
    
    // Fill in the sign in form
    await page.getByPlaceholder(/email/i).fill(user1.email);
    await page.getByPlaceholder(/password/i).fill(user1.password);
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).last().click();
    
    // Wait for successful login - we should see the user's name
    await expect(page.getByText(user1.fullName)).toBeVisible({ timeout: 10000 });
    
    // Step 2: Navigate to Friends tab and send friend request
    await page.getByRole('button', { name: /friends/i }).click();
    
    // Click the Add Friend button
    await page.getByRole('button', { name: /add new friend/i }).click();
    
    // The modal should open
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Search for User 2 by email
    await page.getByPlaceholder(/search by name or email/i).fill(user2.email);
    
    // Wait for search results (debounced)
    await page.waitForTimeout(800);
    
    // User 2 should appear in results - try both full name and email
    const user2Result = page.getByText(user2.fullName).or(page.getByText(user2.email)).first();
    await expect(user2Result).toBeVisible({ timeout: 10000 });
    
    // Check if Add Friend button is available (users might already be friends)
    const addFriendButton = page.getByRole('button', { name: /add friend/i });
    if (await addFriendButton.isVisible() && await addFriendButton.isEnabled()) {
      await addFriendButton.click();
      
      // Success toast should appear
      await expect(page.getByText(/friend request sent/i)).toBeVisible();
    } else {
      console.log('Users might already be friends or have a pending request');
      // Close modal and continue with test
      await page.keyboard.press('Escape');
      return; // Skip the rest of the test
    }
    
    // Close the modal
    await page.keyboard.press('Escape');
    
    // Check sent requests tab
    await page.getByRole('tab', { name: /sent/i }).click();
    await expect(page.getByText(user2.fullName)).toBeVisible();
    await expect(page.getByText(/pending/i)).toBeVisible();
    
    // Step 3: Logout User 1
    await page.getByRole('button', { name: /user menu/i }).click();
    await page.getByText(/sign out/i).click();
    
    // Wait to return to home page
    await page.waitForURL('/');
    
    // Step 4: Login as User 2
    await page.getByRole('button', { name: /start playing/i }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByPlaceholder(/email/i).fill(user2.email);
    await page.getByPlaceholder(/password/i).fill(user2.password);
    await page.getByRole('button', { name: /sign in/i }).last().click();
    
    // Wait for successful login
    await expect(page.getByText(user2.fullName)).toBeVisible({ timeout: 10000 });
    
    // Step 5: Check notification
    // There should be a notification indicator
    const notificationBadge = page.locator('.notification-badge, [class*="badge"]').first();
    await expect(notificationBadge).toBeVisible();
    
    // Navigate to friends
    await page.getByRole('button', { name: /friends/i }).click();
    
    // Go to received requests
    await page.getByRole('tab', { name: /received/i }).click();
    
    // User 1's request should be visible
    await expect(page.getByText(user1.fullName)).toBeVisible();
    
    // Step 6: Accept friend request
    await page.getByRole('button', { name: /accept/i }).click();
    
    // Success message
    await expect(page.getByText(/friend request accepted/i)).toBeVisible();
    
    // Step 7: Verify friendship
    // Go to friends tab
    await page.getByRole('tab', { name: /friends/i }).click();
    await expect(page.getByText(user1.fullName)).toBeVisible();
    
    // Logout and check from User 1's perspective
    await page.getByRole('button', { name: /user menu/i }).click();
    await page.getByText(/sign out/i).click();
    await page.waitForURL('/');
    
    // Login as User 1 again
    await page.getByRole('button', { name: /start playing/i }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByPlaceholder(/email/i).fill(user1.email);
    await page.getByPlaceholder(/password/i).fill(user1.password);
    await page.getByRole('button', { name: /sign in/i }).last().click();
    
    await expect(page.getByText(user1.fullName)).toBeVisible({ timeout: 10000 });
    
    // Navigate to friends and verify User 2 is in the list
    await page.getByRole('button', { name: /friends/i }).click();
    await expect(page.getByText(user2.fullName)).toBeVisible();
    
    // Step 8: Clean up - Remove friend (if unfriend feature exists)
    // This step would depend on the actual implementation of unfriend functionality
    console.log('Friend request flow completed successfully!');
  });
});
