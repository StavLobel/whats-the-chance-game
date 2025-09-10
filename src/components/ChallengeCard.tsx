import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Zap } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { useUserDisplay } from '@/hooks/useUserDisplay';

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept?: (id: string) => void; // eslint-disable-line no-unused-vars
  onReject?: (id: string) => void; // eslint-disable-line no-unused-vars
  onClick?: (id: string) => void; // eslint-disable-line no-unused-vars
}

export function ChallengeCard({ challenge, onAccept, onReject, onClick }: ChallengeCardProps) {
  // Use the user display hook to resolve user ID to display name
  const { displayName, userInfo, loading } = useUserDisplay(challenge.from_user);
  
  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'accepted':
        return 'bg-primary text-primary-foreground';
      case 'active':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Challenge['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className='h-3 w-3' />;
      case 'accepted':
        return <Zap className='h-3 w-3' />;
      case 'active':
        return <Zap className='h-3 w-3' />;
      case 'completed':
        return <span className='text-xs'>✓</span>;
      default:
        return null;
    }
  };

  const getStatusText = (status: Challenge['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card
      className='bg-gradient-card hover:shadow-card transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border/50'
      onClick={() => onClick?.(challenge.id)}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10'>
              {userInfo?.photoURL && <AvatarImage src={userInfo.photoURL} />}
              <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
                {loading ? '...' : displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className='font-medium text-foreground'>
                @{loading ? 'Loading...' : displayName}
              </p>
              <p className='text-sm text-muted-foreground'>challenged you</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(challenge.status)} animate-bounce-in`}>
            {getStatusIcon(challenge.status)}
            {getStatusText(challenge.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='pb-4'>
        <p className='text-foreground font-medium leading-relaxed' dir='auto'>
          "{challenge.description}"
        </p>
        {challenge.range && (
          <div className='mt-3 flex items-center gap-2 text-sm text-muted-foreground'>
            <span className='w-2 h-2 bg-primary rounded-full'></span>
            Range: {challenge.range.min}-{challenge.range.max}
          </div>
        )}
      </CardContent>

      {challenge.status === 'pending' && (onAccept || onReject) && (
        <CardFooter className='pt-0 flex gap-2'>
          {onReject && (
            <Button
              variant='outline'
              size='sm'
              onClick={e => {
                e.stopPropagation();
                onReject(challenge.id);
              }}
              className='flex-1'
            >
              Decline
            </Button>
          )}
          {onAccept && (
            <Button
              variant='game'
              size='sm'
              onClick={e => {
                e.stopPropagation();
                onAccept(challenge.id);
              }}
              className='flex-1'
            >
              Accept Challenge
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
