/**
 * UniqueIdDisplay Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UniqueIdDisplay } from '../UniqueIdDisplay';

// Mock the hooks
vi.mock('@/hooks/useUniqueId', () => ({
  useMyUniqueId: vi.fn(),
  useGenerateUniqueId: vi.fn(),
  useUniqueIdValidation: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

import { useMyUniqueId, useGenerateUniqueId, useUniqueIdValidation } from '@/hooks/useUniqueId';
import { useToast } from '@/hooks/use-toast';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('UniqueIdDisplay', () => {
  const mockToast = vi.fn();
  const mockGenerateUniqueId = {
    mutate: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
    });
    
    vi.mocked(useGenerateUniqueId).mockReturnValue(mockGenerateUniqueId);
    
    vi.mocked(useUniqueIdValidation).mockReturnValue({
      validateFormat: vi.fn(),
      formatForDisplay: vi.fn((id: string) => id.replace(/(\d{4})(?=\d)/g, '$1 ')),
      cleanUniqueId: vi.fn((id: string) => id.replace(/\s/g, '')),
    });

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should render loading state', () => {
    vi.mocked(useMyUniqueId).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <UniqueIdDisplay />
      </TestWrapper>
    );

    expect(screen.getByText('Unique ID')).toBeInTheDocument();
    expect(screen.getByText('Your personal 16-digit identifier for friend requests')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.mocked(useMyUniqueId).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    } as any);

    render(
      <TestWrapper>
        <UniqueIdDisplay />
      </TestWrapper>
    );

    expect(screen.getByText('Error Loading Unique ID')).toBeInTheDocument();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('should render generate ID state when user has no unique ID', () => {
    vi.mocked(useMyUniqueId).mockReturnValue({
      data: { unique_id: null, message: '' },
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <UniqueIdDisplay />
      </TestWrapper>
    );

    expect(screen.getByText('Generate your personal identifier for friend requests')).toBeInTheDocument();
    expect(screen.getByText('Generate Unique ID')).toBeInTheDocument();
  });

  it('should render unique ID when user has one', () => {
    vi.mocked(useMyUniqueId).mockReturnValue({
      data: { 
        unique_id: '1234567890123456', 
        message: 'Existing unique ID retrieved' 
      },
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <UniqueIdDisplay />
      </TestWrapper>
    );

    expect(screen.getByText('Share this ID with friends so they can send you friend requests')).toBeInTheDocument();
    expect(screen.getByText('Show')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Regenerate')).toBeInTheDocument();
  });

  it('should show/hide unique ID when toggle button is clicked', () => {
    vi.mocked(useMyUniqueId).mockReturnValue({
      data: { 
        unique_id: '1234567890123456', 
        message: 'Existing unique ID retrieved' 
      },
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <UniqueIdDisplay />
      </TestWrapper>
    );

    // Initially hidden
    expect(screen.getByText('•••• •••• •••• ••••')).toBeInTheDocument();
    expect(screen.getByText('Show')).toBeInTheDocument();

    // Click show button
    fireEvent.click(screen.getByText('Show'));
    
    expect(screen.getByText('Hide')).toBeInTheDocument();
  });

  it('should copy unique ID to clipboard when copy button is clicked', async () => {
    vi.mocked(useMyUniqueId).mockReturnValue({
      data: { 
        unique_id: '1234567890123456', 
        message: 'Existing unique ID retrieved' 
      },
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <UniqueIdDisplay />
      </TestWrapper>
    );

    // Show the ID first
    fireEvent.click(screen.getByText('Show'));
    
    // Click copy button
    fireEvent.click(screen.getByText('Copy'));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1234567890123456');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Copied!',
        description: 'Your unique ID has been copied to clipboard',
      });
    });
  });

  it('should call regenerate function when regenerate button is clicked', () => {
    vi.mocked(useMyUniqueId).mockReturnValue({
      data: { 
        unique_id: '1234567890123456', 
        message: 'Existing unique ID retrieved' 
      },
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <UniqueIdDisplay />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Regenerate'));

    expect(mockGenerateUniqueId.mutate).toHaveBeenCalled();
  });

  it('should disable copy button when ID is hidden', () => {
    vi.mocked(useMyUniqueId).mockReturnValue({
      data: { 
        unique_id: '1234567890123456', 
        message: 'Existing unique ID retrieved' 
      },
      isLoading: false,
      error: null,
    } as any);

    render(
      <TestWrapper>
        <UniqueIdDisplay />
      </TestWrapper>
    );

    const copyButton = screen.getByText('Copy').closest('button');
    expect(copyButton).toBeDisabled();
  });
});
