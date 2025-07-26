import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { Sidebar } from "@/components/Sidebar";
import { ChallengeCard } from "@/components/ChallengeCard";
import { ChallengeDetail } from "@/components/ChallengeDetail";
import { CreateChallengeModal } from "@/components/CreateChallengeModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockGameState } from "@/data/mockData";
import { Challenge } from "@/types/challenge";
import { Plus, Trophy, Bell, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type TabType = 'home' | 'my-challenges' | 'create' | 'notifications' | 'friends' | 'settings';

export default function Game() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  const { currentUser, challenges } = mockGameState;
  const incomingChallenges = challenges.filter(c => c.to_user === currentUser.username && c.status === 'pending');
  const myChallenges = challenges.filter(c => c.from_user === currentUser.username);
  const notificationCount = incomingChallenges.length;

  const handleAcceptChallenge = (id: string) => {
    const challenge = challenges.find(c => c.id === id);
    if (challenge) {
      setSelectedChallenge(challenge);
    }
  };

  const handleRejectChallenge = (id: string) => {
    toast({
      title: "Challenge declined",
      description: "You have declined the challenge.",
      duration: 3000,
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    if (tab === 'create') {
      setShowCreateModal(true);
    }
  };

  const renderTabContent = () => {
    if (selectedChallenge) {
      return (
        <ChallengeDetail 
          challenge={selectedChallenge} 
          onBack={() => setSelectedChallenge(null)} 
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="text-center space-y-2 p-6 bg-gradient-card rounded-lg shadow-card">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Welcome back, @{currentUser.username}!
              </h1>
              <p className="text-muted-foreground">Ready for some fun challenges?</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gradient-card p-4 rounded-lg text-center shadow-card">
                <div className="text-2xl font-bold text-primary">{incomingChallenges.length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg text-center shadow-card">
                <div className="text-2xl font-bold text-success">{challenges.filter(c => c.status === 'completed').length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg text-center shadow-card">
                <div className="text-2xl font-bold text-secondary">{myChallenges.length}</div>
                <div className="text-sm text-muted-foreground">Created</div>
              </div>
              <div className="bg-gradient-card p-4 rounded-lg text-center shadow-card">
                <div className="text-2xl font-bold text-accent">🎯</div>
                <div className="text-sm text-muted-foreground">Matches</div>
              </div>
            </div>

            {/* Incoming Challenges */}
            {incomingChallenges.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Incoming Challenges</h2>
                  <Badge variant="secondary">{incomingChallenges.length}</Badge>
                </div>
                <div className="grid gap-4">
                  {incomingChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onAccept={handleAcceptChallenge}
                      onReject={handleRejectChallenge}
                      onClick={handleAcceptChallenge}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <div className="grid gap-4">
                {challenges.slice(0, 3).map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onClick={() => setSelectedChallenge(challenge)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'my-challenges':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                My Challenges
              </h1>
              <Button
                variant="game"
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Challenge
              </Button>
            </div>
            
            <div className="grid gap-4">
              {myChallenges.length > 0 ? (
                myChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onClick={() => setSelectedChallenge(challenge)}
                  />
                ))
              ) : (
                <div className="text-center p-8 bg-gradient-card rounded-lg">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No challenges yet</h3>
                  <p className="text-muted-foreground mb-4">Start challenging your friends!</p>
                  <Button variant="game" onClick={() => setShowCreateModal(true)}>
                    Create Your First Challenge
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary" />
              Notifications
              {notificationCount > 0 && (
                <Badge variant="secondary">{notificationCount}</Badge>
              )}
            </h1>
            
            {incomingChallenges.length > 0 ? (
              <div className="grid gap-4">
                {incomingChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onAccept={handleAcceptChallenge}
                    onReject={handleRejectChallenge}
                    onClick={handleAcceptChallenge}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gradient-card rounded-lg">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No new notifications</p>
              </div>
            )}
          </div>
        );

      case 'friends':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Friends
            </h1>
            
            <div className="text-center p-8 bg-gradient-card rounded-lg">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Friends feature coming soon!</h3>
              <p className="text-muted-foreground">Connect with friends to challenge them</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-lg font-medium">Coming Soon</h2>
            <p className="text-muted-foreground">This feature is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar 
        onMenuClick={() => setSidebarOpen(true)} 
        notificationCount={notificationCount} 
      />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          notificationCount={notificationCount}
        />
        
        <main className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto">
          {renderTabContent()}
        </main>
      </div>

      <CreateChallengeModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
      />
    </div>
  );
}