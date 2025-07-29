import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@/types/firebase';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth');

// Mock the ThemeToggle component
vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid='theme-toggle'>Theme Toggle</div>,
}));

// Mock the CreateChallengeModal component
vi.mock('@/components/CreateChallengeModal', () => ({
  CreateChallengeModal: () => (
    <div data-testid='create-challenge-modal'>Create Challenge Modal</div>
  ),
}));

// Mock the AuthModal component
vi.mock('@/components/auth/AuthModal', () => ({
  AuthModal: () => <div data-testid='auth-modal'>Auth Modal</div>,
}));

const mockUseAuth = vi.mocked(useAuth);

const createMockFirebaseUser = (overrides: Partial<FirebaseUser> = {}): FirebaseUser =>
  ({
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
      creationTime: '2023-01-01T00:00:00.000Z',
      lastSignInTime: '2023-01-01T00:00:00.000Z',
    },
    providerData: [],
    refreshToken: 'refresh-token',
    tenantId: null,
    delete: vi.fn(),
    getIdToken: vi.fn(),
    getIdTokenResult: vi.fn(),
    reload: vi.fn(),
    toJSON: vi.fn(),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    ...overrides,
  }) as FirebaseUser;

const createMockUser = (overrides: Partial<User> = {}): User =>
  ({
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
    createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
    updatedAt: { seconds: 1672531200, nanoseconds: 0 } as any,
    profile: {
      isPublic: true,
    },
    settings: {
      notifications: {
        challenges: true,
        messages: true,
        gameUpdates: true,
        marketing: false,
      },
      privacy: {
        showEmail: false,
        showProfile: true,
        allowFriendRequests: true,
      },
      theme: 'auto',
      language: 'en',
    },
    stats: {
      totalChallengesCreated: 0,
      totalChallengesAccepted: 0,
      totalGamesWon: 0,
      totalGamesLost: 0,
      totalGamesPlayed: 0,
      winPercentage: 0,
      averageGuessAccuracy: 0,
      streakCurrent: 0,
      streakBest: 0,
      favoriteRange: { min: 1, max: 10, count: 0 },
      lastActiveAt: { seconds: 1672531200, nanoseconds: 0 } as any,
    },
    ...overrides,
  }) as User;

const renderNavBar = (props = {}) => {
  const defaultProps = {
    onMenuClick: vi.fn(),
    notificationCount: 0,
    ...props,
  };

  return render(
    <BrowserRouter>
      <NavBar {...defaultProps} />
    </BrowserRouter>
  );
};

describe('NavBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication State', () => {
    it('should display login/signup buttons when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userDoc: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        sendPasswordReset: vi.fn(),
        setLoading: vi.fn(),
        refreshUserDoc: vi.fn(),
      });

      renderNavBar();

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    it('should display user menu when authenticated', () => {
      const mockFirebaseUser = createMockFirebaseUser();
      const mockUserDoc = createMockUser();

      mockUseAuth.mockReturnValue({
        user: mockFirebaseUser,
        userDoc: mockUserDoc,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        sendPasswordReset: vi.fn(),
        setLoading: vi.fn(),
        refreshUserDoc: vi.fn(),
      });

      renderNavBar();

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    it('should show loading state during authentication', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userDoc: null,
        isLoading: true,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        sendPasswordReset: vi.fn(),
        setLoading: vi.fn(),
        refreshUserDoc: vi.fn(),
      });

      renderNavBar();

      // Note: This test might need adjustment based on actual loading state implementation
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });
  });

  describe('Theme Toggle Integration', () => {
    it('should render theme toggle component', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        userDoc: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        sendPasswordReset: vi.fn(),
        setLoading: vi.fn(),
        refreshUserDoc: vi.fn(),
      });

      renderNavBar();

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('should call signOut when logout button is clicked', () => {
      const mockSignOut = vi.fn();
      const mockFirebaseUser = createMockFirebaseUser();
      const mockUserDoc = createMockUser();

      mockUseAuth.mockReturnValue({
        user: mockFirebaseUser,
        userDoc: mockUserDoc,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: mockSignOut,
        sendPasswordReset: vi.fn(),
        setLoading: vi.fn(),
        refreshUserDoc: vi.fn(),
      });

      renderNavBar();

      // Find and click the user dropdown trigger first
      const userButton = screen.getByText('Test User');
      fireEvent.click(userButton);

      // Then find and click the logout button
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockSignOut).toHaveBeenCalledOnce();
    });
  });

  describe('Menu Click Handler', () => {
    it('should call onMenuClick when menu button is clicked', () => {
      const mockOnMenuClick = vi.fn();

      mockUseAuth.mockReturnValue({
        user: null,
        userDoc: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        sendPasswordReset: vi.fn(),
        setLoading: vi.fn(),
        refreshUserDoc: vi.fn(),
      });

      renderNavBar({ onMenuClick: mockOnMenuClick });

      // Note: Menu button only shows on mobile (lg:hidden)
      // This test may need adjustment based on actual responsive behavior
      const menuButton = screen.getByRole('button', { name: /menu/i });
      fireEvent.click(menuButton);

      expect(mockOnMenuClick).toHaveBeenCalledOnce();
    });
  });

  describe('RTL Layout Support', () => {
    it.skip('should apply RTL layout when Hebrew language is selected', () => {
      // TODO: Implement RTL language detection and layout
      // This test is skipped until RTL functionality is implemented
      expect(true).toBe(false); // This will fail when test is unskipped
    });

    it.skip('should render navigation items in correct RTL order', () => {
      // TODO: Implement RTL navigation item ordering
      // This test is skipped until RTL functionality is implemented
      expect(true).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it.skip('should have proper ARIA labels for navigation', () => {
      // TODO: Add ARIA labels to NavBar component
      // This test is skipped until accessibility features are implemented
      mockUseAuth.mockReturnValue({
        user: null,
        userDoc: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        sendPasswordReset: vi.fn(),
        setLoading: vi.fn(),
        refreshUserDoc: vi.fn(),
      });

      renderNavBar();

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it.skip('should support keyboard navigation', () => {
      // TODO: Implement keyboard navigation support
      // This test is skipped until keyboard navigation is implemented
      mockUseAuth.mockReturnValue({
        user: null,
        userDoc: null,
        isLoading: false,
        isAuthenticated: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signInWithGoogle: vi.fn(),
        signOut: vi.fn(),
        sendPasswordReset: vi.fn(),
        setLoading: vi.fn(),
        refreshUserDoc: vi.fn(),
      });

      renderNavBar();

      const loginButton = screen.getByText('Login');
      expect(loginButton).toHaveAttribute('tabindex', '0');
    });
  });
});
