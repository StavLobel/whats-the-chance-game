import { useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { Sidebar } from '@/components/Sidebar';
import { ChallengeCard } from '@/components/ChallengeCard';
import { ChallengeDetail } from '@/components/ChallengeDetail';
import { CreateChallengeModal } from '@/components/CreateChallengeModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { Challenge } from '@/types/challenge';
import { Plus, Trophy, Bell, Users, Target, Zap } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';

type TabType = 'home' | 'my-challenges' | 'create' | 'notifications' | 'friends' | 'settings';

export default function Game() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const {
    challenges,
    loading,
    error,
    getIncomingChallenges,
    getOutgoingChallenges,
    getActiveChallenges,
    getCompletedChallenges,
  } = useGame();

  const incomingChallenges = getIncomingChallenges();
  const myChallenges = getOutgoingChallenges();
  const activeChallenges = getActiveChallenges();
  const completedChallenges = getCompletedChallenges();
  const notificationCount = incomingChallenges.length;

  const handleAcceptChallenge = (id: string) => {
    const challenge = challenges.find((c: Challenge) => c.id === id);
    if (challenge) {
      setSelectedChallenge(challenge);
    }
  };

  const handleRejectChallenge = () => {
    // This will be handled by the ChallengeDetail component
    console.log('Challenge rejected');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    if (tab === 'create') {
      setShowCreateModal(true);
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingState message='Loading challenges...' />;
  }

  // Show error state
  if (error) {
    return (
      <ErrorState
        title='Failed to load challenges'
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const renderTabContent = () => {
    if (selectedChallenge) {
      return (
        <ChallengeDetail challenge={selectedChallenge} onBack={() => setSelectedChallenge(null)} />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className='space-y-6'>
            {/* Welcome Header */}
            <div className='text-center space-y-2 p-6 bg-gradient-card rounded-lg shadow-card'>
              <h1 className='text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent'>
                Welcome back, @{user?.displayName || user?.email || 'user'}!
              </h1>
              <p className='text-muted-foreground'>Ready for some fun challenges?</p>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              <div className='bg-gradient-card p-4 rounded-lg text-center shadow-card'>
                <div className='text-2xl font-bold text-primary'>{incomingChallenges.length}</div>
                <div className='text-sm text-muted-foreground'>Pending</div>
              </div>
              <div className='bg-gradient-card p-4 rounded-lg text-center shadow-card'>
                <div className='text-2xl font-bold text-success'>
                  {challenges.filter((c: Challenge) => c.status === 'completed').length}
                </div>
                <div className='text-sm text-muted-foreground'>Completed</div>
              </div>
              <div className='bg-gradient-card p-4 rounded-lg text-center shadow-card'>
                <div className='text-2xl font-bold text-secondary'>{myChallenges.length}</div>
                <div className='text-sm text-muted-foreground'>Created</div>
              </div>
              <div className='bg-gradient-card p-4 rounded-lg text-center shadow-card'>
                <div className='text-2xl font-bold text-accent'>🎯</div>
                <div className='text-sm text-muted-foreground'>Matches</div>
              </div>
            </div>

            {/* Incoming Challenges */}
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <h2 className='text-xl font-semibold'>Incoming Challenges</h2>
                {incomingChallenges.length > 0 && (
                  <Badge variant='secondary'>{incomingChallenges.length}</Badge>
                )}
              </div>
              {incomingChallenges.length > 0 ? (
                <div className='grid gap-4'>
                  {incomingChallenges.map((challenge: Challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onAccept={() => handleAcceptChallenge(challenge.id)}
                      onReject={() => handleRejectChallenge()}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Target className='w-12 h-12' />}
                  title='No incoming challenges'
                  description="You don't have any pending challenges right now. Create a challenge to get started!"
                  action={{
                    label: 'Create Challenge',
                    onClick: () => setShowCreateModal(true),
                  }}
                />
              )}
            </div>

            {/* Recent Activity */}
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold'>Recent Activity</h2>
              {challenges.length > 0 ? (
                <div className='grid gap-4'>
                  {challenges.slice(0, 3).map((challenge: Challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onClick={() => setSelectedChallenge(challenge)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Zap className='w-12 h-12' />}
                  title='No recent activity'
                  description="You haven't participated in any challenges yet. Start by creating or accepting a challenge!"
                  action={{
                    label: 'Create Challenge',
                    onClick: () => setShowCreateModal(true),
                  }}
                />
              )}
            </div>
          </div>
        );

      case 'my-challenges':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h1 className='text-2xl font-bold'>My Challenges</h1>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Create New
              </Button>
            </div>
            {myChallenges.length > 0 ? (
              <div className='grid gap-4'>
                {myChallenges.map((challenge: Challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onClick={() => setSelectedChallenge(challenge)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Trophy className='w-12 h-12' />}
                title='No challenges created'
                description="You haven't created any challenges yet. Start by creating your first challenge!"
                action={{
                  label: 'Create Challenge',
                  onClick: () => setShowCreateModal(true),
                }}
              />
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className='space-y-6'>
            <h1 className='text-2xl font-bold'>Notifications</h1>
            <EmptyState
              icon={<Bell className='w-12 h-12' />}
              title='No notifications'
              description="You're all caught up! No new notifications at the moment."
            />
          </div>
        );

      case 'friends':
        return (
          <div className='space-y-6'>
            <h1 className='text-2xl font-bold'>Friends</h1>
            <EmptyState
              icon={<Users className='w-12 h-12' />}
              title='Friend features coming soon'
              description="We're working on bringing you amazing social features. Stay tuned!"
            />
          </div>
        );

      case 'settings':
        return (
          <div className='space-y-6'>
            <h1 className='text-2xl font-bold'>Settings</h1>
            <EmptyState
              icon={<Trophy className='w-12 h-12' />}
              title='Settings panel coming soon'
              description="We're working on bringing you comprehensive settings. Stay tuned!"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5'>
      <NavBar onMenuClick={() => setSidebarOpen(true)} notificationCount={notificationCount} />

      <div className='flex h-[calc(100vh-4rem)]'>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          notificationCount={notificationCount}
        />

        <main className='flex-1 p-6 overflow-y-auto'>{renderTabContent()}</main>
      </div>

      <CreateChallengeModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}
