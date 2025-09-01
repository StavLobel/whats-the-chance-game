/**
 * Authentication Modal Component
 *
 * Provides a modal dialog that switches between login and sign-up forms.
 * Integrates with the existing design system and handles authentication flow.
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  const handleSwitchToSignUp = () => {
    setMode('signup');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md p-0 gap-0' data-testid='auth-modal'>
        <DialogHeader className='sr-only'>
          <DialogTitle>{mode === 'login' ? 'Sign In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {mode === 'login'
              ? 'Sign in to your account to continue'
              : 'Create a new account to get started'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'login' ? (
          <LoginForm
            onSwitchToSignUp={handleSwitchToSignUp}
            onSuccess={handleSuccess}
            className='border-0 shadow-none'
          />
        ) : (
          <SignUpForm
            onSwitchToLogin={handleSwitchToLogin}
            onSuccess={handleSuccess}
            className='border-0 shadow-none'
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
