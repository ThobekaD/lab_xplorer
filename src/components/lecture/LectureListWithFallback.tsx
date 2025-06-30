//src/components/lecture/LectureListWithFallback.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Clock, 
  Eye, 
  BookOpen, 
  Volume2, 
  Video,
  ChevronRight,
  Globe,
  User,
  Mic,
  Brain,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TeleprompterPlayer } from './TeleprompterPlayer';
import { VoiceLecturePlayer } from './VoiceLecturePlayer';
import { useVideoLectures, type VideoLecture } from '@/hooks/useVideoLectures';
import { useTavusStore } from '@/stores/useTavusStore';
import { useVoiceStore } from '@/stores/useVoiceStore';

interface LectureListWithFallbackProps {
  experimentId: string;
  experimentSubject: 'chemistry' | 'physics' | 'biology';
  experimentTitle: string;
  onLectureComplete?: (lectureId: string) => void;
}

export function LectureListWithFallback({ 
  experimentId, 
  experimentSubject,
  experimentTitle,
  onLectureComplete 
}: LectureListWithFallbackProps) {
  const { data: lectures, isLoading, error } = useVideoLectures(experimentId);
  const [selectedLecture, setSelectedLecture] = useState<VideoLecture | null>(null);
  const [showVoiceLecture, setShowVoiceLecture] = useState(false);
  const { currentPersona } = useTavusStore();
  const { isEnabled: voiceEnabled, currentVoiceProfile } = useVoiceStore();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown duration';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLectureSelect = (lecture: VideoLecture) => {
    setSelectedLecture(lecture);
    setShowVoiceLecture(false);
  };

  const handleVoiceLectureSelect = () => {
    setShowVoiceLecture(true);
    setSelectedLecture(null);
  };

  // Get lecture data for voice player (use first available lecture or null)
  const getLectureDataForVoice = () => {
    if (lectures && lectures.length > 0) {
      return lectures[0]; // Use first lecture's content structure
    }
    return null;
  };

  const handleLectureComplete = (lectureId?: string) => {
    if (lectureId) {
      onLectureComplete?.(lectureId);
    } else {
      // Voice lecture completed
      onLectureComplete?.('voice-lecture-' + experimentId);
    }
    setSelectedLecture(null);
    setShowVoiceLecture(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (selectedLecture) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedLecture(null)}
          className="mb-4"
        >
          ← Back to Lectures
        </Button>
        
        <TeleprompterPlayer
          lecture={selectedLecture}
          onComplete={() => handleLectureComplete(selectedLecture.id)}
        />
      </div>
    );
  }

  if (showVoiceLecture) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => setShowVoiceLecture(false)}
          className="mb-4"
        >
          ← Back to Lectures
        </Button>
        
        <VoiceLecturePlayer
          experimentId={experimentId}
          experimentSubject={experimentSubject}
          experimentTitle={experimentTitle}
          lectureData={getLectureDataForVoice()}
          onComplete={() => handleLectureComplete()}
        />
      </div>
    );
  }

  // Show voice lecture fallback if no video lectures are available
  const hasVideoLectures = lectures && lectures.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Learning Materials</h3>
          <p className="text-sm text-gray-600">
            Choose from video lectures or AI-narrated content
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasVideoLectures && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {lectures.length} video{lectures.length !== 1 ? 's' : ''}
            </Badge>
          )}
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Voice Available
          </Badge>
        </div>
      </div>

      {/* Voice Lecture Option (Always Available) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">AI Voice Lecture</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        ~15-20 min
                      </div>
                      
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        EN
                      </div>

                      {currentVoiceProfile && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {currentVoiceProfile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="flex items-center space-x-3 mb-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Volume2 className="h-3 w-3 mr-1" />
                    AI Narration
                  </Badge>
                  
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <Eye className="h-3 w-3 mr-1" />
                    Text Highlighting
                  </Badge>

                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Brain className="h-3 w-3 mr-1" />
                    Auto-Generated
                  </Badge>
                </div>

                {/* Content Preview */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    {hasVideoLectures ? 
                      `Professional lecture content with structured sections covering ${experimentSubject} concepts, real-world applications, and interactive elements.` :
                      `AI-generated introduction to ${experimentSubject} concepts with real-world examples, key points, and fun facts. Narrated by your AI instructor with customizable speed and voice options.`
                    }
                  </p>
                </div>

                {/* Voice Features */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                  <div className="flex items-center text-gray-600">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Professional voice synthesis
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Settings className="h-3 w-3 mr-1" />
                    Adjustable reading speed
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Eye className="h-3 w-3 mr-1" />
                    Real-time text highlighting
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Brain className="h-3 w-3 mr-1" />
                    Subject-specific content
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleVoiceLectureSelect}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start AI Voice Lecture
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Video Lectures (if available) */}
      {hasVideoLectures && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">Video Lectures</h4>
          </div>
          
          {lectures.map((lecture, index) => (
            <motion.div
              key={lecture.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            >
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Eye className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{lecture.lecture_title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDuration(lecture.duration_seconds)}
                            </div>
                            
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              {lecture.language_code.toUpperCase()}
                            </div>

                            {currentPersona && (
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {currentPersona.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex items-center space-x-3 mb-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Volume2 className="h-3 w-3 mr-1" />
                          AI Narration
                        </Badge>
                        
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          <Eye className="h-3 w-3 mr-1" />
                          Teleprompter
                        </Badge>

                        {lecture.tavus_video_id && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <Video className="h-3 w-3 mr-1" />
                            Video Available
                          </Badge>
                        )}

                        {lecture.transcript && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <BookOpen className="h-3 w-3 mr-1" />
                            Transcript
                          </Badge>
                        )}
                      </div>

                      {/* Transcript Preview */}
                      {lecture.transcript && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {lecture.transcript.substring(0, 150)}
                            {lecture.transcript.length > 150 ? '...' : ''}
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        onClick={() => handleLectureSelect(lecture)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Video Lecture
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'Failed to load video lectures. Voice lecture is still available.'}
          </AlertDescription>
        </Alert>
      )}

      {/* No Video Lectures Info */}
      {!hasVideoLectures && !error && (
        <Card className="bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold mb-2">AI-Generated Voice Lecture Available</h4>
                <p className="text-sm text-gray-700 mb-3">
                  While video lectures for this experiment are being prepared, you can access 
                  comprehensive AI-narrated content that covers all the essential concepts and provides 
                  an excellent learning experience.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Volume2 className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Professional AI voice</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-purple-600" />
                    <span>Interactive text display</span>
                  </div>
                  <div className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-green-600" />
                    <span>Customizable speed</span>
                  </div>
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-orange-600" />
                    <span>Subject-specific content</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}