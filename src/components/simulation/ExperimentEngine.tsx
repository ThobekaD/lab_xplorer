//src/components/simulation/ExperimentEngine.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Camera, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Video,
  MessageCircle,
  Volume2,
  VolumeX,
  Brain
} from 'lucide-react';
import { StepRenderer } from './StepRenderer';
import { DataCollector } from './DataCollector';
import { SafetyChecker } from './SafetyChecker';
import { VoiceController } from '@/components/voice/VoiceController';
import { VoiceHints } from '@/components/voice/VoiceHints';
import { TavusVideoPlayer } from '@/components/avatar/TavusVideoPlayer';
import { ConversationManager } from '@/components/avatar/ConversationManager';
import { PhysicsEngine } from './engines/PhysicsEngine';
import { ChemistryEngine } from './engines/ChemistryEngine';
import { BiologyEngine } from './engines/BiologyEngine';
import { useExperiment } from '@/hooks/useExperiments';
import { useAuthStore } from '@/stores/useAuthStore';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { useTavusStore } from '@/stores/useTavusStore';
import { toast } from 'sonner';
import { generateContextualHint, analyzeUserQuery } from '@/lib/tavus';
import type { 
  ExperimentData, 
  SimulationState, 
  UserAction, 
  ValidationResult,
  SimulationResults 
} from '@/types/simulation';

interface ExperimentEngineProps {
  experimentSlug: string;
  sessionId?: string;
  onComplete?: (results: SimulationResults) => void;
}

export function ExperimentEngine({ 
  experimentSlug, 
  sessionId,
  onComplete 
}: ExperimentEngineProps) {
  const { user } = useAuthStore();
  const { 
    speakInstruction, 
    speakFeedback, 
    autoSpeak, 
    isEnabled: voiceEnabled,
    toggleVoice
  } = useVoiceStore();
  const { 
    currentPersona, 
    isConnected: tavusConnected, 
    startConversation, 
    getPersonaBySubject,
    setPersona,
    sendMessage 
  } = useTavusStore();
  const { data: experiment, isLoading, error } = useExperiment(experimentSlug);
  
  const [simulationState, setSimulationState] = useState<SimulationState>({
    currentStep: 0,
    totalSteps: 0,
    variables: {},
    measurements: [],
    userActions: [],
    isComplete: false,
    score: 0,
    startTime: new Date(),
  });

  const [isRunning, setIsRunning] = useState(false);
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);
  const [validationFeedback, setValidationFeedback] = useState<string>('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showAvatarChat, setShowAvatarChat] = useState(false);
  const [showAvatarVideo, setShowAvatarVideo] = useState(false);
  const [aiAssistanceLevel, setAiAssistanceLevel] = useState<'minimal' | 'moderate' | 'full'>('moderate');

  // Initialize simulation when experiment loads
  useEffect(() => {
    if (experiment && experiment.steps && experiment.steps.length > 0) {
      setSimulationState(prev => ({
        ...prev,
        totalSteps: experiment.steps.length,
        startTime: new Date(),
      }));

      // Set appropriate AI teacher based on experiment subject
      const subjectPersona = getPersonaBySubject(experiment.subject);
      if (subjectPersona && (!currentPersona || currentPersona.subject !== experiment.subject)) {
        setPersona(subjectPersona);
      }

      // Start conversation with experiment context (with error handling)
      if (subjectPersona && !tavusConnected) {
        try {
          startConversation({
            experiment_id: experiment.id,
            current_step: 0,
            difficulty_level: experiment.difficulty,
            learning_objectives: experiment.learning_objectives,
          });
        } catch (error) {
          console.warn('Failed to start Tavus conversation:', error);
          // Continue without avatar features
        }
      }

      // AI Welcome and First Instruction (with error handling)
      if (autoSpeak && voiceEnabled && subjectPersona) {
        const welcomeMessage = `Welcome to the ${experiment.title} experiment. I'm ${subjectPersona.name}, and I'll be guiding you through this ${experiment.subject} experiment. Let's begin with step 1.`;
        
        speakInstruction(welcomeMessage).catch(error => {
          console.warn('Voice synthesis failed:', error);
          // Show visual message instead
          toast.info(`Welcome! ${subjectPersona.name} will guide you through this experiment.`);
        });
        
        if (experiment.steps[0]) {
          setTimeout(() => {
            speakInstruction(experiment.steps[0].instructions, 1).catch(error => {
              console.warn('Failed to speak instructions:', error);
            });
          }, 3000);
        }
      }
    }
  }, [experiment, autoSpeak, speakInstruction, getPersonaBySubject, currentPersona, setPersona, startConversation, tavusConnected, voiceEnabled]);

  // Request microphone permission automatically
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log('Microphone permission granted');
        })
        .catch(err => {
          console.warn('Microphone permission denied:', err);
        });
    }
    
    // Enable voice if it's not already enabled
    if (!voiceEnabled) {
      toggleVoice();
    }
  }, [voiceEnabled, toggleVoice]);

  // Get appropriate engine based on subject
  const getSimulationEngine = useCallback(() => {
    if (!experiment) return null;
    
    switch (experiment.subject) {
      case 'physics':
        return new PhysicsEngine();
      case 'chemistry':
        return new ChemistryEngine();
      case 'biology':
        return new BiologyEngine();
      default:
        return null;
    }
  }, [experiment]);

  // Enhanced user action handler with AI feedback
  const handleUserAction = useCallback(async (action: Omit<UserAction, 'id' | 'timestamp' | 'isValid'>) => {
    if (!experiment || !experiment.steps || experiment.steps.length === 0) return;

    const userAction: UserAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      isValid: false,
    };

    // Validate action with safety checker
    const safetyResult = SafetyChecker.validateAction(
      userAction,
      experiment.steps[simulationState.currentStep]
    );

    if (!safetyResult.isValid && safetyResult.safetyWarning) {
      setSafetyWarnings(prev => [...prev, safetyResult.safetyWarning!]);
      
      // AI Safety Response
      if (voiceEnabled) {
        speakFeedback(safetyResult.safetyWarning!, 'warning').catch(error => {
          console.warn('Failed to speak safety warning:', error);
        });
      }
      
      // Send safety concern to avatar
      if (tavusConnected && currentPersona) {
        try {
          sendMessage(`Safety warning: ${safetyResult.safetyWarning}`, {
            experiment_id: experiment.id,
            current_step: simulationState.currentStep,
            difficulty_level: experiment.difficulty,
          });
        } catch (error) {
          console.warn('Failed to send safety message to avatar:', error);
        }
      }
      
      toast.error('Safety Warning', {
        description: safetyResult.safetyWarning,
      });
      return;
    }

    // Validate with simulation engine
    const engine = getSimulationEngine();
    if (engine) {
      const validationResult = await engine.validateAction(userAction, simulationState);
      
      userAction.isValid = validationResult.isValid;
      setValidationFeedback(validationResult.feedback);

      if (validationResult.isValid) {
        // Update simulation state
        const newState = await engine.updateState(userAction, simulationState);
        setSimulationState(newState);

        // AI Success Feedback
        if (voiceEnabled) {
          speakFeedback(validationResult.feedback, 'success');
        }

        // Adaptive AI assistance based on user performance
        if (aiAssistanceLevel !== 'minimal') {
          const hint = generateContextualHint(
            experiment.subject as 'chemistry' | 'physics' | 'biology',
            action.type,
            { score: newState.score, actions: newState.userActions.length }
          );
          
          if (aiAssistanceLevel === 'full') {
            setTimeout(() => {
              if (voiceEnabled) {
                speakInstruction(`Here's a tip: ${hint}`);
              }
            }, 2000);
          }
        }

        // Check if step is complete
        if (validationResult.nextStep !== undefined) {
          handleStepComplete(validationResult.nextStep);
        }

        toast.success("Action Successful", {
          description: validationResult.feedback,
        });
      } else {
        // AI Error Feedback
        if (voiceEnabled) {
          speakFeedback(validationResult.feedback, 'error');
        }
        
        // Offer help through avatar
        if (tavusConnected && currentPersona && aiAssistanceLevel !== 'minimal') {
          sendMessage(`User had difficulty with: ${action.type}. Feedback: ${validationResult.feedback}`, {
            experiment_id: experiment.id,
            current_step: simulationState.currentStep,
            difficulty_level: experiment.difficulty,
          });
        }
        
        toast.error("Invalid Action", {
          description: validationResult.feedback,
        });
      }
    }

    // Record action
    setSimulationState(prev => ({
      ...prev,
      userActions: [...prev.userActions, userAction],
    }));
  }, [experiment, simulationState, getSimulationEngine, speakFeedback, voiceEnabled, tavusConnected, currentPersona, sendMessage, aiAssistanceLevel, speakInstruction]);

  // Enhanced step completion with AI guidance
  const handleStepComplete = useCallback((nextStep: number) => {
    if (!experiment || !experiment.steps || experiment.steps.length === 0) return;

    setSimulationState(prev => {
      const newState = {
        ...prev,
        currentStep: nextStep,
        score: prev.score + 10, // Base points per step
      };

      // AI Step Completion Feedback
      if (nextStep < experiment.steps.length) {
        if (voiceEnabled) {
          speakFeedback(`Excellent! Step ${nextStep} completed! Moving to step ${nextStep + 1}.`, 'success');
          
          setTimeout(() => {
            if (experiment.steps[nextStep]) {
              speakInstruction(experiment.steps[nextStep].instructions, nextStep + 1);
            }
          }, 2000);
        }
        
        // Avatar celebration and next step introduction
        if (tavusConnected && currentPersona) {
          sendMessage(`Step completed successfully! Ready for step ${nextStep + 1}`, {
            experiment_id: experiment.id,
            current_step: nextStep,
            difficulty_level: experiment.difficulty,
            user_progress: {
              score: newState.score,
              completedSteps: nextStep,
              totalSteps: experiment.steps.length,
            },
          });
        }
      }

      // Check if experiment is complete
      if (nextStep >= experiment.steps.length) {
        newState.isComplete = true;
        newState.endTime = new Date();
        
        // Calculate final results
        const results: SimulationResults = {
          finalScore: newState.score,
          completionTime: newState.endTime.getTime() - newState.startTime.getTime(),
          measurements: newState.measurements,
          achievements: [], // TODO: Calculate achievements
          feedback: 'Experiment completed successfully!',
          nextRecommendations: [], // TODO: Generate recommendations
        };

        onComplete?.(results);
        
        // AI Completion Celebration
        if (voiceEnabled) {
          speakFeedback(`Congratulations! You've completed the ${experiment.title} experiment with a score of ${results.finalScore} points! Excellent work!`, 'success');
        }
        
        if (tavusConnected && currentPersona) {
          sendMessage(`Experiment completed with score: ${results.finalScore}`, {
            experiment_id: experiment.id,
            current_step: nextStep,
            difficulty_level: experiment.difficulty,
            user_progress: {
              score: results.finalScore,
              completedSteps: experiment.steps.length,
              totalSteps: experiment.steps.length,
            },
          });
        }
        
        toast.success('Experiment Complete!', {
          description: `You scored ${results.finalScore} points!`,
        });
      }

      return newState;
    });
  }, [experiment, onComplete, speakFeedback, speakInstruction, voiceEnabled, tavusConnected, currentPersona, sendMessage]);

  // Enhanced voice command handler with AI integration
  const handleVoiceCommand = useCallback((command: string, intent: string) => {
    if (!experiment || !experiment.steps || experiment.steps.length === 0) return;

    // Analyze user query for better AI response
    const analysis = analyzeUserQuery(command);

    switch (intent) {
      case 'next_instruction':
        const currentStep = experiment.steps[simulationState.currentStep];
        if (currentStep) {
          speakInstruction(currentStep.instructions, simulationState.currentStep + 1);
        }
        break;
      
      case 'repeat_instruction':
        const stepToRepeat = experiment.steps[simulationState.currentStep];
        if (stepToRepeat) {
          speakInstruction(stepToRepeat.instructions, simulationState.currentStep + 1);
        }
        break;
      
      case 'explain_concept':
        const explanation = `This step focuses on ${experiment.subject} concepts. Take your time to understand the process.`;
        speakInstruction(explanation);
        
        // Send to avatar for detailed explanation
        if (tavusConnected) {
          sendMessage(`User asked for explanation: ${command}`, {
            experiment_id: experiment.id,
            current_step: simulationState.currentStep,
            difficulty_level: experiment.difficulty,
          });
          setShowAvatarChat(true);
        }
        break;
      
      case 'help_request':
        const hint = generateContextualHint(
          experiment.subject as 'chemistry' | 'physics' | 'biology',
          'general',
          { currentStep: simulationState.currentStep }
        );
        speakInstruction(`Here's some help: ${hint}`);
        setHintsUsed(prev => prev + 1);
        break;
      
      case 'navigate_step':
        // Extract step number from command and navigate if valid
        const stepMatch = command.match(/step (\d+)/i);
        if (stepMatch) {
          const targetStep = parseInt(stepMatch[1], 10) - 1;
          if (targetStep >= 0 && targetStep < experiment.steps.length) {
            setSimulationState(prev => ({ ...prev, currentStep: targetStep }));
            speakInstruction(experiment.steps[targetStep].instructions, targetStep + 1);
          }
        }
        break;
        
      case 'show_teacher':
        setShowAvatarVideo(true);
        if (voiceEnabled) {
          speakInstruction("Showing your AI teacher now.");
        }
        break;
        
      case 'ask_question':
        setShowAvatarChat(true);
        if (voiceEnabled) {
          speakInstruction("I'm opening the chat so you can ask your question.");
        }
        break;
    }
  }, [experiment, simulationState, speakInstruction, tavusConnected, sendMessage, voiceEnabled, setHintsUsed]);

  // Control functions
  const startSimulation = () => {
    setIsRunning(true);
    if (voiceEnabled) {
      speakFeedback('Simulation started. Let\'s begin!', 'success').catch(error => {
        console.warn('Failed to speak start message:', error);
        toast.success('Simulation started. Let\'s begin!');
      });
    } else {
      toast.success('Simulation started. Let\'s begin!');
    }
  };

  const pauseSimulation = () => {
    setIsRunning(false);
    if (voiceEnabled) {
      speakFeedback('Simulation paused.', 'success').catch(error => {
        console.warn('Failed to speak pause message:', error);
        toast.info('Simulation paused.');
      });
    } else {
      toast.info('Simulation paused.');
    }
  };

  const resetSimulation = () => {
    setSimulationState({
      currentStep: 0,
      totalSteps: experiment?.steps?.length || 0,
      variables: {},
      measurements: [],
      userActions: [],
      isComplete: false,
      score: 0,
      startTime: new Date(),
    });
    setIsRunning(false);
    setSafetyWarnings([]);
    setValidationFeedback('');
    setHintsUsed(0);
    if (voiceEnabled) {
      speakFeedback('Simulation reset. Ready to start over!', 'success').catch(error => {
        console.warn('Failed to speak reset message:', error);
        toast.success('Simulation reset. Ready to start over!');
      });
    } else {
      toast.success('Simulation reset. Ready to start over!');
    }
  };

  const takeScreenshot = async () => {
    // TODO: Implement screenshot functionality
    toast.success('Screenshot saved to notebook');
    if (voiceEnabled) {
      speakFeedback('Screenshot saved to your lab notebook.', 'success').catch(error => {
        console.warn('Failed to speak screenshot message:', error);
      });
    }
  };

  const saveProgress = async () => {
    // TODO: Save to database
    toast.success('Progress saved');
    if (voiceEnabled) {
      speakFeedback('Your progress has been saved.', 'success').catch(error => {
        console.warn('Failed to speak save message:', error);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experiment...</p>
        </div>
      </div>
    );
  }

  if (error || !experiment || !experiment.steps || experiment.steps.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Experiment Not Found</h3>
        <p className="text-gray-600">The requested experiment could not be loaded or has no steps.</p>
      </div>
    );
  }

  const progressPercentage = (simulationState.currentStep / simulationState.totalSteps) * 100;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with AI Status */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{experiment.title}</CardTitle>
              <p className="text-gray-600 mt-1">{experiment.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline">{experiment.subject}</Badge>
                <Badge variant="outline">Difficulty {experiment.difficulty}</Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {experiment.estimated_duration} min
                </div>
                {currentPersona && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Teacher: {currentPersona.name}
                  </Badge>
                )}
                <Badge 
                  variant={voiceEnabled ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={toggleVoice}
                >
                  {voiceEnabled ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
                  Voice {voiceEnabled ? 'On' : 'Off'}
                </Badge>
              </div>
            </div>
            
            {/* Enhanced Controls with AI Features */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAvatarVideo(!showAvatarVideo)}
              >
                <Video className="h-4 w-4 mr-1" />
                {showAvatarVideo ? 'Hide' : 'Show'} Teacher
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAvatarChat(!showAvatarChat)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
              <VoiceHints
                currentStep={simulationState.currentStep}
                experimentSubject={experiment.subject}
                userActions={simulationState.userActions}
                onHintUsed={() => setHintsUsed(prev => prev + 1)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={takeScreenshot}
              >
                <Camera className="h-4 w-4 mr-1" />
                Screenshot
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveProgress}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSimulation}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button
                onClick={isRunning ? pauseSimulation : startSimulation}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{simulationState.currentStep} / {simulationState.totalSteps} steps</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Enhanced Stats with AI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{simulationState.score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{simulationState.measurements.length}</div>
              <div className="text-sm text-gray-500">Measurements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{simulationState.userActions.length}</div>
              <div className="text-sm text-gray-500">Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{hintsUsed}</div>
              <div className="text-sm text-gray-500">Hints Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Math.floor((Date.now() - simulationState.startTime.getTime()) / 60000)}
              </div>
              <div className="text-sm text-gray-500">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {tavusConnected ? 'Connected' : 'Offline'}
              </div>
              <div className="text-sm text-gray-500">AI Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Teacher Video */}
      <AnimatePresence>
        {showAvatarVideo && currentPersona && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Video className="h-4 w-4" />
                    <span className="font-medium">{currentPersona.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAvatarVideo(false)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <TavusVideoPlayer
                  isLive={true}
                  className="aspect-video rounded-lg"
                  onInteraction={(type, data) => {
                    if (type === 'open_chat') {
                      setShowAvatarChat(true);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAvatarChat(!showAvatarChat)}
                  className="w-full mt-2"
                >
                  <Brain className="h-4 w-4 mr-1" />
                  {showAvatarChat ? 'Hide Chat' : 'Ask Questions'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Panel */}
      <AnimatePresence>
        {showAvatarChat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Ask Your AI Teacher</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAvatarChat(false)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ConversationManager
                  context={{
                    experiment_id: experiment.id,
                    current_step: simulationState.currentStep,
                    difficulty_level: experiment.difficulty,
                    user_progress: {
                      score: simulationState.score,
                      completedSteps: simulationState.currentStep,
                      totalSteps: simulationState.totalSteps,
                    },
                    recent_actions: simulationState.userActions.slice(-5),
                  }}
                  onMessageSent={(message) => {
                    console.log('User sent message:', message);
                    // Could trigger additional AI responses here
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safety Warnings */}
      <AnimatePresence>
        {safetyWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Safety Warning:</strong> {safetyWarnings[safetyWarnings.length - 1]}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Feedback with AI Enhancement */}
      <AnimatePresence>
        {validationFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {validationFeedback}
                {currentPersona && aiAssistanceLevel !== 'minimal' && (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAvatarChat(true)}
                    >
                      <Brain className="h-3 w-3 mr-1" />
                      Ask {currentPersona.name} for help
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Simulation Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Simulation Viewport */}
        <div className={`${showAvatarChat ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <Card className="min-h-[600px]">
            <CardContent className="p-6">
              {!simulationState.isComplete ? (
                <StepRenderer
                  step={experiment.steps[simulationState.currentStep]}
                  simulationState={simulationState}
                  onUserAction={handleUserAction}
                  isRunning={isRunning}
                  experimentSubject={experiment.subject}
                />
              ) : (
                <div className="text-center py-20">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Experiment Complete!</h3>
                  <p className="text-gray-600 mb-4">
                    You've successfully completed the {experiment.title} experiment.
                  </p>
                  
                  {/* AI Completion Message */}
                  {currentPersona && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-4 max-w-md mx-auto">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{currentPersona.name} says:</p>
                          <p className="text-sm text-gray-600">
                            "Excellent work! You've demonstrated great understanding of {experiment.subject} concepts. 
                            Your systematic approach and attention to safety were outstanding!"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{simulationState.score}</div>
                      <div className="text-sm text-gray-500">Final Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {Math.floor((Date.now() - simulationState.startTime.getTime()) / 60000)}
                      </div>
                      <div className="text-sm text-gray-500">Minutes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{hintsUsed}</div>
                      <div className="text-sm text-gray-500">Hints Used</div>
                    </div>
                  </div>
                  
                  {/* Next Steps */}
                  <div className="mt-6 space-y-2">
                    <Button
                      onClick={() => {/* Navigate to post-lab assessment */}}
                      className="bg-green-600 hover:bg-green-700 text-white mr-2"
                    >
                      Take Post-Lab Assessment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetSimulation}
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Collection Panel */}
        <div className={`space-y-6 ${showAvatarChat ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
          <DataCollector
            measurements={simulationState.measurements}
            onAddMeasurement={(measurement) => {
              setSimulationState(prev => ({
                ...prev,
                measurements: [...prev.measurements, measurement],
              }));
              
              // AI feedback on measurement
              if (voiceEnabled && aiAssistanceLevel !== 'minimal') {
                speakFeedback(`Measurement recorded: ${measurement.name} - ${measurement.value} ${measurement.unit}`, 'success');
              }
            }}
          />
        </div>
      </div>

      {/* Voice Controller - Always show during simulation */}
      <VoiceController
        experimentSubject={experiment.subject as 'chemistry' | 'physics' | 'biology'}
        currentStep={simulationState.currentStep}
        onVoiceCommand={handleVoiceCommand}
      />
    </div>
  );
}