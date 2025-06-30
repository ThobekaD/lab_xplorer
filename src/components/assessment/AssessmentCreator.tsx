import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Button 
} from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Save, 
  CheckSquare, 
  Clock, 
  Settings, 
  FileText,
  MoveUp,
  MoveDown,
  Copy
} from 'lucide-react';
import type { 
  Assessment, 
  AssessmentQuestion 
} from '@/types/assessment';

interface AssessmentCreatorProps {
  experimentId?: string;
  onSave: (assessment: Assessment) => void;
  initialAssessment?: Assessment;
  className?: string;
}

export function AssessmentCreator({
  experimentId,
  onSave,
  initialAssessment,
  className = ''
}: AssessmentCreatorProps) {
  const [assessment, setAssessment] = useState<Assessment>(initialAssessment || {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    experiment_id: experimentId,
    assessment_type: 'pre_lab',
    questions: [],
    time_limit_minutes: 30,
    max_attempts: 3,
    passing_score: 70,
    difficulty: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  });
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  
  const handleAssessmentChange = (field: keyof Assessment, value: any) => {
    setAssessment(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const addNewQuestion = () => {
    const newQuestion: AssessmentQuestion = {
      id: crypto.randomUUID(),
      question_text: '',
      question_type: 'multiple_choice',
      options: [],
      correct_answer: '',
      explanation: '',
      points: 1,
      difficulty: assessment.difficulty,
    };
    
    setAssessment(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    
    setCurrentQuestionIndex(assessment.questions.length);
    setShowQuestionEditor(true);
  };
  
  const editQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowQuestionEditor(true);
  };
  
  const deleteQuestion = (index: number) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    
    if (currentQuestionIndex === index) {
      setCurrentQuestionIndex(null);
      setShowQuestionEditor(false);
    } else if (currentQuestionIndex !== null && currentQuestionIndex > index) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = assessment.questions[index];
    const duplicatedQuestion = {
      ...questionToDuplicate,
      id: crypto.randomUUID(),
    };
    
    setAssessment(prev => ({
      ...prev,
      questions: [
        ...prev.questions.slice(0, index + 1),
        duplicatedQuestion,
        ...prev.questions.slice(index + 1)
      ]
    }));
  };
  
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === assessment.questions.length - 1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newQuestions = [...assessment.questions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    
    setAssessment(prev => ({
      ...prev,
      questions: newQuestions
    }));
    
    if (currentQuestionIndex === index) {
      setCurrentQuestionIndex(newIndex);
    } else if (currentQuestionIndex === newIndex) {
      setCurrentQuestionIndex(index);
    }
  };
  
  const updateQuestion = (updatedQuestion: AssessmentQuestion) => {
    if (currentQuestionIndex === null) return;
    
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === currentQuestionIndex ? updatedQuestion : q
      )
    }));
  };
  
  const handleSave = () => {
    onSave(assessment);
  };
  
  const currentQuestion = currentQuestionIndex !== null 
    ? assessment.questions[currentQuestionIndex] 
    : null;
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Assessment Creator</CardTitle>
          <CardDescription>
            Create or edit an assessment for your experiment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">
                <FileText className="h-4 w-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="questions">
                <CheckSquare className="h-4 w-4 mr-2" />
                Questions ({assessment.questions.length})
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title</Label>
                <Input
                  id="title"
                  value={assessment.title}
                  onChange={(e) => handleAssessmentChange('title', e.target.value)}
                  placeholder="Enter assessment title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assessment.description}
                  onChange={(e) => handleAssessmentChange('description', e.target.value)}
                  placeholder="Enter assessment description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assessment-type">Assessment Type</Label>
                  <Select
                    value={assessment.assessment_type}
                    onValueChange={(value) => handleAssessmentChange('assessment_type', value)}
                  >
                    <SelectTrigger id="assessment-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pre_lab">Pre-Lab</SelectItem>
                      <SelectItem value="post_lab">Post-Lab</SelectItem>
                      <SelectItem value="checkpoint">Checkpoint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={assessment.difficulty.toString()}
                    onValueChange={(value) => handleAssessmentChange('difficulty', parseInt(value))}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Easy</SelectItem>
                      <SelectItem value="2">2 - Basic</SelectItem>
                      <SelectItem value="3">3 - Intermediate</SelectItem>
                      <SelectItem value="4">4 - Advanced</SelectItem>
                      <SelectItem value="5">5 - Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="questions" className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Questions</h3>
                <Button onClick={addNewQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
              
              {assessment.questions.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No questions added yet</p>
                  <Button onClick={addNewQuestion} variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {assessment.questions.map((question, index) => (
                    <Card key={question.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold">Question {index + 1}</span>
                              <span className="text-xs text-gray-500 capitalize">
                                {question.question_type.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-gray-800 line-clamp-2">
                              {question.question_text || 'No question text'}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => moveQuestion(index, 'up')}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                            >
                              <MoveUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => moveQuestion(index, 'down')}
                              disabled={index === assessment.questions.length - 1}
                              className="h-8 w-8 p-0"
                            >
                              <MoveDown className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => duplicateQuestion(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => editQuestion(index)}
                              className="h-8 w-8 p-0"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteQuestion(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Question Editor Dialog */}
              <Dialog open={showQuestionEditor} onOpenChange={setShowQuestionEditor}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>
                      {currentQuestionIndex !== null && currentQuestion 
                        ? `Edit Question ${currentQuestionIndex + 1}` 
                        : 'Add New Question'}
                    </DialogTitle>
                    <DialogDescription>
                      Create or modify your assessment question
                    </DialogDescription>
                  </DialogHeader>
                  
                  {currentQuestion && (
                    <QuestionEditor
                      question={currentQuestion}
                      onSave={(updatedQuestion) => {
                        updateQuestion(updatedQuestion);
                        setShowQuestionEditor(false);
                      }}
                      onCancel={() => setShowQuestionEditor(false)}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                  <Input
                    id="time-limit"
                    type="number"
                    min="1"
                    value={assessment.time_limit_minutes || ''}
                    onChange={(e) => handleAssessmentChange('time_limit_minutes', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Maximum Attempts</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    min="1"
                    value={assessment.max_attempts || ''}
                    onChange={(e) => handleAssessmentChange('max_attempts', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="passing-score">Passing Score (%)</Label>
                  <Input
                    id="passing-score"
                    type="number"
                    min="0"
                    max="100"
                    value={assessment.passing_score || ''}
                    onChange={(e) => handleAssessmentChange('passing_score', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="is-active">Status</Label>
                  <Select
                    value={assessment.is_active ? 'active' : 'inactive'}
                    onValueChange={(value) => handleAssessmentChange('is_active', value === 'active')}
                  >
                    <SelectTrigger id="is-active">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6 pt-4 border-t">
            <Button onClick={handleSave} disabled={assessment.questions.length === 0}>
              <Save className="h-4 w-4 mr-2" />
              Save Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuestionEditorProps {
  question: AssessmentQuestion;
  onSave: (question: AssessmentQuestion) => void;
  onCancel: () => void;
}

function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  const [editedQuestion, setEditedQuestion] = useState<AssessmentQuestion>({...question});
  const [newOption, setNewOption] = useState('');
  
  const handleQuestionChange = (field: keyof AssessmentQuestion, value: any) => {
    setEditedQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const addOption = () => {
    if (!newOption.trim()) return;
    
    setEditedQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }));
    
    setNewOption('');
  };
  
  const removeOption = (index: number) => {
    setEditedQuestion(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleSave = () => {
    onSave(editedQuestion);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question-text">Question Text</Label>
        <Textarea
          id="question-text"
          value={editedQuestion.question_text}
          onChange={(e) => handleQuestionChange('question_text', e.target.value)}
          placeholder="Enter your question"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="question-type">Question Type</Label>
          <Select
            value={editedQuestion.question_type}
            onValueChange={(value) => handleQuestionChange('question_type', value)}
          >
            <SelectTrigger id="question-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="numerical">Numerical</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            min="1"
            value={editedQuestion.points || 1}
            onChange={(e) => handleQuestionChange('points', parseInt(e.target.value))}
          />
        </div>
      </div>
      
      {/* Multiple Choice Options */}
      {editedQuestion.question_type === 'multiple_choice' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Answer Options</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="New option"
                className="w-64"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addOption}
                disabled={!newOption.trim()}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
          
          {(editedQuestion.options || []).length === 0 ? (
            <div className="text-center py-4 border rounded-lg">
              <p className="text-gray-600">No options added yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(editedQuestion.options || []).map((option, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name="correct-answer"
                      checked={editedQuestion.correct_answer === option}
                      onChange={() => handleQuestionChange('correct_answer', option)}
                    />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Numerical Answer */}
      {editedQuestion.question_type === 'numerical' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="correct-numerical">Correct Answer</Label>
              <Input
                id="correct-numerical"
                type="number"
                step="any"
                value={editedQuestion.correct_answer as string || ''}
                onChange={(e) => handleQuestionChange('correct_answer', e.target.value)}
                placeholder="Enter correct numerical value"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tolerance">Tolerance (±)</Label>
              <Input
                id="tolerance"
                type="number"
                step="0.01"
                min="0"
                value={editedQuestion.tolerance || 0.01}
                onChange={(e) => handleQuestionChange('tolerance', parseFloat(e.target.value))}
                placeholder="Acceptable margin of error"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Unit (optional)</Label>
            <Input
              id="unit"
              value={editedQuestion.unit || ''}
              onChange={(e) => handleQuestionChange('unit', e.target.value)}
              placeholder="e.g., kg, m/s, °C"
            />
          </div>
        </div>
      )}
      
      {/* Short Answer */}
      {editedQuestion.question_type === 'short_answer' && (
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords (comma-separated)</Label>
          <Textarea
            id="keywords"
            value={Array.isArray(editedQuestion.correct_answer) 
              ? editedQuestion.correct_answer.join(', ')
              : editedQuestion.correct_answer || ''}
            onChange={(e) => {
              const keywords = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
              handleQuestionChange('correct_answer', keywords);
            }}
            placeholder="Enter keywords that should be in the answer"
            rows={2}
          />
          <p className="text-xs text-gray-500">
            Enter keywords that should appear in a correct answer, separated by commas
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (shown after answering)</Label>
        <Textarea
          id="explanation"
          value={editedQuestion.explanation || ''}
          onChange={(e) => handleQuestionChange('explanation', e.target.value)}
          placeholder="Explain the correct answer"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hints">Hints (one per line)</Label>
        <Textarea
          id="hints"
          value={(editedQuestion.hints || []).join('\n')}
          onChange={(e) => {
            const hints = e.target.value.split('\n').filter(Boolean);
            handleQuestionChange('hints', hints);
          }}
          placeholder="Enter hints to help students"
          rows={3}
        />
        <p className="text-xs text-gray-500">
          Enter each hint on a new line. Hints will be shown in order when requested.
        </p>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Question
        </Button>
      </div>
    </div>
  );
}