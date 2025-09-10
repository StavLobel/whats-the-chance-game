import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChallengeCard } from '../ChallengeCard';
import { Challenge } from '@/types/challenge';

// Mock the useUserDisplay hook
vi.mock('@/hooks/useUserDisplay', () => ({
  useUserDisplay: vi.fn(),
}));

const mockChallenge: Challenge = {
  id: 'challenge123',
  from_user: 'user123',
  to_user: 'user456',
  description: 'Test challenge description',
  status: 'pending',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  range: {
    min: 1,
    max: 100
  }
};

describe('ChallengeCard', () => {
  const mockUseUserDisplay = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Import the mocked hook
    const { useUserDisplay } = await import('@/hooks/useUserDisplay');
    vi.mocked(useUserDisplay).mockImplementation(mockUseUserDisplay);
  });

  it('should display username when user lookup is successful', () => {
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: {
        uid: 'user123',
        displayName: 'johndoe',
        username: 'johndoe',
        email: 'john@example.com',
        photoURL: 'https://example.com/photo.jpg'
      },
      loading: false,
      error: null
    });

    render(<ChallengeCard challenge={mockChallenge} />);

    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('challenged you')).toBeInTheDocument();
  });

  it('should display loading state while user lookup is in progress', () => {
    mockUseUserDisplay.mockReturnValue({
      displayName: 'User user123...',
      userInfo: null,
      loading: true,
      error: null
    });

    render(<ChallengeCard challenge={mockChallenge} />);

    expect(screen.getByText('@Loading...')).toBeInTheDocument();
    expect(screen.getByText('challenged you')).toBeInTheDocument();
  });

  it('should display fallback name when user lookup fails', () => {
    mockUseUserDisplay.mockReturnValue({
      displayName: 'User user123...',
      userInfo: {
        uid: 'user123',
        displayName: 'User user123...'
      },
      loading: false,
      error: 'User not found'
    });

    render(<ChallengeCard challenge={mockChallenge} />);

    expect(screen.getByText('@User user123...')).toBeInTheDocument();
    expect(screen.getByText('challenged you')).toBeInTheDocument();
  });

  it('should display challenge description', () => {
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: null,
      loading: false,
      error: null
    });

    render(<ChallengeCard challenge={mockChallenge} />);

    expect(screen.getByText('"Test challenge description"')).toBeInTheDocument();
  });

  it('should display challenge range when available', () => {
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: null,
      loading: false,
      error: null
    });

    render(<ChallengeCard challenge={mockChallenge} />);

    expect(screen.getByText('Range: 1-100')).toBeInTheDocument();
  });

  it('should display correct status badge for pending challenge', () => {
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: null,
      loading: false,
      error: null
    });

    render(<ChallengeCard challenge={mockChallenge} />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should display correct status badge for accepted challenge', () => {
    const acceptedChallenge = { ...mockChallenge, status: 'accepted' as const };
    
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: null,
      loading: false,
      error: null
    });

    render(<ChallengeCard challenge={acceptedChallenge} />);

    expect(screen.getByText('Accepted')).toBeInTheDocument();
  });

  it('should display correct status badge for completed challenge', () => {
    const completedChallenge = { ...mockChallenge, status: 'completed' as const };
    
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: null,
      loading: false,
      error: null
    });

    render(<ChallengeCard challenge={completedChallenge} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should call onAccept when accept button is clicked', () => {
    const mockOnAccept = vi.fn();
    
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: null,
      loading: false,
      error: null
    });

    render(
      <ChallengeCard 
        challenge={mockChallenge} 
        onAccept={mockOnAccept}
      />
    );

    const acceptButton = screen.getByText('Accept Challenge');
    acceptButton.click();

    expect(mockOnAccept).toHaveBeenCalledWith('challenge123');
  });

  it('should call onReject when reject button is clicked', () => {
    const mockOnReject = vi.fn();
    
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: null,
      loading: false,
      error: null
    });

    render(
      <ChallengeCard 
        challenge={mockChallenge} 
        onReject={mockOnReject}
      />
    );

    const rejectButton = screen.getByText('Decline');
    rejectButton.click();

    expect(mockOnReject).toHaveBeenCalledWith('challenge123');
  });

  it('should call onClick when card is clicked', () => {
    const mockOnClick = vi.fn();
    
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: null,
      loading: false,
      error: null
    });

    render(
      <ChallengeCard 
        challenge={mockChallenge} 
        onClick={mockOnClick}
      />
    );

    const card = screen.getByRole('button', { hidden: true }); // Card has cursor-pointer class
    card.click();

    expect(mockOnClick).toHaveBeenCalledWith('challenge123');
  });

  it('should not show action buttons for non-pending challenges', () => {
    const acceptedChallenge = { ...mockChallenge, status: 'accepted' as const };
    
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: null,
      loading: false,
      error: null
    });

    render(<ChallengeCard challenge={acceptedChallenge} />);

    expect(screen.queryByText('Accept Challenge')).not.toBeInTheDocument();
    expect(screen.queryByText('Decline')).not.toBeInTheDocument();
  });

  it('should display user avatar when photoURL is available', () => {
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: {
        uid: 'user123',
        displayName: 'johndoe',
        username: 'johndoe',
        email: 'john@example.com',
        photoURL: 'https://example.com/photo.jpg'
      },
      loading: false,
      error: null
    });

    render(<ChallengeCard challenge={mockChallenge} />);

    const avatar = screen.getByRole('img');
    expect(avatar).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('should display user initials when photoURL is not available', () => {
    mockUseUserDisplay.mockReturnValue({
      displayName: 'johndoe',
      userInfo: {
        uid: 'user123',
        displayName: 'johndoe',
        username: 'johndoe',
        email: 'john@example.com'
      },
      loading: false,
      error: null
    });

    render(<ChallengeCard challenge={mockChallenge} />);

    // The avatar fallback should show the first letter of the display name
    expect(screen.getByText('J')).toBeInTheDocument(); // First letter of 'johndoe'
  });
});
