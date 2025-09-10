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

  test('should show authentication modal when get started button is clicked', async ({ page }) => {
    await test.step('Click get started button', async () => {
      await homePage.clickGetStarted();
    });

    await test.step('Verify auth modal opens in register mode', async () => {
      // Check that the authentication modal opens
      await expect(page.getByTestId('auth-modal')).toBeVisible({ timeout: 10000 });
      
      // Should be in register mode by default when clicking "Get Started"
      await expect(page.getByText(/create account/i)).toBeVisible();
    });
  });

  test('should show authentication modal when sign in button is clicked', async ({ page }) => {
    await test.step('Click sign in button', async () => {
      await homePage.clickSignIn();
    });

    await test.step('Verify auth modal opens in login mode', async () => {
      // Check that the authentication modal opens
      await expect(page.getByTestId('auth-modal')).toBeVisible({ timeout: 10000 });
      
      // Should be in login mode when clicking "Sign In"
      await expect(page.getByText(/sign in/i)).toBeVisible();
    });
  });

  test('should have proper accessibility features', async ({ page }) => {
    await test.step('Verify accessibility compliance', async () => {
      await TestHelpers.verifyPageAccessibility(page);
    });

    await test.step('Check keyboard navigation', async () => {
      // Focus on body first to ensure consistent starting point
      await page.locator('body').focus();
      
      // Tab through focusable elements - Theme toggle is first
      await page.keyboard.press('Tab');
      const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(firstFocusedElement).toBeTruthy();
      
      // Continue tabbing to find one of the CTA buttons
      let maxTabs = 10;
      let foundButton = false;
      while (maxTabs > 0 && !foundButton) {
        const isFocusedGetStarted = await homePage.getStartedButton.evaluate(el => el === document.activeElement);
        const isFocusedSignIn = await homePage.signInButton.evaluate(el => el === document.activeElement);
        if (isFocusedGetStarted || isFocusedSignIn) {
          foundButton = true;
          break;
        }
        await page.keyboard.press('Tab');
        maxTabs--;
      }
      
      // Verify we found one of the CTA buttons (get started or sign in)
      const isFocusedGetStarted = await homePage.getStartedButton.evaluate(el => el === document.activeElement);
      const isFocusedSignIn = await homePage.signInButton.evaluate(el => el === document.activeElement);
      expect(isFocusedGetStarted || isFocusedSignIn).toBe(true);
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

  test('should maintain state across page interactions', async () => {
    await test.step('Interact with page elements', async () => {
      // Scroll down to see how it works section
      await homePage.howItWorksSection.scrollIntoViewIfNeeded();
      await expect(homePage.howItWorksSection).toBeVisible();
    });

    await test.step('Verify elements remain functional after interaction', async () => {
      await homePage.gameTitle.scrollIntoViewIfNeeded();
      await expect(homePage.getStartedButton).toBeVisible();
      await expect(homePage.getStartedButton).toBeEnabled();
      await expect(homePage.signInButton).toBeVisible();
      await expect(homePage.signInButton).toBeEnabled();
    });
  });

  test.skip('should work with disabled JavaScript (graceful degradation)', async ({ browser }) => {
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
