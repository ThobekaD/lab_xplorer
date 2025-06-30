//src/components/lecture/LectureList.tsx
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
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TeleprompterPlayer } from './TeleprompterPlayer';
import { useVideoLectures, type VideoLecture } from '@/hooks/useVideoLectures';
import { useTavusStore } from '@/stores/useTavusStore';

interface LectureListProps {
  experimentId: string;
  onLectureComplete?: (lectureId: string) => void;
}

export function LectureList({ experimentId, onLectureComplete }: LectureListProps) {
  const { data: lectures, isLoading, error } = useVideoLectures(experimentId);
  const [selectedLecture, setSelectedLecture] = useState<VideoLecture | null>(null);
  const { currentPersona, getPersonaBySubject } = useTavusStore();

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown duration';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLectureSelect = (lecture: VideoLecture) => {
    setSelectedLecture(lecture);
  };

  const handleLectureComplete = () => {
    if (selectedLecture) {
      onLectureComplete?.(selectedLecture.id);
    }
    setSelectedLecture(null);
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

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <BookOpen className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading lectures
            </h3>
            <p className="text-gray-600 text-sm">
              {error.message || 'Failed to load video lectures. Please try again.'}
            </p>
          </div>
        </CardContent>
      </Card>
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
          onComplete={handleLectureComplete}
        />
      </div>
    );
  }

  if (!lectures || lectures.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No lectures available
            </h3>
            <p className="text-gray-600">
              Video lectures for this experiment are not yet available. Check back later!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Video Lectures</h3>
          <p className="text-sm text-gray-600">
            Comprehensive explanations with AI narration and teleprompter view
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {lectures.length} lecture{lectures.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Lectures List */}
      <div className="space-y-4">
        {lectures.map((lecture, index) => (
          <motion.div
            key={lecture.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
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
                      Start Lecture
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold mb-2">Interactive Learning Experience</h4>
              <p className="text-sm text-gray-700 mb-3">
                These video lectures combine AI narration with a teleprompter-style interface for an 
                immersive learning experience. You can control reading speed, font size, and follow 
                along with highlighted text.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Volume2 className="h-4 w-4 mr-2 text-blue-600" />
                  <span>AI voice narration</span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Teleprompter view</span>
                </div>
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-green-600" />
                  <span>Customizable speed</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-orange-600" />
                  <span>Full transcripts</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}