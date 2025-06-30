import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group';
import { 
  Checkbox 
} from '@/components/ui/checkbox';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Textarea 
} from '@/components/ui/textarea';
import { 
  Label 
} from '@/components/ui/label';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Lightbulb, 
  HelpCircle, 
  Info 
} from 'lucide-react';
import type { 
  AssessmentQuestion, 
  QuestionAnswer 
} from '@/types/assessment';

interface QuestionRendererProps {
  question: AssessmentQuestion;
  userAnswer: QuestionAnswer;
  onAnswerChange: (answer: QuestionAnswer) => void;
  showFeedback?: boolean;
  hintsUsed: number;
  onUseHint: () => void;
}

export function QuestionRenderer({
  question,
  userAnswer,
  onAnswerChange,
  showFeedback = false,
  hintsUsed,
  onUseHint
}: QuestionRendererProps) {
  const [showHint, setShowHint] = useState(false);
  
  const handleUseHint = () => {
    onUseHint();
    setShowHint(true);
  };
  
  const renderQuestionContent = () => {
    // Handle question text with potential HTML content
    return (
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">
          {question.question_text}
        </h3>
        
        {question.image_url && (
          <div className="my-4">
            <img 
              src={question.image_url} 
              alt="Question visual" 
              className="max-w-full rounded-lg"
            />
          </div>
        )}
        
        {question.context && (
          <div className="bg-gray-50 p-4 rounded-lg my-4 text-sm">
            <div className="flex items-start">
              <Info className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
              <div dangerouslySetInnerHTML={{ __html: question.context }} />
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderAnswerInput = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return renderMultipleChoiceInput();
      case 'numerical':
        return renderNumericalInput();
      case 'short_answer':
        return renderShortAnswerInput();
      default:
        return <p>Unsupported question type</p>;
    }
  };
  
  const renderMultipleChoiceInput = () => {
    const options = question.options || [];
    const isMultiSelect = Array.isArray(question.correct_answer);
    
    if (isMultiSelect) {
      return (
        <div className="space-y-3">
          {options.map((option, index) => (
            <div key={index} className="flex items-start space-x-2">
              <Checkbox
                id={`option-${index}`}
                checked={Array.isArray(userAnswer) && userAnswer.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onAnswerChange([...(Array.isArray(userAnswer) ? userAnswer : []), option]);
                  } else {
                    onAnswerChange(
                      Array.isArray(userAnswer) 
                        ? userAnswer.filter(item => item !== option)
                        : []
                    );
                  }
                }}
                disabled={showFeedback}
              />
              <Label 
                htmlFor={`option-${index}`}
                className="text-base cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
          <p className="text-sm text-gray-500 mt-2">
            Select all that apply
          </p>
        </div>
      );
    } else {
      return (
        <RadioGroup
          value={userAnswer as string}
          onValueChange={onAnswerChange}
          disabled={showFeedback}
        >
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`} 
                />
                <Label 
                  htmlFor={`option-${index}`}
                  className="text-base cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      );
    }
  };
  
  const renderNumericalInput = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Label htmlFor="numerical-answer" className="mb-2 block">
              Enter your answer:
            </Label>
            <Input
              id="numerical-answer"
              type="number"
              step="any"
              value={userAnswer as string || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Enter a number"
              disabled={showFeedback}
            />
          </div>
          
          {question.unit && (
            <div className="bg-gray-100 px-3 py-2 rounded-md h-10 flex items-center">
              {question.unit}
            </div>
          )}
        </div>
        
        {question.tolerance && (
          <p className="text-sm text-gray-500">
            Answer will be accepted within ±{question.tolerance} {question.unit || 'units'}
          </p>
        )}
      </div>
    );
  };
  
  const renderShortAnswerInput = () => {
    return (
      <div className="space-y-2">
        <Label htmlFor="short-answer" className="mb-2 block">
          Enter your answer:
        </Label>
        <Textarea
          id="short-answer"
          value={userAnswer as string || ''}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={4}
          disabled={showFeedback}
        />
        
        {question.word_limit && (
          <p className="text-sm text-gray-500">
            Word limit: {question.word_limit} words
          </p>
        )}
      </div>
    );
  };
  
  const renderHint = () => {
    if (!showHint || !question.hints || question.hints.length === 0) return null;
    
    const availableHints = question.hints;
    const currentHintIndex = Math.min(hintsUsed - 1, availableHints.length - 1);
    
    if (currentHintIndex < 0) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"
      >
        <div className="flex items-start">
          <Lightbulb className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Hint {hintsUsed}:</p>
            <p className="text-yellow-700">{availableHints[currentHintIndex]}</p>
          </div>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="space-y-4">
      {renderHint()}
      {renderQuestionContent()}
      {renderAnswerInput()}
      
      {!showFeedback && question.hints && question.hints.length > 0 && hintsUsed < question.hints.length && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseHint}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Use Hint ({question.hints.length - hintsUsed} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}