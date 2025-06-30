import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info 
} from 'lucide-react';
import { 
  Alert, 
  AlertDescription 
} from '@/components/ui/alert';
import type { 
  AssessmentQuestion, 
  QuestionAnswer 
} from '@/types/assessment';

interface FeedbackSystemProps {
  question: AssessmentQuestion;
  userAnswer: QuestionAnswer;
  hintsUsed: number;
}

export function FeedbackSystem({
  question,
  userAnswer,
  hintsUsed
}: FeedbackSystemProps) {
  const isCorrect = checkAnswer(question, userAnswer);
  
  function checkAnswer(question: AssessmentQuestion, answer: QuestionAnswer): boolean {
    if (!answer) return false;
    
    switch (question.question_type) {
      case 'multiple_choice':
        if (Array.isArray(question.correct_answer)) {
          // Multiple correct answers
          if (!Array.isArray(answer)) return false;
          
          // Check if arrays have the same elements
          return (
            answer.length === question.correct_answer.length &&
            answer.every(a => question.correct_answer.includes(a))
          );
        } else {
          // Single correct answer
          return answer === question.correct_answer;
        }
        
      case 'numerical':
        const numericAnswer = parseFloat(answer as string);
        const correctAnswer = parseFloat(question.correct_answer as string);
        const tolerance = question.tolerance || 0.01;
        
        return Math.abs(numericAnswer - correctAnswer) <= tolerance;
        
      case 'short_answer':
        const keywords = Array.isArray(question.correct_answer) 
          ? question.correct_answer 
          : [question.correct_answer];
          
        const userText = (answer as string).toLowerCase();
        
        return keywords.some(keyword => 
          userText.includes((keyword as string).toLowerCase())
        );
        
      default:
        return false;
    }
  }
  
  const renderCorrectAnswer = () => {
    if (isCorrect) return null;
    
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="mt-2">
            <p className="font-medium">Correct answer:</p>
            {Array.isArray(question.correct_answer) ? (
              <ul className="list-disc pl-5 mt-1">
                {question.correct_answer.map((answer, index) => (
                  <li key={index}>{answer}</li>
                ))}
              </ul>
            ) : (
              <p>{question.correct_answer}</p>
            )}
          </div>
        );
        
      case 'numerical':
        return (
          <div className="mt-2">
            <p className="font-medium">Correct answer:</p>
            <p>
              {question.correct_answer}
              {question.unit ? ` ${question.unit}` : ''}
              {question.tolerance ? ` (±${question.tolerance})` : ''}
            </p>
          </div>
        );
        
      case 'short_answer':
        return (
          <div className="mt-2">
            <p className="font-medium">Expected keywords:</p>
            {Array.isArray(question.correct_answer) ? (
              <ul className="list-disc pl-5 mt-1">
                {question.correct_answer.map((keyword, index) => (
                  <li key={index}>{keyword}</li>
                ))}
              </ul>
            ) : (
              <p>{question.correct_answer}</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert className={`
        ${isCorrect 
          ? 'border-green-200 bg-green-50' 
          : 'border-red-200 bg-red-50'}
      `}>
        <div className="flex items-start">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
          )}
          
          <div className="flex-1">
            <AlertDescription className={`
              ${isCorrect ? 'text-green-800' : 'text-red-800'}
              font-medium text-base
            `}>
              {isCorrect 
                ? 'Correct!' 
                : 'Not quite right.'}
            </AlertDescription>
            
            {question.explanation && (
              <div className="mt-2 text-gray-700">
                <p className="font-medium">Explanation:</p>
                <div dangerouslySetInnerHTML={{ __html: question.explanation }} />
              </div>
            )}
            
            {renderCorrectAnswer()}
            
            {hintsUsed > 0 && (
              <div className="mt-4 text-sm text-gray-600 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                <span>You used {hintsUsed} hint{hintsUsed > 1 ? 's' : ''} for this question.</span>
              </div>
            )}
          </div>
        </div>
      </Alert>
    </motion.div>
  );
}