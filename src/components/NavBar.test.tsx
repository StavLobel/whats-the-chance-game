import { render, screen } from '@/test/utils/test-utils';
import { NavBar } from './NavBar';

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockProps = {
  onMenuClick: vi.fn(),
  notificationCount: 0,
};

describe('NavBar', () => {
  it('renders the app title', () => {
    render(<NavBar {...mockProps} />);

    expect(screen.getByText("What's the Chance?")).toBeInTheDocument();
  });

  it('shows sign in button when user is not authenticated', () => {
    render(<NavBar {...mockProps} />);

    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('is accessible', () => {
    render(<NavBar {...mockProps} />);

    // Check for navigation landmark
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
