import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Clock, 
  Star, 
  Play, 
  Lock 
} from 'lucide-react';
import { useSubscription } from '@/components/subscription/SubscriptionProvider';
import { PaywallManager } from '@/components/subscription/PaywallManager';
import type { BaseGame } from '@/types/games';

interface GameCardProps {
  game: BaseGame;
  onSelect: (game: BaseGame) => void;
  index?: number;
  className?: string;
}

export function GameCard({
  game,
  onSelect,
  index = 0,
  className = ''
}: GameCardProps) {
  const { canAccessFeature } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);
  
  const canAccessAllGames = canAccessFeature('all_games');
  const isAccessible = game.difficulty <= 2 || canAccessAllGames;
  
  const handleClick = () => {
    if (isAccessible) {
      onSelect(game);
    } else {
      setShowPaywall(true);
    }
  };
  
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800';
    if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case 'chemistry': return 'bg-blue-100 text-blue-800';
      case 'physics': return 'bg-purple-100 text-purple-800';
      case 'biology': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 * index }}
        className={className}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={handleClick}>
          <div className="aspect-video relative">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="w-full h-full object-cover"
            />
            {!isAccessible && (
              <div className="absolute top-0 right-0 m-2">
                <Badge className="bg-black/70 text-white">
                  <Lock className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
            )}
            <div className="absolute top-4 right-4">
              <Badge className="bg-black/70 text-white">
                +{Math.floor(game.maxScore / 10)} XP
              </Badge>
            </div>
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getSubjectColor(game.subject)}>
                {game.subject}
              </Badge>
              <Badge variant="outline" className={getDifficultyColor(game.difficulty)}>
                {getDifficultyLabel(game.difficulty)}
              </Badge>
            </div>
            <CardTitle className="line-clamp-1 text-lg">{game.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {game.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {game.estimatedDuration} min
              </div>
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                4.8
              </div>
            </div>
            <Button 
              className="w-full group bg-blue-600 hover:bg-blue-700"
            >
              {!isAccessible ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Unlock
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Play Game
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      
      <PaywallManager
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="premium games"
      />
    </>
  );
}