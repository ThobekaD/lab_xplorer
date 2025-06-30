//src/lib/elevenlabs.ts
import { create } from 'zustand';

// ElevenLabs API configuration - use environment variable
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export interface VoiceProfile {
  id: string;
  name: string;
  voice_id: string;
  subject: 'chemistry' | 'physics' | 'biology' | 'general';
  personality: string;
  language: string;
  gender: 'male' | 'female';
  age_range: 'young' | 'middle' | 'mature';
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface SpeechRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}

export interface VoiceCommand {
  command: string;
  intent: string;
  confidence: number;
  parameters?: Record<string, any>;
}

class ElevenLabsClient {
  private apiKey: string;
  private baseUrl: string;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private speechQueue: SpeechRequest[] = [];
  private isPlaying = false;
  private rateLimitDelay = 0;
  private lastRequestTime = 0;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = ELEVENLABS_BASE_URL;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Request microphone permission for speech recognition
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  private async handleRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  async getVoices(): Promise<any[]> {
    try {
      if (!this.apiKey) {
        console.warn('ElevenLabs API key not configured');
        return [];
      }

      await this.handleRateLimit();

      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (response.status === 429) {
        this.rateLimitDelay = 2000; // 2 second delay for rate limiting
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
      }

      if (response.status === 401) {
        throw new Error('Invalid ElevenLabs API key. Please check your configuration.');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return [];
    }
  }

  async synthesizeSpeech(request: SpeechRequest): Promise<ArrayBuffer | null> {
    try {
      if (!this.apiKey) {
        console.warn('ElevenLabs API key not configured. Using fallback speech synthesis.');
        return null;
      }

      await this.handleRateLimit();

      const response = await fetch(`${this.baseUrl}/text-to-speech/${request.voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: request.text,
          model_id: request.model_id || 'eleven_monolingual_v1',
          voice_settings: request.voice_settings || {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (response.status === 429) {
        this.rateLimitDelay = Math.min(this.rateLimitDelay * 2 || 1000, 10000); // Exponential backoff, max 10s
        console.warn('ElevenLabs rate limit exceeded. Falling back to browser speech synthesis.');
        return null;
      }

      if (response.status === 401) {
        console.error('Invalid ElevenLabs API key. Falling back to browser speech synthesis.');
        return null;
      }

      if (!response.ok) {
        console.warn(`ElevenLabs API error (${response.status}). Falling back to browser speech synthesis.`);
        return null;
      }

      // Reset rate limit delay on successful request
      this.rateLimitDelay = 0;
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Speech synthesis failed:', error);
      return null;
    }
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.isPlaying = false;
          resolve();
        };
        this.currentAudio.onerror = reject;
        
        this.isPlaying = true;
        this.currentAudio.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  async speak(text: string, voiceId: string, settings?: VoiceSettings): Promise<void> {
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not configured. Using browser speech synthesis as fallback.');
      this.fallbackSpeak(text);
      return;
    }

    const request: SpeechRequest = {
      text,
      voice_id: voiceId,
      voice_settings: settings,
    };

    this.speechQueue.push(request);
    
    if (!this.isPlaying) {
      await this.processQueue();
    }
  }

  private fallbackSpeak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  }

  private async processQueue(): Promise<void> {
    while (this.speechQueue.length > 0) {
      const request = this.speechQueue.shift()!;
      const audioBuffer = await this.synthesizeSpeech(request);
      
      if (audioBuffer) {
        await this.playAudio(audioBuffer);
      } else {
        // Fallback to browser speech synthesis
        this.fallbackSpeak(request.text);
        // Add a small delay to prevent rapid fallback calls
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  stopSpeech(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isPlaying = false;
    }
    this.speechQueue = [];
    
    // Also stop browser speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  pauseSpeech(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
    }
    
    // Pause browser speech synthesis
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.pause();
    }
  }

  resumeSpeech(): void {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play();
      this.isPlaying = true;
    }
    
    // Resume browser speech synthesis
    if ('speechSynthesis' in window && speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }
}

// Singleton instance
export const elevenLabsClient = new ElevenLabsClient(ELEVENLABS_API_KEY);

// Voice profiles for different subjects
export const voiceProfiles: VoiceProfile[] = [
  {
    id: 'chemistry-teacher',
    name: 'Dr. Sarah Chen',
    voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
    subject: 'chemistry',
    personality: 'Friendly and encouraging chemistry teacher',
    language: 'en-US',
    gender: 'female',
    age_range: 'middle',
  },
  {
    id: 'physics-professor',
    name: 'Prof. Michael Thompson',
    voice_id: 'VR6AewLTigWG4xSOukaG', // Arnold voice
    subject: 'physics',
    personality: 'Knowledgeable and patient physics professor',
    language: 'en-US',
    gender: 'male',
    age_range: 'mature',
  },
  {
    id: 'biology-expert',
    name: 'Dr. Emily Rodriguez',
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella voice
    subject: 'biology',
    personality: 'Enthusiastic and caring biology expert',
    language: 'en-US',
    gender: 'female',
    age_range: 'young',
  },
  {
    id: 'general-assistant',
    name: 'Alex',
    voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam voice
    subject: 'general',
    personality: 'Helpful and versatile lab assistant',
    language: 'en-US',
    gender: 'male',
    age_range: 'young',
  },
];

// Command patterns for voice recognition
export const voiceCommands = [
  {
    patterns: ['what should i do next', 'next step', 'what now'],
    intent: 'next_instruction',
    response: 'Let me guide you to the next step.',
  },
  {
    patterns: ['repeat', 'say that again', 'repeat instruction'],
    intent: 'repeat_instruction',
    response: 'Let me repeat the current instruction.',
  },
  {
    patterns: ['explain', 'help me understand', 'what does this mean'],
    intent: 'explain_concept',
    response: 'Let me explain this concept in more detail.',
  },
  {
    patterns: ['what did i do wrong', 'mistake', 'error'],
    intent: 'explain_error',
    response: 'Let me help you identify what went wrong.',
  },
  {
    patterns: ['skip to step', 'go to step', 'jump to'],
    intent: 'navigate_step',
    response: 'Which step would you like to go to?',
  },
  {
    patterns: ['pause', 'stop', 'quiet'],
    intent: 'pause_speech',
    response: 'Voice assistant paused.',
  },
  {
    patterns: ['resume', 'continue', 'speak'],
    intent: 'resume_speech',
    response: 'Voice assistant resumed.',
  },
];