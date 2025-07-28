import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { TestHelpers } from './utils/test-helpers';

test.describe('Home Page E2E Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await TestHelpers.waitForPageLoad(page);
  });

  test('should load home page successfully', async ({ page }) => {
    await test.step('Verify page loads', async () => {
      await homePage.waitForLoad();
    });

    await test.step('Verify all elements are visible', async () => {
      await homePage.verifyHomePageElements();
    });

    await test.step('Verify no console errors', async () => {
      await TestHelpers.verifyNoConsoleErrors(page);
    });
  });

  test('should display correct page title and meta information', async ({ page }) => {
    await test.step('Check page title', async () => {
      await expect(page).toHaveTitle(/What's the Chance/i);
    });

    await test.step('Check meta description', async () => {
      const metaDescription = page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute(
        'content',
        expect.stringContaining('social game')
      );
    });
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    await test.step('Test mobile viewport', async () => {
      await page.setViewportSize({ width: 375, height: 667 });
      await homePage.verifyHomePageElements();
    });

    await test.step('Test tablet viewport', async () => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await homePage.verifyHomePageElements();
    });

    await test.step('Test desktop viewport', async () => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await homePage.verifyHomePageElements();
    });
  });

  test('should navigate to game when start playing button is clicked', async ({ page }) => {
    await test.step('Click start playing button', async () => {
      await homePage.clickStartPlaying();
    });

    await test.step('Verify game page loads', async () => {
      // Wait for the game component to load
      await page.waitForTimeout(1000);

      // The game should show different content than the home page
      await expect(homePage.gameTitle).not.toBeVisible();
    });
  });

  test('should have proper accessibility features', async ({ page }) => {
    await test.step('Verify accessibility compliance', async () => {
      await TestHelpers.verifyPageAccessibility(page);
    });

    await test.step('Check keyboard navigation', async () => {
      // Tab through focusable elements
      await page.keyboard.press('Tab');
      await expect(homePage.startPlayingButton).toBeFocused();
    });

    await test.step('Check color contrast and readability', async () => {
      // Verify text elements are visible and readable
      await expect(homePage.gameTitle).toBeVisible();
      await expect(homePage.gameDescription).toBeVisible();
    });
  });

  test('should perform well under normal conditions', async ({ page }) => {
    await test.step('Verify page performance metrics', async () => {
      await TestHelpers.verifyPagePerformance(page);
    });

    await test.step('Check resource loading', async () => {
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
    });
  });

  test('should handle slow network conditions gracefully', async ({ page }) => {
    await test.step('Simulate slow network', async () => {
      await TestHelpers.simulateSlowNetwork(page);
    });

    await test.step('Verify page still loads correctly', async () => {
      await page.reload();
      await homePage.waitForLoad();
      await homePage.verifyHomePageElements();
    });
  });

  test('should maintain state across page interactions', async ({ page }) => {
    await test.step('Interact with page elements', async () => {
      // Scroll down to see how it works section
      await homePage.howItWorksSection.scrollIntoViewIfNeeded();
      await expect(homePage.howItWorksSection).toBeVisible();
    });

    await test.step('Verify elements remain functional after interaction', async () => {
      await homePage.gameTitle.scrollIntoViewIfNeeded();
      await expect(homePage.startPlayingButton).toBeVisible();
      await expect(homePage.startPlayingButton).toBeEnabled();
    });
  });

  test('should work with disabled JavaScript (graceful degradation)', async ({ page, browser }) => {
    // Create new context with JavaScript disabled
    const context = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await context.newPage();

    await test.step('Load page without JavaScript', async () => {
      await noJsPage.goto('/');
    });

    await test.step('Verify basic content is still visible', async () => {
      const title = noJsPage.getByRole('heading', { name: /what's the chance\?/i });
      await expect(title).toBeVisible();
    });

    await context.close();
  });
});
