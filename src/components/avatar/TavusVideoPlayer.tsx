//src/components/avatar/TavusVideoPlayer.tsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  MessageCircle,
  Mic,
  MicOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useTavusStore } from '@/stores/useTavusStore';

interface TavusVideoPlayerProps {
  conversationUrl?: string;
  isLive?: boolean;
  onInteraction?: (type: string, data: any) => void;
  className?: string;
}

export function TavusVideoPlayer({ 
  conversationUrl, 
  isLive = false, 
  onInteraction,
  className = '' 
}: TavusVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const {
    currentPersona,
    isVideoEnabled,
    isAudioEnabled,
    toggleVideo,
    toggleAudio,
  } = useTavusStore();

  useEffect(() => {
    if (conversationUrl && isLive) {
      initializeVideoCall();
    }
  }, [conversationUrl, isLive]);

  const initializeVideoCall = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      // Initialize WebRTC connection to Tavus
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideoEnabled, 
        audio: isAudioEnabled 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Simulate connection process
      setTimeout(() => {
        setConnectionStatus('connected');
        setIsConnecting(false);
        setIsPlaying(true);
      }, 2000);

    } catch (error) {
      console.error('Failed to initialize video call:', error);
      setConnectionStatus('disconnected');
      setIsConnecting(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol / 100;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      />

      {/* Connection Status */}
      <div className="absolute top-4 left-4">
        <Badge className={`${getStatusColor()} text-white`}>
          <div className={`w-2 h-2 rounded-full bg-white mr-2 ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`} />
          {getStatusText()}
        </Badge>
      </div>

      {/* Avatar Info */}
      {currentPersona && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-black/70 text-white">
            {currentPersona.name}
          </Badge>
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {isConnecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center"
          >
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Connecting to {currentPersona?.name}...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
          >
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center space-x-2">
                {!isLive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <div className="flex items-center space-x-2 w-24">
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    min={0}
                    step={5}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Center Controls */}
              {isLive && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleVideo}
                    className={`text-white hover:bg-white/20 ${!isVideoEnabled ? 'bg-red-500/50' : ''}`}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleAudio}
                    className={`text-white hover:bg-white/20 ${!isAudioEnabled ? 'bg-red-500/50' : ''}`}
                  >
                    <MicOff className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onInteraction?.('open_chat', {})}
                    className="text-white hover:bg-white/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onInteraction?.('open_settings', {})}
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Elements Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* This would contain interactive elements like questions, quizzes, etc. */}
      </div>
    </div>
  );
}