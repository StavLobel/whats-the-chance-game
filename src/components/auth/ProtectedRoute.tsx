/**
 * Protected Route Component
 *
 * Wraps routes that require authentication and shows authentication
 * modal for unauthenticated users.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { Card, CardContent } from '../ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAuthModal?: boolean;
  redirectMessage?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  showAuthModal = true,
  redirectMessage = 'Please sign in to access this feature.',
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && showAuthModal) {
      setShowModal(true);
    }
  }, [isLoading, isAuthenticated, showAuthModal]);

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

  // User is authenticated - show protected content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // User is not authenticated - show fallback or auth modal
  const handleAuthSuccess = () => {
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      {/* Default fallback when not authenticated */}
      <div className='flex items-center justify-center min-h-[400px] p-4'>
        <Card className='w-full max-w-md'>
          <CardContent className='pt-6'>
            <div className='text-center space-y-4'>
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>Authentication Required</h3>
                <p className='text-muted-foreground text-sm'>{redirectMessage}</p>
              </div>
              <button onClick={() => setShowModal(true)} className='text-primary hover:underline'>
                Sign in now
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSuccess={handleAuthSuccess}
          defaultMode='login'
        />
      )}
    </>
  );
};

export default ProtectedRoute;
