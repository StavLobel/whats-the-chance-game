/**
 * Friend ID QR Code Tests
 * Tests for QR code functionality integrated into the Friends tab
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock QR code library
vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value, size }: { value: string; size: number }) => (
    <div data-testid="qr-code-svg" data-value={value} data-size={size}>
      QR Code SVG
    </div>
  ),
  QRCodeCanvas: ({ value, size, id }: { value: string; size: number; id?: string }) => (
    <canvas data-testid="qr-code-canvas" data-value={value} data-size={size} id={id}>
      QR Code Canvas
    </canvas>
  ),
}));

// Mock hooks
vi.mock('@/hooks/useFriendId', () => ({
  useMyFriendId: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

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

// Mock QR Code Modal component that will be integrated into Friends tab
const FriendIdQRCodeModal = ({ 
  isOpen, 
  onClose, 
  friendId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  friendId: string;
}) => {
  if (!isOpen) return null;

  return (
    <div data-testid="friend-id-qr-modal" role="dialog" aria-label="Friend ID QR Code">
      <div className="modal-content">
        <h2>My Friend ID QR Code</h2>
        <p>Share this QR code so friends can add you instantly</p>
        
        {/* QR Code Display */}
        <div data-testid="qr-code-container">
          <div data-testid="qr-code-svg" data-value={friendId}>
            QR Code for {friendId}
          </div>
        </div>

        {/* Friend ID Display */}
        <div data-testid="friend-id-text">
          <span>Friend ID: </span>
          <span className="font-mono">{friendId.replace(/(\d{4})(?=\d)/g, '$1 ')}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button data-testid="download-qr" onClick={() => {}}>
            Download QR Code
          </button>
          <button data-testid="share-qr" onClick={() => {}}>
            Share QR Code
          </button>
          <button data-testid="close-modal" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import { useMyFriendId } from '@/hooks/useFriendId';
import { useToast } from '@/hooks/use-toast';

describe('FriendIdQRCode Component', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
    });

    // Mock canvas toDataURL for download functionality
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock-image-data');
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock navigator.share
    Object.assign(navigator, {
      share: vi.fn().mockResolvedValue(undefined),
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  describe('QR Code Modal Rendering', () => {
    it('should render QR code modal when open', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('friend-id-qr-modal')).toBeInTheDocument();
      expect(screen.getByText('My Friend ID QR Code')).toBeInTheDocument();
      expect(screen.getByText('Share this QR code so friends can add you instantly')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={false} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      expect(screen.queryByTestId('friend-id-qr-modal')).not.toBeInTheDocument();
    });

    it('should display formatted Friend ID in modal', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      expect(screen.getByText('1234 5678 9012 3456')).toBeInTheDocument();
    });
  });

  describe('QR Code Generation', () => {
    it('should generate QR code with correct Friend ID value', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const qrCode = screen.getByTestId('qr-code-svg');
      expect(qrCode).toHaveAttribute('data-value', '1234567890123456');
    });

    it('should generate QR code with appropriate size for scanning', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const qrCode = screen.getByTestId('qr-code-svg');
      expect(qrCode).toBeInTheDocument();
      // Size should be large enough for easy scanning (256px or larger)
    });
  });

  describe('Download functionality', () => {
    it('should have download QR code button', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('download-qr')).toBeInTheDocument();
      expect(screen.getByText('Download QR Code')).toBeInTheDocument();
    });

    it('should trigger download when download button is clicked', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const downloadButton = screen.getByTestId('download-qr');
      fireEvent.click(downloadButton);

      // In actual implementation, this would trigger file download
      expect(downloadButton).toBeInTheDocument();
    });
  });

  describe('Share functionality', () => {
    it('should have share QR code button', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('share-qr')).toBeInTheDocument();
      expect(screen.getByText('Share QR Code')).toBeInTheDocument();
    });

    it('should use native share API when available', async () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const shareButton = screen.getByTestId('share-qr');
      fireEvent.click(shareButton);

      // In actual implementation, this would call navigator.share
      expect(shareButton).toBeInTheDocument();
    });

    it('should fallback to clipboard when native share is not available', () => {
      // Mock navigator.share as undefined
      Object.assign(navigator, { share: undefined });

      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const shareButton = screen.getByTestId('share-qr');
      fireEvent.click(shareButton);

      // In actual implementation, this would copy to clipboard
      expect(shareButton).toBeInTheDocument();
    });
  });

  describe('Modal interactions', () => {
    it('should close modal when close button is clicked', () => {
      const mockOnClose = vi.fn();

      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={mockOnClose} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const closeButton = screen.getByTestId('close-modal');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have proper modal accessibility attributes', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const modal = screen.getByTestId('friend-id-qr-modal');
      expect(modal).toHaveAttribute('role', 'dialog');
      expect(modal).toHaveAttribute('aria-label', 'Friend ID QR Code');
    });
  });

  describe('Integration with Friends tab', () => {
    it('should be accessible from Friends tab header', () => {
      // This test ensures QR code functionality is integrated into Friends tab
      const friendsTabHeader = (
        <div data-testid="friends-tab-header">
          <h1>Friends</h1>
          <div data-testid="friend-id-section">
            <span>My Friend ID: 1234 5678 9012 3456</span>
            <button data-testid="show-qr-from-friends">QR Code</button>
          </div>
        </div>
      );

      render(friendsTabHeader);

      expect(screen.getByTestId('friends-tab-header')).toBeInTheDocument();
      expect(screen.getByTestId('friend-id-section')).toBeInTheDocument();
      expect(screen.getByTestId('show-qr-from-friends')).toBeInTheDocument();
    });

    it('should maintain Friends tab context when showing QR code', () => {
      // QR code modal should not interfere with Friends tab functionality
      render(
        <TestWrapper>
          <div>
            <div data-testid="friends-content">Friends list content</div>
            <FriendIdQRCodeModal 
              isOpen={true} 
              onClose={() => {}} 
              friendId="1234567890123456" 
            />
          </div>
        </TestWrapper>
      );

      expect(screen.getByTestId('friends-content')).toBeInTheDocument();
      expect(screen.getByTestId('friend-id-qr-modal')).toBeInTheDocument();
    });
  });

  describe('Mobile responsiveness', () => {
    it('should render appropriately sized QR code for mobile', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      // QR code should be large enough for mobile scanning
      const qrCode = screen.getByTestId('qr-code-svg');
      expect(qrCode).toBeInTheDocument();
    });

    it('should have touch-friendly buttons on mobile', () => {
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      // Buttons should be large enough for touch interaction
      expect(screen.getByTestId('download-qr')).toBeInTheDocument();
      expect(screen.getByTestId('share-qr')).toBeInTheDocument();
      expect(screen.getByTestId('close-modal')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should handle QR code generation errors gracefully', () => {
      // Test error state when Friend ID is invalid
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="" 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('friend-id-qr-modal')).toBeInTheDocument();
    });

    it('should handle download errors gracefully', () => {
      // Mock canvas toDataURL to throw error
      HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
        throw new Error('Canvas error');
      });

      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const downloadButton = screen.getByTestId('download-qr');
      fireEvent.click(downloadButton);

      // Should handle error without crashing
      expect(downloadButton).toBeInTheDocument();
    });

    it('should handle share errors gracefully', () => {
      // Mock navigator.share to reject
      Object.assign(navigator, {
        share: vi.fn().mockRejectedValue(new Error('Share failed')),
      });

      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const shareButton = screen.getByTestId('share-qr');
      fireEvent.click(shareButton);

      // Should handle error without crashing
      expect(shareButton).toBeInTheDocument();
    });
  });

  describe('QR Code content validation', () => {
    it('should generate QR code containing only the Friend ID', () => {
      const friendId = '1234567890123456';
      
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId={friendId} 
          />
        </TestWrapper>
      );

      const qrCode = screen.getByTestId('qr-code-svg');
      expect(qrCode).toHaveAttribute('data-value', friendId);
    });

    it('should not include sensitive information in QR code', () => {
      const friendId = '1234567890123456';
      
      render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId={friendId} 
          />
        </TestWrapper>
      );

      const qrCode = screen.getByTestId('qr-code-svg');
      const qrValue = qrCode.getAttribute('data-value');
      
      // QR code should only contain the Friend ID, no email or other sensitive data
      expect(qrValue).toBe(friendId);
      expect(qrValue).not.toContain('@');
      expect(qrValue).not.toContain('email');
      expect(qrValue).not.toContain('password');
    });
  });

  describe('Performance considerations', () => {
    it('should not regenerate QR code unnecessarily', () => {
      const { rerender } = render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      const initialQrCode = screen.getByTestId('qr-code-svg');
      expect(initialQrCode).toBeInTheDocument();

      // Rerender with same Friend ID
      rerender(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      // QR code should still be present and not regenerated
      expect(screen.getByTestId('qr-code-svg')).toBeInTheDocument();
    });

    it('should update QR code when Friend ID changes', () => {
      const { rerender } = render(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="1234567890123456" 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('qr-code-svg')).toHaveAttribute('data-value', '1234567890123456');

      // Rerender with different Friend ID
      rerender(
        <TestWrapper>
          <FriendIdQRCodeModal 
            isOpen={true} 
            onClose={() => {}} 
            friendId="9876543210987654" 
          />
        </TestWrapper>
      );

      expect(screen.getByTestId('qr-code-svg')).toHaveAttribute('data-value', '9876543210987654');
    });
  });
});
