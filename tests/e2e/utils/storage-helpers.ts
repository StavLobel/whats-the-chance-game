import { Page } from '@playwright/test';
import { MemoryStorageImpl } from '../../../src/infrastructure/storage/MemoryStorageImpl';

/**
 * Storage helpers for E2E tests with proper abstraction
 * Solves localStorage access issues in different browser contexts
 */
export class StorageHelpers {
  /**
   * Set up test storage that works in any browser context
   * Injects memory storage implementation into the page
   */
  static async setupTestStorage(page: Page): Promise<void> {
    await page.addInitScript(() => {
      // Create memory storage implementation in browser context
      class TestStorage {
        private storage = new Map<string, string>();

        getItem(key: string): string | null {
          return this.storage.get(key) || null;
        }

        setItem(key: string, value: string): void {
          this.storage.set(key, value);
        }

        removeItem(key: string): void {
          this.storage.delete(key);
        }

        clear(): void {
          this.storage.clear();
        }

        get length(): number {
          return this.storage.size;
        }

        key(index: number): string | null {
          const keys = Array.from(this.storage.keys());
          return keys[index] || null;
        }
      }

      // Replace browser storage with test storage
      const testStorage = new TestStorage();
      
      // Mark as test environment
      (window as any).__PLAYWRIGHT_TEST__ = true;
      
      // Override storage objects
      Object.defineProperty(window, 'localStorage', {
        value: testStorage,
        writable: false,
        configurable: true
      });

      Object.defineProperty(window, 'sessionStorage', {
        value: testStorage,
        writable: false,
        configurable: true
      });

      // Store reference for test helpers
      (window as any).__testStorage = testStorage;
    });
  }

  /**
   * Clear all storage data safely
   * Works in any browser context without security errors
   */
  static async clearStorage(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        // Use test storage if available
        if ((window as any).__testStorage) {
          (window as any).__testStorage.clear();
          return;
        }

        // Fallback to regular storage with error handling
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.clear();
          }
        } catch (error) {
          console.log('localStorage clear failed (expected in some contexts):', error);
        }

        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.clear();
          }
        } catch (error) {
          console.log('sessionStorage clear failed (expected in some contexts):', error);
        }
      });
    } catch (error) {
      // If page evaluation fails, just log and continue
      console.log('Storage clear skipped due to context issues:', error);
    }
  }

  /**
   * Set storage item safely
   */
  static async setStorageItem(page: Page, key: string, value: string): Promise<void> {
    await page.evaluate(
      ({ key, value }) => {
        try {
          if ((window as any).__testStorage) {
            (window as any).__testStorage.setItem(key, value);
          } else if (typeof localStorage !== 'undefined') {
            localStorage.setItem(key, value);
          }
        } catch (error) {
          console.log(`Storage setItem failed for key '${key}':`, error);
        }
      },
      { key, value }
    );
  }

  /**
   * Get storage item safely
   */
  static async getStorageItem(page: Page, key: string): Promise<string | null> {
    return await page.evaluate(key => {
      try {
        if ((window as any).__testStorage) {
          return (window as any).__testStorage.getItem(key);
        } else if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
      } catch (error) {
        console.log(`Storage getItem failed for key '${key}':`, error);
      }
      return null;
    }, key);
  }

  /**
   * Wait for storage to be ready
   */
  static async waitForStorageReady(page: Page, timeout = 5000): Promise<void> {
    await page.waitForFunction(
      () => {
        return (window as any).__testStorage || typeof localStorage !== 'undefined';
      },
      { timeout }
    );
  }

  /**
   * Get storage debug info for troubleshooting
   */
  static async getStorageDebugInfo(page: Page): Promise<{
    hasTestStorage: boolean;
    hasLocalStorage: boolean;
    storageSize: number;
    storageKeys: string[];
  }> {
    return await page.evaluate(() => {
      const hasTestStorage = !!(window as any).__testStorage;
      const hasLocalStorage = typeof localStorage !== 'undefined';
      
      let storageSize = 0;
      let storageKeys: string[] = [];

      try {
        if ((window as any).__testStorage) {
          const testStorage = (window as any).__testStorage;
          storageSize = testStorage.length;
          storageKeys = [];
          for (let i = 0; i < testStorage.length; i++) {
            const key = testStorage.key(i);
            if (key) storageKeys.push(key);
          }
        } else if (typeof localStorage !== 'undefined') {
          storageSize = localStorage.length;
          storageKeys = Object.keys(localStorage);
        }
      } catch (error) {
        console.log('Failed to get storage debug info:', error);
      }

      return {
        hasTestStorage,
        hasLocalStorage,
        storageSize,
        storageKeys
      };
    });
  }
}
