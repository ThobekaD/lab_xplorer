import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Badge 
} from '@/components/ui/badge';
import { 
  Award, 
  Zap, 
  Star, 
  Unlock, 
  ArrowRight 
} from 'lucide-react';
import { LEVEL_PROGRESSION } from '@/types/gamification';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  userName?: string;
}

export function LevelUpModal({
  isOpen,
  onClose,
  oldLevel,
  newLevel,
  userName = 'Scientist'
}: LevelUpModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setShowConfetti(true);
    }
  }, [isOpen]);
  
  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  
  const getNewLevelInfo = () => {
    const levelKey = Object.keys(LEVEL_PROGRESSION)[newLevel - 1];
    return levelKey ? LEVEL_PROGRESSION[levelKey as keyof typeof LEVEL_PROGRESSION] : null;
  };
  
  const newLevelInfo = getNewLevelInfo();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center">
            <DialogTitle className="text-2xl font-bold">Level Up!</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="relative overflow-hidden">
          {/* Confetti effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 50 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-20px`,
                    backgroundColor: [
                      '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
                      '#ff00ff', '#00ffff', '#ff8000', '#8000ff'
                    ][Math.floor(Math.random() * 8)]
                  }}
                  animate={{
                    y: ['0vh', '100vh'],
                    x: [0, Math.random() * 100 - 50]
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-8"
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-12 w-12 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">
                  Congratulations, {userName}!
                </h2>
                
                <p className="text-gray-600 mb-4">
                  You've reached Level {newLevel}
                </p>
                
                <div className="flex justify-center">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg py-1 px-3">
                    {newLevelInfo?.name || `Level ${newLevel}`}
                  </Badge>
                </div>
              </motion.div>
            )}
            
            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="py-6"
              >
                <h3 className="text-lg font-semibold mb-4 text-center">
                  <Zap className="h-5 w-5 inline mr-2 text-yellow-500" />
                  New Perks Unlocked
                </h3>
                
                <div className="space-y-3 mb-4">
                  {newLevelInfo?.perks.map((perk, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <Star className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">{perk}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="py-6"
              >
                <h3 className="text-lg font-semibold mb-4 text-center">
                  <Unlock className="h-5 w-5 inline mr-2 text-green-500" />
                  New Content Available
                </h3>
                
                <div className="space-y-3 mb-4">
                  {newLevelInfo?.unlockedExperiments.includes('all') ? (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="font-medium text-green-800">
                        All experiments are now available!
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-800 mb-2">
                        New difficulty levels unlocked:
                      </p>
                      <ul className="space-y-1 text-blue-700">
                        {newLevelInfo?.unlockedExperiments.map((exp, index) => (
                          <li key={index} className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            {exp.replace('-', ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex justify-center mt-4">
            <Button onClick={handleNext}>
              {currentStep < 2 ? 'Next' : 'Continue'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}