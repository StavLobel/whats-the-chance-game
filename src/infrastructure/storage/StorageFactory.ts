import { IStorage } from '../../domain/ports/IStorage';
import { LocalStorageImpl } from './LocalStorageImpl';
import { MemoryStorageImpl } from './MemoryStorageImpl';

/**
 * Factory for creating appropriate storage implementation based on environment
 */
export class StorageFactory {
  /**
   * Create storage implementation based on environment and availability
   */
  static createStorage(forceMemory = false): IStorage {
    // Force memory storage for tests or when explicitly requested
    if (forceMemory || this.isTestEnvironment()) {
      return new MemoryStorageImpl();
    }

    // Try localStorage first, fallback to memory storage
    try {
      return new LocalStorageImpl();
    } catch (error) {
      console.warn('localStorage unavailable, falling back to memory storage:', error);
      return new MemoryStorageImpl();
    }
  }

  /**
   * Detect if we're in a test environment
   */
  private static isTestEnvironment(): boolean {
    return (
      typeof process !== 'undefined' && 
      (process.env.NODE_ENV === 'test' || 
       process.env.VITEST === 'true' ||
       // Playwright test detection
       typeof window !== 'undefined' && 
       (window as any).__PLAYWRIGHT_TEST__ === true)
    );
  }

  /**
   * Create memory storage specifically for tests
   */
  static createTestStorage(): MemoryStorageImpl {
    return new MemoryStorageImpl();
  }
}
