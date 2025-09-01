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
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { Search, UserPlus, UserX, X } from 'lucide-react';
import { useSearchUsers, useSendFriendRequest } from '@/hooks/useFriendsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFriendModal = ({ isOpen, onClose }: AddFriendModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Query for search results
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(
    { query: debouncedQuery },
    debouncedQuery.length > 0
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
      // Clear search after successful request
      setSearchQuery('');
    } catch (error) {
      // Error handling is done in the hook
    }
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
            <Card key={userResult.id} className="p-4 hover:bg-accent transition-colors">
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
                  onClick={() => handleSendFriendRequest(userResult.id)}
                  disabled={sendFriendRequest.isPending || userResult.id === user?.uid}
                  aria-label={`Send friend request to ${userResult.displayName || userResult.email}`}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {userResult.id === user?.uid ? 'You' : 'Add Friend'}
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="add-friend-dialog-description">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Friends</DialogTitle>
          <DialogDescription id="add-friend-dialog-description">
            Search for users by name or email to send friend requests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
