//src/pages/AssessmentPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckSquare, Clock, AlertTriangle, Award, Loader2 } from 'lucide-react';
import { AssessmentEngine } from '@/components/assessment/AssessmentEngine';
import { AssessmentList } from '@/components/assessment/AssessmentList';
import { AnalyticsTracker } from '@/components/assessment/AnalyticsTracker';
import { useAssessment, useAssessments, useAssessmentAttempts } from '@/hooks/useAssessment';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import type { Assessment, AssessmentAttempt } from '@/types/assessment';

export function AssessmentPage() {
  const { experimentId, assessmentType } = useParams<{ experimentId: string; assessmentType: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentData, setAssessmentData] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  
  // Fetch assessments directly from Supabase
  useEffect(() => {
    const fetchAssessments = async () => {
      if (!experimentId || !assessmentType) {
        setError('Missing experiment ID or assessment type');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch assessments for this experiment and type
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('experiment_id', experimentId)
          .eq('assessment_type', assessmentType);
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
          setAssessmentData([]);
          setIsLoading(false);
          return;
        }
        
        // Group assessments by type to create assessment objects
        const assessmentMap = new Map<string, any>();
        
        data.forEach(question => {
          const key = `${question.assessment_type}-${question.experiment_id}`;
          
          if (!assessmentMap.has(key)) {
            assessmentMap.set(key, {
              id: key,
              title: getAssessmentTitle(question.assessment_type),
              description: getAssessmentDescription(question.assessment_type),
              experiment_id: question.experiment_id,
              assessment_type: question.assessment_type,
              questions: [],
              time_limit_minutes: getTimeLimit(question.assessment_type),
              max_attempts: 3,
              passing_score: getPassingScore(question.assessment_type),
              difficulty: question.difficulty,
              is_active: true,
              created_at: new Date().toISOString(),
            });
          }
          
          const assessment = assessmentMap.get(key);
          
          assessment.questions.push({
            id: question.id,
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.options || [],
            correct_answer: question.correct_answer,
            explanation: question.explanation,
            points: question.points || 1,
            difficulty: question.difficulty,
            topic: question.topic,
            image_url: question.image_url,
            context: question.context,
            hints: question.hints,
            tolerance: question.tolerance,
            unit: question.unit,
          });
        });
        
        setAssessmentData(Array.from(assessmentMap.values()));
      } catch (err) {
        console.error('Error fetching assessments:', err);
        setError('Failed to load assessments');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssessments();
  }, [experimentId, assessmentType]);
  
  // Fetch attempts if user is logged in
  useEffect(() => {
    const fetchAttempts = async () => {
      if (!user?.id || !selectedAssessment) return;
      
      try {
        const { data, error } = await supabase
          .from('assessment_attempts')
          .select('*')
          .eq('user_id', user.id)
          .eq('assessment_id', selectedAssessment.id);
          
        if (error) throw error;
        
        setAttempts(data || []);
      } catch (err) {
        console.error('Error fetching attempts:', err);
      }
    };
    
    fetchAttempts();
  }, [user?.id, selectedAssessment]);
  
  const handleSelectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
  };
  
  const handleAssessmentComplete = (results: AssessmentAttempt) => {
    // In a real implementation, this would save the results to the database
    console.log('Assessment completed:', results);
    setAttempts(prev => [...prev, results]);
  };
  
  const handleExitAssessment = () => {
    setSelectedAssessment(null);
  };
  
  const validAssessmentType = assessmentType === 'pre_lab' || 
                             assessmentType === 'post_lab' || 
                             assessmentType === 'checkpoint'
    ? assessmentType
    : 'pre_lab';
  
  function getAssessmentTitle(type: string) {
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
  
  if (selectedAssessment) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={handleExitAssessment}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Assessments
        </Button>
        
        <AssessmentEngine
          assessmentId={selectedAssessment.id}
          experimentId={experimentId}
          assessmentType={selectedAssessment.assessment_type as 'pre_lab' | 'post_lab' | 'checkpoint'}
          onComplete={handleAssessmentComplete}
          onExit={handleExitAssessment}
        />
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Assessments</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <h1 className="text-3xl font-bold tracking-tight">
              {assessmentType?.replace('_', ' ')} Assessments
            </h1>
            <p className="text-muted-foreground">
              {assessmentType === 'pre_lab' && 'Prepare for your lab experiment with these pre-lab assessments'}
              {assessmentType === 'post_lab' && 'Test your understanding after completing the lab experiment'}
              {assessmentType === 'checkpoint' && 'Check your progress during the experiment'}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Assessment List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <AssessmentList
          experimentId={experimentId}
          assessmentType={validAssessmentType as 'pre_lab' | 'post_lab' | 'checkpoint'}
          onSelectAssessment={handleSelectAssessment}
        />
      </motion.div>
      
      {/* Recent Attempts */}
      {user && attempts && attempts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Your Recent Attempts
              </CardTitle>
              <CardDescription>
                View your recent assessment performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attempts.slice(0, 3).map((attempt) => (
                  <Card key={attempt.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {attempt.assessment_id}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <div className="flex items-center">
                              <CheckSquare className="h-4 w-4 mr-1" />
                              Score: {attempt.score}/{attempt.max_score}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {attempt.time_taken 
                                ? `${Math.floor(attempt.time_taken / 60)}m ${attempt.time_taken % 60}s` 
                                : 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Badge className={`
                            ${attempt.percentage >= 70 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          `}>
                            {attempt.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}