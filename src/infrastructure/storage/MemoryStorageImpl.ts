import { IStorage } from '../../domain/ports/IStorage';

/**
 * Memory-based storage implementation for testing
 * Provides consistent storage interface without browser dependencies
 */
export class MemoryStorageImpl implements IStorage {
  private storage = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  /**
   * Test helper methods
   */
  getSize(): number {
    return this.storage.size;
  }

  getAllEntries(): Record<string, string> {
    return Object.fromEntries(this.storage);
  }
}
