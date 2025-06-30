//src/stores/useVoiceStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { elevenLabsClient, VoiceProfile, voiceProfiles } from '@/lib/elevenlabs';

interface VoiceState {
  // Core state
  isEnabled: boolean;
  isInitialized: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  
  // Settings
  currentVoiceProfile: VoiceProfile | null;
  volume: number;
  speechRate: number;
  autoSpeak: boolean;
  showTranscripts: boolean;
  
  // Audio state
  lastSpokenText: string;
  speechQueue: string[];
  
  // Actions
  initialize: () => Promise<void>;
  toggleVoice: () => void;
  toggleListening: () => void;
  speak: (text: string, priority?: 'high' | 'normal' | 'low') => Promise<void>;
  pauseSpeech: () => void;
  resumeSpeech: () => void;
  stopSpeech: () => void;
  
  // Settings actions
  setVoiceProfile: (profile: VoiceProfile) => void;
  setVolume: (volume: number) => void;
  setSpeechRate: (rate: number) => void;
  setAutoSpeak: (enabled: boolean) => void;
  setShowTranscripts: (show: boolean) => void;
  
  // Utility actions
  testVoice: (text: string) => Promise<void>;
  speakInstruction: (instruction: string, stepNumber?: number) => Promise<void>;
  speakFeedback: (feedback: string, type?: 'success' | 'error' | 'warning') => Promise<void>;
  speakHint: (hint: string) => Promise<void>;
}

export const useVoiceStore = create<VoiceState>()(
  persist(
    (set, get) => ({
      // Initial state
      isEnabled: false,
      isInitialized: false,
      isListening: false,
      isSpeaking: false,
      
      currentVoiceProfile: voiceProfiles[0], // Default to first profile
      volume: 70,
      speechRate: 1.0,
      autoSpeak: true,
      showTranscripts: true,
      
      lastSpokenText: '',
      speechQueue: [],

      // Initialize the voice system
      initialize: async () => {
        try {
          await elevenLabsClient.initialize();
          set({ isInitialized: true });
        } catch (error) {
          console.error('Failed to initialize voice system:', error);
        }
      },

      // Toggle voice system on/off
      toggleVoice: () => {
        const { isEnabled } = get();
        if (isEnabled) {
          elevenLabsClient.stopSpeech();
        }
        set({ isEnabled: !isEnabled, isListening: false, isSpeaking: false });
      },

      // Toggle speech recognition
      toggleListening: () => {
        const { isListening, isEnabled } = get();
        if (!isEnabled) return;
        
        set({ isListening: !isListening });
      },

      // Speak text with priority queue
      speak: async (text: string, priority: 'high' | 'normal' | 'low' = 'normal') => {
        const { isEnabled, currentVoiceProfile, volume, speechRate } = get();
        
        if (!isEnabled || !currentVoiceProfile || !text.trim()) {
          return;
        }

        set({ isSpeaking: true, lastSpokenText: text });

        try {
          const voiceSettings = {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.0,
            use_speaker_boost: true,
          };

          await elevenLabsClient.speak(text, currentVoiceProfile.voice_id, voiceSettings);
        } catch (error) {
          console.error('Speech synthesis failed:', error);
        } finally {
          set({ isSpeaking: false });
        }
      },

      // Pause current speech
      pauseSpeech: () => {
        elevenLabsClient.pauseSpeech();
        set({ isSpeaking: false });
      },

      // Resume paused speech
      resumeSpeech: () => {
        elevenLabsClient.resumeSpeech();
        set({ isSpeaking: true });
      },

      // Stop all speech
      stopSpeech: () => {
        elevenLabsClient.stopSpeech();
        set({ isSpeaking: false, speechQueue: [] });
      },

      // Settings actions
      setVoiceProfile: (profile: VoiceProfile) => {
        set({ currentVoiceProfile: profile });
      },

      setVolume: (volume: number) => {
        set({ volume });
      },

      setSpeechRate: (rate: number) => {
        set({ speechRate: rate });
      },

      setAutoSpeak: (enabled: boolean) => {
        set({ autoSpeak: enabled });
      },

      setShowTranscripts: (show: boolean) => {
        set({ showTranscripts: show });
      },

      // Utility methods for different types of speech
      testVoice: async (text: string) => {
        const { speak } = get();
        await speak(text, 'high');
      },

      speakInstruction: async (instruction: string, stepNumber?: number) => {
        const { speak, autoSpeak } = get();
        
        if (!autoSpeak) return;

        const prefix = stepNumber ? `Step ${stepNumber}: ` : '';
        const fullText = `${prefix}${instruction}`;
        
        await speak(fullText, 'normal');
      },

      speakFeedback: async (feedback: string, type: 'success' | 'error' | 'warning' = 'success') => {
        const { speak } = get();
        
        const prefix = {
          success: 'Great job! ',
          error: 'Oops! ',
          warning: 'Be careful! ',
        }[type];

        await speak(`${prefix}${feedback}`, 'high');
      },

      speakHint: async (hint: string) => {
        const { speak } = get();
        await speak(`Here's a hint: ${hint}`, 'normal');
      },
    }),
    {
      name: 'voice-settings',
      partialize: (state) => ({
        currentVoiceProfile: state.currentVoiceProfile,
        volume: state.volume,
        speechRate: state.speechRate,
        autoSpeak: state.autoSpeak,
        showTranscripts: state.showTranscripts,
        isEnabled: state.isEnabled,
      }),
    }
  )
);