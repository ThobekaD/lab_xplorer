//src/types/index.ts
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  role: 'student' | 'teacher' | 'admin';
  experience_points: number;
  level: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
  category: 'experiments' | 'collaboration' | 'assessment' | 'milestone';
}

export interface Experiment {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'chemistry' | 'physics' | 'biology' | 'earth-science';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  thumbnail_url: string;
  instructions: string;
  equipment_required: string[];
  learning_objectives: string[];
  safety_notes: string[];
  created_at: string;
  created_by: string;
  is_published: boolean;
  completion_count: number;
  average_rating: number;
}

export interface ExperimentSession {
  id: string;
  experiment_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  data: Record<string, any>;
  screenshots: string[];
  notes: string;
  rating?: number;
  feedback?: string;
}

export interface NotebookEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  experiment_id?: string;
  created_at: string;
  updated_at: string;
  is_shared: boolean;
  collaborators: string[];
  tags: string[];
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points_reward: number;
  thumbnail_url: string;
  game_data: Record<string, any>;
  created_at: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  experiment_id?: string;
  questions: Question[];
  time_limit_minutes?: number;
  max_attempts: number;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'calculation';
  question: string;
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  points: number;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  answers: Record<string, any>;
  score: number;
  max_score: number;
  started_at: string;
  submitted_at: string;
  time_taken_minutes: number;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  experience_points: number;
  level: number;
  rank: number;
  experiments_completed: number;
  assessments_passed: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'achievement' | 'collaboration' | 'assignment' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: Record<string, any>;
}

// Database types from Supabase
export type { Tables, Inserts, Updates } from '@/lib/supabase';