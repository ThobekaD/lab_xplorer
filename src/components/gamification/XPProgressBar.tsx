import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Zap, 
  Award, 
  TrendingUp 
} from 'lucide-react';
import { LEVEL_PROGRESSION } from '@/types/gamification';

interface XPProgressBarProps {
  currentXP: number;
  className?: string;
  showDetails?: boolean;
  animate?: boolean;
}

export function XPProgressBar({
  currentXP,
  className = '',
  showDetails = true,
  animate = true
}: XPProgressBarProps) {
  // Calculate current level and progress
  const getCurrentLevel = (xp: number) => {
    const levels = Object.values(LEVEL_PROGRESSION);
    
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const [min, max] = level.xpRange;
      
      if (xp >= min && xp <= max) {
        return {
          level: i + 1,
          name: level.name,
          currentXP: xp,
          minXP: min,
          maxXP: max,
          nextLevelXP: max + 1,
          xpToNextLevel: max - xp + 1,
          progress: ((xp - min) / (max - min)) * 100
        };
      }
    }
    
    // If XP exceeds all defined levels, use the highest level
    const highestLevel = levels[levels.length - 1];
    return {
      level: levels.length,
      name: highestLevel.name,
      currentXP: xp,
      minXP: highestLevel.xpRange[0],
      maxXP: Infinity,
      nextLevelXP: Infinity,
      xpToNextLevel: Infinity,
      progress: 100
    };
  };
  
  const levelInfo = getCurrentLevel(currentXP);
  
  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Award className="h-3 w-3 mr-1" />
              Level {levelInfo.level}
            </Badge>
            <span className="ml-2 text-sm font-medium">{levelInfo.name}</span>
          </div>
          
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-1 text-yellow-500" />
            <span className="font-bold">{levelInfo.currentXP.toLocaleString()} XP</span>
          </div>
        </div>
        
        <div className="relative">
          {animate ? (
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${levelInfo.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              style={{ maxWidth: '100%' }}
            />
          ) : (
            <Progress value={levelInfo.progress} className="h-2" />
          )}
        </div>
        
        {showDetails && (
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>
                {levelInfo.xpToNextLevel < Infinity 
                  ? `${levelInfo.xpToNextLevel.toLocaleString()} XP to Level ${levelInfo.level + 1}`
                  : 'Max Level Reached'}
              </span>
            </div>
            
            {levelInfo.xpToNextLevel < Infinity && (
              <span>{Math.round(levelInfo.progress)}% Complete</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}