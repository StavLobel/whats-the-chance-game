import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className='mx-auto w-12 h-12 text-muted-foreground mb-4 flex items-center justify-center'>
        {icon}
      </div>
      <h3 className='text-lg font-semibold text-foreground mb-2'>{title}</h3>
      <p className='text-muted-foreground mb-6 max-w-sm mx-auto'>{description}</p>
      {action && (
        <Button onClick={action.onClick} variant='default'>
          {action.label}
        </Button>
      )}
    </div>
  );
} 