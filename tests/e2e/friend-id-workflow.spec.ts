/**
 * Friend ID Workflow E2E Tests
 * End-to-end tests for the complete Friend ID system workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Friend ID System - Complete Workflow', () => {
  const testUsers = {
    user1: {
      email: 'testuser1@example.com',
      password: 'TestPassword123!',
      friendId: '8638712740019442', // John Doe's Friend ID
      displayName: 'John Doe'
    },
    user2: {
      email: 'testuser2@example.com', 
      password: 'TestPassword123!',
      friendId: '4403739266478588', // Jane Smith's Friend ID
      displayName: 'Jane Smith'
    }
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Friend ID Display in Friends Tab', () => {
    test('should display user\'s Friend ID in Friends tab', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      // Wait for login to complete
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Navigate to Friends tab
      await page.click('text=Friends');
      
      // Should see Friend ID section in Friends tab
      await expect(page.locator('[data-testid="friend-id-display"]')).toBeVisible();
      await expect(page.locator('text=My Friend ID')).toBeVisible();
      
      // Should show masked Friend ID initially
      await expect(page.locator('text=•••• •••• •••• ••••')).toBeVisible();
    });

    test('should show/hide Friend ID when toggle button is clicked', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Click show button
      await page.click('[data-testid="show-friend-id"]');
      
      // Should show actual Friend ID
      await expect(page.locator('text=8259 2552 9776 2312')).toBeVisible();
      
      // Click hide button
      await page.click('[data-testid="hide-friend-id"]');
      
      // Should hide Friend ID again
      await expect(page.locator('text=•••• •••• •••• ••••')).toBeVisible();
    });

    test('should copy Friend ID to clipboard', async ({ page }) => {
      // Grant clipboard permissions
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
      
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Show Friend ID first
      await page.click('[data-testid="show-friend-id"]');
      
      // Copy Friend ID
      await page.click('[data-testid="copy-friend-id"]');
      
      // Should show success toast
      await expect(page.locator('text=Copied!')).toBeVisible();
      
      // Verify clipboard content
      const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardContent).toBe(testUsers.user1.friendId);
    });
  });

  test.describe('QR Code Generation in Friends Tab', () => {
    test('should display QR code modal from Friends tab', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Click QR Code button
      await page.click('[data-testid="show-qr-code"]');
      
      // Should open QR code modal
      await expect(page.locator('[data-testid="friend-id-qr-modal"]')).toBeVisible();
      await expect(page.locator('text=My Friend ID QR Code')).toBeVisible();
      
      // Should display QR code
      await expect(page.locator('[data-testid="qr-code-canvas"]')).toBeVisible();
      
      // Should display formatted Friend ID
      await expect(page.locator('text=8259 2552 9776 2312')).toBeVisible();
    });

    test('should download QR code when download button is clicked', async ({ page }) => {
      // Setup download handling
      const downloadPromise = page.waitForEvent('download');
      
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Open QR code modal
      await page.click('[data-testid="show-qr-code"]');
      await expect(page.locator('[data-testid="friend-id-qr-modal"]')).toBeVisible();
      
      // Click download button
      await page.click('[data-testid="download-qr"]');
      
      // Should trigger download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('friend-id-qr');
      expect(download.suggestedFilename()).toContain(testUsers.user1.friendId);
    });
  });

  test.describe('Friend Request via Friend ID', () => {
    test('should send friend request using Friend ID', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Click Add Friend button
      await page.click('[data-testid="add-friend-button"]');
      
      // Should open Add Friend modal with Friend ID tab active
      await expect(page.locator('[data-testid="add-friend-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="friend-id-tab"]')).toHaveClass(/active/);
      
      // Enter User 2's Friend ID
      await page.fill('[data-testid="friend-id-input"]', testUsers.user2.friendId);
      
      // Should show formatted Friend ID
      await expect(page.locator('input[data-testid="friend-id-input"]')).toHaveValue('4403 7392 6647 8588');
      
      // Should find and display User 2
      await expect(page.locator('text=Jane Smith')).toBeVisible();
      
      // Click Add Friend button
      await page.click('text=Add Friend');
      
      // Should show success message
      await expect(page.locator('text=Friend request sent')).toBeVisible();
    });

    test('should show validation error for invalid Friend ID', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Open Add Friend modal
      await page.click('[data-testid="add-friend-button"]');
      await expect(page.locator('[data-testid="add-friend-modal"]')).toBeVisible();
      
      // Enter invalid Friend ID
      await page.fill('[data-testid="friend-id-input"]', '12345');
      
      // Should show validation error
      await expect(page.locator('text=Friend ID must be exactly 16 digits')).toBeVisible();
      
      // Should not show user lookup results
      await expect(page.locator('[data-testid="friend-lookup-results"]')).toBeEmpty();
    });

    test('should show "User not found" for non-existent Friend ID', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Open Add Friend modal
      await page.click('[data-testid="add-friend-button"]');
      await expect(page.locator('[data-testid="add-friend-modal"]')).toBeVisible();
      
      // Enter non-existent Friend ID
      await page.fill('[data-testid="friend-id-input"]', '9999999999999999');
      
      // Should show "User not found" message
      await expect(page.locator('text=User not found')).toBeVisible();
    });
  });

  test.describe('QR Code Scanning Workflow', () => {
    test('should open QR scanner from Add Friend modal', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Open Add Friend modal
      await page.click('[data-testid="add-friend-button"]');
      await expect(page.locator('[data-testid="add-friend-modal"]')).toBeVisible();
      
      // Switch to QR Code tab
      await page.click('[data-testid="qr-code-tab"]');
      
      // Click Open Camera Scanner
      await page.click('[data-testid="open-camera-scanner"]');
      
      // Should open QR scanner modal
      await expect(page.locator('[data-testid="qr-scanner-modal"]')).toBeVisible();
    });

    test('should handle camera permission requests', async ({ page }) => {
      // Grant camera permissions
      await page.context().grantPermissions(['camera']);
      
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Open Add Friend modal and QR scanner
      await page.click('[data-testid="add-friend-button"]');
      await page.click('[data-testid="qr-code-tab"]');
      await page.click('[data-testid="open-camera-scanner"]');
      
      // Should show camera view or permission prompt
      await expect(page.locator('[data-testid="qr-scanner-modal"]')).toBeVisible();
    });
  });

  test.describe('Complete Friend Request Lifecycle with Friend IDs', () => {
    test('should complete full friend request cycle using Friend IDs', async ({ page, context }) => {
      // Step 1: User 1 shares their Friend ID
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Verify User 1's Friend ID is displayed
      await page.click('[data-testid="show-friend-id"]');
      await expect(page.locator('text=8259 2552 9776 2312')).toBeVisible();
      
      // Logout User 1
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Sign out');
      
      // Step 2: User 2 uses User 1's Friend ID to send friend request
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user2.email);
      await page.fill('input[type="password"]', testUsers.user2.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Open Add Friend modal
      await page.click('[data-testid="add-friend-button"]');
      await expect(page.locator('[data-testid="add-friend-modal"]')).toBeVisible();
      
      // Enter User 1's Friend ID
      await page.fill('[data-testid="friend-id-input"]', testUsers.user1.friendId);
      
      // Should find User 1
      await expect(page.locator('text=John Doe')).toBeVisible();
      
      // Send friend request
      await page.click('text=Add Friend');
      await expect(page.locator('text=Friend request sent')).toBeVisible();
      
      // Close modal
      await page.click('[data-testid="close-modal"]');
      
      // Step 3: Verify friend request appears in Sent tab
      await page.click('text=Sent');
      await expect(page.locator('text=John Doe')).toBeVisible();
      await expect(page.locator('text=Pending')).toBeVisible();
      
      // Logout User 2
      await page.click('[data-testid="user-menu"]');
      await page.click('text=Sign out');
      
      // Step 4: User 1 accepts friend request
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Check Received tab
      await page.click('text=Received');
      await expect(page.locator('text=Jane Smith')).toBeVisible();
      
      // Accept friend request
      await page.click('text=Accept');
      await expect(page.locator('text=Friend request accepted')).toBeVisible();
      
      // Step 5: Verify friendship in Friends tab
      await page.click('text=Friends');
      await expect(page.locator('text=Jane Smith')).toBeVisible();
      
      // Step 6: Cleanup - Remove friendship
      await page.click('text=Remove Friend');
      await page.click('text=Confirm');
      await expect(page.locator('text=Friend removed')).toBeVisible();
    });
  });

  test.describe('QR Code End-to-End Flow', () => {
    test('should generate and display QR code containing Friend ID', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Open QR code modal
      await page.click('[data-testid="show-qr-code"]');
      await expect(page.locator('[data-testid="friend-id-qr-modal"]')).toBeVisible();
      
      // Should display QR code
      await expect(page.locator('[data-testid="qr-code-canvas"]')).toBeVisible();
      
      // Should display Friend ID text
      await expect(page.locator('text=Friend ID:')).toBeVisible();
      await expect(page.locator('text=8259 2552 9776 2312')).toBeVisible();
      
      // Should have action buttons
      await expect(page.locator('[data-testid="download-qr"]')).toBeVisible();
      await expect(page.locator('[data-testid="share-qr"]')).toBeVisible();
    });

    test('should simulate QR code scanning workflow', async ({ page }) => {
      // Login as User 2
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user2.email);
      await page.fill('input[type="password"]', testUsers.user2.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Open Add Friend modal
      await page.click('[data-testid="add-friend-button"]');
      await expect(page.locator('[data-testid="add-friend-modal"]')).toBeVisible();
      
      // Switch to QR Code tab
      await page.click('[data-testid="qr-code-tab"]');
      
      // Open QR scanner
      await page.click('[data-testid="open-camera-scanner"]');
      await expect(page.locator('[data-testid="qr-scanner-modal"]')).toBeVisible();
      
      // Simulate successful QR scan (development mode)
      if (await page.locator('[data-testid="simulate-scan"]').isVisible()) {
        await page.click('[data-testid="simulate-scan"]');
        
        // Should automatically send friend request
        await expect(page.locator('text=Friend request sent')).toBeVisible();
      }
    });
  });

  test.describe('Security and Validation', () => {
    test('should prevent self-friend requests via Friend ID', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Try to add self using own Friend ID
      await page.click('[data-testid="add-friend-button"]');
      await page.fill('[data-testid="friend-id-input"]', testUsers.user1.friendId);
      
      // Should show "You" instead of "Add Friend"
      await expect(page.locator('text=You')).toBeVisible();
      
      // Add Friend button should be disabled
      await expect(page.locator('text=Add Friend')).toBeDisabled();
    });

    test('should validate Friend ID format in real-time', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Open Add Friend modal
      await page.click('[data-testid="add-friend-button"]');
      
      // Test various invalid formats
      const invalidIds = [
        { input: '12345', error: 'Friend ID must be exactly 16 digits' },
        { input: 'abcd567890123456', error: 'Friend ID must contain only digits' },
        { input: '0123456789012345', error: 'Friend ID cannot start with 0' },
      ];

      for (const { input, error } of invalidIds) {
        await page.fill('[data-testid="friend-id-input"]', '');
        await page.fill('[data-testid="friend-id-input"]', input);
        await expect(page.locator(`text=${error}`)).toBeVisible();
      }
    });
  });

  test.describe('Mobile Experience', () => {
    test('should work correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Open mobile menu
      await page.click('[data-testid="menu-button"]');
      await page.click('text=Friends');
      
      // Should display Friend ID section in mobile layout
      await expect(page.locator('[data-testid="friend-id-display"]')).toBeVisible();
      
      // QR code should be appropriately sized for mobile
      await page.click('[data-testid="show-qr-code"]');
      await expect(page.locator('[data-testid="qr-code-canvas"]')).toBeVisible();
    });

    test('should handle touch interactions for Friend ID features', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Login and navigate to Friends
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('[data-testid="menu-button"]');
      await page.click('text=Friends');
      
      // Touch interactions should work
      await page.tap('[data-testid="show-friend-id"]');
      await page.tap('[data-testid="copy-friend-id"]');
      await page.tap('[data-testid="show-qr-code"]');
      
      // Should handle touch events properly
      await expect(page.locator('[data-testid="friend-id-qr-modal"]')).toBeVisible();
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should handle network interruptions gracefully', async ({ page }) => {
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      
      // Simulate network offline
      await page.context().setOffline(true);
      
      await page.click('text=Friends');
      
      // Should handle offline state gracefully
      await expect(page.locator('[data-testid="friend-id-display"]')).toBeVisible();
      
      // Restore network
      await page.context().setOffline(false);
    });

    test('should load Friend ID data efficiently', async ({ page }) => {
      // Monitor network requests
      const responses: any[] = [];
      page.on('response', response => {
        if (response.url().includes('/api/friends/friend-id/')) {
          responses.push(response);
        }
      });
      
      // Login as User 1
      await page.click('[data-testid="sign-in-button"]');
      await page.fill('input[type="email"]', testUsers.user1.email);
      await page.fill('input[type="password"]', testUsers.user1.password);
      await page.click('button[type="submit"]');
      
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await page.click('text=Friends');
      
      // Should load Friend ID efficiently
      await expect(page.locator('[data-testid="friend-id-display"]')).toBeVisible();
      
      // Should not make excessive API calls
      expect(responses.length).toBeLessThanOrEqual(2);
    });
  });
});
