import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface AddFriendButtonProps {
  onClick: () => void;
  isDisabled?: boolean;
}

export const AddFriendButton = ({ onClick, isDisabled = false }: AddFriendButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      variant="default"
      size="sm"
      className="flex items-center gap-2"
      aria-label="Add new friend"
    >
      <UserPlus className="h-4 w-4" />
      <span>Add Friend</span>
    </Button>
  );
};
