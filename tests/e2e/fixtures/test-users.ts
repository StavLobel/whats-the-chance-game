/**
 * Test User Fixtures
 * Provides consistent test user data for E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  displayName: string;
  uid?: string;
}

export const testUsers = {
  user1: {
    email: 'testuser1@example.com',
    password: 'TestPassword123!',
    displayName: 'Test User 1',
    uid: 'test-user-1-uid'
  },
  user2: {
    email: 'testuser2@example.com', 
    password: 'TestPassword123!',
    displayName: 'Test User 2',
    uid: 'test-user-2-uid'
  },
  admin: {
    email: 'admin@example.com',
    password: 'AdminPassword123!',
    displayName: 'Admin User',
    uid: 'admin-user-uid'
  }
} as const;

export default testUsers;
