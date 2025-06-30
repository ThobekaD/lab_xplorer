//src/pages/AssessmentPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckSquare, Clock, AlertTriangle, Award, Loader2, Brain, BookOpen } from 'lucide-react';
import { AssessmentEngine } from '@/components/assessment/AssessmentEngine';
import { AssessmentList } from '@/components/assessment/AssessmentList';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import type { Assessment, AssessmentAttempt } from '@/types/assessment';

export function AssessmentPage() {
  const { experimentSlug, assessmentType } = useParams<{ experimentSlug: string; assessmentType: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentData, setAssessmentData] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [experimentId, setExperimentId] = useState<string | null>(null);
  
  // First, get experiment ID from slug
  useEffect(() => {
    const fetchExperimentId = async () => {
      if (!experimentSlug) {
        setError('Missing experiment identifier');
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('experiments')
          .select('id')
          .eq('slug', experimentSlug)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setExperimentId(data.id);
        } else {
          setError('Experiment not found');
        }
      } catch (err) {
        console.error('Error fetching experiment:', err);
        setError('Failed to load experiment');
      }
    };
    
    fetchExperimentId();
  }, [experimentSlug]);
  
  // Fetch assessments once we have experiment ID
  useEffect(() => {
    const fetchAssessments = async () => {
      if (!experimentId || !assessmentType) {
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
          // Create mock assessment data if none exists
          const mockAssessment = createMockAssessment(experimentId, assessmentType);
          setAssessmentData([mockAssessment]);
          setIsLoading(false);
          return;
        }
        
        // Group questions into assessments
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
              difficulty: question.difficulty || 1,
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
          .eq('assessment_id', selectedAssessment.id)
          .order('completed_at', { ascending: false });
          
        if (error) throw error;
        
        setAttempts(data || []);
      } catch (err) {
        console.error('Error fetching attempts:', err);
      }
    };
    
    fetchAttempts();
  }, [user?.id, selectedAssessment]);
  
  const createMockAssessment = (expId: string, type: string): Assessment => {
    const mockQuestions = generateMockQuestions(type);
    
    return {
      id: `mock-${type}-${expId}`,
      title: getAssessmentTitle(type),
      description: getAssessmentDescription(type),
      experiment_id: expId,
      assessment_type: type as 'pre_lab' | 'post_lab' | 'checkpoint',
      questions: mockQuestions,
      time_limit_minutes: getTimeLimit(type),
      max_attempts: 3,
      passing_score: getPassingScore(type),
      difficulty: 2,
      is_active: true,
      created_at: new Date().toISOString(),
    };
  };
  
  const generateMockQuestions = (type: string) => {
    const baseQuestions = [
      {
        id: `q1-${type}`,
        question_text: "What is the primary purpose of this lab experiment?",
        question_type: "multiple_choice" as const,
        options: [
          "To demonstrate basic scientific principles",
          "To practice laboratory safety",
          "To collect and analyze data",
          "All of the above"
        ],
        correct_answer: "All of the above",
        explanation: "Lab experiments serve multiple purposes including demonstrating principles, practicing safety, and developing analytical skills.",
        points: 1,
        difficulty: 1,
        topic: "Laboratory Fundamentals",
      },
      {
        id: `q2-${type}`,
        question_text: "Which safety equipment should always be worn in the laboratory?",
        question_type: "multiple_choice" as const,
        options: [
          "Safety goggles only",
          "Lab coat only", 
          "Safety goggles and lab coat",
          "No special equipment needed"
        ],
        correct_answer: "Safety goggles and lab coat",
        explanation: "Both safety goggles and lab coats are essential for protection in laboratory environments.",
        points: 1,
        difficulty: 1,
        topic: "Laboratory Safety",
      },
      {
        id: `q3-${type}`,
        question_text: "What should you do if you spill a chemical?",
        question_type: "multiple_choice" as const,
        options: [
          "Ignore it and continue working",
          "Clean it up immediately without telling anyone",
          "Notify the instructor immediately",
          "Leave it for someone else to clean"
        ],
        correct_answer: "Notify the instructor immediately",
        explanation: "Chemical spills should always be reported to ensure proper cleanup and safety procedures are followed.",
        points: 1,
        difficulty: 2,
        topic: "Emergency Procedures",
      }
    ];
    
    if (type === 'post_lab') {
      baseQuestions.push({
        id: `q4-${type}`,
        question_text: "What was the most important concept you learned in this experiment?",
        question_type: "short_answer" as const,
        options: [],
        correct_answer: "Understanding of experimental methodology and data analysis",
        explanation: "Post-lab reflections help consolidate learning and identify key concepts.",
        points: 2,
        difficulty: 2,
        topic: "Reflection",
      });
    }
    
    return baseQuestions;
  };
  
  const handleSelectAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
  };
  
  const handleAssessmentComplete = async (results: any) => {
    console.log('Assessment completed:', results);
    
    // Save attempt to database
    if (user?.id && selectedAssessment) {
      try {
        const attemptData = {
          assessment_id: selectedAssessment.id,
          user_id: user.id,
          answers: results.answers || {},
          score: results.score || 0,
          max_score: results.maxScore || selectedAssessment.questions.length,
          percentage: results.percentage || 0,
          time_taken: results.timeElapsed || 0,
          hints_used: results.hintsUsed || 0,
          completed_at: new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('assessment_attempts')
          .insert([attemptData]);
          
        if (error) {
          console.error('Error saving attempt:', error);
        } else {
          // Refresh attempts
          setAttempts(prev => [attemptData as AssessmentAttempt, ...prev]);
        }
      } catch (err) {
        console.error('Failed to save assessment attempt:', err);
      }
    }
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
          assessment={selectedAssessment}
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
        <Button onClick={() => navigate(`/experiment/${experimentSlug}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Experiment
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => navigate(`/experiment/${experimentSlug}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Experiment
        </Button>
        
        <div className="flex items-center space-x-3 mb-6">
          {assessmentType === 'pre_lab' && <Brain className="h-8 w-8 text-blue-600" />}
          {assessmentType === 'post_lab' && <Award className="h-8 w-8 text-green-600" />}
          {assessmentType === 'checkpoint' && <CheckSquare className="h-8 w-8 text-orange-600" />}
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getAssessmentTitle(assessmentType || 'pre_lab')}
            </h1>
            <p className="text-muted-foreground">
              {getAssessmentDescription(assessmentType || 'pre_lab')}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Assessment Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{assessmentData.length}</div>
            <div className="text-sm text-gray-500">Available Assessments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{getTimeLimit(assessmentType || 'pre_lab')}</div>
            <div className="text-sm text-gray-500">Minutes Time Limit</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{getPassingScore(assessmentType || 'pre_lab')}%</div>
            <div className="text-sm text-gray-500">Passing Score</div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Assessment List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Available Assessments
            </CardTitle>
            <CardDescription>
              Select an assessment to begin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assessmentData.length > 0 ? (
              <div className="space-y-4">
                {assessmentData.map((assessment) => (
                  <Card key={assessment.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{assessment.title}</h3>
                          <p className="text-gray-600 mb-4">{assessment.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <CheckSquare className="h-4 w-4 mr-1" />
                              {assessment.questions?.length || 0} Questions
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {assessment.time_limit_minutes} minutes
                            </div>
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              {assessment.passing_score}% to pass
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-4">
                            <Badge variant="outline">
                              Difficulty: {assessment.difficulty}/5
                            </Badge>
                            <Badge variant="outline">
                              Max Attempts: {assessment.max_attempts}
                            </Badge>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => handleSelectAssessment(assessment)}
                          className="ml-4"
                        >
                          Start Assessment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assessments available yet</p>
                <p className="text-sm text-gray-400 mt-1">Check back later for new assessments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Recent Attempts */}
      {user && attempts && attempts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
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
                            {getAssessmentTitle(assessmentType || 'pre_lab')}
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
                          <div className="text-xs text-gray-400 mt-1">
                            Completed: {new Date(attempt.completed_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div>
                          <Badge className={`
                            ${attempt.percentage >= getPassingScore(assessmentType || 'pre_lab') 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'}
                          `}>
                            {attempt.percentage?.toFixed(1) || 0}%
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