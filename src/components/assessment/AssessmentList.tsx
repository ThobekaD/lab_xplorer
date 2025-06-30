//src/components/assessment/AssessmentList.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Brain, 
  Award, 
  ChevronRight, 
  CheckCircle, 
  AlertTriangle,
  Star,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAssessments, useAssessmentAttempts } from '@/hooks/useAssessment';

interface Assessment {
  id: string;
  title: string;
  description: string;
  experiment_id?: string;
  assessment_type: 'pre_lab' | 'post_lab' | 'checkpoint';
  questions: any[];
  time_limit_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  difficulty: number;
  is_active: boolean;
  created_at: string;
}

interface AssessmentListProps {
  experimentId?: string;
  assessmentType: 'pre_lab' | 'post_lab' | 'checkpoint';
  onSelectAssessment: (assessment: Assessment) => void;
}

export function AssessmentList({ 
  experimentId, 
  assessmentType, 
  onSelectAssessment 
}: AssessmentListProps) {
  const { data: assessments, isLoading, error } = useAssessments(experimentId, assessmentType);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'bg-green-100 text-green-800';
    if (difficulty <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pre_lab': return <Brain className="h-5 w-5" />;
      case 'post_lab': return <Award className="h-5 w-5" />;
      case 'checkpoint': return <CheckCircle className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pre_lab': return 'text-blue-600';
      case 'post_lab': return 'text-green-600';
      case 'checkpoint': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading assessments
            </h3>
            <p className="text-gray-600 text-sm">
              {error.message || 'Failed to load assessments. Please try again.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessments || assessments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No assessments available
            </h3>
            <p className="text-gray-600">
              {assessmentType === 'pre_lab' && 'Pre-lab assessments will be available when the experiment is ready.'}
              {assessmentType === 'post_lab' && 'Post-lab assessments will be unlocked after completing the experiment.'}
              {assessmentType === 'checkpoint' && 'Checkpoint assessments will appear during the experiment.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment, index) => (
        <motion.div
          key={assessment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`${getTypeColor(assessment.assessment_type)}`}>
                    {getTypeIcon(assessment.assessment_type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{assessment.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getDifficultyColor(assessment.difficulty)}>
                        {getDifficultyLabel(assessment.difficulty)}
                      </Badge>
                      {assessment.time_limit_minutes && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {assessment.time_limit_minutes} min
                        </div>
                      )}
                      {assessment.max_attempts && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {assessment.max_attempts} attempts
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <Brain className="h-4 w-4 mr-1" />
                        {assessment.questions.length} questions
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => onSelectAssessment(assessment)}
                  className="ml-4"
                >
                  Start Assessment
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-gray-600 mb-4">{assessment.description}</p>
              
              <div className="space-y-3">
                {/* Requirements */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Passing Score:</span>
                  <span className="font-medium">{assessment.passing_score}%</span>
                </div>
                
                {/* Progress placeholder */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Your Progress:</span>
                    <span className="text-gray-500">Not started</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>

                {/* Show question breakdown */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Topics covered:</strong> 
                    {assessment.questions.slice(0, 3).map((q, i) => 
                      q.topic ? ` ${q.topic}` : ''
                    ).filter(Boolean).join(', ') || ' Various topics'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Difficulty range: {Math.min(...assessment.questions.map(q => q.difficulty || 1))} - {Math.max(...assessment.questions.map(q => q.difficulty || 1))}
                  </div>
                </div>

                {/* Mock previous attempts */}
                {index === 0 && assessmentType === 'pre_lab' && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Previous attempt: 85% (Passed)
                      </span>
                    </div>
                  </div>
                )}

                {index === 1 && assessmentType === 'pre_lab' && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Previous attempt: 65% (Need 80% to pass)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Assessment Type Info */}
      <Card className="bg-gray-50">
        <CardContent className="py-4">
          <div className="flex items-start space-x-3">
            <div className={getTypeColor(assessmentType)}>
              {getTypeIcon(assessmentType)}
            </div>
            <div>
              <h4 className="font-medium mb-2">
                {assessmentType === 'pre_lab' && 'Pre-Lab Assessments'}
                {assessmentType === 'post_lab' && 'Post-Lab Assessments'}
                {assessmentType === 'checkpoint' && 'Checkpoint Assessments'}
              </h4>
              <p className="text-sm text-gray-600">
                {assessmentType === 'pre_lab' && 
                  'Complete these assessments before starting the experiment to ensure you have the necessary background knowledge and understand safety procedures.'
                }
                {assessmentType === 'post_lab' && 
                  'These assessments test your understanding of the experimental concepts, results, and their applications. Complete them after finishing the experiment.'
                }
                {assessmentType === 'checkpoint' && 
                  'These quick assessments appear during the experiment to check your understanding and provide feedback on your progress.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}