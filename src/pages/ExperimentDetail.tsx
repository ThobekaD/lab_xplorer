//src/pages/ExperimentDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Star, 
  Users, 
  Target, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Brain, 
  Volume2, 
  VolumeX, 
  Video, 
  VideoOff, 
  Mic,
  Settings,
  BookOpen,
  Award,
  Eye  // Added missing Eye import
} from 'lucide-react';
import { ExperimentEngine } from '@/components/simulation/ExperimentEngine';
import { SessionManager } from '@/components/collaboration/SessionManager';
import { RealtimePresence } from '@/components/collaboration/RealtimePresence';
import { CollaborativeEditor } from '@/components/collaboration/CollaborativeEditor';
import { CommunicationHub } from '@/components/collaboration/CommunicationHub';
import { SharedExperimentState } from '@/components/collaboration/SharedExperimentState';
import { AssessmentList } from '@/components/assessment/AssessmentList';
import { TavusVideoPlayer } from '@/components/avatar/TavusVideoPlayer';
import { ConversationManager } from '@/components/avatar/ConversationManager';
import { AvatarPersonalization } from '@/components/avatar/AvatarPersonalization';
import { VoiceController } from '@/components/voice/VoiceController';
import { LectureListWithFallback } from '@/components/lecture/LectureListWithFallback';
import { useExperiment } from '@/hooks/useExperiments';
import { useAssessments } from '@/hooks/useAssessment';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCollaborationStore } from '@/stores/useCollaborationStore';
import { useTavusStore } from '@/stores/useTavusStore';
import { useVoiceStore } from '@/stores/useVoiceStore';
import type { SimulationResults } from '@/types/simulation';
import type { Assessment } from '@/types/assessment';

// Define utility functions at the top before the component
const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 2) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
  return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
};

const getDifficultyLabel = (difficulty: number) => {
  if (difficulty <= 2) return 'Beginner';
  if (difficulty <= 3) return 'Intermediate';
  return 'Advanced';
};

const getSubjectColor = (subject: string) => {
  switch (subject) {
    case 'chemistry': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'physics': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'biology': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export function ExperimentDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isConnected } = useCollaborationStore();
  const { data: experiment, isLoading, error } = useExperiment(slug!);
  const { data: assessments } = useAssessments(experiment?.id);
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showAvatarChat, setShowAvatarChat] = useState(false);
  const [showAvatarVideo, setShowAvatarVideo] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // AI Stores
  const {
    currentPersona,
    isConnected: tavusConnected,
    startConversation,
    getPersonaBySubject,
    setPersona
  } = useTavusStore();

  const {
    isEnabled: voiceEnabled,
    isInitialized: voiceInitialized,
    initialize: initializeVoice,
    speakInstruction
  } = useVoiceStore();

  // Initialize AI when experiment loads
  useEffect(() => {
    if (experiment && experiment.subject) {
      // Initialize voice system
      if (!voiceInitialized) {
        initializeVoice();
      }

      // Set appropriate AI teacher based on experiment subject
      const subjectPersona = getPersonaBySubject(experiment.subject as 'chemistry' | 'physics' | 'biology');
      if (subjectPersona && (!currentPersona || currentPersona.subject !== experiment.subject)) {
        setPersona(subjectPersona);
      }

      // Start Tavus conversation if not connected
      if (subjectPersona && !tavusConnected) {
        startConversation({
          experiment_id: experiment.id,
          current_step: 0,
          difficulty_level: experiment.difficulty,
          learning_objectives: experiment.learning_objectives,
        });
      }

      // Welcome message
      if (voiceEnabled && subjectPersona) {
        const welcomeMessage = `Welcome to ${experiment.title}! I'm ${subjectPersona.name}, your ${experiment.subject} instructor. I'll be guiding you through this experiment.`;
        speakInstruction(welcomeMessage);
      }
    }
  }, [experiment, voiceInitialized, currentPersona, tavusConnected, voiceEnabled]);

  // Debug logging
  useEffect(() => {
    console.log('ExperimentDetail render:', {
      slug,
      isLoading,
      error,
      experiment: experiment ? {
        id: experiment.id,
        title: experiment.title,
        stepsCount: experiment.steps?.length || 0,
        steps: experiment.steps?.map(s => ({ 
          id: s.id, 
          step_number: s.step_number, 
          title: s.title 
        }))
      } : null
    });
  }, [slug, isLoading, error, experiment]);

  const handleStartExperiment = () => {
    setIsSimulating(true);
    
    // Speak start message
    if (voiceEnabled && currentPersona) {
      speakInstruction("Let's begin the experiment! I'll guide you through each step.");
    }
  };

  const handleExperimentComplete = (results: SimulationResults) => {
    setIsSimulating(false);
    console.log('Experiment completed:', results);
    
    // Speak completion message
    if (voiceEnabled && currentPersona) {
      speakInstruction(`Congratulations! You've completed the experiment with a score of ${results.finalScore} points!`);
    }
  };

  const handleUserAction = (action: any) => {
    if (action.type === 'next_step') {
      setCurrentStep(prev => prev + 1);
    } else if (action.type === 'prev_step') {
      setCurrentStep(prev => Math.max(0, prev - 1));
    } else if (action.type === 'goto_step') {
      setCurrentStep(action.step);
    }
  };

  const handleShowTeacher = () => {
    setShowAvatarVideo(!showAvatarVideo);
    if (!showAvatarVideo && currentPersona) {
      // Start conversation when showing teacher
      if (!tavusConnected) {
        startConversation({
          experiment_id: experiment?.id || '',
          current_step: currentStep,
          difficulty_level: experiment?.difficulty || 1,
        });
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experiment...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching experiment: {slug}</p>
        </div>
      </div>
    );
  }

  // Error state with more details
  if (error || !experiment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Experiment Not Found</h3>
        <p className="text-gray-600 mb-4">
          {error || 'The requested experiment could not be loaded.'}
        </p>
        <div className="bg-gray-100 p-4 rounded-lg mb-4 text-sm text-left max-w-md mx-auto">
          <p><strong>Debug Info:</strong></p>
          <p>Slug: {slug}</p>
          <p>Error: {error || 'No experiment data'}</p>
        </div>
        <Button onClick={() => navigate('/experiments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Experiments
        </Button>
      </div>
    );
  }

  // Simulation mode
  if (isSimulating) {
    return (
      <div className="space-y-6">
        {/* AI Teacher Video - Show when user selects "Show Teacher" */}
        {showAvatarVideo && currentPersona && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 z-50 w-80"
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

        {/* AI Chat Panel */}
        {showAvatarChat && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-4 right-4 z-40 w-80"
            style={{ top: showAvatarVideo ? '400px' : '20px' }}
          >
            <ConversationManager
              context={{
                experiment_id: experiment.id,
                current_step: currentStep,
                difficulty_level: experiment.difficulty,
                user_progress: {
                  score: 0,
                  completedSteps: currentStep,
                  totalSteps: experiment.steps?.length || 0,
                },
                recent_actions: [],
              }}
              onMessageSent={(message) => {
                console.log('User sent message:', message);
              }}
            />
          </motion.div>
        )}

        {/* Collaboration Panel */}
        {showCollaboration && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SharedExperimentState
                experimentId={experiment.id}
                currentStep={currentStep}
                totalSteps={experiment.steps?.length || 0}
                onUserAction={handleUserAction}
              />
            </div>
            <div>
              <SessionManager
                experimentId={experiment.id}
              />
            </div>
          </div>
        )}
        
        {/* Experiment Engine */}
        <ExperimentEngine
          experimentSlug={slug!}
          onComplete={handleExperimentComplete}
        />
        
        {/* Collaboration Tools */}
        {showCollaboration && isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CollaborativeEditor
              documentId={`experiment-${experiment.id}`}
              initialContent={`# Lab Notes: ${experiment.title}\n\n## Observations\n\n## Data\n\n## Conclusions\n`}
            />
            <CommunicationHub />
          </div>
        )}
        
        {/* Voice Controller - Always show during simulation */}
        <VoiceController
          experimentSubject={experiment.subject as 'chemistry' | 'physics' | 'biology'}
          currentStep={currentStep}
          onVoiceCommand={(command, intent) => {
            console.log('Voice command:', command, intent);
            // Handle voice commands in ExperimentEngine
          }}
        />

        {/* Presence Indicator */}
        {showCollaboration && isConnected && (
          <div className="fixed bottom-4 left-4 z-50">
            <RealtimePresence showUserList={false} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/experiments')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Experiments
        </Button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Experiment Image */}
          <div className="lg:w-1/3">
            <img
              src={experiment.thumbnail_url || 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400'}
              alt={experiment.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          {/* Experiment Info */}
          <div className="lg:w-2/3 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{experiment.title}</h1>
              <p className="text-gray-600 text-lg">{experiment.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge className={getSubjectColor(experiment.subject)}>
                {experiment.subject.charAt(0).toUpperCase() + experiment.subject.slice(1)}
              </Badge>
              <Badge variant="outline" className={getDifficultyColor(experiment.difficulty)}>
                {getDifficultyLabel(experiment.difficulty)}
              </Badge>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {experiment.estimated_duration} min
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                4.8
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                1,234 completed
              </div>
            </div>

            {/* AI Teacher Info */}
            {currentPersona && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium">Your AI Teacher: {currentPersona.name}</h3>
                    <p className="text-sm text-gray-600">{currentPersona.personality}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className={voiceEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                      {voiceEnabled ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
                      Voice {voiceEnabled ? 'On' : 'Off'}
                    </Badge>
                    <Badge variant="secondary" className={tavusConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                      {tavusConnected ? <Video className="h-3 w-3 mr-1" /> : <VideoOff className="h-3 w-3 mr-1" />}
                      Video {tavusConnected ? 'Ready' : 'Connecting'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={handleStartExperiment}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!experiment.steps || experiment.steps.length === 0}
              >
                <Play className="h-5 w-5 mr-2" />
                Start Experiment
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleShowTeacher}
              >
                <Video className="h-5 w-5 mr-2" />
                {showAvatarVideo ? 'Hide Teacher' : 'Show Teacher'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowCollaboration(!showCollaboration)}
              >
                <UserPlus className="h-5 w-5 mr-2" />
                {showCollaboration ? 'Hide Collaboration' : 'Collaborate'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Tabs with Assessments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="lecture" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Lecture
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Steps
            </TabsTrigger>
            <TabsTrigger value="pre-lab" className="flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Pre-Lab
            </TabsTrigger>
            <TabsTrigger value="post-lab" className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Post-Lab
            </TabsTrigger>
            <TabsTrigger value="ai-tutor" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              AI Tutor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Learning Objectives */}
            {experiment.learning_objectives && experiment.learning_objectives.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Learning Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {experiment.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Prerequisites */}
            {experiment.prerequisites && experiment.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                  <CardDescription>
                    Knowledge and skills you should have before starting this experiment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {experiment.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-gray-400 mr-2">•</span>
                        <span>{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-purple-600" />
                  Interactive Video Lectures
                </CardTitle>
                <CardDescription>
                  Watch comprehensive explanations with AI narration and teleprompter-style reading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LectureListWithFallback
                  experimentId={experiment.id}
                  experimentSubject={experiment.subject as 'chemistry' | 'physics' | 'biology'}
                  experimentTitle={experiment.title}
                  onLectureComplete={(lectureId) => {
                    console.log('Lecture completed:', lectureId);
                    // Could track completion or unlock features
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Experiment Steps</span>
                  <Badge variant="outline">
                    {experiment.steps?.length || 0} steps
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Detailed steps you'll complete in this experiment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {experiment.steps && experiment.steps.length > 0 ? (
                    experiment.steps.map((step, index) => (
                      <motion.div 
                        key={step.id} 
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {step.step_number}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-medium text-gray-900">{step.title}</h4>
                          
                          {/* Step Instructions */}
                          <div className="text-sm text-gray-600">
                            {typeof step.instructions === 'string' ? (
                              <p>{step.instructions}</p>
                            ) : step.instructions?.description ? (
                              <p>{step.instructions.description}</p>
                            ) : (
                              <p>Interactive step with guided instructions</p>
                            )}
                          </div>

                          {/* Safety Notes */}
                          {step.safety_notes && step.safety_notes.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              <span className="text-xs text-yellow-700">
                                Safety guidelines included
                              </span>
                            </div>
                          )}

                          {/* Expected Results */}
                          {step.expected_results && (
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-xs text-green-700">
                                Expected results provided
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No experiment steps available yet.</p>
                      <p className="text-sm text-gray-400 mt-1">This experiment is still being prepared.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pre-lab" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-blue-600" />
                  Pre-Lab Assessments
                </CardTitle>
                <CardDescription>
                  Complete these assessments before starting the experiment to test your preparation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentList
                  experimentId={experiment.id}
                  assessmentType="pre_lab"
                  onSelectAssessment={(assessment) => {
                    navigate(`/experiments/${slug}/assessment/pre_lab`);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post-lab" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-green-600" />
                  Post-Lab Assessments
                </CardTitle>
                <CardDescription>
                  Test your understanding after completing the experiment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AssessmentList
                  experimentId={experiment.id}
                  assessmentType="post_lab"
                  onSelectAssessment={(assessment) => {
                    navigate(`/experiments/${slug}/assessment/post_lab`);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-tutor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-purple-600" />
                  AI Tutor Personalization
                </CardTitle>
                <CardDescription>
                  Customize how your AI teacher interacts with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarPersonalization />
              </CardContent>
            </Card>

            {/* AI Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Volume2 className="h-5 w-5 mr-2" />
                    Voice Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Get spoken instructions and explanations during your experiment.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Voice guidance</span>
                      <Badge variant={voiceEnabled ? 'default' : 'secondary'}>
                        {voiceEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    {currentPersona && (
                      <div className="text-sm">
                        <strong>Voice:</strong> {currentPersona.name} ({currentPersona.subject})
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Video className="h-5 w-5 mr-2" />
                    Video Teacher
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      See your AI teacher explain concepts through interactive video.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Video connection</span>
                      <Badge variant={tavusConnected ? 'default' : 'secondary'}>
                        {tavusConnected ? 'Ready' : 'Connecting'}
                      </Badge>
                    </div>
                    {currentPersona && (
                      <div className="text-sm">
                        <strong>Teacher:</strong> {currentPersona.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Collaboration Panel */}
      {showCollaboration && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SessionManager
            experimentId={experiment.id}
          />
        </motion.div>
      )}

      {/* AI Teacher Preview (when not in simulation) */}
      {showAvatarVideo && !isSimulating && currentPersona && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-20 right-4 z-50 w-80"
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
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 aspect-video rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Video className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-gray-600">Video will activate during experiment</p>
                  <Button
                    size="sm"
                    onClick={handleStartExperiment}
                    className="mt-2"
                  >
                    Start to Meet Your Teacher
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Voice Controller for preview */}
      {!isSimulating && voiceEnabled && (
        <VoiceController
          experimentSubject={experiment.subject as 'chemistry' | 'physics' | 'biology'}
          currentStep={0}
          onVoiceCommand={(command, intent) => {
            console.log('Voice command preview:', command, intent);
          }}
        />
      )}
    </div>
  );
}