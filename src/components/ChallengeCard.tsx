import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User, Zap } from "lucide-react";
import { Challenge } from "@/types/challenge";

interface ChallengeCardProps {
  challenge: Challenge;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onClick?: (id: string) => void;
}

export function ChallengeCard({ challenge, onAccept, onReject, onClick }: ChallengeCardProps) {
  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'accepted': return 'bg-primary text-primary-foreground';
      case 'completed': return 'bg-success text-success-foreground';
      case 'rejected': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Challenge['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'accepted': return <Zap className="h-3 w-3" />;
      case 'completed': return <span className="text-xs">✓</span>;
      case 'rejected': return <span className="text-xs">✗</span>;
      default: return null;
    }
  };

  return (
    <Card 
      className="bg-gradient-card hover:shadow-card transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border/50"
      onClick={() => onClick?.(challenge.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {challenge.from_user.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">@{challenge.from_user}</p>
              <p className="text-sm text-muted-foreground">challenged you</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(challenge.status)} animate-bounce-in`}>
            {getStatusIcon(challenge.status)}
            {challenge.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-foreground font-medium leading-relaxed">
          "{challenge.description}"
        </p>
        {challenge.range && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Range: 1-{challenge.range}
          </div>
        )}
      </CardContent>

      {challenge.status === 'pending' && (onAccept || onReject) && (
        <CardFooter className="pt-0 flex gap-2">
          {onReject && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReject(challenge.id);
              }}
              className="flex-1"
            >
              Decline
            </Button>
          )}
          {onAccept && (
            <Button
              variant="game"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAccept(challenge.id);
              }}
              className="flex-1"
            >
              Accept Challenge
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}