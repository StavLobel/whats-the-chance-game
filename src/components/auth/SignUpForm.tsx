/**
 * Sign Up Form Component
 *
 * Provides email/password registration and Google sign-in functionality
 * using the existing design system and shadcn/ui components.
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Loader2, Mail, Lock, User, Chrome, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';

interface SignUpFormProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  className?: string;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSwitchToLogin,
  onSuccess,
  className,
}) => {
  const { signUp, signInWithGoogle, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const validateForm = (): boolean => {
    if (!formData.displayName.trim()) {
      setErrors('Please enter your name.');
      return false;
    }

    if (!formData.email) {
      setErrors('Please enter your email address.');
      return false;
    }

    if (!formData.password) {
      setErrors('Please enter a password.');
      return false;
    }

    if (formData.password.length < 6) {
      setErrors('Password must be at least 6 characters long.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors('Passwords do not match.');
      return false;
    }

    if (!acceptTerms) {
      setErrors('Please accept the Terms of Service and Privacy Policy.');
      return false;
    }

    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors('');

    try {
      await signUp(formData.email, formData.password, formData.displayName);
      setShowSuccess(true);

      // Auto-redirect after showing success message
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error: unknown) {
      setErrors((error as Error).message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!acceptTerms) {
      setErrors('Please accept the Terms of Service and Privacy Policy.');
      return;
    }

    setErrors('');

    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error: unknown) {
      setErrors((error as Error).message || 'Failed to sign up with Google. Please try again.');
    }
  };

  const isFormDisabled = isLoading || isSubmitting || showSuccess;

  // =============================================================================
  // Success State
  // =============================================================================

  if (showSuccess) {
    return (
      <Card className={cn('w-full max-w-md mx-auto', className)}>
        <CardContent className='pt-6'>
          <div className='text-center space-y-4'>
            <div className='mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
              <CheckCircle className='w-8 h-8 text-green-600' />
            </div>
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold'>Account created successfully!</h3>
              <p className='text-muted-foreground text-sm'>
                Please check your email for a verification link before signing in.
              </p>
            </div>
            <Button onClick={onSwitchToLogin} className='w-full'>
              Continue to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>Join the fun!</CardTitle>
        <CardDescription className='text-center'>
          Create your account and start challenging friends
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
        <form onSubmit={handleEmailSignUp} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='displayName'>Name</Label>
            <div className='relative'>
              <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='displayName'
                name='displayName'
                type='text'
                placeholder='Enter your full name'
                value={formData.displayName}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='pl-10'
                required
              />
            </div>
          </div>

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
                placeholder='Create a password (min. 6 characters)'
                value={formData.password}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='pl-10'
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                placeholder='Confirm your password'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isFormDisabled}
                className='pl-10'
                required
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className='flex items-start space-x-2'>
            <Checkbox
              id='terms'
              checked={acceptTerms}
              onCheckedChange={(checked: boolean) => setAcceptTerms(checked)}
              disabled={isFormDisabled}
            />
            <Label htmlFor='terms' className='text-sm leading-relaxed text-muted-foreground'>
              I agree to the{' '}
              <Button
                type='button'
                variant='link'
                className='h-auto p-0 text-primary'
                disabled={isFormDisabled}
              >
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button
                type='button'
                variant='link'
                className='h-auto p-0 text-primary'
                disabled={isFormDisabled}
              >
                Privacy Policy
              </Button>
            </Label>
          </div>

          <Button type='submit' className='w-full' disabled={isFormDisabled}>
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Creating account...
              </>
            ) : (
              'Create Account'
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

        {/* Google Sign-Up */}
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={handleGoogleSignUp}
          disabled={isFormDisabled}
        >
          {isLoading ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Chrome className='mr-2 h-4 w-4' />
          )}
          Continue with Google
        </Button>

        {/* Sign In Link */}
        {onSwitchToLogin && (
          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>Already have an account? </span>
            <Button
              type='button'
              variant='link'
              className='h-auto p-0 text-primary'
              onClick={onSwitchToLogin}
              disabled={isFormDisabled}
            >
              Sign in
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
