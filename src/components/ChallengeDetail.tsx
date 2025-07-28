import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { Challenge } from '@/types/challenge';
import { useToast } from '@/hooks/use-toast';

interface ChallengeDetailProps {
  challenge: Challenge;
  onBack: () => void;
}

type GamePhase = 'initial' | 'set_range' | 'pick_number' | 'waiting' | 'reveal';

export function ChallengeDetail({ challenge, onBack }: ChallengeDetailProps) {
  const [phase, setPhase] = useState<GamePhase>('initial');
  const [range, setRange] = useState([10]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();

  // Mock numbers for demonstration
  const mockUserNumber = 7;
  const mockOpponentNumber = 7;
  const isMatch = mockUserNumber === mockOpponentNumber;

  const handleAccept = () => {
    setPhase('set_range');
  };

  const handleReject = () => {
    toast({
      title: 'Challenge declined',
      description: 'You have declined this challenge.',
    });
    onBack();
  };

  const handleSetRange = () => {
    setPhase('pick_number');
  };

  const handleNumberSelect = (number: number) => {
    setSelectedNumber(number);
    setPhase('waiting');

    // Simulate waiting then reveal
    setTimeout(() => {
      setPhase('reveal');
      setShowResult(true);
    }, 2000);
  };

  const getDiceIcon = (number: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[Math.min(number - 1, 5)];
    return Icon;
  };

  const renderPhase = () => {
    switch (phase) {
      case 'initial':
        return (
          <div className='space-y-6'>
            <div className='text-center space-y-4'>
              <h3 className='text-xl font-semibold'>You've been challenged!</h3>
              <div className='p-6 bg-muted/50 rounded-lg'>
                <p className='text-lg text-center'>"{challenge.description}"</p>
              </div>
            </div>
            <div className='flex gap-3'>
              <Button variant='outline' onClick={handleReject} className='flex-1'>
                Decline
              </Button>
              <Button variant='game' onClick={handleAccept} className='flex-1'>
                Accept Challenge
              </Button>
            </div>
          </div>
        );

      case 'set_range':
        return (
          <div className='space-y-6'>
            <div className='text-center space-y-4'>
              <h3 className='text-xl font-semibold'>Set the Range</h3>
              <p className='text-muted-foreground'>Choose the maximum number (1 to {range[0]})</p>
            </div>

            <div className='space-y-6'>
              <div className='text-center'>
                <div className='text-4xl font-bold text-primary mb-2'>{range[0]}</div>
                <p className='text-sm text-muted-foreground'>
                  Both players will pick from 1 to {range[0]}
                </p>
              </div>

              <Slider
                value={range}
                onValueChange={setRange}
                max={100}
                min={2}
                step={1}
                className='w-full'
              />

              <Button variant='game' onClick={handleSetRange} className='w-full'>
                Set Range & Pick Number
              </Button>
            </div>
          </div>
        );

      case 'pick_number':
        return (
          <div className='space-y-6'>
            <div className='text-center space-y-4'>
              <h3 className='text-xl font-semibold'>Pick Your Number</h3>
              <p className='text-muted-foreground'>Choose a number from 1 to {range[0]}</p>
            </div>

            <div className='grid grid-cols-5 gap-3 max-h-60 overflow-y-auto'>
              {Array.from({ length: range[0] }, (_, i) => i + 1).map(number => {
                const DiceIcon = getDiceIcon(number);
                return (
                  <Button
                    key={number}
                    variant={selectedNumber === number ? 'game' : 'outline'}
                    onClick={() => handleNumberSelect(number)}
                    className='aspect-square flex flex-col items-center justify-center h-16'
                  >
                    {number <= 6 ? <DiceIcon className='h-6 w-6 mb-1' /> : null}
                    <span className='text-sm font-bold'>{number}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        );

      case 'waiting':
        return (
          <div className='space-y-6 text-center'>
            <div className='space-y-4'>
              <h3 className='text-xl font-semibold'>Number Selected!</h3>
              <div className='w-16 h-16 bg-gradient-primary rounded-full mx-auto flex items-center justify-center animate-pulse'>
                <span className='text-2xl font-bold text-primary-foreground'>{selectedNumber}</span>
              </div>
              <p className='text-muted-foreground'>Waiting for opponent to pick their number...</p>
            </div>
            <div className='flex justify-center'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          </div>
        );

      case 'reveal':
        return (
          <div className='space-y-6'>
            <div className='text-center space-y-4'>
              <h3 className='text-xl font-semibold'>Results</h3>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Card className='text-center'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm text-muted-foreground'>Your Number</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold text-primary animate-number-reveal'>
                    {mockUserNumber}
                  </div>
                </CardContent>
              </Card>

              <Card className='text-center'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-sm text-muted-foreground'>
                    @{challenge.from_user}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-3xl font-bold text-primary animate-number-reveal'>
                    {mockOpponentNumber}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card
              className={`text-center ${isMatch ? 'bg-gradient-success' : 'bg-muted'} animate-bounce-in`}
            >
              <CardContent className='pt-6'>
                <div className='text-2xl font-bold mb-2'>
                  {isMatch ? (
                    <span className='text-success-foreground'>🎯 IT'S A MATCH!</span>
                  ) : (
                    <span className='text-muted-foreground'>❌ No Match</span>
                  )}
                </div>
                <p className={isMatch ? 'text-success-foreground' : 'text-muted-foreground'}>
                  {isMatch
                    ? `You must complete the challenge: "${challenge.description}"`
                    : "You're off the hook this time!"}
                </p>
              </CardContent>
            </Card>

            <Button variant='outline' onClick={onBack} className='w-full'>
              Back to Challenges
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='max-w-md mx-auto p-4 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={onBack}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div className='flex items-center gap-3 flex-1'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
              {challenge.from_user.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='font-medium'>@{challenge.from_user}</p>
            <Badge variant='secondary' className='text-xs'>
              {challenge.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className='bg-gradient-card shadow-card'>
        <CardContent className='p-6'>{renderPhase()}</CardContent>
      </Card>
    </div>
  );
}
