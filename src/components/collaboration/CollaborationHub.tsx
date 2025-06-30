import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageCircle, 
  FileText, 
  Video, 
  Layers,
  ClipboardCheck,
  GraduationCap,
  Film
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionManager } from './SessionManager';
import { RealtimePresence } from './RealtimePresence';
import { CollaborativeEditor } from './CollaborativeEditor';
import { CommunicationHub } from './CommunicationHub';
import { SharedExperimentState } from './SharedExperimentState';
import { BreakoutGroups } from './BreakoutGroups';
import { PeerReviewSystem } from './PeerReviewSystem';
import { TeacherOversight } from './TeacherOversight';
import { SessionRecording } from './SessionRecording';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCollaborationStore } from '@/stores/useCollaborationStore';

interface CollaborationHubProps {
  experimentId: string;
  currentStep: number;
  totalSteps: number;
  onUserAction: (action: any) => void;
  className?: string;
}

export function CollaborationHub({ 
  experimentId, 
  currentStep, 
  totalSteps,
  onUserAction,
  className = '' 
}: CollaborationHubProps) {
  const { user } = useAuthStore();
  const { isConnected, sessionMembers } = useCollaborationStore();
  const [activeTab, setActiveTab] = useState('session');
  
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  
  if (!isConnected) {
    return (
      <div className={className}>
        <SessionManager experimentId={experimentId} />
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="session">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Session</span>
          </TabsTrigger>
          <TabsTrigger value="notebook">
            <FileText className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notebook</span>
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="experiment">
            <Layers className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Experiment</span>
          </TabsTrigger>
          {sessionMembers.length > 4 && (
            <TabsTrigger value="groups">
              <Layers className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Groups</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="review">
            <ClipboardCheck className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Review</span>
          </TabsTrigger>
          {isTeacher && (
            <TabsTrigger value="teacher">
              <GraduationCap className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Teacher</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="recordings">
            <Film className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Recordings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="session" className="mt-4">
          <SessionManager experimentId={experimentId} />
        </TabsContent>
        
        <TabsContent value="notebook" className="mt-4">
          <CollaborativeEditor
            documentId={`experiment-${experimentId}`}
            initialContent={`# Lab Notes\n\n## Experiment: ${experimentId}\n\n## Observations\n\n## Data\n\n## Conclusions\n`}
          />
        </TabsContent>
        
        <TabsContent value="chat" className="mt-4">
          <CommunicationHub />
        </TabsContent>
        
        <TabsContent value="experiment" className="mt-4">
          <SharedExperimentState
            experimentId={experimentId}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onUserAction={onUserAction}
          />
        </TabsContent>
        
        <TabsContent value="groups" className="mt-4">
          <BreakoutGroups />
        </TabsContent>
        
        <TabsContent value="review" className="mt-4">
          <PeerReviewSystem />
        </TabsContent>
        
        <TabsContent value="teacher" className="mt-4">
          <TeacherOversight />
        </TabsContent>
        
        <TabsContent value="recordings" className="mt-4">
          <SessionRecording />
        </TabsContent>
      </Tabs>
      
      {/* Presence Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <RealtimePresence showUserList={false} />
      </div>
    </div>
  );
}