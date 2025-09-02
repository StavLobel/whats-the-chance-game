import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { UserPlus, UserX, X, QrCode, Hash } from 'lucide-react';
import { useSendFriendRequest } from '@/hooks/useFriendsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLookupUserByFriendId, useFriendIdValidation } from '@/hooks/useFriendId';
import { QRCodeScanner } from '@/components/profile/QRCodeScanner';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFriendModal = ({ isOpen, onClose }: AddFriendModalProps) => {
  const [friendId, setFriendId] = useState('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('friend-id');
  
  const debouncedFriendId = useDebounce(friendId, 500);
  
  const friendIdRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { validateFormat, cleanFriendId, formatForDisplay } = useFriendIdValidation();

  // Query for Friend ID lookup
  const cleanedFriendId = cleanFriendId(debouncedFriendId);
  const friendIdValidation = validateFormat(cleanedFriendId);
  const { data: friendIdUser, isLoading: friendIdLoading, error: friendIdError } = useLookupUserByFriendId(
    cleanedFriendId,
    Boolean(cleanedFriendId && friendIdValidation.valid)
  );

  // Mutation for sending friend requests
  const sendFriendRequest = useSendFriendRequest();

  // Focus Friend ID input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => friendIdRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSendFriendRequest = async (toUserId: string) => {
    try {
      await sendFriendRequest.mutateAsync({ toUserId });
      // Clear inputs after successful request
      setFriendId('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleQRScanResult = (scannedUser: any) => {
    // Auto-send friend request when QR code is scanned successfully
    handleSendFriendRequest(scannedUser.uid);
    setIsQRScannerOpen(false);
  };

  const handleFriendIdChange = (value: string) => {
    // Allow only digits and spaces, limit to 16 digits
    const cleaned = value.replace(/[^\d\s]/g, '');
    if (cleaned.replace(/\s/g, '').length <= 16) {
      setFriendId(cleaned);
    }
  };

  const formatFriendIdInput = (value: string) => {
    // Format as user types: 1234 5678 9012 3456
    const cleaned = cleanFriendId(value);
    return formatForDisplay(cleaned);
  };



  const renderFriendIdResults = () => {
    if (!cleanedFriendId) {
      return (
        <EmptyState
          icon={<Hash className="w-12 h-12" />}
          title="Enter a Friend ID"
          description="Type a 16-digit Friend ID to find and add a friend instantly."
        />
      );
    }

    if (!friendIdValidation.valid) {
      return (
        <EmptyState
          icon={<UserX className="w-12 h-12" />}
          title="Invalid Friend ID"
          description={friendIdValidation.error || "Please enter a valid 16-digit Friend ID."}
        />
      );
    }

    if (friendIdLoading) {
      return <LoadingState message="Looking up user..." />;
    }

    if (friendIdError) {
      return (
        <EmptyState
          icon={<UserX className="w-12 h-12" />}
          title="User not found"
          description="No user found with this Friend ID. Please check the ID and try again."
        />
      );
    }

    if (friendIdUser) {
      return (
        <div className="p-1">
          <Card className="p-4 hover:bg-accent transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={friendIdUser.photo_url || undefined} />
                  <AvatarFallback>
                    {friendIdUser.display_name?.charAt(0) || friendIdUser.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {friendIdUser.display_name || friendIdUser.email}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {friendIdUser.email}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    ID: {formatForDisplay(cleanedFriendId)}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendFriendRequest(friendIdUser.uid)}
                disabled={sendFriendRequest.isPending || friendIdUser.uid === user?.uid}
                aria-label={`Send friend request to ${friendIdUser.display_name || friendIdUser.email}`}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {friendIdUser.uid === user?.uid ? 'You' : 'Add Friend'}
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]" aria-describedby="add-friend-dialog-description">
                            <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Add Friends</DialogTitle>
            <DialogDescription id="add-friend-dialog-description">
              Add friends securely using their Friend ID or by scanning their QR code.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friend-id" className="flex items-center gap-2" data-testid="friend-id-tab">
                <Hash className="w-4 h-4" />
                Friend ID
              </TabsTrigger>
              <TabsTrigger value="qr-code" className="flex items-center gap-2" data-testid="qr-code-tab">
                <QrCode className="w-4 h-4" />
                QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friend-id" className="space-y-4 mt-4" data-testid="friend-id-tab-content">
              {/* Friend ID Input */}
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={friendIdRef}
                  type="text"
                  placeholder="Enter 16-digit Friend ID..."
                  value={formatFriendIdInput(friendId)}
                  onChange={(e) => handleFriendIdChange(e.target.value)}
                  className="pl-9 pr-4 font-mono tracking-wider"
                  aria-label="Enter Friend ID"
                  autoComplete="off"
                  maxLength={19} // 16 digits + 3 spaces
                  data-testid="friend-id-input"
                />
                {friendId && (
                  <button
                    onClick={() => setFriendId('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear Friend ID"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Validation Status */}
              {friendId && !friendIdValidation.valid && (
                <p className="text-sm text-destructive" data-testid="friend-id-validation-message">{friendIdValidation.error}</p>
              )}
              
              {/* Friend ID Results */}
              <div className="min-h-[200px]" data-testid="friend-lookup-results">{renderFriendIdResults()}</div>
            </TabsContent>

            <TabsContent value="qr-code" className="space-y-4 mt-4" data-testid="qr-code-tab-content">
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ask your friend to show their QR code and scan it to add them instantly.
                    </p>
                    <Button onClick={() => setIsQRScannerOpen(true)} className="w-full" data-testid="open-camera-scanner">
                      <QrCode className="w-4 h-4 mr-2" />
                      Open Camera Scanner
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={onClose} data-testid="close-modal">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      <QRCodeScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onUserFound={handleQRScanResult}
      />
    </>
  );
};
