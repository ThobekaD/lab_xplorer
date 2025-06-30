//src/components/voice/VoiceController.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Settings,
  MessageCircle,
  Loader2,
  AlertTriangle,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVoiceStore } from '@/stores/useVoiceStore';
import { VoiceSettings } from './VoiceSettings';
import { AudioVisualizer } from './AudioVisualizer';

interface VoiceControllerProps {
  experimentSubject?: 'chemistry' | 'physics' | 'biology';
  currentStep?: number;
  onVoiceCommand?: (command: string, intent: string) => void;
}

export function VoiceController({ 
  experimentSubject = 'general', 
  currentStep,
  onVoiceCommand 
}: VoiceControllerProps) {
  const {
    isEnabled,
    isListening,
    isSpeaking,
    volume,
    currentVoiceProfile,
    isInitialized,
    lastSpokenText,
    toggleVoice,
    toggleListening,
    pauseSpeech,
    resumeSpeech,
    setVolume,
    speak,
    initialize,
  } = useVoiceStore();

  const [showSettings, setShowSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
    
    // Request microphone permission automatically
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log('Microphone permission granted');
        })
        .catch(err => {
          console.warn('Microphone permission denied:', err);
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
          setShowPermissionHelp(true);
        });
    }
  }, [isInitialized, initialize]);

  // Simple volume controls without slider
  const increaseVolume = useCallback(() => {
    setVolume(Math.min(100, volume + 10));
  }, [volume, setVolume]);

  const decreaseVolume = useCallback(() => {
    setVolume(Math.max(0, volume - 10));
  }, [volume, setVolume]);

  const handleVoiceCommand = useCallback((command: string, intent: string) => {
    setIsProcessing(true);
    setError(null);
    
    // Handle built-in commands
    switch (intent) {
      case 'pause_speech':
        pauseSpeech();
        break;
      case 'resume_speech':
        resumeSpeech();
        break;
      case 'repeat_instruction':
        if (lastSpokenText) {
          speak(lastSpokenText);
        }
        break;
      default:
        onVoiceCommand?.(command, intent);
    }
    
    setTimeout(() => setIsProcessing(false), 1000);
  }, [pauseSpeech, resumeSpeech, lastSpokenText, speak, onVoiceCommand]);

  const getVoiceProfileName = () => {
    if (!currentVoiceProfile) return 'Voice Assistant';
    return currentVoiceProfile.name;
  };

  const getStatusColor = () => {
    if (error) return 'bg-red-500';
    if (!isEnabled) return 'bg-gray-500';
    if (isListening) return 'bg-green-500';
    if (isSpeaking) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (!isEnabled) return 'Voice Disabled';
    if (isProcessing) return 'Processing...';
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    return 'Ready';
  };

  const dismissError = () => {
    setError(null);
    setShowPermissionHelp(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4"
          >
            <VoiceSettings onClose={() => setShowSettings(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 w-80"
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}
              {showPermissionHelp && (
                <div className="mt-2 text-xs">
                  <strong>To fix this:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Look for a microphone icon in your browser's address bar</li>
                    <li>Click it and select "Allow"</li>
                    <li>Or go to browser Settings → Privacy → Microphone</li>
                    <li>Add this site to allowed list</li>
                    <li>Refresh the page</li>
                  </ol>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={dismissError}
                className="mt-2 h-6 text-xs"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Main Voice Control Panel */}
      <Card className="w-80 shadow-lg border-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
              <span className="font-medium text-sm">{getVoiceProfileName()}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Status Display */}
          <div className="text-center mb-4">
            <Badge variant={error ? "destructive" : "outline"} className="mb-2">
              {getStatusText()}
            </Badge>
            {lastSpokenText && !error && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-16 overflow-y-auto">
                "{lastSpokenText.slice(0, 100)}{lastSpokenText.length > 100 ? '...' : ''}"
              </div>
            )}
          </div>

          {/* Audio Visualizer */}
          {(isListening || isSpeaking) && !error && (
            <div className="mb-4">
              <AudioVisualizer isActive={isListening || isSpeaking} type={isListening ? 'input' : 'output'} />
            </div>
          )}

          {/* Simple Volume Control - No Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Volume</span>
              <span className="text-sm text-gray-500">{volume}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseVolume}
                disabled={volume <= 0}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
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
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={isEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleVoice}
              className="flex flex-col items-center p-2 h-auto text-white"
            >
              {isEnabled ? <Volume2 className="h-4 w-4 mb-1" /> : <VolumeX className="h-4 w-4 mb-1" />}
              <span className="text-xs">{isEnabled ? 'On' : 'Off'}</span>
            </Button>

            <Button
              variant={isListening ? "default" : "outline"}
              size="sm"
              onClick={toggleListening}
              disabled={!isEnabled || !!error}
              className="flex flex-col items-center p-2 h-auto text-white"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mb-1 animate-spin" />
              ) : isListening ? (
                <Mic className="h-4 w-4 mb-1" />
              ) : (
                <MicOff className="h-4 w-4 mb-1" />
              )}
              <span className="text-xs">{isListening ? 'Stop' : 'Listen'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={isSpeaking ? pauseSpeech : resumeSpeech}
              disabled={!isEnabled}
              className="flex flex-col items-center p-2 h-auto"
            >
              {isSpeaking ? <Pause className="h-4 w-4 mb-1" /> : <Play className="h-4 w-4 mb-1" />}
              <span className="text-xs">{isSpeaking ? 'Pause' : 'Play'}</span>
            </Button>
          </div>

          {/* Quick Commands */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-gray-600 mb-2">Quick Commands:</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>"Next step"</div>
              <div>"Repeat"</div>
              <div>"Explain"</div>
              <div>"Help"</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}