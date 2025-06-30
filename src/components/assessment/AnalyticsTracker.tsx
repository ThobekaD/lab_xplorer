import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import type { 
  Assessment, 
  AssessmentAttempt 
} from '@/types/assessment';

interface AnalyticsTrackerProps {
  assessment: Assessment;
  attempts: AssessmentAttempt[];
  className?: string;
}

export function AnalyticsTracker({
  assessment,
  attempts,
  className = ''
}: AnalyticsTrackerProps) {
  // Calculate average score
  const averageScore = attempts.length > 0
    ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length
    : 0;
  
  // Calculate average time taken
  const averageTime = attempts.length > 0
    ? attempts.reduce((sum, attempt) => sum + (attempt.time_taken || 0), 0) / attempts.length
    : 0;
  
  // Calculate question difficulty
  const questionDifficulty = assessment.questions.map(question => {
    const questionAttempts = attempts.filter(attempt => 
      attempt.answers[question.id] !== undefined
    );
    
    const correctCount = questionAttempts.filter(attempt => {
      const userAnswer = attempt.answers[question.id];
      
      switch (question.question_type) {
        case 'multiple_choice':
          if (Array.isArray(question.correct_answer)) {
            return Array.isArray(userAnswer) && 
                   userAnswer.length === question.correct_answer.length &&
                   userAnswer.every(a => question.correct_answer.includes(a));
          } else {
            return userAnswer === question.correct_answer;
          }
          
        case 'numerical':
          const numericAnswer = parseFloat(userAnswer as string);
          const correctAnswer = parseFloat(question.correct_answer as string);
          const tolerance = question.tolerance || 0.01;
          
          return Math.abs(numericAnswer - correctAnswer) <= tolerance;
          
        case 'short_answer':
          const keywords = Array.isArray(question.correct_answer) 
            ? question.correct_answer 
            : [question.correct_answer];
            
          const userText = (userAnswer as string).toLowerCase();
          
          return keywords.some(keyword => 
            userText.includes((keyword as string).toLowerCase())
          );
          
        default:
          return false;
      }
    }).length;
    
    const successRate = questionAttempts.length > 0
      ? (correctCount / questionAttempts.length) * 100
      : 0;
    
    return {
      id: question.id,
      question: `Q${assessment.questions.findIndex(q => q.id === question.id) + 1}`,
      successRate,
      difficulty: question.difficulty || 1,
      attempts: questionAttempts.length
    };
  });
  
  // Score distribution
  const scoreRanges = [
    { name: '0-20%', count: 0 },
    { name: '21-40%', count: 0 },
    { name: '41-60%', count: 0 },
    { name: '61-80%', count: 0 },
    { name: '81-100%', count: 0 },
  ];
  
  attempts.forEach(attempt => {
    const score = attempt.percentage;
    if (score <= 20) scoreRanges[0].count++;
    else if (score <= 40) scoreRanges[1].count++;
    else if (score <= 60) scoreRanges[2].count++;
    else if (score <= 80) scoreRanges[3].count++;
    else scoreRanges[4].count++;
  });
  
  // Question type breakdown
  const questionTypes = assessment.questions.reduce((acc, question) => {
    const type = question.question_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const questionTypeData = Object.entries(questionTypes).map(([type, count]) => ({
    name: type.replace('_', ' '),
    value: count
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Assessment Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {averageScore.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Average Score</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {attempts.length}
                </div>
                <div className="text-sm text-gray-500">Total Attempts</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.floor(averageTime / 60)}m {Math.floor(averageTime % 60)}s
                </div>
                <div className="text-sm text-gray-500">Average Time</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Question Success Rate Chart */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Question Success Rate</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={questionDifficulty}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Success Rate']}
                  />
                  <Bar 
                    dataKey="successRate" 
                    fill="#3b82f6" 
                    name="Success Rate" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scoreRanges}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="#8884d8" 
                      name="Students" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Question Type Breakdown */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Question Types</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={questionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {questionTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Questions']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}