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
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Challenge } from '@/types/challenge';
import { Plus, Trophy, Bell, Users, Target, Zap, UserPlus, UserCheck, UserX, Clock, Check, X } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';
import { useFriendsList, useReceivedFriendRequests, useSentFriendRequests, useSendFriendRequest, useUpdateFriendRequest } from '@/hooks/useFriendsApi';
import { useToast } from '@/hooks/use-toast';
import { AddFriendButton } from '@/components/friends/AddFriendButton';
import { AddFriendModal } from '@/components/friends/AddFriendModal';
import { UniqueIdDisplay, QRCodeDisplay } from '@/components/profile';

type TabType = 'home' | 'my-challenges' | 'create' | 'notifications' | 'friends' | 'settings';

export default function Game() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    challenges,
    loading,
    error,
    getIncomingChallenges,
    getOutgoingChallenges,
    // TODO: Uncomment when implementing active/completed challenges display
    // getActiveChallenges,
    // getCompletedChallenges,
  } = useGame();

  // Friends API hooks
  const { data: friendsData, isLoading: friendsLoading } = useFriendsList();
  const { data: receivedRequests, isLoading: receivedLoading } = useReceivedFriendRequests();
  const { data: sentRequests, isLoading: sentLoading } = useSentFriendRequests();

  
  const sendFriendRequest = useSendFriendRequest();
  const updateFriendRequest = useUpdateFriendRequest();

  const incomingChallenges = getIncomingChallenges();
  const myChallenges = getOutgoingChallenges();
  // TODO: Implement active and completed challenges display
  // const activeChallenges = getActiveChallenges();
  // const completedChallenges = getCompletedChallenges();
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

  const handleSendFriendRequest = async (toUserId: string) => {
    try {
      await sendFriendRequest.mutateAsync({ toUserId });
      toast({
        title: 'Friend request sent!',
        description: 'Your friend request has been sent successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send friend request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await updateFriendRequest.mutateAsync({ requestId, status: 'accepted' });
      toast({
        title: 'Friend request accepted!',
        description: 'You are now friends!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept friend request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectFriendRequest = async (requestId: string) => {
    try {
      await updateFriendRequest.mutateAsync({ requestId, status: 'rejected' });
      toast({
        title: 'Friend request rejected',
        description: 'The friend request has been rejected.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject friend request. Please try again.',
        variant: 'destructive',
      });
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
            <div className='text-center space-y-2 p-6 bg-gradient-card rounded-lg shadow-card' data-testid='dashboard'>
              <h1 className='text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent'>
                Welcome back, @{user?.displayName || user?.email || 'user'}!
              </h1>
              <p className='text-muted-foreground'>Ready for some fun challenges?</p>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              <div className='bg-gradient-card p-4 rounded-lg text-center shadow-card'>
                <div className='text-2xl font-bold text-primary'>{incomingChallenges.length}</div>
                <div className='text-sm text-muted-foreground'>Incoming</div>
              </div>
              <div className='bg-gradient-card p-4 rounded-lg text-center shadow-card'>
                <div className='text-2xl font-bold text-secondary'>{myChallenges.length}</div>
                <div className='text-sm text-muted-foreground'>My Challenges</div>
              </div>
              <div className='bg-gradient-card p-4 rounded-lg text-center shadow-card'>
                <div className='text-2xl font-bold text-accent'>{friendsData?.friends?.length || 0}</div>
                <div className='text-sm text-muted-foreground'>Friends</div>
              </div>
              <div className='bg-gradient-card p-4 rounded-lg text-center shadow-card'>
                <div className='text-2xl font-bold text-destructive'>{receivedRequests?.requests?.length || 0}</div>
                <div className='text-sm text-muted-foreground'>Requests</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className='space-y-4'>
              <h2 className='text-xl font-semibold'>Recent Activity</h2>
              {incomingChallenges.length > 0 ? (
                <div className='space-y-3'>
                  {incomingChallenges.slice(0, 3).map((challenge: Challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onClick={() => setSelectedChallenge(challenge)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Bell className='w-8 h-8' />}
                  title='No recent activity'
                  description="You're all caught up! No new challenges at the moment."
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
            <div className='flex items-center justify-between'>
              <h1 className='text-2xl font-bold'>Friends</h1>
              <AddFriendButton onClick={() => setShowAddFriendModal(true)} />
            </div>

            <Tabs defaultValue='friends' className='w-full'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='friends'>Friends ({friendsData?.friends?.length || 0})</TabsTrigger>
                <TabsTrigger value='received'>Received ({receivedRequests?.requests?.length || 0})</TabsTrigger>
                <TabsTrigger value='sent'>Sent ({sentRequests?.requests?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value='friends' className='space-y-4'>
                {friendsLoading ? (
                  <LoadingState message='Loading friends...' />
                ) : friendsData?.friends && friendsData.friends.length > 0 ? (
                  <div className='grid gap-4'>
                    {friendsData.friends.map((friendship) => (
                      <Card key={friendship.id} className='p-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <Avatar>
                              <AvatarImage src={friendship.friend.photoURL || undefined} />
                              <AvatarFallback>
                                {friendship.friend.displayName?.charAt(0) || friendship.friend.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{friendship.friend.displayName || friendship.friend.email}</div>
                              <div className='text-sm text-muted-foreground flex items-center space-x-2'>
                                <div className={`w-2 h-2 rounded-full ${friendship.onlineStatus ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <span>{friendship.onlineStatus ? 'Online' : 'Offline'}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              // TODO: Implement challenge creation with friend
                              setShowCreateModal(true);
                            }}
                          >
                            <Target className='mr-2 h-4 w-4' />
                            Challenge
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Users className='w-12 h-12' />}
                    title='No friends yet'
                    description="You haven't added any friends yet. Search for users to connect with!"
                  />
                )}
              </TabsContent>

              <TabsContent value='received' className='space-y-4'>
                {receivedLoading ? (
                  <LoadingState message='Loading friend requests...' />
                ) : receivedRequests?.requests && receivedRequests.requests.length > 0 ? (
                  <div className='grid gap-4'>
                    {receivedRequests.requests.map((request) => (
                      <Card key={request.id} className='p-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <Avatar>
                              <AvatarImage src={request.fromUser.photoURL || undefined} />
                              <AvatarFallback>
                                {request.fromUser.displayName?.charAt(0) || request.fromUser.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{request.fromUser.displayName || request.fromUser.email}</div>
                              {request.message && (
                                <div className='text-sm text-muted-foreground'>{request.message}</div>
                              )}
                            </div>
                          </div>
                          <div className='flex space-x-2'>
                            <Button
                              size='sm'
                              onClick={() => handleAcceptFriendRequest(request.id)}
                              disabled={updateFriendRequest.isPending}
                            >
                              <Check className='mr-2 h-4 w-4' />
                              Accept
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleRejectFriendRequest(request.id)}
                              disabled={updateFriendRequest.isPending}
                            >
                              <X className='mr-2 h-4 w-4' />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<UserCheck className='w-12 h-12' />}
                    title='No friend requests'
                    description="You don't have any pending friend requests at the moment."
                  />
                )}
              </TabsContent>

              <TabsContent value='sent' className='space-y-4'>
                {sentLoading ? (
                  <LoadingState message='Loading sent requests...' />
                ) : sentRequests?.requests && sentRequests.requests.length > 0 ? (
                  <div className='grid gap-4'>
                    {sentRequests.requests.map((request) => (
                      <Card key={request.id} className='p-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <Avatar>
                              <AvatarImage src={request.toUser.photoURL || undefined} />
                              <AvatarFallback>
                                {request.toUser.displayName?.charAt(0) || request.toUser.email?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium'>{request.toUser.displayName || request.toUser.email}</div>
                              <div className='text-sm text-muted-foreground flex items-center space-x-2'>
                                <Clock className='h-4 w-4' />
                                <span>Pending</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<UserPlus className='w-12 h-12' />}
                    title='No sent requests'
                    description="You haven't sent any friend requests yet."
                  />
                )}
              </TabsContent>


            </Tabs>
          </div>
        );

      case 'settings':
        return (
          <div className='space-y-6'>
            <h1 className='text-2xl font-bold'>Settings</h1>
            
            {/* Unique ID Section */}
            <div className='grid gap-6 md:grid-cols-2'>
              <UniqueIdDisplay />
              <QRCodeDisplay />
            </div>
            
            {/* Additional Settings Placeholder */}
            <Card className='p-6'>
              <CardHeader>
                <CardTitle>Additional Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <EmptyState
                  icon={<Trophy className='w-12 h-12' />}
                  title='More settings coming soon'
                  description="We're working on bringing you comprehensive settings for privacy, notifications, and preferences."
                />
              </CardContent>
            </Card>
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
      <AddFriendModal isOpen={showAddFriendModal} onClose={() => setShowAddFriendModal(false)} />
    </div>
  );
}
