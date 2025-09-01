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
import { X } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { useGame } from '@/hooks/useGame';

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChallengeModal({ open, onOpenChange }: CreateChallengeModalProps) {
  // ESLint false positive: open is used in Dialog component below
  const [task, setTask] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createChallenge } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !targetUser.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createChallenge(targetUser, task);

      // Reset form
      setTask('');
      setTargetUser('');
      setTags([]);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the useGame hook
      console.error('Failed to create challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (targetUser.trim() && !tags.includes(targetUser.trim())) {
      setTags([...tags, targetUser.trim()]);
      setTargetUser('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md bg-gradient-card' data-testid='create-challenge-modal'>
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
              data-testid='challenge-description'
            />
          </div>

          {/* Target User */}
          <div className='space-y-2'>
            <Label htmlFor='user' className='text-foreground font-medium flex items-center gap-2'>
              Challenge someone
            </Label>
            <div className='flex gap-2'>
              <Input
                id='user'
                placeholder='@username'
                value={targetUser}
                onChange={e => setTargetUser(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                dir='auto'
                data-testid='target-user-input'
              />
              <Button type='button' onClick={addTag} size='sm' variant='outline'>
                Add
              </Button>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className='space-y-2'>
              <Label className='text-foreground font-medium'>Challenged Users</Label>
              <div className='flex flex-wrap gap-2'>
                {tags.map(tag => (
                  <Badge key={tag} variant='secondary' className='flex items-center gap-1'>
                    {tag}
                    <button
                      type='button'
                      onClick={() => removeTag(tag)}
                      className='ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
            <Button type='submit' className='flex-1' disabled={isSubmitting} data-testid='submit-challenge'>
              {isSubmitting ? 'Sending...' : 'Send Challenge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
