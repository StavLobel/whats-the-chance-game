/**
 * Storage configuration for E2E tests
 * Ensures consistent storage behavior across all test environments
 */

export const storageConfig = {
  // Enable storage abstraction for all tests
  useStorageAbstraction: true,
  
  // Clear storage between tests
  clearStorageBetweenTests: true,
  
  // Timeout for storage operations
  storageTimeout: 5000,
  
  // Debug storage operations
  debugStorage: process.env.DEBUG_STORAGE === 'true',
  
  // Storage keys to preserve between tests (if any)
  preserveKeys: [] as string[],
};

/**
 * Helper to apply storage configuration to a test page
 */
export async function applyStorageConfig(page: any) {
  if (storageConfig.debugStorage) {
    // Enable storage debugging
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem;
      const originalGetItem = Storage.prototype.getItem;
      const originalRemoveItem = Storage.prototype.removeItem;
      const originalClear = Storage.prototype.clear;

      Storage.prototype.setItem = function(key: string, value: string) {
        console.log(`[Storage Debug] setItem: ${key} = ${value}`);
        return originalSetItem.call(this, key, value);
      };

      Storage.prototype.getItem = function(key: string) {
        const value = originalGetItem.call(this, key);
        console.log(`[Storage Debug] getItem: ${key} = ${value}`);
        return value;
      };

      Storage.prototype.removeItem = function(key: string) {
        console.log(`[Storage Debug] removeItem: ${key}`);
        return originalRemoveItem.call(this, key);
      };

      Storage.prototype.clear = function() {
        console.log(`[Storage Debug] clear: all items removed`);
        return originalClear.call(this);
      };
    });
  }
}
