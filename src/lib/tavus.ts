//src/lib/tavus.ts
// Tavus AI Video Avatar Configuration
const TAVUS_API_KEY = '04fec6kahe6382147c68215d00055fc6f84';
const TAVUS_BASE_URL = 'https://api.tavus.io/v2';

export interface AvatarPersona {
  id: string;
  name: string;
  persona_id: string;
  subject: 'chemistry' | 'physics' | 'biology';
  personality: string;
  expertise: string[];
  teaching_style: string;
  avatar_url?: string;
  voice_characteristics: {
    tone: 'warm' | 'professional' | 'enthusiastic' | 'calm';
    pace: 'slow' | 'normal' | 'fast';
    accent: string;
  };
}

export interface ConversationContext {
  experiment_id: string;
  current_step: number;
  difficulty_level: number;
  learning_objectives?: string[];
  user_progress?: {
    score: number;
    completedSteps: number;
    totalSteps: number;
  };
  recent_actions?: any[];
}

export interface ConversationMessage {
  id: string;
  type: 'user' | 'avatar';
  content: string;
  timestamp: Date;
  emotion?: 'neutral' | 'encouraging' | 'concerned' | 'excited';
  context?: ConversationContext;
}

export interface VideoLecture {
  id: string;
  title: string;
  description: string;
  duration: number;
  video_url: string;
  transcript: string;
  subject: 'chemistry' | 'physics' | 'biology';
  difficulty: number;
  learning_objectives: string[];
  interactive_elements: {
    timestamp: number;
    type: 'question' | 'quiz' | 'demonstration' | 'checkpoint';
    content: any;
    required: boolean;
  }[];
}

// AI Avatar Personas
export const avatarPersonas: AvatarPersona[] = [
  {
    id: 'chemistry-sarah',
    name: 'Dr. Sarah Chen',
    persona_id: 'persona_chemistry_001',
    subject: 'chemistry',
    personality: 'Friendly, encouraging, and detail-oriented chemistry professor with 15 years of teaching experience',
    expertise: ['Organic Chemistry', 'Analytical Chemistry', 'Laboratory Safety', 'Chemical Reactions'],
    teaching_style: 'Uses real-world examples and hands-on demonstrations to explain complex concepts',
    avatar_url: 'https://example.com/avatars/dr-sarah-chen.jpg',
    voice_characteristics: {
      tone: 'warm',
      pace: 'normal',
      accent: 'American',
    },
  },
  {
    id: 'physics-michael',
    name: 'Prof. Michael Thompson',
    persona_id: 'persona_physics_001',
    subject: 'physics',
    personality: 'Knowledgeable and patient physics professor who loves making complex topics accessible',
    expertise: ['Classical Mechanics', 'Electromagnetism', 'Thermodynamics', 'Lab Techniques'],
    teaching_style: 'Uses analogies and visual demonstrations to explain abstract physics concepts',
    avatar_url: 'https://example.com/avatars/prof-michael-thompson.jpg',
    voice_characteristics: {
      tone: 'professional',
      pace: 'slow',
      accent: 'British',
    },
  },
  {
    id: 'biology-elena',
    name: 'Dr. Elena Rodriguez',
    persona_id: 'persona_biology_001',
    subject: 'biology',
    personality: 'Enthusiastic and caring biology expert who emphasizes the wonder of living systems',
    expertise: ['Cell Biology', 'Genetics', 'Ecology', 'Microscopy'],
    teaching_style: 'Connects biological concepts to everyday life and environmental issues',
    avatar_url: 'https://example.com/avatars/dr-elena-rodriguez.jpg',
    voice_characteristics: {
      tone: 'enthusiastic',
      pace: 'normal',
      accent: 'Spanish',
    },
  },
];

// Conversation starters for different subjects
export const conversationStarters = {
  chemistry: [
    "What safety precautions should I take?",
    "Can you explain this chemical reaction?",
    "Why is precision important in measurements?",
    "What happens if I mix these chemicals?",
    "How do I calculate the molarity?",
  ],
  physics: [
    "Can you explain this physics concept?",
    "What forces are acting here?",
    "How do I calculate the velocity?",
    "Why does this phenomenon occur?",
    "What's the relationship between these variables?",
  ],
  biology: [
    "What's happening at the cellular level?",
    "How does this process work in living organisms?",
    "What can I observe under the microscope?",
    "Why is this biological process important?",
    "How do environmental factors affect this?",
  ],
};

class TavusClient {
  private apiKey: string;
  private baseUrl: string;
  private isInitialized: boolean = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = TAVUS_BASE_URL;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Tavus SDK
      console.log('Initializing Tavus client...');
      // In a real implementation, this would set up the Tavus SDK
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Tavus client:', error);
      this.isInitialized = false;
      // Don't throw - allow app to continue without Tavus features
    }
  }

  async startConversation(
    personaId: string, 
    context?: ConversationContext
  ): Promise<string | null> {
    if (!this.isInitialized) {
      console.warn('Tavus client not initialized, skipping conversation start');
      return null;
    }

    try {
      // In a real implementation, this would call the Tavus API
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona_id: personaId,
          context,
          settings: {
            video_quality: 'high',
            audio_enabled: true,
            video_enabled: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.conversation_url || 'https://tavus-demo-url.com/conversation/123';
    } catch (error) {
      console.error('Failed to start conversation:', error);
      // Return demo URL for development or null for production
      return process.env.NODE_ENV === 'development' ? 'https://tavus-demo-url.com/conversation/123' : null;
    }
  }

  async sendMessage(
    conversationId: string, 
    message: string, 
    context?: ConversationContext
  ): Promise<ConversationMessage | null> {
    try {
      // In a real implementation, this would send the message to Tavus
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        id: data.id || crypto.randomUUID(),
        type: 'avatar',
        content: data.response || 'I understand your question. Let me help you with that.',
        timestamp: new Date(),
        emotion: data.emotion || 'neutral',
        context,
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }

  async endConversation(conversationId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  }

  async getVideoLectures(subject?: string): Promise<VideoLecture[]> {
    try {
      let url = `${this.baseUrl}/lectures`;
      if (subject) {
        url += `?subject=${subject}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.lectures || [];
    } catch (error) {
      console.error('Failed to fetch video lectures:', error);
      return [];
    }
  }

  async generatePersonalizedContent(
    personaId: string,
    userPreferences: any,
    experimentContext: ConversationContext
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/personalize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona_id: personaId,
          user_preferences: userPreferences,
          context: experimentContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content || 'Personalized content will be available shortly.';
    } catch (error) {
      console.error('Failed to generate personalized content:', error);
      return 'I\'m here to help you with your experiment. What would you like to know?';
    }
  }
}

// Singleton instance
export const tavusClient = new TavusClient(TAVUS_API_KEY);

// Utility functions
export function getPersonaBySubject(subject: 'chemistry' | 'physics' | 'biology'): AvatarPersona | null {
  return avatarPersonas.find(persona => persona.subject === subject) || null;
}

export function formatConversationMessage(
  content: string, 
  type: 'user' | 'avatar' = 'avatar',
  emotion?: 'neutral' | 'encouraging' | 'concerned' | 'excited'
): ConversationMessage {
  return {
    id: crypto.randomUUID(),
    type,
    content,
    timestamp: new Date(),
    emotion: emotion || 'neutral',
  };
}

export function generateContextualGreeting(
  persona: AvatarPersona, 
  experimentTitle: string,
  userProgress?: { completedSteps: number; totalSteps: number }
): string {
  const greetings = {
    chemistry: [
      `Hello! I'm ${persona.name}, your chemistry guide for "${experimentTitle}".`,
      `Welcome to the fascinating world of chemistry! I'm ${persona.name}, and I'll be helping you through "${experimentTitle}".`,
      `Greetings, future chemist! I'm ${persona.name}, ready to explore "${experimentTitle}" with you.`,
    ],
    physics: [
      `Welcome! I'm ${persona.name}, your physics instructor for "${experimentTitle}".`,
      `Hello there! I'm ${persona.name}, and I'm excited to guide you through the physics of "${experimentTitle}".`,
      `Greetings! I'm ${persona.name}, ready to unlock the mysteries of physics in "${experimentTitle}".`,
    ],
    biology: [
      `Hi! I'm ${persona.name}, your biology mentor for "${experimentTitle}".`,
      `Welcome to the wonderful world of biology! I'm ${persona.name}, here to guide you through "${experimentTitle}".`,
      `Hello! I'm ${persona.name}, excited to explore the living world with you in "${experimentTitle}".`,
    ],
  };

  const subjectGreetings = greetings[persona.subject] || greetings.chemistry;
  const baseGreeting = subjectGreetings[Math.floor(Math.random() * subjectGreetings.length)];

  if (userProgress && userProgress.completedSteps > 0) {
    return `${baseGreeting} I see you've already completed ${userProgress.completedSteps} of ${userProgress.totalSteps} steps. Great progress! How can I help you continue?`;
  }

  return `${baseGreeting} I'm here to provide guidance, answer questions, and ensure you have a safe and educational experience. What would you like to know?`;
}

export function generateContextualHint(
  subject: 'chemistry' | 'physics' | 'biology',
  stepType: string,
  userProgress: any
): string {
  const hints = {
    chemistry: {
      measurement: "Remember to record your measurements with the appropriate number of significant figures and units.",
      mixing: "Always add acid to water, never water to acid. This prevents dangerous heat generation.",
      observation: "Look for color changes, gas formation, temperature changes, or precipitation.",
      calculation: "Double-check your molarity calculations and make sure your units cancel properly.",
    },
    physics: {
      measurement: "Ensure your measuring instruments are properly calibrated and read at eye level.",
      calculation: "Remember to include direction in vector quantities and check your unit conversions.",
      observation: "Look for patterns in your data - physics often reveals beautiful mathematical relationships.",
      setup: "Make sure all connections are secure and your apparatus is properly aligned.",
    },
    biology: {
      observation: "Use proper microscopy techniques - start with low magnification and work your way up.",
      measurement: "Biological measurements often have natural variation - take multiple readings.",
      preparation: "Handle biological specimens gently and maintain sterile conditions when necessary.",
      analysis: "Consider how environmental factors might affect your biological observations.",
    },
  };

  const subjectHints = hints[subject] || hints.chemistry;
  return subjectHints[stepType as keyof typeof subjectHints] || "Take your time and think through each step carefully.";
}

export function analyzeUserQuery(query: string): {
  intent: string;
  confidence: number;
  suggestedResponse: string;
} {
  const query_lower = query.toLowerCase();
  
  // Safety-related queries
  if (query_lower.includes('safe') || query_lower.includes('danger') || query_lower.includes('careful')) {
    return {
      intent: 'safety_concern',
      confidence: 0.9,
      suggestedResponse: 'Safety is our top priority. Let me review the safety protocols for this step...',
    };
  }
  
  // Help requests
  if (query_lower.includes('help') || query_lower.includes('stuck') || query_lower.includes('confused')) {
    return {
      intent: 'help_request',
      confidence: 0.85,
      suggestedResponse: 'I\'m here to help! Let me break this down step by step...',
    };
  }
  
  // Explanation requests
  if (query_lower.includes('why') || query_lower.includes('explain') || query_lower.includes('how')) {
    return {
      intent: 'explanation_request',
      confidence: 0.8,
      suggestedResponse: 'Great question! Let me explain the underlying concepts...',
    };
  }
  
  // Procedure questions
  if (query_lower.includes('what next') || query_lower.includes('next step') || query_lower.includes('now what')) {
    return {
      intent: 'procedure_question',
      confidence: 0.85,
      suggestedResponse: 'Let me guide you to the next step in our procedure...',
    };
  }
  
  // General inquiry
  return {
    intent: 'general_inquiry',
    confidence: 0.6,
    suggestedResponse: 'That\'s an interesting question. Let me think about the best way to address that...',
  };
}