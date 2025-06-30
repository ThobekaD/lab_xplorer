import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  MessageSquare,
  BarChart,
  UserPlus,
  UserMinus,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollaborationStore } from '@/stores/useCollaborationStore';

interface SessionOverview {
  id: string;
  name: string;
  experiment_id: string;
  experiment_name: string;
  participant_count: number;
  progress: number;
  status: 'active' | 'paused' | 'completed';
  start_time: Date;
  duration_minutes: number;
  safety_alerts: number;
}

interface StudentProgress {
  user_id: string;
  display_name: string;
  avatar_url?: string;
  current_step: number;
  total_steps: number;
  score: number;
  time_spent_minutes: number;
  measurements_taken: number;
  needs_help: boolean;
  last_active: Date;
}

export function TeacherOversight() {
  const { sessionMembers } = useCollaborationStore();
  
  const [activeSessions, setActiveSessions] = useState<SessionOverview[]>([
    {
      id: '1',
      name: 'Chemistry 101 - Morning Lab',
      experiment_id: 'exp1',
      experiment_name: 'Acid-Base Titration',
      participant_count: 12,
      progress: 65,
      status: 'active',
      start_time: new Date(Date.now() - 45 * 60000), // 45 minutes ago
      duration_minutes: 45,
      safety_alerts: 2,
    },
    {
      id: '2',
      name: 'Physics 202 - Afternoon Lab',
      experiment_id: 'exp2',
      experiment_name: 'Pendulum Motion',
      participant_count: 8,
      progress: 30,
      status: 'active',
      start_time: new Date(Date.now() - 20 * 60000), // 20 minutes ago
      duration_minutes: 20,
      safety_alerts: 0,
    },
  ]);
  
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([
    {
      user_id: 'user1',
      display_name: 'Alice Johnson',
      current_step: 4,
      total_steps: 6,
      score: 85,
      time_spent_minutes: 32,
      measurements_taken: 8,
      needs_help: false,
      last_active: new Date(),
    },
    {
      user_id: 'user2',
      display_name: 'Bob Smith',
      current_step: 3,
      total_steps: 6,
      score: 72,
      time_spent_minutes: 28,
      measurements_taken: 6,
      needs_help: true,
      last_active: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    },
    {
      user_id: 'user3',
      display_name: 'Charlie Davis',
      current_step: 5,
      total_steps: 6,
      score: 92,
      time_spent_minutes: 35,
      measurements_taken: 10,
      needs_help: false,
      last_active: new Date(),
    },
  ]);
  
  const [selectedSession, setSelectedSession] = useState<string>(activeSessions[0]?.id || '');
  const [selectedView, setSelectedView] = useState<'overview' | 'students' | 'analytics'>('overview');
  
  const handleJoinSession = (sessionId: string) => {
    // In a real implementation, this would navigate to the session
    console.log('Joining session:', sessionId);
  };
  
  const handleHelpStudent = (userId: string) => {
    // In a real implementation, this would open a direct chat or join their group
    console.log('Helping student:', userId);
  };
  
  const handleEndSession = (sessionId: string) => {
    // In a real implementation, this would end the session
    console.log('Ending session:', sessionId);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  const formatTimeElapsed = (startTime: Date) => {
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 60000);
    return formatDuration(elapsed);
  };
  
  const selectedSessionData = activeSessions.find(s => s.id === selectedSession);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Teacher Dashboard
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {activeSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={() => handleJoinSession(selectedSession)}>
              <Eye className="h-4 w-4 mr-1" />
              Join
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {selectedSessionData && (
          <>
            {/* Session Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Experiment</span>
                    <span className="font-medium">{selectedSessionData.experiment_name}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Participants</span>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-blue-500" />
                      <span className="font-medium">{selectedSessionData.participant_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Time Elapsed</span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-purple-500" />
                      <span className="font-medium">{formatTimeElapsed(selectedSessionData.start_time)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm text-gray-500">Safety Alerts</span>
                    <div className="flex items-center">
                      <AlertTriangle className={`h-4 w-4 mr-1 ${
                        selectedSessionData.safety_alerts > 0 ? 'text-red-500' : 'text-green-500'
                      }`} />
                      <span className="font-medium">{selectedSessionData.safety_alerts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Session Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Overall Progress</h3>
                  <Badge className={getStatusColor(selectedSessionData.status)}>
                    {selectedSessionData.status.charAt(0).toUpperCase() + selectedSessionData.status.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{selectedSessionData.progress}%</span>
                  </div>
                  <Progress 
                    value={selectedSessionData.progress} 
                    className={`h-2 ${getProgressColor(selectedSessionData.progress)}`} 
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Tabs for different views */}
            <Tabs value={selectedView} onValueChange={(v: any) => setSelectedView(v)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Students Needing Help */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2 text-yellow-500" />
                        Students Needing Help
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {studentProgress.filter(s => s.needs_help).length === 0 ? (
                          <p className="text-sm text-gray-500">No students currently need help</p>
                        ) : (
                          studentProgress
                            .filter(s => s.needs_help)
                            .map((student) => (
                              <div key={student.user_id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={student.avatar_url} alt={student.display_name} />
                                    <AvatarFallback>
                                      {student.display_name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-sm">{student.display_name}</div>
                                    <div className="text-xs text-gray-500">
                                      Step {student.current_step}/{student.total_steps}
                                    </div>
                                  </div>
                                </div>
                                <Button size="sm" onClick={() => handleHelpStudent(student.user_id)}>
                                  Help
                                </Button>
                              </div>
                            ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Safety Alerts */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        Safety Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedSessionData.safety_alerts === 0 ? (
                        <p className="text-sm text-gray-500">No safety alerts</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="p-2 bg-red-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="font-medium text-sm">Improper chemical mixing</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              Bob Smith attempted to mix incompatible chemicals
                            </p>
                            <div className="flex justify-end mt-2">
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Message
                              </Button>
                            </div>
                          </div>
                          
                          <div className="p-2 bg-red-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="font-medium text-sm">Excessive temperature</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              Alice Johnson set temperature above safe limits
                            </p>
                            <div className="flex justify-end mt-2">
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Message
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Session Actions */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => handleEndSession(selectedSession)}>
                    End Session
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="students" className="space-y-4 pt-4">
                <div className="space-y-3">
                  {studentProgress.map((student) => (
                    <Card key={student.user_id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={student.avatar_url} alt={student.display_name} />
                              <AvatarFallback>
                                {student.display_name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{student.display_name}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>Score: {student.score}</span>
                                <span>•</span>
                                <span>Time: {formatDuration(student.time_spent_minutes)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {student.needs_help && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                <HelpCircle className="h-3 w-3 mr-1" />
                                Needs Help
                              </Badge>
                            )}
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>Step {student.current_step}/{student.total_steps}</span>
                          </div>
                          <Progress 
                            value={(student.current_step / student.total_steps) * 100} 
                            className="h-2" 
                          />
                        </div>
                        
                        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <div className="font-medium">{student.measurements_taken}</div>
                            <div className="text-xs text-gray-500">Measurements</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <div className="font-medium">{formatDuration(student.time_spent_minutes)}</div>
                            <div className="text-xs text-gray-500">Time Spent</div>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <div className="font-medium">
                              {new Date(student.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-xs text-gray-500">Last Active</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4 pt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <BarChart className="h-4 w-4 mr-2 text-blue-500" />
                      Session Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Progress Distribution */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Progress Distribution</h4>
                        <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                          <div className="h-full bg-red-500" style={{ width: '10%' }}></div>
                          <div className="h-full bg-yellow-500" style={{ width: '30%' }}></div>
                          <div className="h-full bg-green-500" style={{ width: '60%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Just Started (10%)</span>
                          <span>In Progress (30%)</span>
                          <span>Nearly Complete (60%)</span>
                        </div>
                      </div>
                      
                      {/* Average Completion Time */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Average Completion Time</h4>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">32 minutes</span>
                          <span className="text-xs text-gray-500">
                            (Expected: 45 minutes)
                          </span>
                        </div>
                      </div>
                      
                      {/* Common Issues */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Common Issues</h4>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Step 3: Measurement Error</span>
                            <Badge variant="outline">5 students</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Step 4: Calculation Mistake</span>
                            <Badge variant="outline">3 students</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Export Options */}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    Export Analytics
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}