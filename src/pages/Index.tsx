import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Zap, Trophy, ArrowRight, Dice1, Dice2 } from "lucide-react";
import Game from "./Game";

const Index = () => {
  const [showGame, setShowGame] = useState(false);

  if (showGame) {
    return <Game />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-bounce-in">
              <span className="text-primary-foreground font-bold text-2xl">?</span>
            </div>
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

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Perfect for Any Group</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">
                  <Trophy className="h-3 w-3" />
                </Badge>
                <div>
                  <h3 className="font-semibold">Party Games</h3>
                  <p className="text-muted-foreground">Break the ice and get everyone laughing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">
                  <Users className="h-3 w-3" />
                </Badge>
                <div>
                  <h3 className="font-semibold">Friend Groups</h3>
                  <p className="text-muted-foreground">Create hilarious memories together</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">
                  <Zap className="h-3 w-3" />
                </Badge>
                <div>
                  <h3 className="font-semibold">Team Building</h3>
                  <p className="text-muted-foreground">Fun challenges for work events</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-card rounded-lg p-8 shadow-card">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">A</span>
                  </div>
                  <span className="font-medium">@alice challenged you</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium">"Do a cartwheel in the yard"</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-primary/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">7</div>
                    <div className="text-xs text-muted-foreground">Your pick</div>
                  </div>
                  <div className="flex-1 bg-primary/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary">7</div>
                    <div className="text-xs text-muted-foreground">Their pick</div>
                  </div>
                </div>
                <div className="bg-gradient-success rounded-lg p-3 text-center">
                  <span className="text-success-foreground font-bold">🎯 IT'S A MATCH!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-24 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Take the Challenge?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of players having fun with friends. What's the chance you'll love it?
          </p>
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
