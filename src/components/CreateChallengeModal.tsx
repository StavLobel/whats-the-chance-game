import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { X, Dice1, Clock, Zap, Heart, Sparkles } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { useGame } from '@/hooks/useGame';
import { cn } from '@/lib/utils';

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedUserId?: string;
}

export function CreateChallengeModal({ open, onOpenChange, preselectedUserId }: CreateChallengeModalProps) {
  const [task, setTask] = useState('');
  const [targetUsers, setTargetUsers] = useState<Array<{ id: string; name: string; avatar?: string }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedCategory, setSelectedCategory] = useState<string>('dare');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createChallenge } = useGame();
  const { data: friendsData, isLoading: isLoadingFriends } = useFriends();

  const friends = friendsData?.friends || [];

  // Filter friends based on search
  const filteredFriends = friends.filter((friendship) => {
    const friend = friendship.friend;
    const displayName = getDisplayName(friend);
    const username = friend.username || '';
    return (
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pre-select friend if provided
  useEffect(() => {
    if (preselectedUserId && friends.length > 0) {
      const friendship = friends.find(f => f.friend.uid === preselectedUserId);
      if (friendship) {
        const friend = friendship.friend;
        setTargetUsers([{
          id: friend.uid,
          name: getDisplayName(friend),
          avatar: friend.photoURL || undefined,
        }]);
      }
    }
  }, [preselectedUserId, friends]);

  const getInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.displayName) {
      const parts = user.displayName.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  const getDisplayName = (user: any) => {
    if (user.displayName) return user.displayName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.username) return user.username;
    return user.email;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || targetUsers.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Create challenge for each selected user
      for (const user of targetUsers) {
        await createChallenge(user.id, task, {
          difficulty: selectedDifficulty,
          category: selectedCategory,
        });
      }

      // Reset form
      setTask('');
      setTargetUsers([]);
      setSearchQuery('');
      setSelectedDifficulty('medium');
      setSelectedCategory('dare');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUser = (userId: string, userName: string, userAvatar?: string) => {
    const isSelected = targetUsers.some(u => u.id === userId);
    if (isSelected) {
      setTargetUsers(targetUsers.filter(u => u.id !== userId));
    } else {
      setTargetUsers([...targetUsers, { id: userId, name: userName, avatar: userAvatar }]);
    }
  };

  const categories = [
    { id: 'funny', label: 'Funny', icon: '😄' },
    { id: 'dare', label: 'Dare', icon: '🎯' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'physical', label: 'Physical', icon: '💪' },
    { id: 'mental', label: 'Mental', icon: '🧠' },
    { id: 'social', label: 'Social', icon: '👥' },
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', icon: Zap, color: 'text-green-500' },
    { value: 'medium', label: 'Medium', icon: Clock, color: 'text-yellow-500' },
    { value: 'hard', label: 'Hard', icon: Heart, color: 'text-red-500' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl bg-gradient-card'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <img src='/logo.png' alt="What's the Chance? Logo" className='w-16 h-16' />
            Create Challenge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Task Description */}
          <div className='space-y-2'>
            <Label htmlFor='task' className='text-foreground font-medium'>
              What's the challenge?
            </Label>
            <Textarea
              id='task'
              placeholder='e.g., Do a handstand for 30 seconds'
              value={task}
              onChange={e => setTask(e.target.value)}
              className='resize-none'
              rows={3}
              dir='auto'
            />
          </div>

          {/* Category and Difficulty */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-foreground font-medium'>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className='flex items-center gap-2'>
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label className='text-foreground font-medium'>Difficulty</Label>
              <div className='flex gap-2'>
                {difficultyLevels.map(level => {
                  const Icon = level.icon;
                  return (
                    <Button
                      key={level.value}
                      type='button'
                      variant={selectedDifficulty === level.value ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setSelectedDifficulty(level.value as any)}
                      className='flex-1'
                    >
                      <Icon className={cn('h-4 w-4 mr-1', level.color)} />
                      {level.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Target Users */}
          <div className='space-y-2'>
            <Label className='text-foreground font-medium flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Challenge Friends
            </Label>

            {/* Selected Users */}
            {targetUsers.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-3'>
                {targetUsers.map(user => (
                  <Badge key={user.id} variant='secondary' className='flex items-center gap-2 pr-1'>
                    {user.avatar && (
                      <Avatar className='h-5 w-5'>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className='text-xs'>
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {user.name}
                    <button
                      type='button'
                      onClick={() => toggleUser(user.id, user.name, user.avatar)}
                      className='ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <Tabs defaultValue='friends' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='friends'>My Friends</TabsTrigger>
                <TabsTrigger value='search'>Search Users</TabsTrigger>
              </TabsList>

              <TabsContent value='friends' className='mt-4'>
                {/* Friend Search */}
                <div className='relative mb-3'>
                  <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search friends...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>

                {/* Friends List */}
                <ScrollArea className='h-[200px] border rounded-lg p-2'>
                  {isLoadingFriends ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      Loading friends...
                    </div>
                  ) : filteredFriends.length === 0 ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      {friends.length === 0 ? 'No friends yet' : 'No friends found'}
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      {filteredFriends.map(friendship => {
                        const friend = friendship.friend;
                        const isSelected = targetUsers.some(u => u.id === friend.uid);

                        return (
                          <div
                            key={friendship.id}
                            className={cn(
                              'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors',
                              isSelected ? 'bg-primary/20 border border-primary' : 'hover:bg-accent'
                            )}
                            onClick={() => toggleUser(friend.uid, getDisplayName(friend), friend.photoURL || undefined)}
                          >
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-8 w-8'>
                                <AvatarImage src={friend.photoURL} />
                                <AvatarFallback>{getInitials(friend)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className='font-medium'>{getDisplayName(friend)}</p>
                                <p className='text-xs text-muted-foreground'>
                                  {friend.username ? `@${friend.username}` : friend.email}
                                </p>
                              </div>
                            </div>
                            {friendship.onlineStatus && (
                              <Badge variant='outline' className='text-xs'>
                                Online
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value='search' className='mt-4'>
                <div className='text-center py-8 text-muted-foreground'>
                  <UserPlus className='h-12 w-12 mx-auto mb-2 opacity-50' />
                  <p>User search coming soon!</p>
                  <p className='text-sm'>For now, challenge your friends from the list.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Submit */}
          <div className='flex gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button 
              type='submit' 
              className='flex-1' 
              disabled={isSubmitting || targetUsers.length === 0 || !task.trim()}
            >
              {isSubmitting ? 'Sending...' : `Challenge ${targetUsers.length} Friend${targetUsers.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}