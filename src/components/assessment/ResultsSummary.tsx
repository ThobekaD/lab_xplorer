import React from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Progress 
} from '@/components/ui/progress';
import { 
  Award, 
  Clock, 
  BarChart, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  DownloadCloud, 
  RotateCcw, 
  Home 
} from 'lucide-react';
import type { 
  Assessment, 
  AssessmentAttempt 
} from '@/types/assessment';

interface ResultsSummaryProps {
  results: AssessmentAttempt;
  assessment: Assessment;
  onRetake?: () => void;
  onExit?: () => void;
}

export function ResultsSummary({
  results,
  assessment,
  onRetake,
  onExit
}: ResultsSummaryProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-600';
    if (percentage >= 70) return 'bg-blue-600';
    if (percentage >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };
  
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  const countCorrectAnswers = () => {
    let correct = 0;
    
    assessment.questions.forEach(question => {
      const userAnswer = results.answers[question.id];
      
      if (!userAnswer) return;
      
      switch (question.question_type) {
        case 'multiple_choice':
          if (Array.isArray(question.correct_answer)) {
            if (Array.isArray(userAnswer) && 
                userAnswer.length === question.correct_answer.length &&
                userAnswer.every(a => question.correct_answer.includes(a))) {
              correct++;
            }
          } else if (userAnswer === question.correct_answer) {
            correct++;
          }
          break;
          
        case 'numerical':
          const numericAnswer = parseFloat(userAnswer as string);
          const correctAnswer = parseFloat(question.correct_answer as string);
          const tolerance = question.tolerance || 0.01;
          
          if (Math.abs(numericAnswer - correctAnswer) <= tolerance) {
            correct++;
          }
          break;
          
        case 'short_answer':
          const keywords = Array.isArray(question.correct_answer) 
            ? question.correct_answer 
            : [question.correct_answer];
            
          const userText = (userAnswer as string).toLowerCase();
          
          if (keywords.some(keyword => 
            userText.includes((keyword as string).toLowerCase())
          )) {
            correct++;
          }
          break;
      }
    });
    
    return correct;
  };
  
  const correctAnswers = countCorrectAnswers();
  const totalQuestions = assessment.questions.length;
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Score */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(results.percentage)}`}>
                    {results.percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Score</div>
                  <div className="text-lg font-semibold mt-1">
                    Grade: {getGrade(results.percentage)}
                  </div>
                </CardContent>
              </Card>
              
              {/* Correct Answers */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <div className="text-sm text-gray-500">Correct Answers</div>
                  <div className="text-lg font-semibold mt-1">
                    {((correctAnswers / totalQuestions) * 100).toFixed(0)}% Accuracy
                  </div>
                </CardContent>
              </Card>
              
              {/* Time Taken */}
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {formatTime(results.time_taken)}
                  </div>
                  <div className="text-sm text-gray-500">Time Taken</div>
                  <div className="text-lg font-semibold mt-1">
                    {results.hints_used} Hints Used
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>Score</span>
                <span>{results.score} / {results.max_score} points</span>
              </div>
              <Progress 
                value={results.percentage} 
                className={`h-3 ${getProgressColor(results.percentage)}`} 
              />
            </div>
            
            {/* Question Breakdown */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg">Question Breakdown</h3>
              
              <div className="space-y-2">
                {assessment.questions.map((question, index) => {
                  const userAnswer = results.answers[question.id];
                  let isCorrect = false;
                  
                  if (userAnswer) {
                    switch (question.question_type) {
                      case 'multiple_choice':
                        if (Array.isArray(question.correct_answer)) {
                          isCorrect = Array.isArray(userAnswer) && 
                                      userAnswer.length === question.correct_answer.length &&
                                      userAnswer.every(a => question.correct_answer.includes(a));
                        } else {
                          isCorrect = userAnswer === question.correct_answer;
                        }
                        break;
                        
                      case 'numerical':
                        const numericAnswer = parseFloat(userAnswer as string);
                        const correctAnswer = parseFloat(question.correct_answer as string);
                        const tolerance = question.tolerance || 0.01;
                        
                        isCorrect = Math.abs(numericAnswer - correctAnswer) <= tolerance;
                        break;
                        
                      case 'short_answer':
                        const keywords = Array.isArray(question.correct_answer) 
                          ? question.correct_answer 
                          : [question.correct_answer];
                          
                        const userText = (userAnswer as string).toLowerCase();
                        
                        isCorrect = keywords.some(keyword => 
                          userText.includes((keyword as string).toLowerCase())
                        );
                        break;
                    }
                  }
                  
                  return (
                    <div 
                      key={question.id} 
                      className={`p-3 rounded-lg border ${
                        isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-0.5">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            Question {index + 1}: {question.question_text.length > 50 
                              ? question.question_text.substring(0, 50) + '...' 
                              : question.question_text}
                          </p>
                          <div className="flex justify-between text-sm mt-1">
                            <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                            <span className="text-gray-500">
                              {question.points} points
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
              <Button variant="outline" onClick={onExit}>
                <Home className="h-4 w-4 mr-2" />
                Exit
              </Button>
              
              <div className="flex space-x-3">
                <Button variant="outline">
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Download Results
                </Button>
                
                {onRetake && (
                  <Button onClick={onRetake}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Assessment
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}