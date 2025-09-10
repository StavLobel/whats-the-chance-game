/**
 * Integration-style unit tests for the real friendIdApiService
 * Reproduces issue #43 where api.get/post return raw JSON (not { data })
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the api module to return RAW JSON objects (like fetchAPI does)
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '@/lib/api';
import { friendIdApiService } from '@/lib/friendIdApiService';

describe('friendIdApiService (issue #43 reproduction)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMyFriendId should map backend unique_id to friend_id (raw JSON response)', async () => {
    const backendResponse = { unique_id: '1234567890123456', message: 'Existing Friend ID retrieved' };
    vi.mocked(api.get).mockResolvedValue(backendResponse as any);

    // This expectation previously failed when service expected response.data
    const result = await friendIdApiService.getMyFriendId();

    expect(api.get).toHaveBeenCalledWith('/api/friends/unique-id/my');
    expect(result).toEqual({ friend_id: '1234567890123456', message: 'Existing Friend ID retrieved' });
  });

  it('generateFriendId should map backend unique_id to friend_id (raw JSON response)', async () => {
    const backendResponse = { unique_id: '9876543210987654', message: 'Friend ID generated successfully' };
    vi.mocked(api.post).mockResolvedValue(backendResponse as any);

    const result = await friendIdApiService.generateFriendId();

    expect(api.post).toHaveBeenCalledWith('/api/friends/unique-id/generate');
    expect(result).toEqual({ friend_id: '9876543210987654', message: 'Friend ID generated successfully' });
  });
});


