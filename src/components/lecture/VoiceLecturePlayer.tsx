//src/components/lecture/VoiceLecturePlayer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize,
  Type,
  BookOpen,
  Brain,
  Globe,
  Lightbulb,
  Microscope,
  Settings,
  Eye,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { useTavusStore } from '@/stores/useTavusStore';
import { voiceProfiles } from '@/lib/elevenlabs';

interface LectureSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  realWorldExamples?: string[];
  keyPoints?: string[];
  funFacts?: string[];
  estimatedDuration: number; // seconds
}

interface VoiceLecturePlayerProps {
  experimentId: string;
  experimentSubject: 'chemistry' | 'physics' | 'biology';
  experimentTitle: string;
  lectureData?: any; // Data from video_lectures table
  onComplete?: () => void;
  className?: string;
}

// Define helper functions first before they're used
const getIconForSectionType = (type: string) => {
  switch (type) {
    case 'introduction':
    case 'intro':
      return <Microscope className="h-5 w-5" />;
    case 'safety':
      return <Brain className="h-5 w-5" />;
    case 'concept':
    case 'concepts':
      return <Lightbulb className="h-5 w-5" />;
    case 'example':
    case 'examples':
      return <Globe className="h-5 w-5" />;
    case 'conclusion':
      return <BookOpen className="h-5 w-5" />;
    default:
      return <Brain className="h-5 w-5" />;
  }
};

// Generate fallback content for experiments without database lectures
const generateFallbackContent = (experimentTitle: string, experimentSubject: string): LectureSection[] => {
  const welcomeMessage = `Welcome to "${experimentTitle}"! This is a comprehensive introduction to the key concepts you'll encounter in this ${experimentSubject} experiment.`;
  
  return [
    {
      id: 'introduction',
      title: `Introduction to ${experimentTitle}`,
      icon: <Microscope className="h-5 w-5" />,
      content: `${welcomeMessage} Throughout this experiment, you'll explore fundamental principles and gain hands-on experience with scientific investigation. Let's begin by understanding the core concepts that will guide our exploration.`,
      keyPoints: [
        `This experiment focuses on ${experimentSubject} principles`,
        'Careful observation and measurement are essential',
        'Safety protocols must be followed at all times',
        'Scientific thinking involves hypothesis and testing'
      ],
      realWorldExamples: [
        `${experimentSubject.charAt(0).toUpperCase() + experimentSubject.slice(1)} principles apply in everyday life`,
        'Scientific methods help us understand our world',
        'Experiments lead to new discoveries and technologies'
      ],
      funFacts: [
        'Science is all about asking questions and finding answers',
        'Every great discovery started with curiosity and experimentation'
      ],
      estimatedDuration: 180
    }
  ];
};

export function VoiceLecturePlayer({ 
  experimentId,
  experimentSubject, 
  experimentTitle,
  lectureData,
  onComplete, 
  className = '' 
}: VoiceLecturePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [readingSpeed, setReadingSpeed] = useState([150]); // words per minute
  const [fontSize, setFontSize] = useState([18]);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoiceProfile, setSelectedVoiceProfile] = useState<string>('');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const teleprompterRef = useRef<HTMLDivElement>(null);
  
  const { 
    speak, 
    stopSpeech,
    isEnabled: voiceEnabled,
    currentVoiceProfile,
    setVoiceProfile,
    volume,
    setVolume,
    toggleVoice
  } = useVoiceStore();
  
  const { currentPersona } = useTavusStore();

  // Parse lecture content from database content_structure
  const parseLectureContent = useCallback((lectureData: any): LectureSection[] => {
    if (!lectureData?.content_structure?.sections) {
      return [];
    }

    return lectureData.content_structure.sections.map((section: any, index: number) => ({
      id: section.id || `section-${index}`,
      title: section.title || 'Untitled Section',
      icon: getIconForSectionType(section.type || 'concept'),
      content: section.content || '',
      keyPoints: section.keyPoints || [],
      realWorldExamples: section.realWorldExamples || [],
      funFacts: section.funFacts || [],
      estimatedDuration: section.estimatedDuration || 120 // default 2 minutes per section
    }));
  }, []);

  // Use database content if available, otherwise generate fallback content
  const lectureContent = React.useMemo(() => {
    if (lectureData) {
      const parsedContent = parseLectureContent(lectureData);
      if (parsedContent.length > 0) {
        return parsedContent;
      }
    }
    
    // Fallback to generated content if no database content available
    return generateFallbackContent(experimentTitle, experimentSubject);
  }, [lectureData, experimentSubject, experimentTitle, parseLectureContent]);

  const currentLectureSection = lectureContent[currentSection];
  const sentences = currentLectureSection?.content.split(/[.!?]+/).filter(s => s.trim()) || [];

  // Initialize voice profile based on experiment subject
  useEffect(() => {
    const subjectProfile = voiceProfiles.find(profile => profile.subject === experimentSubject);
    if (subjectProfile && currentVoiceProfile?.subject !== experimentSubject) {
      setVoiceProfile(subjectProfile);
      setSelectedVoiceProfile(subjectProfile.id);
    }
    
    // Enable voice when component mounts
    if (!voiceEnabled) {
      toggleVoice();
    }
  }, [experimentSubject, currentVoiceProfile, setVoiceProfile, voiceEnabled, toggleVoice]);

  // Auto-advance through sentences and sections
  useEffect(() => {
    if (isPlaying && autoAdvance) {
      const wordsPerSentence = sentences[currentSentence]?.split(' ').length || 10;
      const readingTimeMs = (wordsPerSentence / readingSpeed[0]) * 60 * 1000;

      intervalRef.current = setTimeout(() => {
        if (currentSentence < sentences.length - 1) {
          setCurrentSentence(prev => prev + 1);
        } else if (currentSection < lectureContent.length - 1) {
          setCurrentSection(prev => prev + 1);
          setCurrentSentence(0);
        } else {
          setIsPlaying(false);
          onComplete?.();
        }
      }, readingTimeMs);

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [isPlaying, currentSentence, currentSection, autoAdvance, readingSpeed, sentences, lectureContent.length, onComplete]);

  // Voice synthesis for current sentence
  useEffect(() => {
    if (isPlaying && voiceEnabled && sentences[currentSentence]) {
      const currentText = sentences[currentSentence].trim() + '.';
      speak(currentText).catch(error => {
        console.warn('Failed to speak sentence:', error);
      });
    }
  }, [currentSentence, isPlaying, voiceEnabled, sentences, speak]);

  // Auto-scroll teleprompter
  useEffect(() => {
    if (teleprompterRef.current && showHighlights) {
      const highlightedElement = teleprompterRef.current.querySelector('.highlighted-sentence');
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSentence, showHighlights]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopSpeech();
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentSentence(0);
    stopSpeech();
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
      setCurrentSentence(0);
      stopSpeech();
    }
  };

  const handleNextSection = () => {
    if (currentSection < lectureContent.length - 1) {
      setCurrentSection(prev => prev + 1);
      setCurrentSentence(0);
      stopSpeech();
    }
  };

  const handleVoiceProfileChange = (profileId: string) => {
    const profile = voiceProfiles.find(p => p.id === profileId);
    if (profile) {
      setVoiceProfile(profile);
      setSelectedVoiceProfile(profileId);
    }
  };

  // Simple volume controls to avoid slider issues
  const increaseVolume = useCallback(() => {
    setVolume(Math.min(100, volume + 10));
  }, [volume, setVolume]);

  const decreaseVolume = useCallback(() => {
    setVolume(Math.max(0, volume - 10));
  }, [volume, setVolume]);

  const renderTeleprompterText = () => {
    if (!currentLectureSection) return null;

    return sentences.map((sentence, index) => (
      <span
        key={index}
        className={`
          ${index === currentSentence && showHighlights ? 'highlighted-sentence bg-yellow-200 font-semibold shadow-sm' : ''}
          ${index < currentSentence ? 'text-gray-500' : 'text-gray-900'}
          cursor-pointer hover:bg-gray-100 p-1 rounded transition-all duration-200
        `}
        onClick={() => {
          setCurrentSentence(index);
          if (isPlaying) {
            stopSpeech();
          }
        }}
        style={{ fontSize: `${fontSize[0]}px`, lineHeight: 1.8 }}
      >
        {sentence.trim()}{index < sentences.length - 1 ? '. ' : '.'}
      </span>
    ));
  };

  const getTotalDuration = () => {
    return lectureContent.reduce((total, section) => total + section.estimatedDuration, 0);
  };

  const getCurrentProgress = () => {
    const completedSections = lectureContent.slice(0, currentSection).reduce((total, section) => total + section.estimatedDuration, 0);
    const currentSectionProgress = (currentSentence / sentences.length) * currentLectureSection.estimatedDuration;
    return ((completedSections + currentSectionProgress) / getTotalDuration()) * 100;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Lecture Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-600" />
                Voice Lecture: {currentLectureSection?.title}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {currentPersona ? `Narrated by ${currentPersona.name}` : 'AI-Powered Learning Experience'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Section {currentSection + 1} of {lectureContent.length}
              </Badge>
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
        </CardHeader>
      </Card>

      {/* Control Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            {/* Playback Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousSection}
                disabled={currentSection === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={isPlaying ? handlePause : handlePlay}
                className={isPlaying ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}
              >
                {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
              >
                <Square className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextSection}
                disabled={currentSection === lectureContent.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Settings Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
              {showSettings ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
              <span>Progress</span>
              <span>{currentSentence + 1} / {sentences.length} sentences</span>
              <span>~{Math.ceil(getTotalDuration() / 60)} min total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCurrentProgress()}%` }}
              />
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Voice Profile Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Voice Profile
                    </label>
                    <Select value={selectedVoiceProfile} onValueChange={handleVoiceProfileChange}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceProfiles.map(profile => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.name} ({profile.subject})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reading Speed */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reading Speed: {readingSpeed[0]} WPM
                    </label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReadingSpeed([Math.max(50, readingSpeed[0] - 10)])}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((readingSpeed[0] - 50) / 200) * 100}%` }}
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReadingSpeed([Math.min(250, readingSpeed[0] + 10)])}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Type className="h-4 w-4 inline mr-1" />
                      Font Size: {fontSize[0]}px
                    </label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFontSize([Math.max(14, fontSize[0] - 2)])}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((fontSize[0] - 14) / 14) * 100}%` }}
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFontSize([Math.min(28, fontSize[0] + 2)])}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Auto-advance:</span>
                    <Switch
                      checked={autoAdvance}
                      onCheckedChange={setAutoAdvance}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Highlight text:</span>
                    <Switch
                      checked={showHighlights}
                      onCheckedChange={setShowHighlights}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={decreaseVolume}
                      disabled={volume <= 0}
                      className="h-8 w-8 p-0"
                    >
                      <VolumeX className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${volume}%` }}
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={increaseVolume}
                      disabled={volume >= 100}
                      className="h-8 w-8 p-0"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Section Navigation */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {lectureContent.map((section, index) => (
              <Button
                key={section.id}
                variant={index === currentSection ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setCurrentSection(index);
                  setCurrentSentence(0);
                  if (isPlaying) stopSpeech();
                }}
                className="flex items-center text-xs"
              >
                {section.icon}
                <span className="ml-1 hidden sm:inline">{section.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Lecture Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teleprompter */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lecture Content</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHighlights(!showHighlights)}
                >
                  <Lightbulb className={`h-4 w-4 ${showHighlights ? 'text-yellow-500' : 'text-gray-400'}`} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={teleprompterRef}
                className="prose max-w-none bg-white p-6 rounded-lg border min-h-[400px] max-h-[500px] overflow-y-auto"
              >
                {renderTeleprompterText()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplementary Content */}
        <div className="space-y-4">
          {/* Key Points */}
          {currentLectureSection?.keyPoints && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Points</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentLectureSection.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">•</span>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Real-World Examples */}
          {currentLectureSection?.realWorldExamples && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Real-World Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentLectureSection.realWorldExamples.map((example, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">{example}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fun Facts */}
          {currentLectureSection?.funFacts && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fun Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentLectureSection.funFacts.map((fact, index) => (
                    <div key={index} className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-800">💡 {fact}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lecture Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lecture Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subject:</span>
                  <Badge variant="outline">{experimentSubject}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated Duration:</span>
                  <span>{Math.ceil(currentLectureSection.estimatedDuration / 60)} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Current Narrator:</span>
                  <span>{currentVoiceProfile?.name || 'Default Voice'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auto-generated:</span>
                  <Badge variant="secondary">AI Content</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Completion Message */}
      {currentSection === lectureContent.length - 1 && currentSentence === sentences.length - 1 && !isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lecture Complete!</h3>
                  <p className="text-gray-600">You've finished the voice lecture for {experimentTitle}</p>
                </div>
              </div>
              <Button onClick={onComplete} className="mt-4 text-white">
                Continue to Experiment
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}