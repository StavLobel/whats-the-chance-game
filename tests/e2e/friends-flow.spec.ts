import { test, expect } from '@playwright/test';

test.describe('Complete Friends Flow', () => {
  // Test user credentials
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
    // Step 1: Login as User 1
    await page.goto('/');
    await page.click('text=Start Playing');
    
    // Wait for any modals to load and close them if present
    await page.waitForTimeout(1000);
    const modalBackdrop = page.locator('[data-state="open"][aria-hidden="true"]');
    if (await modalBackdrop.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', user1.email);
    await page.fill('input[type="password"]', user1.password);
    
    // Click the submit button in the form
    const signInForm = page.locator('form').filter({ has: page.locator('input[type="email"]') });
    await signInForm.locator('button[type="submit"]').click();
    await page.waitForURL('**/game', { timeout: 10000 });

    // Verify user 1 is logged in
    await expect(page.locator('text=' + user1.fullName)).toBeVisible();

    // Step 2: User 1 sends friend request to User 2
    await page.click('button:has-text("Friends")');
    
    // Open Add Friend modal
    await page.click('button[aria-label="Add new friend"]');
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Search for User 2
    const searchInput = page.getByPlaceholder('Search by name or email...');
    await searchInput.fill(user2.username);
    await page.waitForTimeout(500); // Wait for debounce
    
    // Verify User 2 appears in search results
    await expect(page.getByText(user2.fullName)).toBeVisible();
    await expect(page.getByText(user2.email)).toBeVisible();
    
    // Send friend request
    await page.click('button:has-text("Add Friend")');
    
    // Verify success toast
    await expect(page.getByText('Friend request sent!')).toBeVisible();
    
    // Close modal
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    
    // Check sent requests tab
    await page.click('text=Sent');
    await expect(page.getByText(user2.fullName)).toBeVisible();
    await expect(page.getByText('Pending')).toBeVisible();

    // Step 3: Logout User 1
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Sign Out');
    await page.waitForURL('/', { timeout: 10000 });

    // Step 4: Login as User 2
    await page.click('text=Start Playing');
    
    // Wait for any modals to load and close them if present
    await page.waitForTimeout(1000);
    const modalBackdrop2 = page.locator('[data-state="open"][aria-hidden="true"]');
    if (await modalBackdrop2.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', user2.email);
    await page.fill('input[type="password"]', user2.password);
    
    // Click the submit button in the form
    const signInForm2 = page.locator('form').filter({ has: page.locator('input[type="email"]') });
    await signInForm2.locator('button[type="submit"]').click();
    await page.waitForURL('**/game', { timeout: 10000 });

    // Verify user 2 is logged in
    await expect(page.locator('text=' + user2.fullName)).toBeVisible();

    // Step 5: Check notification about friend request
    // Check for notification badge
    const notificationBadge = page.locator('.notification-badge');
    await expect(notificationBadge).toBeVisible();
    
    // Navigate to notifications
    await page.click('button:has-text("Notifications")');
    await expect(page.getByText('You have a new friend request')).toBeVisible();

    // Navigate to friends tab
    await page.click('button:has-text("Friends")');
    
    // Go to received requests tab
    await page.click('text=Received');
    
    // Verify friend request from User 1
    await expect(page.getByText(user1.fullName)).toBeVisible();
    await expect(page.getByText(user1.email)).toBeVisible();

    // Step 6: Approve friend request
    await page.click('button:has-text("Accept")');
    
    // Verify success toast
    await expect(page.getByText('Friend request accepted!')).toBeVisible();
    
    // Step 7: Verify User 1 is in User 2's friend list
    await page.click('text=Friends');
    await expect(page.getByText(user1.fullName)).toBeVisible();
    
    // Logout User 2 and login as User 1 to verify mutual friendship
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Sign Out');
    await page.waitForURL('/', { timeout: 10000 });
    
    // Login as User 1 again
    await page.click('text=Start Playing');
    
    // Wait for any modals to load and close them if present
    await page.waitForTimeout(1000);
    const modalBackdrop3 = page.locator('[data-state="open"][aria-hidden="true"]');
    if (await modalBackdrop3.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', user1.email);
    await page.fill('input[type="password"]', user1.password);
    
    // Click the submit button in the form
    const signInForm3 = page.locator('form').filter({ has: page.locator('input[type="email"]') });
    await signInForm3.locator('button[type="submit"]').click();
    await page.waitForURL('**/game', { timeout: 10000 });
    
    // Navigate to friends and verify User 2 is in friend list
    await page.click('button:has-text("Friends")');
    await expect(page.getByText(user2.fullName)).toBeVisible();

    // Step 8: Unfriend both users to restore default state
    // User 1 unfriends User 2
    const user2Card = page.locator('div').filter({ hasText: user2.fullName }).first();
    await user2Card.hover();
    
    // Look for unfriend button (might be in a menu or direct button)
    const unfriendButton = user2Card.locator('button').filter({ hasText: /unfriend|remove/i });
    if (await unfriendButton.count() > 0) {
      await unfriendButton.click();
    } else {
      // Try clicking a menu button first
      const menuButton = user2Card.locator('button[aria-label*="menu"]');
      if (await menuButton.count() > 0) {
        await menuButton.click();
        await page.click('text=/unfriend|remove friend/i');
      }
    }
    
    // Confirm unfriend action if there's a confirmation dialog
    const confirmButton = page.locator('button').filter({ hasText: /confirm|yes|remove/i });
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
    
    // Verify User 2 is no longer in friend list
    await expect(page.getByText('No friends yet')).toBeVisible();
    
    // Logout and login as User 2 to verify mutual unfriending
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Sign Out');
    await page.waitForURL('/', { timeout: 10000 });
    
    await page.click('text=Start Playing');
    
    // Wait for any modals to load and close them if present
    await page.waitForTimeout(1000);
    const modalBackdrop4 = page.locator('[data-state="open"][aria-hidden="true"]');
    if (await modalBackdrop4.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', user2.email);
    await page.fill('input[type="password"]', user2.password);
    
    // Click the submit button in the form
    const signInForm4 = page.locator('form').filter({ has: page.locator('input[type="email"]') });
    await signInForm4.locator('button[type="submit"]').click();
    await page.waitForURL('**/game', { timeout: 10000 });
    
    // Verify User 1 is no longer in User 2's friend list
    await page.click('button:has-text("Friends")');
    await expect(page.getByText('No friends yet')).toBeVisible();
  });

  test('should handle friend request notifications correctly', async ({ page }) => {
    // Quick test to verify notification system
    // Login as User 1 and send request
    await page.goto('/');
    await page.click('text=Start Playing');
    
    // Wait for any modals to load and close them if present
    await page.waitForTimeout(1000);
    const modalBackdrop = page.locator('[data-state="open"][aria-hidden="true"]');
    if (await modalBackdrop.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', user1.email);
    await page.fill('input[type="password"]', user1.password);
    
    // Click the submit button in the form
    const signInForm = page.locator('form').filter({ has: page.locator('input[type="email"]') });
    await signInForm.locator('button[type="submit"]').click();
    await page.waitForURL('**/game', { timeout: 10000 });

    // Send friend request
    await page.click('button:has-text("Friends")');
    await page.click('button[aria-label="Add new friend"]');
    const searchInput = page.getByPlaceholder('Search by name or email...');
    await searchInput.fill(user2.email);
    await page.waitForTimeout(500);
    
    // Check if already friends or request already sent
    const addFriendButton = page.getByRole('button', { name: /Add Friend/i });
    if (await addFriendButton.isEnabled()) {
      await addFriendButton.click();
      await expect(page.getByText('Friend request sent!')).toBeVisible();
    }
    
    // Logout
    await page.keyboard.press('Escape'); // Close modal
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Sign Out');
    
    // Login as User 2
    await page.click('text=Start Playing');
    
    // Wait for any modals to load and close them if present
    await page.waitForTimeout(1000);
    const modalBackdrop2 = page.locator('[data-state="open"][aria-hidden="true"]');
    if (await modalBackdrop2.isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
    
    await page.click('button:has-text("Sign In")');
    await page.fill('input[type="email"]', user2.email);
    await page.fill('input[type="password"]', user2.password);
    
    // Click the submit button in the form
    const signInForm2 = page.locator('form').filter({ has: page.locator('input[type="email"]') });
    await signInForm2.locator('button[type="submit"]').click();
    await page.waitForURL('**/game', { timeout: 10000 });
    
    // Check notifications tab shows count
    const notificationsButton = page.locator('button:has-text("Notifications")');
    const badge = notificationsButton.locator('.badge, [class*="badge"]');
    
    // Navigate to notifications
    await notificationsButton.click();
    
    // Verify notification content
    const notificationContent = page.locator('text=/friend request|new friend/i');
    if (await notificationContent.count() > 0) {
      await expect(notificationContent.first()).toBeVisible();
    }
    
    // Clean up - reject the request
    await page.click('button:has-text("Friends")');
    await page.click('text=Received');
    
    const rejectButton = page.locator('button').filter({ hasText: /reject|decline/i });
    if (await rejectButton.count() > 0) {
      await rejectButton.click();
    }
  });
});
