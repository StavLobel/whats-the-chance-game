import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userLookupService } from '../userLookupService';
import { api } from '../api';

// Mock the API module
vi.mock('../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('UserLookupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userLookupService.clearCache();
  });

  afterEach(() => {
    userLookupService.clearCache();
  });

  describe('getUserDisplayInfo', () => {
    it('should return user info with username as display name', async () => {
      const mockUserData = {
        uid: 'user123',
        username: 'johndoe',
        displayName: 'John Doe',
        email: 'john@example.com',
        photoURL: 'https://example.com/photo.jpg'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(api.get).toHaveBeenCalledWith('/api/users/user123');
      expect(result).toEqual({
        uid: 'user123',
        displayName: 'johndoe', // username should be preferred
        username: 'johndoe',
        email: 'john@example.com',
        photoURL: 'https://example.com/photo.jpg'
      });
    });

    it('should fallback to displayName when username is not available', async () => {
      const mockUserData = {
        uid: 'user123',
        displayName: 'John Doe',
        email: 'john@example.com'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(result.displayName).toBe('John Doe');
    });

    it('should fallback to display_name (snake_case) when other fields are not available', async () => {
      const mockUserData = {
        uid: 'user123',
        display_name: 'Jane Smith',
        email: 'jane@example.com'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(result.displayName).toBe('Jane Smith');
    });

    it('should fallback to first_name when other display fields are not available', async () => {
      const mockUserData = {
        uid: 'user123',
        first_name: 'Alice',
        email: 'alice@example.com'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(result.displayName).toBe('Alice');
    });

    it('should fallback to firstName (camelCase) when other fields are not available', async () => {
      const mockUserData = {
        uid: 'user123',
        firstName: 'Bob',
        email: 'bob@example.com'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(result.displayName).toBe('Bob');
    });

    it('should fallback to email prefix when no display fields are available', async () => {
      const mockUserData = {
        uid: 'user123',
        email: 'charlie@example.com'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(result.displayName).toBe('charlie');
    });

    it('should fallback to "Unknown User" when no user data is available', async () => {
      const mockUserData = {
        uid: 'user123'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(result.displayName).toBe('Unknown User');
    });

    it('should handle API errors gracefully with fallback', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('User not found'));

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(result).toEqual({
        uid: 'user123',
        displayName: 'User user123...'
      });
    });

    it('should cache results for subsequent calls', async () => {
      const mockUserData = {
        uid: 'user123',
        username: 'johndoe',
        email: 'john@example.com'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      // First call
      const result1 = await userLookupService.getUserDisplayInfo('user123');
      
      // Second call should use cache
      const result2 = await userLookupService.getUserDisplayInfo('user123');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });
  });

  describe('getUsersDisplayInfo', () => {
    it('should lookup multiple users efficiently', async () => {
      const mockResponse = {
        users: [
          {
            uid: 'user1',
            displayName: 'John Doe',
            username: 'johndoe',
            email: 'john@example.com'
          },
          {
            uid: 'user2',
            displayName: 'Jane Smith',
            username: 'janesmith',
            email: 'jane@example.com'
          }
        ]
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await userLookupService.getUsersDisplayInfo(['user1', 'user2']);

      expect(api.post).toHaveBeenCalledWith('/api/users/lookup', {
        user_ids: ['user1', 'user2']
      });
      expect(result.users).toHaveProperty('user1');
      expect(result.users).toHaveProperty('user2');
      expect(result.users.user1.displayName).toBe('johndoe'); // username should be preferred
      expect(result.users.user2.displayName).toBe('janesmith'); // username should be preferred
    });

    it('should handle partial failures gracefully', async () => {
      const mockResponse = {
        users: [
          {
            uid: 'user1',
            displayName: 'johndoe',
            username: 'johndoe'
          }
          // user2 is missing from the response, indicating a failure
        ],
        errors: ['Failed to lookup user user2']
      };

      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await userLookupService.getUsersDisplayInfo(['user1', 'user2']);

      expect(result.users).toHaveProperty('user1');
      expect(result.users).not.toHaveProperty('user2'); // user2 is not in the response
      expect(result.users.user1.displayName).toBe('johndoe'); // username should be preferred
      // The service doesn't pass through API errors, only creates its own on API failures
      expect(result.errors).toEqual([]);
    });

    it('should handle complete API failure with fallbacks', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('API Error'));

      const result = await userLookupService.getUsersDisplayInfo(['user1', 'user2']);

      expect(result.users).toHaveProperty('user1');
      expect(result.users).toHaveProperty('user2');
      expect(result.users.user1.displayName).toBe('User user1...');
      expect(result.users.user2.displayName).toBe('User user2...');
      expect(result.errors).toHaveLength(2);
    });
  });

  describe('display name priority order', () => {
    it('should prioritize username over all other fields', async () => {
      const mockUserData = {
        uid: 'user123',
        username: 'johndoe',
        displayName: 'John Doe',
        display_name: 'Johnny Doe',
        first_name: 'John',
        firstName: 'Johnny',
        email: 'john@example.com'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(result.displayName).toBe('johndoe');
    });

    it('should follow correct priority order when username is not available', async () => {
      const mockUserData = {
        uid: 'user123',
        displayName: 'John Doe',
        display_name: 'Johnny Doe',
        first_name: 'John',
        firstName: 'Johnny',
        email: 'john@example.com'
      };

      vi.mocked(api.get).mockResolvedValue({ data: mockUserData });

      const result = await userLookupService.getUserDisplayInfo('user123');

      expect(result.displayName).toBe('John Doe'); // displayName should be preferred
    });
  });
});