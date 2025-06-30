//src/components/voice/SpeechRecognition.tsx
import React, { useEffect, useRef, useState } from 'react';
import { voiceCommands, VoiceCommand } from '@/lib/elevenlabs';

interface SpeechRecognitionProps {
  onCommand: (command: string, intent: string) => void;
  onError: (error: string) => void;
  language?: string;
}

export function SpeechRecognition({ 
  onCommand, 
  onError, 
  language = 'en-US' 
}: SpeechRecognitionProps) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Check if Speech Recognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      onError('Speech recognition is not supported in this browser');
      return;
    }

    setIsSupported(true);

    // Request microphone permission first
    const requestMicrophonePermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionGranted(true);
        initializeSpeechRecognition();
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setPermissionGranted(false);
        onError('Microphone access denied. Please allow microphone access in your browser settings to use voice commands.');
        return;
      }
    };

    const initializeSpeechRecognition = () => {
      // Initialize Speech Recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          const command = parseVoiceCommand(finalTranscript.toLowerCase().trim());
          if (command) {
            onCommand(finalTranscript, command.intent);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'not-allowed':
            onError('Microphone access denied. Please allow microphone access in your browser settings and refresh the page.');
            break;
          case 'no-speech':
            onError('No speech detected. Please try speaking again.');
            break;
          case 'audio-capture':
            onError('Audio capture failed. Please check your microphone.');
            break;
          case 'network':
            onError('Network error occurred during speech recognition.');
            break;
          default:
            onError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        // Restart recognition for continuous listening only if permission is granted
        if (recognitionRef.current && permissionGranted) {
          try {
            recognition.start();
          } catch (error) {
            console.warn('Failed to restart speech recognition:', error);
          }
        }
      };

      recognitionRef.current = recognition;

      // Start recognition
      try {
        recognition.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        onError('Failed to start speech recognition');
      }
    };

    requestMicrophonePermission();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [language, onCommand, onError, permissionGranted]);

  const parseVoiceCommand = (transcript: string): VoiceCommand | null => {
    for (const commandDef of voiceCommands) {
      for (const pattern of commandDef.patterns) {
        if (transcript.includes(pattern)) {
          return {
            command: transcript,
            intent: commandDef.intent,
            confidence: calculateConfidence(transcript, pattern),
            parameters: extractParameters(transcript, commandDef.intent),
          };
        }
      }
    }
    return null;
  };

  const calculateConfidence = (transcript: string, pattern: string): number => {
    const words = transcript.split(' ');
    const patternWords = pattern.split(' ');
    let matches = 0;

    for (const word of patternWords) {
      if (words.includes(word)) {
        matches++;
      }
    }

    return matches / patternWords.length;
  };

  const extractParameters = (transcript: string, intent: string): Record<string, any> => {
    const params: Record<string, any> = {};

    switch (intent) {
      case 'navigate_step':
        const stepMatch = transcript.match(/step (\d+)/i);
        if (stepMatch) {
          params.stepNumber = parseInt(stepMatch[1], 10);
        }
        break;
      case 'explain_concept':
        const conceptMatch = transcript.match(/explain (.+)/i);
        if (conceptMatch) {
          params.concept = conceptMatch[1];
        }
        break;
    }

    return params;
  };

  // This component doesn't render anything visible
  return null;
}

// Extend the Window interface to include Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}