//src/components/lecture/TeleprompterPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Settings,
  Maximize,
  Minimize,
  Type,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { useTavusStore } from '@/stores/useTavusStore';
import type { VideoLecture } from '@/hooks/useVideoLectures';

interface TeleprompterPlayerProps {
  lecture: VideoLecture;
  onComplete?: () => void;
  className?: string;
}

export function TeleprompterPlayer({ 
  lecture, 
  onComplete, 
  className = '' 
}: TeleprompterPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(30); // words per minute
  const [fontSize, setFontSize] = useState(18);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [highlightedWord, setHighlightedWord] = useState(0);
  
  const textRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { currentPersona } = useTavusStore();
  const { 
    speak, 
    isEnabled: voiceEnabled, 
    volume,
    setVolume 
  } = useVoiceStore();

  // Parse transcript into words
  const words = React.useMemo(() => {
    if (!lecture.transcript) return [];
    return lecture.transcript
      .split(/\s+/)
      .filter(word => word.trim().length > 0)
      .map((word, index) => ({
        text: word,
        index,
        timestamp: index * (60 / scrollSpeed), // Estimate timestamp based on speed
      }));
  }, [lecture.transcript, scrollSpeed]);

  // Auto-scroll effect
  useEffect(() => {
    if (isPlaying && words.length > 0) {
      intervalRef.current = setInterval(() => {
        setHighlightedWord(prev => {
          const next = prev + 1;
          if (next >= words.length) {
            setIsPlaying(false);
            onComplete?.();
            return prev;
          }
          return next;
        });
      }, (60 / scrollSpeed) * 1000); // Convert WPM to milliseconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isPlaying, scrollSpeed, words.length, onComplete]);

  // Auto-scroll to highlighted word
  useEffect(() => {
    if (textRef.current && highlightedWord > 0) {
      const wordElement = textRef.current.children[highlightedWord] as HTMLElement;
      if (wordElement) {
        wordElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [highlightedWord]);

  // Voice synthesis
  useEffect(() => {
    if (isPlaying && voiceEnabled && currentPersona && lecture.transcript) {
      // Split transcript into manageable chunks for voice synthesis
      const chunks = lecture.transcript.match(/.{1,200}(\s|$)/g) || [lecture.transcript];
      
      chunks.forEach((chunk, index) => {
        setTimeout(() => {
          if (isPlaying) {
            speak(chunk).catch(error => {
              console.warn('Voice synthesis failed:', error);
            });
          }
        }, index * 5000); // 5 seconds between chunks
      });
    }
  }, [isPlaying, voiceEnabled, currentPersona, lecture.transcript, speak]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setHighlightedWord(0);
    setCurrentPosition(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleSkipBack = () => {
    setHighlightedWord(prev => Math.max(0, prev - 10));
  };

  const handleSkipForward = () => {
    setHighlightedWord(prev => Math.min(words.length - 1, prev + 10));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = highlightedWord * (60 / scrollSpeed);
  const totalTime = words.length * (60 / scrollSpeed);
  const progress = words.length > 0 ? (highlightedWord / words.length) * 100 : 0;

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''} ${className}`}>
      <Card className={`h-full ${isFullscreen ? 'rounded-none border-0' : ''}`}>
        <CardHeader className={`${isFullscreen ? 'bg-black text-white' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-lg">
                <Eye className="h-5 w-5 mr-2" />
                {lecture.lecture_title}
              </CardTitle>
              {currentPersona && (
                <Badge variant="secondary" className="mt-1">
                  Narrated by {currentPersona.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className={isFullscreen ? 'text-white hover:bg-gray-800' : ''}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className={isFullscreen ? 'text-white hover:bg-gray-800' : ''}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className={`flex-1 overflow-hidden ${isFullscreen ? 'bg-black text-white' : ''}`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{formatDuration(Math.floor(currentTime))}</span>
              <span>Reading Speed: {scrollSpeed} WPM</span>
              <span>{formatDuration(Math.floor(totalTime))}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Teleprompter Text */}
          <div 
            ref={textRef}
            className={`
              h-96 overflow-y-auto p-6 rounded-lg leading-relaxed
              ${isFullscreen ? 'h-[calc(100vh-200px)] bg-gray-900' : 'bg-gray-50'}
              ${isFullscreen ? 'text-white' : 'text-gray-900'}
            `}
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
          >
            {words.length > 0 ? (
              <div className="space-y-1">
                {words.map((word, index) => (
                  <span
                    key={index}
                    className={`
                      inline-block mr-2 px-1 rounded transition-all duration-200
                      ${index === highlightedWord 
                        ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                        : index < highlightedWord 
                          ? 'text-gray-500' 
                          : ''
                      }
                      ${index === highlightedWord ? 'animate-pulse' : ''}
                    `}
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Type className="h-12 w-12 mx-auto mb-4" />
                  <p>No transcript available for this lecture.</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4 space-y-4"
              >
                {/* Playback Controls */}
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkipBack}
                    disabled={highlightedWord === 0}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={isPlaying ? handlePause : handlePlay}
                    disabled={words.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkipForward}
                    disabled={highlightedWord >= words.length - 1}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Reading Speed */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reading Speed: {scrollSpeed} WPM
                    </label>
                    <Slider
                      value={[scrollSpeed]}
                      onValueChange={(value) => setScrollSpeed(value[0])}
                      min={10}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Font Size: {fontSize}px
                    </label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                      min={12}
                      max={36}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  {/* Voice Volume */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Voice Volume: {volume}%
                    </label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVolume(0)}
                        className="p-0 h-8 w-8"
                      >
                        <VolumeX className="h-4 w-4" />
                      </Button>
                      <Slider
                        value={[volume]}
                        onValueChange={(value) => setVolume(value[0])}
                        min={0}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setVolume(100)}
                        className="p-0 h-8 w-8"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}