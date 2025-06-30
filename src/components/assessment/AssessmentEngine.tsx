import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight,
  RotateCcw,
  Save,
  Award
} from 'lucide-react';
import { QuestionRenderer } from './QuestionRenderer';
import { FeedbackSystem } from './FeedbackSystem';
import { ResultsSummary } from './ResultsSummary';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAssessment } from '@/hooks/useAssessment';
import { toast } from 'sonner';
import type { 
  Assessment, 
  AssessmentQuestion, 
  AssessmentAttempt, 
  QuestionAnswer 
} from '@/types/assessment';

interface AssessmentEngineProps {
  assessmentId: string;
  experimentId?: string;
  sessionId?: string;
  assessmentType: 'pre_lab' | 'post_lab' | 'checkpoint';
  onComplete?: (results: AssessmentAttempt) => void;
  onExit?: () => void;
}

export function AssessmentEngine({ 
  assessmentId, 
  experimentId,
  sessionId,
  assessmentType,
  onComplete,
  onExit
}: AssessmentEngineProps) {
  const { user } = useAuthStore();
  const { data: assessment, isLoading, error } = useAssessment(assessmentId);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, QuestionAnswer>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<AssessmentAttempt | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<Record<string, number>>({});
  
  // Initialize timer based on assessment settings
  useEffect(() => {
    if (assessment?.time_limit_minutes) {
      setTimeRemaining(assessment.time_limit_minutes * 60);
    }
  }, [assessment]);
  
  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isCompleted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, isCompleted]);
  
  const handleTimeUp = () => {
    toast.warning("Time's up!", {
      description: "Your assessment will be submitted automatically.",
    });
    handleSubmitAssessment();
  };
  
  const handleAnswerChange = (questionId: string, answer: QuestionAnswer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleUseHint = (questionId: string) => {
    setHintsUsed(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || 0) + 1
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < (assessment?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowFeedback(false);
    } else {
      // On last question, show submit confirmation
      handleSubmitAssessment();
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowFeedback(false);
    }
  };
  
  const calculateScore = useCallback(() => {
    if (!assessment?.questions) return { score: 0, maxScore: 0, percentage: 0 };
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    assessment.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      const points = question.points || 1;
      maxPossibleScore += points;
      
      if (userAnswer) {
        // For multiple choice
        if (question.question_type === 'multiple_choice') {
          if (Array.isArray(question.correct_answer)) {
            // Multiple correct answers
            if (Array.isArray(userAnswer)) {
              const correctCount = userAnswer.filter(ans => 
                question.correct_answer.includes(ans)
              ).length;
              const incorrectCount = userAnswer.length - correctCount;
              
              // Partial credit formula: correct answers - incorrect answers
              const partialScore = Math.max(0, correctCount - incorrectCount);
              const percentageCorrect = partialScore / question.correct_answer.length;
              totalScore += points * percentageCorrect;
            }
          } else {
            // Single correct answer
            if (userAnswer === question.correct_answer) {
              totalScore += points;
            }
          }
        }
        // For numerical questions
        else if (question.question_type === 'numerical') {
          const numericAnswer = parseFloat(userAnswer as string);
          const correctAnswer = parseFloat(question.correct_answer as string);
          const tolerance = question.tolerance || 0.01;
          
          if (Math.abs(numericAnswer - correctAnswer) <= tolerance) {
            totalScore += points;
          }
        }
        // For short answer
        else if (question.question_type === 'short_answer') {
          const keywords = Array.isArray(question.correct_answer) 
            ? question.correct_answer 
            : [question.correct_answer];
            
          const userText = (userAnswer as string).toLowerCase();
          const matchCount = keywords.filter(keyword => 
            userText.includes((keyword as string).toLowerCase())
          ).length;
          
          if (matchCount > 0) {
            const percentageCorrect = matchCount / keywords.length;
            totalScore += points * percentageCorrect;
          }
        }
      }
    });
    
    return {
      score: totalScore,
      maxScore: maxPossibleScore,
      percentage: (totalScore / maxPossibleScore) * 100
    };
  }, [assessment, userAnswers]);
  
  const handleSubmitAssessment = async () => {
    if (!assessment || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { score, maxScore, percentage } = calculateScore();
      
      // Create assessment attempt record
      const attempt: AssessmentAttempt = {
        id: crypto.randomUUID(),
        assessment_id: assessment.id,
        user_id: user.id,
        session_id: sessionId,
        answers: userAnswers,
        score,
        max_score: maxScore,
        percentage,
        completed_at: new Date(),
        time_taken: assessment.time_limit_minutes 
          ? (assessment.time_limit_minutes * 60) - (timeRemaining || 0)
          : null,
        hints_used: Object.values(hintsUsed).reduce((sum, count) => sum + count, 0),
      };
      
      // In a real implementation, save to database
      // await saveAssessmentAttempt(attempt);
      
      setResults(attempt);
      setIsCompleted(true);
      
      // Notify parent component
      onComplete?.(attempt);
      
      toast.success("Assessment completed!", {
        description: `You scored ${percentage.toFixed(1)}%`,
      });
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      toast.error("Failed to submit assessment", {
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCheckAnswer = () => {
    setShowFeedback(true);
  };
  
  const handleRetakeAssessment = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setHintsUsed({});
    setIsCompleted(false);
    setResults(null);
    setShowFeedback(false);
    
    if (assessment?.time_limit_minutes) {
      setTimeRemaining(assessment.time_limit_minutes * 60);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }
  
  if (error || !assessment) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Not Found</h3>
        <p className="text-gray-600 mb-4">The requested assessment could not be loaded.</p>
        <Button onClick={onExit}>
          Go Back
        </Button>
      </div>
    );
  }
  
  if (isCompleted && results) {
    return (
      <ResultsSummary 
        results={results}
        assessment={assessment}
        onRetake={handleRetakeAssessment}
        onExit={onExit}
      />
    );
  }
  
  const currentQuestion = assessment.questions[currentQuestionIndex];
  const hasAnswer = !!userAnswers[currentQuestion?.id];
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{assessment.title}</CardTitle>
              <p className="text-gray-600 mt-1">{assessment.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline">{assessmentType.replace('_', ' ')}</Badge>
                <Badge variant="outline">Difficulty {assessment.difficulty}</Badge>
                {timeRemaining !== null && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTime(timeRemaining)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} / {assessment.questions.length} questions</span>
            </div>
            <Progress 
              value={((currentQuestionIndex + 1) / assessment.questions.length) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="min-h-[400px]">
          <CardContent className="p-6">
            <QuestionRenderer
              question={currentQuestion}
              userAnswer={userAnswers[currentQuestion.id]}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
              showFeedback={showFeedback}
              hintsUsed={hintsUsed[currentQuestion.id] || 0}
              onUseHint={() => handleUseHint(currentQuestion.id)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FeedbackSystem
              question={currentQuestion}
              userAnswer={userAnswers[currentQuestion.id]}
              hintsUsed={hintsUsed[currentQuestion.id] || 0}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          Previous
        </Button>
        
        <div className="flex space-x-2">
          {!showFeedback && hasAnswer && (
            <Button
              onClick={handleCheckAnswer}
              disabled={isSubmitting}
              variant="outline"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Check Answer
            </Button>
          )}
          
          {isLastQuestion ? (
            <Button
              onClick={handleSubmitAssessment}
              disabled={!hasAnswer || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Submit Assessment
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={!hasAnswer || isSubmitting}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}