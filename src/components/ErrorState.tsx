import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'There was an error loading the data. Please try again.',
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className='mx-auto w-12 h-12 text-destructive mb-4 flex items-center justify-center'>
        <AlertCircle className='w-12 h-12' />
      </div>
      <h3 className='text-lg font-semibold text-foreground mb-2'>{title}</h3>
      <p className='text-muted-foreground mb-6 max-w-sm mx-auto'>{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant='outline'>
          <RefreshCw className='w-4 h-4 mr-2' />
          Try Again
        </Button>
      )}
    </div>
  );
} 