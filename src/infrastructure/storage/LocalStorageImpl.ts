import { IStorage } from '../../domain/ports/IStorage';

/**
 * Production localStorage implementation with graceful error handling
 * Handles security contexts and storage unavailability gracefully
 */
export class LocalStorageImpl implements IStorage {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      console.warn('localStorage unavailable, storage operations will be no-ops');
      return false;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.isAvailable) return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item '${key}' from localStorage:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.isAvailable) return;
    
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set item '${key}' in localStorage:`, error);
      // Graceful degradation - continue without storage
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.isAvailable) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove item '${key}' from localStorage:`, error);
    }
  }

  async clear(): Promise<void> {
    if (!this.isAvailable) return;
    
    try {
      localStorage.clear();
      // Also clear sessionStorage for complete cleanup
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  async keys(): Promise<string[]> {
    if (!this.isAvailable) return [];
    
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.warn('Failed to get localStorage keys:', error);
      return [];
    }
  }
}
