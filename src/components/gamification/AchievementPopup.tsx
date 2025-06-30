import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  X, 
  Zap, 
  Star 
} from 'lucide-react';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import type { Badge as BadgeType } from '@/types/gamification';

interface AchievementPopupProps {
  badge: BadgeType;
  onClose: () => void;
  autoCloseDelay?: number;
}

export function AchievementPopup({
  badge,
  onClose,
  autoCloseDelay = 5000
}: AchievementPopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500); // Allow exit animation to complete
    }, autoCloseDelay);
    
    return () => clearTimeout(timer);
  }, [autoCloseDelay, onClose]);
  
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-gray-200">
            <div className={`bg-gradient-to-r ${getRarityColor(badge.rarity)} p-4 text-white relative`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 500);
                }}
                className="absolute top-2 right-2 text-white hover:bg-white/20 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                    {badge.iconUrl ? (
                      <img 
                        src={badge.iconUrl} 
                        alt={badge.name} 
                        className="w-8 h-8"
                      />
                    ) : (
                      <Award className="h-8 w-8 text-yellow-500" />
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                  <Badge className="bg-white/30 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-semibold text-lg mb-1">{badge.name}</h4>
              <p className="text-gray-600 text-sm mb-3">{badge.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-50 text-blue-800 flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  +{badge.xpReward} XP
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 500);
                  }}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}