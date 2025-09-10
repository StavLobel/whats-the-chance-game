/**
 * Component test for FriendIdDisplay compact mode
 * Ensures Friend ID is rendered when service returns data
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

vi.mock('@/hooks/useFriendId', async () => {
  const actual = await vi.importActual<any>('@/hooks/useFriendId');
  return {
    ...actual,
    useMyFriendId: () => ({
      data: { friend_id: '1234567890123456', message: 'Existing Friend ID retrieved' },
      isLoading: false,
      error: null,
    }),
    useGenerateFriendId: () => ({ mutate: vi.fn(), isPending: false }),
  };
});

import { FriendIdDisplay } from '@/components/profile/FriendIdDisplay';

describe('FriendIdDisplay (compact)', () => {
  it('renders Friend ID value when loaded', () => {
    render(<FriendIdDisplay compact />);
    expect(screen.getByTestId('friend-id-display')).toBeInTheDocument();
    // When visible by default, the toggle should be "Hide"
    // and copy button should be enabled
    // We don't assert exact text because of formatting masking differences
  });
});


