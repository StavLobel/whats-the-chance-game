import { Page, expect } from '@playwright/test';

export class TestHelpers {
  static async waitForNetworkIdle(page: Page, timeout = 5000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async takeScreenshot(page: Page, name: string) {
    await page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  static async waitForPageLoad(page: Page) {
    await page.waitForLoadState('load');
    await page.waitForLoadState('domcontentloaded');
    await this.waitForNetworkIdle(page);
  }

  static async verifyPageAccessibility(page: Page) {
    // Check for basic accessibility features
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
    
    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Check for proper button roles
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      expect(ariaLabel || textContent).toBeTruthy();
    }
  }

  static async verifyNoConsoleErrors(page: Page) {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit for any console errors to appear
    await page.waitForTimeout(1000);
    
    if (consoleErrors.length > 0) {
      console.log('Console errors detected:', consoleErrors);
      throw new Error(`Console errors detected: ${consoleErrors.join(', ')}`);
    }
  }

  static async simulateSlowNetwork(page: Page) {
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
  }

  static async mockApiResponse(page: Page, url: string, response: any) {
    await page.route(url, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  static async clearLocalStorage(page: Page) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  static async setLocalStorage(page: Page, key: string, value: string) {
    await page.evaluate(({ key, value }) => {
      localStorage.setItem(key, value);
    }, { key, value });
  }

  static async getLocalStorage(page: Page, key: string): Promise<string | null> {
    return await page.evaluate((key) => {
      return localStorage.getItem(key);
    }, key);
  }

  static async verifyPagePerformance(page: Page) {
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        load: timing.loadEventEnd - timing.loadEventStart,
        domComplete: timing.domComplete - timing.fetchStart,
      };
    });

    // Assert reasonable performance metrics (in milliseconds)
    expect(navigationTiming.domContentLoaded).toBeLessThan(3000);
    expect(navigationTiming.load).toBeLessThan(5000);
    expect(navigationTiming.domComplete).toBeLessThan(5000);
  }
} 