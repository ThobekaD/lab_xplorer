//src/stores/useTavusStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tavusClient, AvatarPersona, avatarPersonas, ConversationMessage, ConversationContext } from '@/lib/tavus';

interface PersonalizationSettings {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  difficultyPreference: number;
  interactionFrequency: number;
  encouragementLevel: number;
  explanationDepth: 'brief' | 'moderate' | 'detailed';
  useRealWorldExamples: boolean;
  adaptiveDifficulty: boolean;
  personalInterests: string;
}

interface TavusState {
  // Core state
  isInitialized: boolean;
  isConnected: boolean;
  currentPersona: AvatarPersona | null;
  conversationId: string | null;
  conversationUrl: string | null;
  initializationError: string | null;
  
  // Conversation state
  conversationHistory: ConversationMessage[];
  isTyping: boolean;
  isListening: boolean;
  
  // Video state
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  videoQuality: 'low' | 'medium' | 'high';
  
  // Personalization
  personalizationSettings: PersonalizationSettings | null;
  
  // Actions
  initialize: () => Promise<void>;
  setPersona: (persona: AvatarPersona) => Promise<void>;
  startConversation: (context?: ConversationContext) => Promise<void>;
  sendMessage: (message: string, context?: ConversationContext) => Promise<void>;
  endConversation: () => void;
  
  // Media controls
  toggleVideo: () => void;
  toggleAudio: () => void;
  setVideoQuality: (quality: 'low' | 'medium' | 'high') => void;
  
  // Speech recognition
  startListening: () => void;
  stopListening: () => void;
  
  // Personalization
  setPersonalizationSettings: (settings: PersonalizationSettings) => void;
  
  // Utility
  clearHistory: () => void;
  getPersonaBySubject: (subject: 'chemistry' | 'physics' | 'biology') => AvatarPersona | null;
}

export const useTavusStore = create<TavusState>()(
  persist(
    (set, get) => ({
      // Initial state
      isInitialized: false,
      isConnected: false,
      currentPersona: null,
      conversationId: null,
      conversationUrl: null,
      initializationError: null,
      
      conversationHistory: [],
      isTyping: false,
      isListening: false,
      
      isVideoEnabled: true,
      isAudioEnabled: true,
      videoQuality: 'medium',
      
      personalizationSettings: null,

      // Initialize Tavus client with error handling
      initialize: async () => {
        try {
          await tavusClient.initialize();
          set({ isInitialized: true, initializationError: null });
          
          // Set default persona if none selected
          const { currentPersona } = get();
          if (!currentPersona && avatarPersonas.length > 0) {
            set({ currentPersona: avatarPersonas[0] });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to initialize Tavus client:', error);
          set({ 
            isInitialized: false, 
            initializationError: errorMessage 
          });
          // Don't throw - allow app to continue
        }
      },

      // Set current persona
      setPersona: async (persona: AvatarPersona) => {
        set({ currentPersona: persona });
        
        // End current conversation if active
        const { conversationId } = get();
        if (conversationId) {
          get().endConversation();
        }
      },

      // Start a new conversation with error handling
      startConversation: async (context?: ConversationContext) => {
        const { currentPersona, isInitialized } = get();
        
        if (!isInitialized) {
          console.warn('Tavus not initialized, skipping conversation start');
          return;
        }
        
        if (!currentPersona) {
          console.warn('No persona selected, skipping conversation start');
          return;
        }

        try {
          set({ isConnected: false });
          
          const conversationUrl = await tavusClient.startConversation(
            currentPersona.persona_id,
            context
          );
          
          if (conversationUrl) {
            set({
              conversationUrl,
              conversationId: crypto.randomUUID(), // Generate local ID
              isConnected: true,
              conversationHistory: [],
            });
          } else {
            console.warn('Failed to get conversation URL from Tavus');
          }
        } catch (error) {
          console.error('Failed to start conversation:', error);
          set({ isConnected: false });
        }
      },

      // Send a message with error handling
      sendMessage: async (message: string, context?: ConversationContext) => {
        const { conversationId, currentPersona, conversationHistory } = get();
        
        if (!conversationId || !currentPersona) {
          console.warn('No active conversation or persona');
          return;
        }

        // Add user message to history
        const userMessage: ConversationMessage = {
          id: crypto.randomUUID(),
          type: 'user',
          content: message,
          timestamp: new Date(),
          context,
        };

        set({
          conversationHistory: [...conversationHistory, userMessage],
          isTyping: true,
        });

        try {
          // Simulate AI response (in real implementation, this would call Tavus API)
          const response = await simulateAIResponse(message, currentPersona, context);
          
          const aiMessage: ConversationMessage = {
            id: crypto.randomUUID(),
            type: 'avatar',
            content: response.content,
            timestamp: new Date(),
            emotion: response.emotion,
          };

          set({
            conversationHistory: [...get().conversationHistory, aiMessage],
            isTyping: false,
          });
        } catch (error) {
          console.error('Failed to send message:', error);
          set({ isTyping: false });
          
          // Add error message to conversation
          const errorMessage: ConversationMessage = {
            id: crypto.randomUUID(),
            type: 'avatar',
            content: "I'm having trouble responding right now. Please try again.",
            timestamp: new Date(),
            emotion: 'concerned',
          };

          set({
            conversationHistory: [...get().conversationHistory, errorMessage],
          });
        }
      },

      // End conversation
      endConversation: () => {
        set({
          conversationId: null,
          conversationUrl: null,
          isConnected: false,
          isTyping: false,
        });
      },

      // Media controls
      toggleVideo: () => {
        set(state => ({ isVideoEnabled: !state.isVideoEnabled }));
      },

      toggleAudio: () => {
        set(state => ({ isAudioEnabled: !state.isAudioEnabled }));
      },

      setVideoQuality: (quality: 'low' | 'medium' | 'high') => {
        set({ videoQuality: quality });
      },

      // Speech recognition
      startListening: () => {
        set({ isListening: true });
        // In real implementation, start speech recognition
      },

      stopListening: () => {
        set({ isListening: false });
        // In real implementation, stop speech recognition
      },

      // Personalization
      setPersonalizationSettings: (settings: PersonalizationSettings) => {
        set({ personalizationSettings: settings });
      },

      // Utility functions
      clearHistory: () => {
        set({ conversationHistory: [] });
      },

      getPersonaBySubject: (subject: 'chemistry' | 'physics' | 'biology') => {
        return avatarPersonas.find(persona => persona.subject === subject) || null;
      },
    }),
    {
      name: 'tavus-settings',
      partialize: (state) => ({
        currentPersona: state.currentPersona,
        personalizationSettings: state.personalizationSettings,
        isVideoEnabled: state.isVideoEnabled,
        isAudioEnabled: state.isAudioEnabled,
        videoQuality: state.videoQuality,
      }),
    }
  )
);

// Simulate AI response for demo purposes with error handling
async function simulateAIResponse(
  message: string, 
  persona: AvatarPersona, 
  context?: ConversationContext
): Promise<{ content: string; emotion: 'neutral' | 'encouraging' | 'concerned' | 'excited' }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const lowerMessage = message.toLowerCase();
  
  // Generate contextual responses based on persona and message
  if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
    return {
      content: `I'm here to help! As your ${persona.subject} guide, let me break this down for you. What specific part are you finding challenging?`,
      emotion: 'encouraging',
    };
  }
  
  if (lowerMessage.includes('safety') || lowerMessage.includes('danger')) {
    return {
      content: `Safety is our top priority! Let me walk you through the proper safety procedures for this step. Always remember to wear protective equipment and follow the guidelines carefully.`,
      emotion: 'concerned',
    };
  }
  
  if (lowerMessage.includes('great') || lowerMessage.includes('understand')) {
    return {
      content: `Excellent! I can see you're really grasping these concepts. Your understanding of ${persona.subject} is improving wonderfully. Ready for the next challenge?`,
      emotion: 'excited',
    };
  }
  
  // Default response based on persona
  const responses = {
    chemistry: `That's a great question about chemistry! In my experience teaching ${persona.subject}, I find that understanding the underlying molecular interactions really helps. Let me explain this concept using a real-world example...`,
    physics: `Fascinating physics question! The beauty of ${persona.subject} is how these fundamental laws govern everything around us. Think about it this way - imagine you're...`,
    biology: `What an interesting biological question! Life is so interconnected, and this concept relates to many other processes in living organisms. Let me help you see the bigger picture...`,
  };
  
  return {
    content: responses[persona.subject as keyof typeof responses] || `That's an interesting question! Let me help you understand this better.`,
    emotion: 'neutral',
  };
}