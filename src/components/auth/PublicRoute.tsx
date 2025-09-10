/**
 * Public Route Component
 *
 * Wraps routes that should only be accessible to unauthenticated users
 * (like landing page) and redirects authenticated users to the app.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/app',
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center space-y-4'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto text-muted-foreground' />
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated - redirect to app
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // User is not authenticated - show public content
  return <>{children}</>;
};

export default PublicRoute;
