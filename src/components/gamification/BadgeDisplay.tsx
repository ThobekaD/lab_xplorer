import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Badge as UIBadge
} from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Award, 
  Lock, 
  Info, 
  Star, 
  Zap 
} from 'lucide-react';
import type { Badge } from '@/types/gamification';

interface BadgeDisplayProps {
  badges: Badge[];
  unlockedBadges: string[];
  className?: string;
  showLocked?: boolean;
  onBadgeClick?: (badge: Badge) => void;
}

export function BadgeDisplay({
  badges,
  unlockedBadges,
  className = '',
  showLocked = true,
  onBadgeClick
}: BadgeDisplayProps) {
  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'uncommon': return 'bg-green-100 border-green-300 text-green-800';
      case 'rare': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'epic': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'legendary': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };
  
  const getBadgeRarityLabel = (rarity: string) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };
  
  const getBadgeIcon = (badge: Badge, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return <Lock className="h-8 w-8 text-gray-400" />;
    }
    
    // Default icon if no custom icon is provided
    return <Award className="h-8 w-8 text-yellow-500" />;
  };
  
  const filteredBadges = showLocked ? badges : badges.filter(badge => unlockedBadges.includes(badge.id));
  
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}>
      {filteredBadges.map((badge) => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        
        return (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onBadgeClick?.(badge)}
                  className="cursor-pointer"
                >
                  <Card className={`
                    ${isUnlocked ? getBadgeRarityColor(badge.rarity) : 'bg-gray-100 border-gray-200 opacity-70'}
                    hover:shadow-md transition-all duration-300
                  `}>
                    <CardContent className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className={`
                          w-16 h-16 rounded-full flex items-center justify-center mb-3
                          ${isUnlocked ? 'bg-white' : 'bg-gray-200'}
                          border-2 ${isUnlocked ? 'border-current' : 'border-gray-300'}
                        `}>
                          {badge.iconUrl ? (
                            <img 
                              src={badge.iconUrl} 
                              alt={badge.name} 
                              className="w-10 h-10"
                            />
                          ) : (
                            getBadgeIcon(badge, isUnlocked)
                          )}
                        </div>
                        
                        <h3 className={`font-medium text-sm mb-1 ${!isUnlocked && 'text-gray-500'}`}>
                          {badge.name}
                        </h3>
                        
                        <UIBadge variant="outline" className="text-xs">
                          {getBadgeRarityLabel(badge.rarity)}
                        </UIBadge>
                        
                        {isUnlocked && badge.unlockedAt && (
                          <p className="text-xs mt-2 text-gray-500">
                            Earned: {new Date(badge.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{badge.name}</h4>
                    <UIBadge variant="outline" className={`
                      ${isUnlocked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    `}>
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </UIBadge>
                  </div>
                  <p className="text-sm">{badge.description}</p>
                  
                  {badge.requirements.length > 0 && (
                    <div className="pt-2">
                      <h5 className="text-xs font-semibold text-gray-500 mb-1">Requirements:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {badge.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-1">•</span>
                            <span>{req.type.replace(/_/g, ' ')}: {req.value.toString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      {getBadgeRarityLabel(badge.rarity)}
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      +{badge.xpReward} XP
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}