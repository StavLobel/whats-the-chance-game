/**
 * Storage abstraction interface
 * Enables environment-independent storage access for production and testing
 */
export interface IStorage {
  /**
   * Get item from storage
   * @param key - Storage key
   * @returns Value or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Set item in storage
   * @param key - Storage key
   * @param value - Value to store
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove item from storage
   * @param key - Storage key
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clear all items from storage
   */
  clear(): Promise<void>;

  /**
   * Get all keys in storage
   */
  keys(): Promise<string[]>;
}
