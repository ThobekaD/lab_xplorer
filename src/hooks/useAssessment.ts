//src/hooks/useAssessment.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Updated types to match your database schema
interface DatabaseAssessment {
  id: string;
  experiment_id: string;
  assessment_type: 'pre_lab' | 'post_lab' | 'checkpoint';
  question_text: string;
  question_type: 'multiple_choice' | 'numerical' | 'short_answer';
  options: any;
  correct_answer: any;
  explanation: string;
  difficulty: number;
  hints: any;
  image_url: string | null;
  context: string | null;
  tolerance: number | null;
  unit: string | null;
  topic: string | null;
  points: number;
}

interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  answers: Record<string, any>;
  score: number;
  max_score: number;
  percentage: number;
  completed_at: Date;
  time_taken: number | null;
  hints_used: number;
}

// Transform database assessment to grouped format
function transformAssessments(assessments: DatabaseAssessment[]) {
  const grouped = assessments.reduce((acc, assessment) => {
    const key = `${assessment.experiment_id}-${assessment.assessment_type}`;
    if (!acc[key]) {
      acc[key] = {
        id: `${assessment.assessment_type}-${assessment.experiment_id}`,
        title: getAssessmentTitle(assessment.assessment_type, assessment.experiment_id),
        description: getAssessmentDescription(assessment.assessment_type),
        experiment_id: assessment.experiment_id,
        assessment_type: assessment.assessment_type,
        questions: [],
        time_limit_minutes: getTimeLimit(assessment.assessment_type),
        max_attempts: 3,
        passing_score: getPassingScore(assessment.assessment_type),
        difficulty: Math.max(...assessments.filter(a => a.experiment_id === assessment.experiment_id && a.assessment_type === assessment.assessment_type).map(a => a.difficulty)),
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }
    
    acc[key].questions.push({
      id: assessment.id,
      question_text: assessment.question_text,
      question_type: assessment.question_type,
      options: assessment.options?.options || [],
      correct_answer: assessment.correct_answer,
      explanation: assessment.explanation,
      points: assessment.points,
      difficulty: assessment.difficulty,
      topic: assessment.topic,
      image_url: assessment.image_url,
      context: assessment.context,
      hints: assessment.hints,
      tolerance: assessment.tolerance,
      unit: assessment.unit,
    });
    
    return acc;
  }, {} as Record<string, any>);
  
  return Object.values(grouped);
}

function getAssessmentTitle(type: string, experimentId: string) {
  switch (type) {
    case 'pre_lab': return 'Pre-Lab Assessment';
    case 'post_lab': return 'Post-Lab Assessment';
    case 'checkpoint': return 'Checkpoint Assessment';
    default: return 'Assessment';
  }
}

function getAssessmentDescription(type: string) {
  switch (type) {
    case 'pre_lab': return 'Complete this assessment before starting the experiment to test your preparation.';
    case 'post_lab': return 'Test your understanding after completing the experiment.';
    case 'checkpoint': return 'Quick check of your progress during the experiment.';
    default: return 'Test your knowledge.';
  }
}

function getTimeLimit(type: string) {
  switch (type) {
    case 'pre_lab': return 20;
    case 'post_lab': return 30;
    case 'checkpoint': return 10;
    default: return 15;
  }
}

function getPassingScore(type: string) {
  switch (type) {
    case 'pre_lab': return 70;
    case 'post_lab': return 75;
    case 'checkpoint': return 60;
    default: return 70;
  }
}

// Fetch assessments for an experiment
export function useAssessments(experimentId?: string, type?: string) {
  return useQuery({
    queryKey: ['assessments', experimentId, type],
    queryFn: async () => {
      let query = supabase
        .from('assessments')
        .select('*');

      if (experimentId) {
        query = query.eq('experiment_id', experimentId);
      }

      if (type) {
        query = query.eq('assessment_type', type);
      }

      const { data, error } = await query.order('difficulty', { ascending: true });

      if (error) throw error;
      return transformAssessments(data as DatabaseAssessment[]);
    },
    enabled: !!experimentId,
  });
}

// Fetch a single assessment
export function useAssessment(assessmentId: string) {
  return useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      return data as DatabaseAssessment;
    },
    enabled: !!assessmentId,
  });
}

// Fetch assessment attempts for a user
export function useAssessmentAttempts(userId: string, assessmentId?: string) {
  return useQuery({
    queryKey: ['assessment-attempts', userId, assessmentId],
    queryFn: async () => {
      // Since we don't have assessment_attempts table yet, return empty array
      // In a real implementation, this would query the attempts table
      return [] as AssessmentAttempt[];
    },
    enabled: !!userId,
  });
}

// Create assessment attempt
export function useCreateAssessmentAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attempt: Omit<AssessmentAttempt, 'id'>) => {
      // For now, just return the attempt with a generated ID
      // In a real implementation, this would save to database
      const newAttempt = {
        ...attempt,
        id: crypto.randomUUID(),
      };
      return newAttempt as AssessmentAttempt;
    },
    onSuccess: (data) => {
      // Invalidate and refetch attempts
      queryClient.invalidateQueries({ 
        queryKey: ['assessment-attempts', data.user_id] 
      });
    },
  });
}

// Update assessment attempt
export function useUpdateAssessmentAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<AssessmentAttempt> 
    }) => {
      // For now, just return the updated attempt
      // In a real implementation, this would update in database
      return { id, ...updates } as AssessmentAttempt;
    },
    onSuccess: (data) => {
      // Invalidate and refetch attempts
      queryClient.invalidateQueries({ 
        queryKey: ['assessment-attempts'] 
      });
    },
  });
}

// Get assessment analytics
export function useAssessmentAnalytics(assessmentId: string) {
  return useQuery({
    queryKey: ['assessment-analytics', assessmentId],
    queryFn: async () => {
      // Return mock analytics for now
      return {
        totalAttempts: 0,
        averageScore: 0,
        averageTime: 0,
        questionSuccessRates: [],
        difficultyDistribution: [],
        topMisconceptions: [],
      };
    },
    enabled: !!assessmentId,
  });
}

// Get user assessment recommendations
export function useAssessmentRecommendations(userId: string) {
  return useQuery({
    queryKey: ['assessment-recommendations', userId],
    queryFn: async () => {
      return {
        userId,
        recommendedTopics: ['Chemical Safety', 'pH Calculations', 'Titration Techniques'],
        knowledgeGaps: ['Buffer Systems', 'Acid-Base Indicators'],
        suggestedResources: [
          {
            topic: 'Chemical Safety',
            resourceType: 'video' as const,
            resourceUrl: '/videos/chemical-safety',
            title: 'Laboratory Safety Fundamentals',
          },
        ],
        readinessLevel: 0.75,
      };
    },
    enabled: !!userId,
  });
}