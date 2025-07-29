import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({
  message = 'Loading...',
  className,
  size = 'md',
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center py-8', className)}>
      <Loader2 className={cn('animate-spin text-primary mb-2', sizeClasses[size])} />
      <p className='text-sm text-muted-foreground'>{message}</p>
    </div>
  );
}
