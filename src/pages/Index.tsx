import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Zap, Trophy, ArrowRight, Dice1, Dice2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Game from "./Game";

const Index = () => {
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return <Game />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-border/50">
          <ThemeToggle />
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="What's the Chance? Logo" 
              className="w-32 h-32 rounded-2xl shadow-glow animate-bounce-in"
            />
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-slide-up">
              What's the Chance?
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-slide-up">
              The ultimate social game of chance and challenges. Dare your friends and see if fate is on your side!
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-4 animate-slide-up">
            <Button 
              variant="game" 
              size="lg" 
              onClick={() => setShowGame(true)}
              className="text-lg px-8 py-6 h-auto"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Playing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">No registration required • Start instantly</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple rules, endless fun. Challenge friends and let chance decide!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gradient-card shadow-card hover:shadow-primary transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">1. Challenge Someone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Create a fun challenge and tag a friend. "What's the chance you'll sing karaoke?"
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card hover:shadow-primary transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dice1 className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">2. Pick Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Set a range (1-10, 1-50, etc.) and both players secretly pick a number within that range.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card hover:shadow-primary transition-all duration-300 hover:scale-105">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-success-foreground" />
                </div>
                <CardTitle className="text-xl">3. Reveal & Decide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  If the numbers match, the challenge must be completed! If not, you're off the hook.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Perfect for Any Group */}
        <div className="mt-24 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Perfect for Any Group</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're with friends, family, or colleagues, What's the Chance? brings everyone together.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <Trophy className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Party Games</h3>
              <p className="text-muted-foreground">
                Break the ice and get everyone laughing with hilarious challenges.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto">
                <Users className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Friend Groups</h3>
              <p className="text-muted-foreground">
                Create unforgettable memories and strengthen friendships.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-8 w-8 text-success-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Team Building</h3>
              <p className="text-muted-foreground">
                Fun challenges perfect for work events and team activities.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-3xl">?</span>
            </div>
            <h2 className="text-3xl font-bold">Ready to Take the Challenge?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of players having fun with friends. What's the chance you'll love it?
            </p>
          </div>
          <Button 
            variant="game" 
            size="lg" 
            onClick={() => setShowGame(true)}
            className="text-lg px-8 py-6 h-auto"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Your First Challenge
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
