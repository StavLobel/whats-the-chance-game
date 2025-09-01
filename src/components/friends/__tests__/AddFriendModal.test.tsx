import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddFriendModal } from '../AddFriendModal';
import { useSearchUsers, useSendFriendRequest } from '@/hooks/useFriendsApi';
import { useAuth } from '@/hooks/useAuth';

// Mock the hooks
vi.mock('@/hooks/useFriendsApi');
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockSearchUsers = vi.mocked(useSearchUsers);
const mockSendFriendRequest = vi.mocked(useSendFriendRequest);
const mockUseAuth = vi.mocked(useAuth);

describe('AddFriendModal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock auth user
    mockUseAuth.mockReturnValue({
      user: { uid: 'current-user-id' },
      loading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });
    
    // Mock send friend request
    mockSendFriendRequest.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      mutate: vi.fn(),
      data: undefined,
      error: null,
      isIdle: true,
      isPaused: false,
      status: 'idle',
      variables: undefined,
      reset: vi.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
    });
  });

  const renderModal = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AddFriendModal isOpen={true} onClose={vi.fn()} {...props} />
      </QueryClientProvider>
    );
  };

  it('should show empty state when no search query', () => {
    mockSearchUsers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: false,
      refetch: vi.fn(),
      status: 'idle',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: false,
      isLoading: false,
      isLoadingError: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
      isSuccess: false,
    });

    renderModal();
    
    expect(screen.getByText('Search for friends')).toBeInTheDocument();
    expect(screen.getByText('Start typing a name or email to find people to connect with.')).toBeInTheDocument();
  });

  it('should search for users when typing', async () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      },
    ];

    mockSearchUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      refetch: vi.fn(),
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isLoadingError: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
    });

    renderModal();
    
    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('should show loading state while searching', async () => {
    mockSearchUsers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      isSuccess: false,
      refetch: vi.fn(),
      status: 'pending',
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: false,
      isFetchedAfterMount: false,
      isFetching: true,
      isLoadingError: false,
      isPending: true,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: true,
    });

    renderModal();
    
    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Searching users...')).toBeInTheDocument();
    });
  });

  it('should handle sending friend request', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue({});
    mockSendFriendRequest.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isSuccess: false,
      isError: false,
      mutate: vi.fn(),
      data: undefined,
      error: null,
      isIdle: true,
      isPaused: false,
      status: 'idle',
      variables: undefined,
      reset: vi.fn(),
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
    });

    const mockUsers = [
      {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      },
    ];

    mockSearchUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
      error: null,
      isSuccess: true,
      refetch: vi.fn(),
      status: 'success',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isLoadingError: false,
      isPending: false,
      isPlaceholderData: false,
      isRefetchError: false,
      isRefetching: false,
      isStale: false,
      isInitialLoading: false,
    });

    renderModal();
    
    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    const addButton = screen.getByRole('button', { name: /send friend request to test user/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ toUserId: 'user-1' });
    });
  });
});
