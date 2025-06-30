//src/types/assessment.ts
export interface Assessment {
  id: string;
  title: string;
  description: string;
  experiment_id?: string;
  assessment_type: 'pre_lab' | 'post_lab' | 'checkpoint';
  questions: AssessmentQuestion[];
  time_limit_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  difficulty: number;
  is_active: boolean;
  created_at: string;
}

export interface AssessmentQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'numerical' | 'short_answer';
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  points?: number;
  difficulty?: number;
  topic?: string;
  image_url?: string;
  context?: string;
  hints?: string[];
  tolerance?: number; // For numerical questions
  unit?: string; // For numerical questions
  word_limit?: number; // For short answer questions
}

export type QuestionAnswer = string | string[] | number;

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  session_id?: string;
  answers: Record<string, QuestionAnswer>;
  score: number;
  max_score: number;
  percentage: number;
  completed_at: Date;
  time_taken: number | null;
  hints_used: number;
}

export type QuestionDifficulty = 1 | 2 | 3 | 4 | 5;

export interface AssessmentAnalytics {
  totalAttempts: number;
  averageScore: number;
  averageTime: number;
  questionSuccessRates: {
    questionId: string;
    successRate: number;
    attempts: number;
  }[];
  difficultyDistribution: {
    difficulty: QuestionDifficulty;
    count: number;
  }[];
  topMisconceptions: {
    questionId: string;
    misconception: string;
    frequency: number;
  }[];
}

export interface AssessmentRecommendation {
  userId: string;
  recommendedTopics: string[];
  knowledgeGaps: string[];
  suggestedResources: {
    topic: string;
    resourceType: 'video' | 'reading' | 'practice';
    resourceUrl: string;
    title: string;
  }[];
  readinessLevel: number; // 0-1 scale
}