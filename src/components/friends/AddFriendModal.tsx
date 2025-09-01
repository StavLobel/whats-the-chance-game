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
import { Search, UserPlus, UserX, X, QrCode, Hash } from 'lucide-react';
import { useSearchUsers, useSendFriendRequest } from '@/hooks/useFriendsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLookupUserByUniqueId, useUniqueIdValidation } from '@/hooks/useUniqueId';
import { QRCodeScanner } from '@/components/profile/QRCodeScanner';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFriendModal = ({ isOpen, onClose }: AddFriendModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  const debouncedUniqueId = useDebounce(uniqueId, 500);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const uniqueIdRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { validateFormat, cleanUniqueId, formatForDisplay } = useUniqueIdValidation();

  // Query for search results
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(
    { query: debouncedQuery },
    debouncedQuery.length > 0
  );

  // Query for unique ID lookup
  const cleanedUniqueId = cleanUniqueId(debouncedUniqueId);
  const uniqueIdValidation = validateFormat(cleanedUniqueId);
  const { data: uniqueIdUser, isLoading: uniqueIdLoading, error: uniqueIdError } = useLookupUserByUniqueId(
    cleanedUniqueId,
    Boolean(cleanedUniqueId && uniqueIdValidation.valid)
  );

  // Mutation for sending friend requests
  const sendFriendRequest = useSendFriendRequest();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
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
      setSearchQuery('');
      setUniqueId('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleQRScanResult = (scannedUser: any) => {
    // Auto-send friend request when QR code is scanned successfully
    handleSendFriendRequest(scannedUser.uid);
    setIsQRScannerOpen(false);
  };

  const handleUniqueIdChange = (value: string) => {
    // Allow only digits and spaces, limit to 16 digits
    const cleaned = value.replace(/[^\d\s]/g, '');
    if (cleaned.replace(/\s/g, '').length <= 16) {
      setUniqueId(cleaned);
    }
  };

  const formatUniqueIdInput = (value: string) => {
    // Format as user types: 1234 5678 9012 3456
    const cleaned = cleanUniqueId(value);
    return formatForDisplay(cleaned);
  };

  const renderSearchResults = () => {
    if (debouncedQuery.length === 0) {
      return (
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title="Search for friends"
          description="Start typing a name or email to find people to connect with."
        />
      );
    }

    if (searchLoading) {
      return <LoadingState message="Searching users..." />;
    }

    if (searchResults && searchResults.length > 0) {
      return (
        <div className="grid gap-3 max-h-[400px] overflow-y-auto p-1">
          {searchResults.map((userResult) => (
            <Card key={userResult.uid || userResult.id} className="p-4 hover:bg-accent transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userResult.photoURL || undefined} />
                    <AvatarFallback>
                      {userResult.displayName?.charAt(0) || userResult.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {userResult.displayName || userResult.email}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {userResult.email}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleSendFriendRequest(userResult.uid || userResult.id)}
                  disabled={sendFriendRequest.isPending || (userResult.uid || userResult.id) === user?.uid}
                  aria-label={`Send friend request to ${userResult.displayName || userResult.email}`}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {(userResult.uid || userResult.id) === user?.uid ? 'You' : 'Add Friend'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <EmptyState
        icon={<UserX className="w-12 h-12" />}
        title="No users found"
        description={`No users found matching "${debouncedQuery}". Try a different search term.`}
      />
    );
  };

  const renderUniqueIdResults = () => {
    if (!cleanedUniqueId) {
      return (
        <EmptyState
          icon={<Hash className="w-12 h-12" />}
          title="Enter a Unique ID"
          description="Type a 16-digit unique ID to find and add a friend instantly."
        />
      );
    }

    if (!uniqueIdValidation.valid) {
      return (
        <EmptyState
          icon={<UserX className="w-12 h-12" />}
          title="Invalid Unique ID"
          description={uniqueIdValidation.error || "Please enter a valid 16-digit unique ID."}
        />
      );
    }

    if (uniqueIdLoading) {
      return <LoadingState message="Looking up user..." />;
    }

    if (uniqueIdError) {
      return (
        <EmptyState
          icon={<UserX className="w-12 h-12" />}
          title="User not found"
          description="No user found with this unique ID. Please check the ID and try again."
        />
      );
    }

    if (uniqueIdUser) {
      return (
        <div className="p-1">
          <Card className="p-4 hover:bg-accent transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={uniqueIdUser.photo_url || undefined} />
                  <AvatarFallback>
                    {uniqueIdUser.display_name?.charAt(0) || uniqueIdUser.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {uniqueIdUser.display_name || uniqueIdUser.email}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {uniqueIdUser.email}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    ID: {formatForDisplay(cleanedUniqueId)}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleSendFriendRequest(uniqueIdUser.uid)}
                disabled={sendFriendRequest.isPending || uniqueIdUser.uid === user?.uid}
                aria-label={`Send friend request to ${uniqueIdUser.display_name || uniqueIdUser.email}`}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {uniqueIdUser.uid === user?.uid ? 'You' : 'Add Friend'}
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
              Find and add friends using their name, email, unique ID, or QR code.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </TabsTrigger>
              <TabsTrigger value="unique-id" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Unique ID
              </TabsTrigger>
              <TabsTrigger value="qr-code" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4 mt-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4"
                  aria-label="Search for users"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Search Results */}
              <div className="min-h-[200px]">{renderSearchResults()}</div>
            </TabsContent>

            <TabsContent value="unique-id" className="space-y-4 mt-4">
              {/* Unique ID Input */}
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={uniqueIdRef}
                  type="text"
                  placeholder="Enter 16-digit unique ID..."
                  value={formatUniqueIdInput(uniqueId)}
                  onChange={(e) => handleUniqueIdChange(e.target.value)}
                  className="pl-9 pr-4 font-mono tracking-wider"
                  aria-label="Enter unique ID"
                  autoComplete="off"
                  maxLength={19} // 16 digits + 3 spaces
                />
                {uniqueId && (
                  <button
                    onClick={() => setUniqueId('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Clear unique ID"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Validation Status */}
              {uniqueId && !uniqueIdValidation.valid && (
                <p className="text-sm text-destructive">{uniqueIdValidation.error}</p>
              )}
              
              {/* Unique ID Results */}
              <div className="min-h-[200px]">{renderUniqueIdResults()}</div>
            </TabsContent>

            <TabsContent value="qr-code" className="space-y-4 mt-4">
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold mb-2">Scan QR Code</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ask your friend to show their QR code and scan it to add them instantly.
                    </p>
                    <Button onClick={() => setIsQRScannerOpen(true)} className="w-full">
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
            <Button variant="outline" onClick={onClose}>
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
