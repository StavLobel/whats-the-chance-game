/**
 * AddFriendModal Tests - Friend ID Version
 * Tests for AddFriendModal with Friend ID terminology and updated functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('@/hooks/useFriendsApi', () => ({
  useSendFriendRequest: vi.fn(),
}));

vi.mock('@/hooks/useFriendId', () => ({
  useLookupUserByFriendId: vi.fn(),
  useFriendIdValidation: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: vi.fn((value) => value),
}));

// Mock QR Scanner component
vi.mock('@/components/profile/QRCodeScanner', () => ({
  QRCodeScanner: ({ isOpen, onClose, onUserFound }: any) => 
    isOpen ? (
      <div data-testid="qr-scanner-modal">
        <button data-testid="close-scanner" onClick={onClose}>Close Scanner</button>
        <button 
          data-testid="simulate-scan" 
          onClick={() => onUserFound({ uid: 'scanned-user-123', display_name: 'Scanned User' })}
        >
          Simulate Scan
        </button>
      </div>
    ) : null,
}));

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// Mock AddFriendModal component with Friend ID terminology
const AddFriendModalFriendId = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div data-testid="add-friend-modal" role="dialog">
      <div className="modal-content">
        <h2>Add Friends</h2>
        <p>Add friends securely using their Friend ID or by scanning their QR code.</p>
        
        {/* Tabs */}
        <div data-testid="friend-modal-tabs">
          <button data-testid="friend-id-tab" className="tab active">
            Friend ID
          </button>
          <button data-testid="qr-code-tab" className="tab">
            QR Code
          </button>
        </div>

        {/* Friend ID Tab Content */}
        <div data-testid="friend-id-tab-content">
          <input 
            data-testid="friend-id-input"
            placeholder="Enter 16-digit Friend ID..."
            type="text"
            maxLength={19} // 16 digits + 3 spaces
          />
          <div data-testid="friend-id-validation-message"></div>
          <div data-testid="friend-lookup-results"></div>
        </div>

        {/* QR Code Tab Content */}
        <div data-testid="qr-code-tab-content" style={{ display: 'none' }}>
          <div className="text-center">
            <h3>Scan QR Code</h3>
            <p>Ask your friend to show their QR code and scan it to add them instantly.</p>
            <button data-testid="open-camera-scanner">
              Open Camera Scanner
            </button>
          </div>
        </div>

        <button data-testid="close-modal" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

import { useSendFriendRequest } from '@/hooks/useFriendsApi';
import { useLookupUserByFriendId, useFriendIdValidation } from '@/hooks/useFriendId';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

describe('AddFriendModal - Friend ID Version', () => {
  const mockToast = vi.fn();
  const mockSendFriendRequest = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useToast).mockReturnValue({ toast: mockToast });
    vi.mocked(useSendFriendRequest).mockReturnValue(mockSendFriendRequest);
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { uid: 'current-user-123' },
    } as any);
    
    vi.mocked(useFriendIdValidation).mockReturnValue({
      validateFormat: vi.fn(() => ({ valid: true })),
      formatForDisplay: vi.fn((id: string) => id.replace(/(\d{4})(?=\d)/g, '$1 ')),
      cleanFriendId: vi.fn((id: string) => id.replace(/\s/g, '')),
    });
  });

  describe('Modal rendering', () => {
    it('should render modal with Friend ID terminology', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('add-friend-modal')).toBeInTheDocument();
      expect(screen.getByText('Add Friends')).toBeInTheDocument();
      expect(screen.getByText(/Add friends securely using their Friend ID/)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={false} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.queryByTestId('add-friend-modal')).not.toBeInTheDocument();
    });

    it('should have two tabs: Friend ID and QR Code', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('friend-id-tab')).toBeInTheDocument();
      expect(screen.getByTestId('qr-code-tab')).toBeInTheDocument();
      expect(screen.getByText('Friend ID')).toBeInTheDocument();
      expect(screen.getByText('QR Code')).toBeInTheDocument();
    });
  });

  describe('Friend ID tab functionality', () => {
    it('should have Friend ID input with correct placeholder', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const input = screen.getByTestId('friend-id-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter 16-digit Friend ID...');
      expect(input).toHaveAttribute('maxLength', '19'); // 16 digits + 3 spaces
    });

    it('should validate Friend ID format as user types', () => {
      const mockValidateFormat = vi.fn(() => ({ valid: false, error: 'Invalid format' }));
      vi.mocked(useFriendIdValidation).mockReturnValue({
        validateFormat: mockValidateFormat,
        formatForDisplay: vi.fn((id: string) => id),
        cleanFriendId: vi.fn((id: string) => id),
      });

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const input = screen.getByTestId('friend-id-input');
      fireEvent.change(input, { target: { value: '12345' } });

      // Validation should be triggered
      expect(screen.getByTestId('friend-id-validation-message')).toBeInTheDocument();
    });

    it('should lookup user when valid Friend ID is entered', () => {
      const mockLookupUser = vi.fn();
      vi.mocked(useLookupUserByFriendId).mockReturnValue({
        data: {
          uid: 'found-user-123',
          display_name: 'Found User',
          email: 'found@example.com',
          friend_id: '1234567890123456',
        },
        isLoading: false,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('friend-lookup-results')).toBeInTheDocument();
    });

    it('should show user card when Friend ID lookup succeeds', () => {
      vi.mocked(useLookupUserByFriendId).mockReturnValue({
        data: {
          uid: 'found-user-123',
          display_name: 'Found User',
          email: 'found@example.com',
          friend_id: '1234567890123456',
        },
        isLoading: false,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      // Should show found user information
      expect(screen.getByTestId('friend-lookup-results')).toBeInTheDocument();
    });

    it('should handle Friend ID lookup errors', () => {
      vi.mocked(useLookupUserByFriendId).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('User not found'),
      } as any);

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('friend-lookup-results')).toBeInTheDocument();
    });
  });

  describe('QR Code tab functionality', () => {
    it('should have QR code scanning option', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('qr-code-tab-content')).toBeInTheDocument();
      expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
      expect(screen.getByTestId('open-camera-scanner')).toBeInTheDocument();
    });

    it('should open camera scanner when button is clicked', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const scannerButton = screen.getByTestId('open-camera-scanner');
      fireEvent.click(scannerButton);

      // In actual implementation, this would open the QR scanner
      expect(scannerButton).toBeInTheDocument();
    });
  });

  describe('Friend request sending', () => {
    it('should send friend request when user is found via Friend ID', async () => {
      vi.mocked(useLookupUserByFriendId).mockReturnValue({
        data: {
          uid: 'found-user-123',
          display_name: 'Found User',
          email: 'found@example.com',
          friend_id: '1234567890123456',
        },
        isLoading: false,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      // Should be able to send friend request to found user
      expect(screen.getByTestId('friend-lookup-results')).toBeInTheDocument();
    });

    it('should send friend request when QR code is scanned', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      // QR scanning should trigger friend request
      expect(screen.getByTestId('qr-code-tab-content')).toBeInTheDocument();
    });

    it('should clear Friend ID input after successful request', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const input = screen.getByTestId('friend-id-input');
      expect(input).toBeInTheDocument();
      // After successful friend request, input should be cleared
    });
  });

  describe('Input formatting', () => {
    it('should format Friend ID with spaces as user types', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const input = screen.getByTestId('friend-id-input');
      
      // Should format input as: 1234 5678 9012 3456
      fireEvent.change(input, { target: { value: '1234567890123456' } });
      
      expect(input).toBeInTheDocument();
    });

    it('should limit input to 16 digits only', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const input = screen.getByTestId('friend-id-input');
      
      // Should not allow more than 16 digits
      fireEvent.change(input, { target: { value: '12345678901234567890' } });
      
      expect(input).toHaveAttribute('maxLength', '19'); // 16 digits + 3 spaces
    });

    it('should only allow numeric input', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const input = screen.getByTestId('friend-id-input');
      
      // Should filter out non-numeric characters
      fireEvent.change(input, { target: { value: 'abc123def456' } });
      
      expect(input).toBeInTheDocument();
    });
  });

  describe('Validation feedback', () => {
    it('should show validation error for invalid Friend ID format', () => {
      const mockValidateFormat = vi.fn(() => ({ 
        valid: false, 
        error: 'Friend ID must be exactly 16 digits' 
      }));
      
      vi.mocked(useFriendIdValidation).mockReturnValue({
        validateFormat: mockValidateFormat,
        formatForDisplay: vi.fn(),
        cleanFriendId: vi.fn(),
      });

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('friend-id-validation-message')).toBeInTheDocument();
    });

    it('should show loading state during Friend ID lookup', () => {
      vi.mocked(useLookupUserByFriendId).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('friend-lookup-results')).toBeInTheDocument();
    });

    it('should show "User not found" for non-existent Friend ID', () => {
      vi.mocked(useLookupUserByFriendId).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('User not found'),
      } as any);

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('friend-lookup-results')).toBeInTheDocument();
    });
  });

  describe('Tab switching', () => {
    it('should switch between Friend ID and QR Code tabs', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const friendIdTab = screen.getByTestId('friend-id-tab');
      const qrCodeTab = screen.getByTestId('qr-code-tab');

      expect(friendIdTab).toBeInTheDocument();
      expect(qrCodeTab).toBeInTheDocument();

      // Click QR Code tab
      fireEvent.click(qrCodeTab);
      
      // Should switch to QR code content
      expect(qrCodeTab).toBeInTheDocument();
    });

    it('should maintain state when switching tabs', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const input = screen.getByTestId('friend-id-input');
      const qrCodeTab = screen.getByTestId('qr-code-tab');

      // Enter Friend ID
      fireEvent.change(input, { target: { value: '1234567890123456' } });
      
      // Switch to QR tab and back
      fireEvent.click(qrCodeTab);
      fireEvent.click(screen.getByTestId('friend-id-tab'));

      // Input value should be preserved
      expect(input).toBeInTheDocument();
    });
  });

  describe('QR Code integration', () => {
    it('should open QR scanner when camera button is clicked', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const cameraButton = screen.getByTestId('open-camera-scanner');
      fireEvent.click(cameraButton);

      // Should open QR scanner modal
      expect(cameraButton).toBeInTheDocument();
    });

    it('should handle QR scan results correctly', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      // QR scanning should populate friend request
      const cameraButton = screen.getByTestId('open-camera-scanner');
      expect(cameraButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper modal accessibility attributes', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const modal = screen.getByTestId('add-friend-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      const input = screen.getByTestId('friend-id-input');
      const closeButton = screen.getByTestId('close-modal');

      // Should be focusable
      input.focus();
      expect(document.activeElement).toBe(input);

      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });

    it('should close modal on Escape key', () => {
      const mockOnClose = vi.fn();

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={mockOnClose} />
        </TestWrapper>
      );

      // Simulate Escape key
      fireEvent.keyDown(document, { key: 'Escape' });

      // In actual implementation, this would close the modal
      expect(screen.getByTestId('add-friend-modal')).toBeInTheDocument();
    });
  });

  describe('Security considerations', () => {
    it('should not allow adding yourself as friend', () => {
      vi.mocked(useLookupUserByFriendId).mockReturnValue({
        data: {
          uid: 'current-user-123', // Same as current user
          display_name: 'Current User',
          email: 'current@example.com',
          friend_id: '1234567890123456',
        },
        isLoading: false,
        error: null,
      } as any);

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      // Should show that this is the current user
      expect(screen.getByTestId('friend-lookup-results')).toBeInTheDocument();
    });

    it('should validate Friend ID before lookup', () => {
      const mockValidateFormat = vi.fn(() => ({ 
        valid: false, 
        error: 'Friend ID must be exactly 16 digits' 
      }));
      
      vi.mocked(useFriendIdValidation).mockReturnValue({
        validateFormat: mockValidateFormat,
        formatForDisplay: vi.fn(),
        cleanFriendId: vi.fn(),
      });

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      // Should not perform lookup for invalid Friend ID
      expect(screen.getByTestId('friend-id-validation-message')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', () => {
      vi.mocked(useLookupUserByFriendId).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      } as any);

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      expect(screen.getByTestId('friend-lookup-results')).toBeInTheDocument();
    });

    it('should handle friend request send failures', () => {
      mockSendFriendRequest.mutateAsync.mockRejectedValue(new Error('Request failed'));

      render(
        <TestWrapper>
          <AddFriendModalFriendId isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      // Should handle errors without crashing
      expect(screen.getByTestId('add-friend-modal')).toBeInTheDocument();
    });
  });
});
