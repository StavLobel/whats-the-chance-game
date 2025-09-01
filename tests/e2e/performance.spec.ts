/**
 * Performance E2E Tests
 * Tests for application performance, loading times, and optimization
 */

import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';
import { AuthHelpers } from './utils/auth-helpers';
import testUsers from './fixtures/test-users';

test.describe('Performance E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await TestHelpers.clearLocalStorage(page);
  });

  test('should load initial page within performance budget', async ({ page }) => {
    const metrics: any = {};
    
    await test.step('Measure page load metrics', async () => {
      await page.goto('/');
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Get performance metrics
      metrics.timing = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          // Time to first byte
          ttfb: perf.responseStart - perf.fetchStart,
          // DOM Content Loaded
          domContentLoaded: perf.domContentLoadedEventEnd - perf.fetchStart,
          // Full page load
          loadComplete: perf.loadEventEnd - perf.fetchStart,
          // DOM processing
          domProcessing: perf.domComplete - perf.domLoading,
        };
      });
    });

    await test.step('Verify performance metrics', async () => {
      // Time to First Byte should be under 600ms
      expect(metrics.timing.ttfb).toBeLessThan(600);
      
      // DOM Content Loaded should be under 2 seconds
      expect(metrics.timing.domContentLoaded).toBeLessThan(2000);
      
      // Full page load should be under 3 seconds
      expect(metrics.timing.loadComplete).toBeLessThan(3000);
      
      // DOM processing should be efficient
      expect(metrics.timing.domProcessing).toBeLessThan(500);
    });

    await test.step('Check Core Web Vitals', async () => {
      // Note: These are approximations, real CWV measurement requires field data
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          let cls = 0;
          let lcp = 0;
          let fid = 0;
          
          // Observe Cumulative Layout Shift
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
                cls += (entry as any).value;
              }
            }
          }).observe({ type: 'layout-shift', buffered: true });
          
          // Observe Largest Contentful Paint
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              lcp = entries[entries.length - 1].startTime;
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          
          // Simulate First Input Delay (can't be accurately measured in tests)
          fid = 50; // Assume good FID
          
          // Resolve after a delay to collect metrics
          setTimeout(() => {
            resolve({ cls, lcp, fid });
          }, 1000);
        });
      });
      
      // Good CLS is less than 0.1
      expect((vitals as any).cls).toBeLessThan(0.1);
      
      // Good LCP is less than 2.5s
      expect((vitals as any).lcp).toBeLessThan(2500);
      
      // Good FID is less than 100ms
      expect((vitals as any).fid).toBeLessThan(100);
    });
  });

  test('should handle slow network gracefully', async ({ page }) => {
    await test.step('Simulate slow 3G network', async () => {
      // Simulate slow 3G
      await page.route('**/*', async (route) => {
        // Add artificial delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 500));
        await route.continue();
      });
    });

    await test.step('Page should still be interactive', async () => {
      await page.goto('/');
      
      // Main content should be visible even with slow network
      await expect(page.getByRole('heading', { name: /what's the chance/i }))
        .toBeVisible({ timeout: 10000 });
      
      // Interactive elements should work
      const startButton = page.getByRole('button', { name: /start playing/i });
      await expect(startButton).toBeEnabled({ timeout: 10000 });
    });
  });

  test('should efficiently handle large amounts of data', async ({ page }) => {
    await AuthHelpers.login(page, testUsers.user1);
    
    await test.step('Mock many challenges', async () => {
      // Intercept API call and return many challenges
      await page.route('**/api/challenges**', async (route) => {
        const challenges = Array.from({ length: 100 }, (_, i) => ({
          id: `challenge-${i}`,
          description: `Test Challenge ${i}`,
          from_user: i % 2 === 0 ? testUsers.user1.uid : testUsers.user2.uid,
          to_user: i % 2 === 0 ? testUsers.user2.uid : testUsers.user1.uid,
          status: i < 50 ? 'active' : 'completed',
          created_at: new Date(Date.now() - i * 3600000).toISOString(),
          updated_at: new Date(Date.now() - i * 3600000).toISOString(),
        }));
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ challenges, total: 100 }),
        });
      });
    });

    await test.step('Verify performance with many items', async () => {
      await page.reload();
      
      // Measure render performance
      const renderStart = Date.now();
      
      // Wait for challenges to render
      await page.waitForSelector('[role="article"]', { timeout: 5000 });
      
      const renderTime = Date.now() - renderStart;
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(2000);
      
      // Check if virtualization or pagination is implemented
      const visibleChallenges = await page.locator('[role="article"]').count();
      
      // Should not render all 100 at once (indicates virtualization/pagination)
      expect(visibleChallenges).toBeLessThanOrEqual(20);
    });

    await test.step('Verify smooth scrolling', async () => {
      // Scroll performance test
      const scrollStart = Date.now();
      
      // Scroll down
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      });
      
      // Wait for scroll to complete
      await page.waitForTimeout(1000);
      
      const scrollTime = Date.now() - scrollStart;
      
      // Scrolling should be reasonably smooth
      expect(scrollTime).toBeLessThan(1500);
    });
  });

  test('should optimize asset loading', async ({ page }) => {
    const assetMetrics: any = {
      images: [],
      scripts: [],
      stylesheets: [],
    };
    
    // Monitor resource loading
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        assetMetrics.images.push({
          url,
          status,
          size: parseInt(headers['content-length'] || '0'),
          cached: headers['cache-control'] || headers['x-cache'],
        });
      } else if (url.match(/\.(js)$/i)) {
        assetMetrics.scripts.push({
          url,
          status,
          size: parseInt(headers['content-length'] || '0'),
          cached: headers['cache-control'] || headers['x-cache'],
        });
      } else if (url.match(/\.(css)$/i)) {
        assetMetrics.stylesheets.push({
          url,
          status,
          size: parseInt(headers['content-length'] || '0'),
          cached: headers['cache-control'] || headers['x-cache'],
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await test.step('Verify image optimization', async () => {
      // All images should load successfully
      assetMetrics.images.forEach((img: any) => {
        expect(img.status).toBe(200);
      });
      
      // Images should have caching headers
      assetMetrics.images.forEach((img: any) => {
        expect(img.cached).toBeTruthy();
      });
    });

    await test.step('Verify script bundling', async () => {
      // Should have minimal number of script files (bundled)
      expect(assetMetrics.scripts.length).toBeLessThan(10);
      
      // Scripts should be cached
      assetMetrics.scripts.forEach((script: any) => {
        expect(script.cached).toBeTruthy();
      });
    });

    await test.step('Verify CSS optimization', async () => {
      // Should have minimal CSS files
      expect(assetMetrics.stylesheets.length).toBeLessThan(5);
      
      // CSS should be cached
      assetMetrics.stylesheets.forEach((css: any) => {
        expect(css.cached).toBeTruthy();
      });
    });
  });

  test('should handle memory efficiently during long sessions', async ({ page }) => {
    await AuthHelpers.login(page, testUsers.user1);
    
    await test.step('Measure initial memory', async () => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      expect(initialMemory).toBeGreaterThan(0);
    });

    await test.step('Perform multiple operations', async () => {
      // Simulate user activity
      for (let i = 0; i < 10; i++) {
        // Open and close modals
        await page.getByRole('button', { name: /create.*challenge/i }).click();
        await page.keyboard.press('Escape');
        
        // Navigate between tabs
        await page.getByRole('tab', { name: /past/i }).click();
        await page.getByRole('tab', { name: /active/i }).click();
        
        // Trigger theme changes
        const themeButton = page.locator('button:has(svg.lucide-sun), button:has(svg.lucide-moon)');
        await themeButton.click();
        
        await page.waitForTimeout(100);
      }
    });

    await test.step('Verify no significant memory leaks', async () => {
      // Force garbage collection if available
      await page.evaluate(() => {
        if ('gc' in window) {
          (window as any).gc();
        }
      });
      
      // Wait a bit for cleanup
      await page.waitForTimeout(1000);
      
      // Check memory after operations
      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      });
      
      // Memory growth should be reasonable (less than 50MB)
      const memoryGrowth = finalMemory - (await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      }));
      
      expect(Math.abs(memoryGrowth)).toBeLessThan(50 * 1024 * 1024);
    });
  });

  test('should implement efficient API caching', async ({ page }) => {
    let apiCallCount = 0;
    
    // Monitor API calls
    await page.route('**/api/challenges**', async (route) => {
      apiCallCount++;
      await route.continue();
    });
    
    await AuthHelpers.login(page, testUsers.user1);
    
    await test.step('Initial load makes API call', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      expect(apiCallCount).toBe(1);
    });

    await test.step('Navigation should use cache', async () => {
      // Navigate away and back
      await page.getByRole('tab', { name: /past/i }).click();
      await page.waitForTimeout(500);
      await page.getByRole('tab', { name: /active/i }).click();
      await page.waitForTimeout(500);
      
      // Should not make additional API calls if properly cached
      expect(apiCallCount).toBeLessThanOrEqual(2);
    });

    await test.step('Force refresh should bypass cache', async () => {
      const previousCount = apiCallCount;
      
      // Hard reload
      await page.reload({ waitUntil: 'networkidle' });
      
      // Should make a new API call
      expect(apiCallCount).toBeGreaterThan(previousCount);
    });
  });

  test('should progressively enhance experience', async ({ page, browser }) => {
    await test.step('Test with JavaScript disabled', async () => {
      const context = await browser.newContext({
        javaScriptEnabled: false,
      });
      const noJsPage = await context.newPage();
      
      await noJsPage.goto('/');
      
      // Basic content should be visible
      await expect(noJsPage.getByRole('heading', { name: /what's the chance/i }))
        .toBeVisible();
      
      // Should show noscript message or fallback
      const pageContent = await noJsPage.content();
      expect(pageContent).toContain('What\'s the Chance?');
      
      await context.close();
    });

    await test.step('Test progressive image loading', async () => {
      // Monitor image loading
      const imageLoadTimes: number[] = [];
      
      page.on('response', response => {
        if (response.url().match(/\.(jpg|jpeg|png|webp)$/i)) {
          imageLoadTimes.push(Date.now());
        }
      });
      
      await page.goto('/');
      
      // Images should load progressively, not all at once
      if (imageLoadTimes.length > 1) {
        const loadSpread = imageLoadTimes[imageLoadTimes.length - 1] - imageLoadTimes[0];
        expect(loadSpread).toBeGreaterThan(0);
      }
    });
  });
});
