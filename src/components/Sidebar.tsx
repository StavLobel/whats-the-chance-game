import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Trophy, Plus, Bell, Settings, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void; // eslint-disable-line no-unused-vars
  notificationCount?: number;
}

export function Sidebar({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  notificationCount = 0,
}: SidebarProps) {
  const { user, userDoc, isAuthenticated } = useAuth();
  
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-challenges', label: 'My Challenges', icon: Trophy },
    { id: 'create', label: 'Create Challenge', icon: Plus },
    { id: 'notifications', label: 'Notifications', icon: Bell, hasNotification: true },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className='fixed inset-0 bg-black/50 z-40 lg:hidden' onClick={onClose} />}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-80 bg-gradient-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-border lg:hidden'>
          <div className='flex items-center'>
            <img src='/logo.png' alt="What's the Chance? Logo" className='w-20 h-20 mr-4' />
            <h2 className='text-lg font-bold'>What's the Chance?</h2>
          </div>
          <Button variant='ghost' size='icon' onClick={onClose}>
            <X className='h-5 w-5' />
          </Button>
        </div>

        {/* Navigation */}
        <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showNotification = item.hasNotification && notificationCount > 0;

            return (
              <Button
                key={item.id}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-11 text-left transition-all duration-200 rounded-lg',
                  isActive && 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                )}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
              >
                <Icon className='mr-3 h-5 w-5' />
                <span className='flex-1'>{item.label}</span>
                {showNotification && (
                  <Badge variant='secondary' className='ml-auto h-5 min-w-5 text-xs'>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className='p-4 border-t border-border bg-gradient-to-t from-background/80 to-transparent'>
          <div className='flex items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200'>
            {/* Profile Picture */}
            <div className='w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden'>
              {isAuthenticated && user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className='w-full h-full object-cover'
                />
              ) : (
                <span className='text-primary-foreground font-bold'>
                  {isAuthenticated && user?.displayName 
                    ? user.displayName.charAt(0).toUpperCase()
                    : isAuthenticated && user?.email
                    ? user.email.charAt(0).toUpperCase()
                    : 'U'
                  }
                </span>
              )}
            </div>
            {/* User Info */}
            <div className='min-w-0 flex-1 ml-3'>
              <p className='font-medium text-foreground truncate'>
                {isAuthenticated && userDoc?.username
                  ? `@${userDoc.username}`
                  : isAuthenticated && user?.displayName
                  ? user.displayName
                  : isAuthenticated && user?.email
                  ? user.email.split('@')[0]
                  : '@user'
                }
              </p>
              <p className='text-sm text-muted-foreground truncate'>
                {isAuthenticated ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
