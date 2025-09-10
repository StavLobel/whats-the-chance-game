import { api } from './api';

export interface UserDisplayInfo {
  uid: string;
  displayName: string;
  username?: string;
  email?: string;
  photoURL?: string;
}

export interface UserLookupResponse {
  users: Record<string, UserDisplayInfo>;
  errors: string[];
}

class UserLookupService {
  private cache = new Map<string, UserDisplayInfo>();
  private pendingRequests = new Map<string, Promise<UserDisplayInfo | null>>();

  /**
   * Get display information for multiple users efficiently
   */
  async getUsersDisplayInfo(userIds: string[]): Promise<UserLookupResponse> {
    const users: Record<string, UserDisplayInfo> = {};
    const errors: string[] = [];
    const uncachedIds: string[] = [];

    // Check cache first
    for (const uid of userIds) {
      const cached = this.cache.get(uid);
      if (cached) {
        users[uid] = cached;
      } else {
        uncachedIds.push(uid);
      }
    }

    // Fetch uncached users
    if (uncachedIds.length > 0) {
      try {
        const response = await api.post('/api/users/lookup', { 
          user_ids: uncachedIds 
        });
        
        for (const userData of response.users || []) {
          const displayInfo: UserDisplayInfo = {
            uid: userData.uid,
            displayName: this.getDisplayName(userData),
            username: userData.username,
            email: userData.email,
            photoURL: userData.photoURL,
          };
          
          this.cache.set(userData.uid, displayInfo);
          users[userData.uid] = displayInfo;
        }
      } catch (error) {
        console.error('Failed to lookup users:', error);
        
        // Create fallback entries for failed lookups
        for (const uid of uncachedIds) {
          const fallback: UserDisplayInfo = {
            uid,
            displayName: this.createFallbackDisplayName(uid),
          };
          
          this.cache.set(uid, fallback);
          users[uid] = fallback;
          errors.push(`Failed to lookup user ${uid}`);
        }
      }
    }

    return { users, errors };
  }

  /**
   * Get display information for a single user
   */
  async getUserDisplayInfo(userId: string): Promise<UserDisplayInfo> {
    // Check cache
    const cached = this.cache.get(userId);
    if (cached) return cached;

    // Check for pending request
    const pending = this.pendingRequests.get(userId);
    if (pending) return (await pending) || this.createFallbackUser(userId);

    // Create new request
    const request = this.fetchUserInfo(userId);
    this.pendingRequests.set(userId, request);

    try {
      const result = await request;
      return result || this.createFallbackUser(userId);
    } finally {
      this.pendingRequests.delete(userId);
    }
  }

  private async fetchUserInfo(userId: string): Promise<UserDisplayInfo | null> {
    try {
      const response = await api.get(`/api/users/${userId}`);
      const userData = response.data || response;
      
      // Debug logging to help identify user data issues
      console.log(`🔍 UserLookupService: Fetched user data for ${userId}:`, {
        uid: userData.uid,
        username: userData.username,
        displayName: userData.displayName,
        display_name: userData.display_name,
        first_name: userData.first_name,
        firstName: userData.firstName,
        email: userData.email
      });
      
      const displayName = this.getDisplayName(userData);
      console.log(`📝 UserLookupService: Resolved display name for ${userId}: "${displayName}"`);
      
      const displayInfo: UserDisplayInfo = {
        uid: userData.uid,
        displayName,
        username: userData.username,
        email: userData.email,
        photoURL: userData.photoURL,
      };
      
      this.cache.set(userId, displayInfo);
      return displayInfo;
    } catch (error) {
      console.error(`Failed to fetch user info for ${userId}:`, error);
      return null;
    }
  }

  private getDisplayName(userData: any): string {
    // Priority order for display name resolution:
    // 1. username (most preferred for @mentions)
    // 2. displayName (from Firebase Auth)
    // 3. display_name (from Firestore, snake_case variation)
    // 4. first_name (fallback from user profile)
    // 5. firstName (camelCase variation)
    // 6. email prefix (extract before @)
    // 7. fallback to "Unknown User"
    return userData.username || 
           userData.displayName || 
           userData.display_name ||
           userData.first_name ||
           userData.firstName ||
           (userData.email ? userData.email.split('@')[0] : null) ||
           'Unknown User';
  }

  private createFallbackDisplayName(userId: string): string {
    return `User ${userId.substring(0, 8)}...`;
  }

  private createFallbackUser(userId: string): UserDisplayInfo {
    const fallback: UserDisplayInfo = {
      uid: userId,
      displayName: this.createFallbackDisplayName(userId),
    };
    
    this.cache.set(userId, fallback);
    return fallback;
  }

  /**
   * Clear cache (useful for testing or when user data changes)
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Preload user data for better performance
   */
  async preloadUsers(userIds: string[]): Promise<void> {
    await this.getUsersDisplayInfo(userIds);
  }
}

export const userLookupService = new UserLookupService();
