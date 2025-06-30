//src/components/assessment/AssessmentEngine.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight,
  ChevronLeft,
  Award,
  Lightbulb,
  X,
  RotateCcw
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import type { Assessment, AssessmentQuestion, AssessmentAttempt } from '@/types/assessment';

interface AssessmentEngineProps {
  assessment: Assessment;
  onComplete?: (results: any) => void;
  onExit?: () => void;
}

export function AssessmentEngine({ 
  assessment,
  onComplete,
  onExit
}: AssessmentEngineProps) {
  const { user } = useAuthStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [hintsUsed, setHintsUsed] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  
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
  
  const handleAnswerChange = (questionId: string, answer: any) => {
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
    setShowHint(prev => ({
      ...prev,
      [questionId]: true
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const calculateScore = useCallback(() => {
    if (!assessment?.questions) return { score: 0, maxScore: 0, percentage: 0 };
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    const questionResults: any[] = [];
    
    assessment.questions.forEach(question => {
      const userAnswer = userAnswers[question.id];
      const points = question.points || 1;
      maxPossibleScore += points;
      let earnedPoints = 0;
      let isCorrect = false;
      
      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        // For multiple choice
        if (question.question_type === 'multiple_choice') {
          if (Array.isArray(question.correct_answer)) {
            // Multiple correct answers
            if (Array.isArray(userAnswer)) {
              const correctCount = userAnswer.filter(ans => 
                question.correct_answer.includes(ans)
              ).length;
              const incorrectCount = userAnswer.length - correctCount;
              
              const partialScore = Math.max(0, correctCount - incorrectCount);
              const percentageCorrect = partialScore / question.correct_answer.length;
              earnedPoints = points * percentageCorrect;
              isCorrect = percentageCorrect === 1;
            }
          } else {
            // Single correct answer
            isCorrect = userAnswer === question.correct_answer;
            if (isCorrect) {
              earnedPoints = points;
            }
          }
        }
        // For numerical questions
        else if (question.question_type === 'numerical') {
          const numericAnswer = parseFloat(userAnswer);
          const correctAnswer = parseFloat(question.correct_answer as string);
          const tolerance = question.tolerance || 0.01;
          
          isCorrect = Math.abs(numericAnswer - correctAnswer) <= tolerance;
          if (isCorrect) {
            earnedPoints = points;
          }
        }
        // For short answer
        else if (question.question_type === 'short_answer') {
          const keywords = Array.isArray(question.correct_answer) 
            ? question.correct_answer 
            : [question.correct_answer];
            
          const userText = userAnswer.toLowerCase();
          const matchCount = keywords.filter(keyword => 
            userText.includes((keyword as string).toLowerCase())
          ).length;
          
          if (matchCount > 0) {
            const percentageCorrect = matchCount / keywords.length;
            earnedPoints = points * percentageCorrect;
            isCorrect = percentageCorrect >= 0.5; // 50% keyword match
          }
        }
      }
      
      totalScore += earnedPoints;
      questionResults.push({
        questionId: question.id,
        question: question.question_text,
        userAnswer,
        correctAnswer: question.correct_answer,
        isCorrect,
        earnedPoints,
        maxPoints: points,
        explanation: question.explanation
      });
    });
    
    return {
      score: totalScore,
      maxScore: maxPossibleScore,
      percentage: maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0,
      questionResults
    };
  }, [assessment, userAnswers]);
  
  const handleSubmitAssessment = async () => {
    if (!assessment || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const { score, maxScore, percentage, questionResults } = calculateScore();
      
      const attempt = {
        id: crypto.randomUUID(),
        assessment_id: assessment.id,
        user_id: user.id,
        answers: userAnswers,
        score,
        maxScore,
        percentage,
        completed_at: new Date(),
        timeElapsed: assessment.time_limit_minutes 
          ? (assessment.time_limit_minutes * 60) - (timeRemaining || 0)
          : null,
        hintsUsed: Object.values(hintsUsed).reduce((sum, count) => sum + count, 0),
        questionResults
      };
      
      setResults(attempt);
      setIsCompleted(true);
      setShowResults(true);
      
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
  
  const handleRetakeAssessment = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setHintsUsed({});
    setShowHint({});
    setIsCompleted(false);
    setShowResults(false);
    setResults(null);
    
    if (assessment?.time_limit_minutes) {
      setTimeRemaining(assessment.time_limit_minutes * 60);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const renderQuestion = (question: AssessmentQuestion) => {
    const userAnswer = userAnswers[question.id];
    
    return (
      <div className="space-y-6">
        {/* Question Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Question {currentQuestionIndex + 1}
            </h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{question.difficulty}/5</Badge>
              <Badge variant="outline">{question.points} pts</Badge>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{question.question_text}</p>
          </div>
          
          {question.context && (
            <Alert>
              <AlertDescription>{question.context}</AlertDescription>
            </Alert>
          )}
          
          {question.image_url && (
            <div className="mt-4">
              <img 
                src={question.image_url} 
                alt="Question illustration" 
                className="max-w-full h-auto rounded-lg border"
              />
            </div>
          )}
        </div>
        
        {/* Answer Input */}
        <div className="space-y-4">
          {question.question_type === 'multiple_choice' && (
            <RadioGroup
              value={userAnswer || ''}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                    <Label 
                      htmlFor={`${question.id}-${index}`}
                      className="flex-1 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
          
          {question.question_type === 'numerical' && (
            <div className="space-y-2">
              <Label htmlFor={`input-${question.id}`}>Your Answer:</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={`input-${question.id}`}
                  type="number"
                  step="any"
                  placeholder="Enter your numerical answer"
                  value={userAnswer || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="flex-1"
                />
                {question.unit && (
                  <span className="text-gray-500 font-medium">{question.unit}</span>
                )}
              </div>
              {question.tolerance && (
                <p className="text-xs text-gray-500">
                  Tolerance: ±{question.tolerance}
                </p>
              )}
            </div>
          )}
          
          {question.question_type === 'short_answer' && (
            <div className="space-y-2">
              <Label htmlFor={`textarea-${question.id}`}>Your Answer:</Label>
              <Textarea
                id={`textarea-${question.id}`}
                placeholder="Enter your answer here..."
                value={userAnswer || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>
        
        {/* Hints */}
        {question.hints && question.hints.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUseHint(question.id)}
              disabled={showHint[question.id]}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {showHint[question.id] ? 'Hint Used' : 'Get Hint'}
            </Button>
            
            {showHint[question.id] && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Hint:</strong> {question.hints[0]}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderResults = () => {
    if (!results) return null;
    
    const { percentage, score, maxScore, questionResults } = results;
    const passed = percentage >= (assessment.passing_score || 70);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <X className="h-8 w-8 text-red-600" />
              )}
            </div>
            <CardTitle className={`text-2xl ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? 'Congratulations!' : 'Assessment Complete'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {passed 
                ? 'You have successfully completed the assessment!'
                : `You need ${assessment.passing_score || 70}% to pass. Keep studying and try again!`
              }
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">{percentage.toFixed(1)}%</div>
                <div className="text-sm text-gray-500">Final Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{score.toFixed(1)}</div>
                <div className="text-sm text-gray-500">Points Earned</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{maxScore}</div>
                <div className="text-sm text-gray-500">Total Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Question by Question Results */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionResults.map((result: any, index: number) => (
                <div key={result.questionId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <div className="flex items-center space-x-2">
                      {result.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm">
                        {result.earnedPoints.toFixed(1)}/{result.maxPoints} pts
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-2">{result.question}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Your Answer:</span>
                      <div className="text-gray-600">
                        {result.userAnswer || 'No answer provided'}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Correct Answer:</span>
                      <div className="text-gray-600">
                        {Array.isArray(result.correctAnswer) 
                          ? result.correctAnswer.join(', ') 
                          : result.correctAnswer}
                      </div>
                    </div>
                  </div>
                  
                  {result.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-800">Explanation:</span>
                      <p className="text-blue-700 mt-1">{result.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {!passed && (
            <Button onClick={handleRetakeAssessment} className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Assessment
            </Button>
          )}
          <Button variant="outline" onClick={onExit}>
            Exit Assessment
          </Button>
        </div>
      </div>
    );
  };
  
  if (!assessment) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Assessment Not Found</h3>
        <p className="text-gray-600 mb-4">The requested assessment could not be loaded.</p>
        <Button onClick={onExit}>Go Back</Button>
      </div>
    );
  }
  
  if (showResults) {
    return renderResults();
  }
  
  const currentQuestion = assessment.questions[currentQuestionIndex];
  const hasAnswer = userAnswers[currentQuestion?.id] !== undefined && 
                   userAnswers[currentQuestion?.id] !== null && 
                   userAnswers[currentQuestion?.id] !== '';
  const isLastQuestion = currentQuestionIndex === assessment.questions.length - 1;
  
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
                <Badge variant="outline">{assessment.assessment_type.replace('_', ' ')}</Badge>
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
            {renderQuestion(currentQuestion)}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0 || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex space-x-2">
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