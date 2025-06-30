import { useState, useEffect } from 'react';
import type { 
  AssessmentQuestion, 
  QuestionAnswer, 
  QuestionDifficulty 
} from '@/types/assessment';

interface AdaptiveEngineProps {
  questions: AssessmentQuestion[];
  onQuestionsSelected: (questions: AssessmentQuestion[]) => void;
  userAbility?: number;
  maxQuestions?: number;
}

export function AdaptiveEngine({
  questions,
  onQuestionsSelected,
  userAbility = 0.5, // Default to medium ability (0-1 scale)
  maxQuestions = 10
}: AdaptiveEngineProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentAbility, setCurrentAbility] = useState(userAbility);
  const [questionResponses, setQuestionResponses] = useState<Record<string, boolean>>({});
  
  // Initialize with appropriate questions based on user ability
  useEffect(() => {
    selectInitialQuestions();
  }, []);
  
  // When ability estimate changes, update question selection
  useEffect(() => {
    if (Object.keys(questionResponses).length > 0) {
      adaptQuestionSelection();
    }
  }, [questionResponses]);
  
  const selectInitialQuestions = () => {
    // Sort questions by difficulty
    const sortedQuestions = [...questions].sort((a, b) => 
      (a.difficulty || 1) - (b.difficulty || 1)
    );
    
    // Select questions around the initial ability estimate
    const targetDifficulty = Math.round(currentAbility * 5);
    
    // Filter questions close to target difficulty
    const appropriateQuestions = sortedQuestions.filter(q => 
      Math.abs((q.difficulty || 1) - targetDifficulty) <= 1
    );
    
    // If not enough questions, add more from the full pool
    let selected = appropriateQuestions.slice(0, maxQuestions);
    
    if (selected.length < maxQuestions) {
      const remaining = sortedQuestions.filter(q => !selected.includes(q));
      selected = [...selected, ...remaining.slice(0, maxQuestions - selected.length)];
    }
    
    setSelectedQuestions(selected);
    onQuestionsSelected(selected);
  };
  
  const adaptQuestionSelection = () => {
    // Calculate new ability estimate based on responses
    const responses = Object.entries(questionResponses);
    if (responses.length === 0) return;
    
    // Simple ability estimation based on correct answers and question difficulty
    let totalDifficulty = 0;
    let weightedScore = 0;
    
    responses.forEach(([questionId, isCorrect]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;
      
      const difficulty = question.difficulty || 1;
      totalDifficulty += difficulty;
      
      if (isCorrect) {
        weightedScore += difficulty;
      }
    });
    
    const newAbility = totalDifficulty > 0 
      ? weightedScore / totalDifficulty 
      : currentAbility;
    
    setCurrentAbility(newAbility);
    
    // Select new questions based on updated ability
    const remainingQuestions = questions.filter(q => 
      !selectedQuestions.some(sq => sq.id === q.id)
    );
    
    if (remainingQuestions.length === 0) return;
    
    // Target questions slightly above current ability to challenge the user
    const targetDifficulty = Math.min(5, Math.round(newAbility * 5) + 1);
    
    // Sort remaining questions by how close they are to the target difficulty
    const sortedByRelevance = [...remainingQuestions].sort((a, b) => {
      const aDiff = Math.abs((a.difficulty || 1) - targetDifficulty);
      const bDiff = Math.abs((b.difficulty || 1) - targetDifficulty);
      return aDiff - bDiff;
    });
    
    // Replace some questions in the selection with more appropriate ones
    const numToReplace = Math.min(2, selectedQuestions.length);
    if (numToReplace > 0 && sortedByRelevance.length > 0) {
      const newSelection = [...selectedQuestions];
      
      // Replace the last questions (not yet answered)
      for (let i = 0; i < numToReplace; i++) {
        const replaceIndex = selectedQuestions.length - 1 - i;
        if (replaceIndex >= 0 && !questionResponses[selectedQuestions[replaceIndex].id]) {
          newSelection[replaceIndex] = sortedByRelevance[i] || selectedQuestions[replaceIndex];
        }
      }
      
      setSelectedQuestions(newSelection);
      onQuestionsSelected(newSelection);
    }
  };
  
  // Public method to record a response to a question
  const recordResponse = (questionId: string, isCorrect: boolean) => {
    setQuestionResponses(prev => ({
      ...prev,
      [questionId]: isCorrect
    }));
  };
  
  // Calculate the next best question to ask
  const getNextBestQuestion = (answeredQuestionIds: string[]): AssessmentQuestion | null => {
    const unansweredQuestions = questions.filter(q => 
      !answeredQuestionIds.includes(q.id)
    );
    
    if (unansweredQuestions.length === 0) return null;
    
    // Target questions slightly above current ability
    const targetDifficulty = Math.min(5, Math.round(currentAbility * 5) + 1);
    
    // Sort by relevance to current ability estimate
    return unansweredQuestions.sort((a, b) => {
      const aDiff = Math.abs((a.difficulty || 1) - targetDifficulty);
      const bDiff = Math.abs((b.difficulty || 1) - targetDifficulty);
      return aDiff - bDiff;
    })[0];
  };
  
  // Estimate user's knowledge level (0-1)
  const estimateKnowledgeLevel = (): number => {
    return currentAbility;
  };
  
  // Identify knowledge gaps based on incorrect answers
  const identifyKnowledgeGaps = (): string[] => {
    const gaps: string[] = [];
    
    Object.entries(questionResponses).forEach(([questionId, isCorrect]) => {
      if (!isCorrect) {
        const question = questions.find(q => q.id === questionId);
        if (question?.topic) {
          gaps.push(question.topic);
        }
      }
    });
    
    // Return unique topics
    return [...new Set(gaps)];
  };
  
  return {
    selectedQuestions,
    currentAbility,
    recordResponse,
    getNextBestQuestion,
    estimateKnowledgeLevel,
    identifyKnowledgeGaps
  };
}