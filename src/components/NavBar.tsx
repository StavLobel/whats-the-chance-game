import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, User, Plus, Bell, LogOut, Settings, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { CreateChallengeModal } from './CreateChallengeModal';
import { AuthModal } from './auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';

interface NavBarProps {
  onMenuClick: () => void;
  notificationCount?: number;
}

export function NavBar({ onMenuClick, notificationCount = 0 }: NavBarProps) {
  const { isAuthenticated, user, userDoc, signOut } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <nav className='bg-gradient-card shadow-card border-b border-border sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            {/* Left: Menu + Logo */}
            <div className='flex items-center space-x-4'>
              <Button variant='ghost' size='icon' onClick={onMenuClick} className='lg:hidden'>
                <Menu className='h-6 w-6' />
              </Button>
              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center'>
                  <span className='text-primary-foreground font-bold text-sm'>?</span>
                </div>
                <h1 className='text-xl font-bold bg-gradient-primary bg-clip-text text-transparent'>
                  What's the Chance?
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className='flex items-center space-x-2'>
              <Button
                variant='game'
                size='sm'
                onClick={() => setShowCreateModal(true)}
                className='hidden sm:flex'
              >
                <Plus className='h-4 w-4' />
                Challenge
              </Button>
              <Button variant='ghost' size='icon' className='relative'>
                <Bell className='h-5 w-5' />
                {notificationCount > 0 && (
                  <span className='absolute -top-1 -right-1 h-5 w-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center animate-bounce-in'>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Button>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size='icon' className='relative'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src={user?.photoURL || undefined} />
                        <AvatarFallback>
                          {userDoc?.displayName?.charAt(0).toUpperCase() ||
                            user?.email?.charAt(0).toUpperCase() ||
                            'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-56'>
                    <DropdownMenuLabel>
                      <div className='flex flex-col space-y-1'>
                        <p className='text-sm font-medium leading-none'>
                          {userDoc?.displayName || user?.displayName || 'User'}
                        </p>
                        <p className='text-xs leading-none text-muted-foreground'>{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserCircle className='mr-2 h-4 w-4' />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className='mr-2 h-4 w-4' />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className='mr-2 h-4 w-4' />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant='ghost' size='icon' onClick={() => setShowAuthModal(true)}>
                  <User className='h-5 w-5' />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <CreateChallengeModal open={showCreateModal} onOpenChange={setShowCreateModal} />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </>
  );
}
