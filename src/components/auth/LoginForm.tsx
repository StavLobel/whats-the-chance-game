/**
 * Login Form Component
 *
 * Provides email/password and Google sign-in functionality
 * using the existing design system and shadcn/ui components.
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Loader2, Mail, Lock, Chrome, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';


interface LoginFormProps {
  onSwitchToSignUp?: () => void;
  onSuccess?: () => void;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignUp, onSuccess, className }) => {
  const { signIn, signInWithGoogle, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =============================================================================
  // Form Handlers
  // =============================================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (errors) {
      setErrors('');
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrors('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    setErrors('');

    try {
      await signIn(formData.email, formData.password);
      onSuccess?.();
    } catch (error: unknown) {
      setErrors((error as Error).message || 'Sign in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrors('');

    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error: unknown) {
      setErrors((error as Error).message || 'Google sign in failed. Please try again.');
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>Welcome back!</CardTitle>
        <CardDescription className='text-center'>
          Sign in to continue your adventure in "What's the Chance?"
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Error Alert */}
        {errors && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{errors}</AlertDescription>
          </Alert>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='Enter your email'
                value={formData.email}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='pl-10'
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='password'
                name='password'
                type='password'
                placeholder='Enter your password'
                value={formData.password}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='pl-10'
                required
              />
            </div>
          </div>

          <Button type='submit' className='w-full' disabled={isFormDisabled}>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>Or continue with</span>
          </div>
        </div>

        {/* Google Sign-In */}
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={handleGoogleSignIn}
          disabled={isFormDisabled}
        >
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Chrome className='mr-2 h-4 w-4' />
          )}
          Continue with Google
        </Button>

        {/* Sign Up Link */}
        {onSwitchToSignUp && (
          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>Don't have an account? </span>
            <Button
              type='button'
              variant='link'
              className='h-auto p-0 text-primary'
              onClick={onSwitchToSignUp}
              disabled={isFormDisabled}
            >
              Sign up
            </Button>
          </div>
        )}

        {/* Forgot Password Link */}
        <div className='text-center'>
          <Button
            type='button'
            variant='link'
            className='h-auto p-0 text-sm text-muted-foreground'
            disabled={isFormDisabled}
          >
            Forgot your password?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
