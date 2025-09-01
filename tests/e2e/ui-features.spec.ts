/**
 * UI Features E2E Tests
 * Tests for theme switching, responsive design, and UI interactions
 */

import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';
import { TestHelpers } from './utils/test-helpers';
import { GamePage } from './pages/GamePage';
import { HomePage } from './pages/HomePage';
import testUsers from './fixtures/test-users';

test.describe('UI Features E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await TestHelpers.clearLocalStorage(page);
    await page.goto('/');
    await TestHelpers.waitForPageLoad(page);
  });

  test('should toggle theme between light and dark modes', async ({ page }) => {
    const gamePage = new GamePage(page);
    
    await test.step('Check initial theme (should follow system)', async () => {
      // Get system preference
      const prefersDark = await page.evaluate(() => 
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
      
      const isDark = await gamePage.isDarkMode();
      expect(isDark).toBe(prefersDark);
    });

    await test.step('Toggle to opposite theme', async () => {
      const initialDarkMode = await gamePage.isDarkMode();
      await gamePage.toggleTheme();
      
      // Wait for theme transition
      await page.waitForTimeout(300);
      
      const newDarkMode = await gamePage.isDarkMode();
      expect(newDarkMode).toBe(!initialDarkMode);
    });

    await test.step('Verify theme persists on reload', async () => {
      const currentDarkMode = await gamePage.isDarkMode();
      
      await page.reload();
      await TestHelpers.waitForPageLoad(page);
      
      const reloadedDarkMode = await gamePage.isDarkMode();
      expect(reloadedDarkMode).toBe(currentDarkMode);
    });

    await test.step('Verify theme applies to all components', async () => {
      // Login to see more UI components
      await AuthHelpers.login(page, testUsers.user1);
      
      // Toggle to dark mode
      if (!(await gamePage.isDarkMode())) {
        await gamePage.toggleTheme();
      }
      
      // Check various UI elements have dark theme classes
      const body = page.locator('body');
      const bodyClasses = await body.getAttribute('class');
      expect(bodyClasses).toContain('dark');
      
      // Check that cards have appropriate dark theme styling
      const cards = page.locator('[role="article"]');
      if (await cards.first().isVisible()) {
        const cardClasses = await cards.first().getAttribute('class');
        expect(cardClasses).toMatch(/dark:|bg-gray-800|bg-slate-800/);
      }
    });
  });

  test('should be fully responsive across different screen sizes', async ({ page }) => {
    const gamePage = new GamePage(page);
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1200, height: 800 },
      { name: 'Wide Desktop', width: 1920, height: 1080 }
    ];

    await AuthHelpers.login(page, testUsers.user1);

    for (const viewport of viewports) {
      await test.step(`Test ${viewport.name} viewport (${viewport.width}x${viewport.height})`, async () => {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500); // Wait for resize animations
        
        // Verify essential elements are visible
        await expect(gamePage.navBar).toBeVisible();
        await expect(gamePage.createChallengeButton).toBeVisible();
        
        // On mobile, check if menu button appears
        if (viewport.width < 768) {
          const menuButton = page.locator('button:has(svg.lucide-menu)');
          await expect(menuButton).toBeVisible();
          
          // User menu might be hidden in mobile menu
          const userMenuVisible = await gamePage.userMenu.isVisible();
          if (!userMenuVisible) {
            // Click menu button to open mobile menu
            await menuButton.click();
            await expect(gamePage.userMenu).toBeVisible();
            // Close menu
            await menuButton.click();
          }
        } else {
          // On larger screens, user menu should be directly visible
          await expect(gamePage.userMenu).toBeVisible();
        }
        
        // Verify no horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBe(false);
      });
    }
  });

  test('should maintain proper RTL layout for Hebrew content', async ({ page }) => {
    test.skip(); // Skip until RTL is implemented
    
    await test.step('Switch to Hebrew', async () => {
      // This would require language switcher implementation
      await page.locator('[data-testid="language-selector"]').selectOption('he');
    });

    await test.step('Verify RTL layout', async () => {
      const html = page.locator('html');
      await expect(html).toHaveAttribute('dir', 'rtl');
      await expect(html).toHaveAttribute('lang', 'he');
      
      // Verify text alignment
      const body = page.locator('body');
      const textAlign = await body.evaluate(el => 
        window.getComputedStyle(el).textAlign
      );
      expect(textAlign).toBe('right');
    });
  });

  test('should handle keyboard navigation properly', async ({ page }) => {
    const gamePage = new GamePage(page);
    
    await test.step('Tab through main navigation', async () => {
      // Start from body
      await page.locator('body').click();
      
      // Tab to first interactive element
      await page.keyboard.press('Tab');
      
      // Should focus on skip link or first nav item
      const focusedElement = await page.evaluate(() => 
        document.activeElement?.tagName
      );
      expect(['A', 'BUTTON']).toContain(focusedElement);
    });

    await test.step('Navigate with arrow keys in dropdowns', async () => {
      await AuthHelpers.login(page, testUsers.user1);
      
      // Open user menu
      await gamePage.userMenu.click();
      
      // Should be able to navigate menu items with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      
      // Press Enter to select
      await page.keyboard.press('Enter');
      
      // Menu should close
      await expect(page.locator('[role="menu"]')).not.toBeVisible();
    });

    await test.step('Escape key closes modals', async () => {
      // Open create challenge modal
      await gamePage.createChallengeButton.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Modal should close
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });
  });

  test('should show loading states appropriately', async ({ page }) => {
    await test.step('Show loading during authentication', async () => {
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.getByPlaceholder(/email/i).fill(testUsers.user1.email);
      await page.getByPlaceholder(/password/i).fill(testUsers.user1.password);
      
      // Start monitoring for loading state
      const loadingPromise = page.waitForSelector(
        'button:has-text("Sign in")[disabled], button:has(svg.animate-spin)',
        { state: 'visible' }
      );
      
      await page.getByRole('button', { name: /sign in/i }).last().click();
      
      // Should show loading state
      await loadingPromise;
    });

    await test.step('Show loading when fetching challenges', async () => {
      const gamePage = new GamePage(page);
      
      // Monitor network requests
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/api/challenges') && response.status() === 200
      );
      
      // Reload to trigger fetch
      await page.reload();
      
      // Should show loading skeleton or spinner
      const loadingElement = page.locator(
        '[role="status"], .animate-pulse, svg.animate-spin'
      ).first();
      
      // Loading element might appear very briefly
      const wasVisible = await loadingElement.isVisible({ timeout: 100 }).catch(() => false);
      
      // Wait for response
      await responsePromise;
      
      // Loading should be gone
      await expect(loadingElement).not.toBeVisible();
    });
  });

  test('should display appropriate empty states', async ({ page }) => {
    const gamePage = new GamePage(page);
    
    await AuthHelpers.login(page, testUsers.user1);
    
    await test.step('Show empty state for challenges', async () => {
      // Assuming new user has no challenges
      await gamePage.verifyEmptyState();
      
      // Empty state should have call to action
      await expect(page.getByText(/create.*first.*challenge/i)).toBeVisible();
    });

    await test.step('Show empty state in past challenges tab', async () => {
      await gamePage.switchToTab('past');
      
      // Should show appropriate empty message
      await expect(page.getByText(/no.*completed.*challenges/i)).toBeVisible();
    });
  });

  test('should handle theme preference changes from system', async ({ page }) => {
    const gamePage = new GamePage(page);
    
    await test.step('Simulate system theme change', async () => {
      // Get initial theme
      const initialDark = await gamePage.isDarkMode();
      
      // Simulate system preference change
      await page.emulateMedia({ colorScheme: initialDark ? 'light' : 'dark' });
      
      // If user hasn't manually set theme, it should follow system
      const hasManualTheme = await page.evaluate(() => 
        localStorage.getItem('theme') !== null
      );
      
      if (!hasManualTheme) {
        const newDark = await gamePage.isDarkMode();
        expect(newDark).toBe(!initialDark);
      }
    });
  });

  test('should maintain UI state during real-time updates', async ({ page, browser }) => {
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    
    try {
      const gamePage1 = new GamePage(page);
      const gamePage2 = new GamePage(page2);
      
      await test.step('Setup both users', async () => {
        await AuthHelpers.login(page, testUsers.user1);
        
        await page2.goto('/');
        await AuthHelpers.login(page2, testUsers.user2);
      });

      await test.step('User 1 starts creating challenge', async () => {
        // Open create modal
        await gamePage1.createChallengeButton.click();
        
        // Start typing description
        const descriptionInput = page.getByPlaceholder(/describe.*challenge/i);
        await descriptionInput.fill('This is a test chall');
      });

      await test.step('User 2 creates challenge to trigger update', async () => {
        // This should trigger real-time update for User 1
        await gamePage2.createChallenge(
          'Real-time UI Test',
          testUsers.user1.email
        );
      });

      await test.step('Verify User 1 modal stays open with content', async () => {
        // Modal should still be open
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Input should still have the text
        const descriptionInput = page.getByPlaceholder(/describe.*challenge/i);
        const value = await descriptionInput.inputValue();
        expect(value).toBe('This is a test chall');
      });
    } finally {
      await context2.close();
    }
  });
});
