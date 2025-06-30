//src/components/voice/VoiceHints.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Lightbulb, 
  X,
  Volume2, 
  ChevronDown, 
  ChevronUp,
  Brain,
  Target,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { generateContextualHint } from '@/lib/tavus';
import type { UserAction } from '@/types/simulation';

interface VoiceHintsProps {
  currentStep: number;
  experimentSubject: string;
  userActions: UserAction[];
  onHintUsed: () => void;
}

export function VoiceHints({ 
  currentStep, 
  experimentSubject, 
  userActions, 
  onHintUsed 
}: VoiceHintsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedHintType, setSelectedHintType] = useState<string | null>(null);
  const { speakHint, isEnabled: voiceEnabled } = useVoiceStore();

  // Generate contextual hints based on current state
  const getAvailableHints = () => {
    const hints = [
      {
        id: 'safety',
        title: 'Safety Reminder',
        icon: <AlertTriangle className="h-4 w-4" />,
        description: 'Important safety considerations for this step',
        content: generateContextualHint(
          experimentSubject as 'chemistry' | 'physics' | 'biology',
          'safety',
          { currentStep, userActions }
        ),
        priority: 'high' as const,
      },
      {
        id: 'procedure',
        title: 'Procedure Help',
        icon: <Target className="h-4 w-4" />,
        description: 'Step-by-step guidance',
        content: generateContextualHint(
          experimentSubject as 'chemistry' | 'physics' | 'biology',
          'procedure',
          { currentStep, userActions }
        ),
        priority: 'medium' as const,
      },
      {
        id: 'concept',
        title: 'Concept Explanation',
        icon: <Brain className="h-4 w-4" />,
        description: 'Understanding the underlying science',
        content: generateContextualHint(
          experimentSubject as 'chemistry' | 'physics' | 'biology',
          'concept',
          { currentStep, userActions }
        ),
        priority: 'low' as const,
      },
      {
        id: 'measurement',
        title: 'Measurement Tips',
        icon: <Lightbulb className="h-4 w-4" />,
        description: 'How to take accurate measurements',
        content: generateContextualHint(
          experimentSubject as 'chemistry' | 'physics' | 'biology',
          'measurement',
          { currentStep, userActions }
        ),
        priority: 'medium' as const,
      },
    ];

    // Filter hints based on user progress and recent actions
    return hints.filter(hint => {
      // Show safety hints more frequently for chemistry
      if (hint.id === 'safety' && experimentSubject === 'chemistry') return true;
      
      // Show measurement hints if user hasn't taken measurements recently
      if (hint.id === 'measurement') {
        const recentMeasurements = userActions.filter(
          action => action.type === 'measurement' && 
          Date.now() - action.timestamp.getTime() < 300000 // 5 minutes
        );
        return recentMeasurements.length === 0;
      }
      
      return true;
    });
  };

  const handleHintSpeak = async (hint: any) => {
    if (voiceEnabled) {
      await speakHint(hint.content);
    }
    setSelectedHintType(hint.id);
    onHintUsed();
    
    // Auto-hide selection after a delay
    setTimeout(() => {
      setSelectedHintType(null);
    }, 3000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableHints = getAvailableHints();

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative"
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        Hints
        {availableHints.some(h => h.priority === 'high') && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 ml-1" />
        ) : (
          <ChevronDown className="h-3 w-3 ml-1" />
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 z-50"
          >
            <Card className="w-80 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                  Available Hints - Step {currentStep + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableHints.map((hint) => (
                  <motion.div
                    key={hint.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedHintType === hint.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleHintSpeak(hint)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-600">{hint.icon}</div>
                        <h4 className="font-medium text-sm">{hint.title}</h4>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(hint.priority)}`}
                      >
                        {hint.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">
                      {hint.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHintSpeak(hint);
                        }}
                        className="text-xs"
                      >
                        {voiceEnabled ? (
                          <>
                            <Volume2 className="h-3 w-3 mr-1" />
                            Speak Hint
                          </>
                        ) : (
                          'Show Hint'
                        )}
                      </Button>
                      
                      {selectedHintType === hint.id && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>
                    
                    {/* Show hint content when selected */}
                    <AnimatePresence>
                      {selectedHintType === hint.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-gray-200"
                        >
                          <p className="text-xs text-gray-700 italic">
                            "{hint.content}"
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
                
                {availableHints.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      No hints available for this step.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      You're doing great! Keep following the instructions.
                    </p>
                  </div>
                )}
                
                {/* Voice Status */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Voice Hints:</span>
                    <Badge variant={voiceEnabled ? 'default' : 'secondary'}>
                      {voiceEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}