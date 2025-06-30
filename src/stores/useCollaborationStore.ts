import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  collaborationManager, 
  LabSession, 
  SessionMember, 
  CollaborativeAction,
  CursorPosition,
  SessionSettings
} from '@/lib/collaboration';

interface UserActivity {
  user_id: string;
  activity_type: string;
  timestamp: Date;
  data?: any;
}

interface PendingApproval extends CollaborativeAction {
  user_name: string;
}

interface CollaborationState {
  // Session state
  currentSession: LabSession | null;
  sessionMembers: SessionMember[];
  isConnected: boolean;
  
  // Collaboration data
  actionHistory: CollaborativeAction[];
  cursorPositions: CursorPosition[];
  userActivities: UserActivity[];
  pendingApprovals: PendingApproval[];
  
  // Session management
  createSession: (sessionData: Partial<LabSession>) => Promise<LabSession | null>;
  joinSession: (sessionId: string, userId: string, role?: string) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  updateSessionSettings: (sessionId: string, settings: SessionSettings) => Promise<boolean>;
  
  // User management
  inviteUser: (sessionId: string, email: string) => Promise<boolean>;
  kickUser: (userId: string) => Promise<boolean>;
  changeUserRole: (userId: string, newRole: string) => Promise<boolean>;
  
  // Action management
  executeAction: (actionType: string, actionData: any, requiresApproval?: boolean) => Promise<string | null>;
  approveAction: (actionId: string) => Promise<boolean>;
  rejectAction: (actionId: string) => Promise<boolean>;
  
  // Presence and communication
  broadcastCursorPosition: (x: number, y: number, tool?: string) => void;
  broadcastActivity: (activityType: string, data?: any) => void;
  recordVoiceNote: (audioBlob: Blob, position?: { x: number; y: number }) => Promise<string | null>;
  addScreenAnnotation: (type: string, position: { x: number; y: number }, data: any) => Promise<string | null>;
  
  // Turn-based collaboration
  requestControl: () => Promise<boolean>;
  releaseControl: () => Promise<boolean>;
  
  // Breakout groups
  createBreakoutGroup: (groupData: any) => Promise<any>;
  joinBreakoutGroup: (groupId: string) => Promise<boolean>;
  leaveBreakoutGroup: (groupId: string) => Promise<boolean>;
  moveUserToGroup: (userId: string, groupId: string) => Promise<boolean>;
  autoAssignGroups: (groupSize: number) => Promise<boolean>;
}

export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessionMembers: [],
      isConnected: false,
      
      actionHistory: [],
      cursorPositions: [],
      userActivities: [],
      pendingApprovals: [],
      
      // Session management
      createSession: async (sessionData) => {
        const session = await collaborationManager.createSession(sessionData);
        
        if (session) {
          set({ 
            currentSession: session,
            isConnected: true,
          });
          
          // Join the session as leader
          await collaborationManager.joinSession(
            session.id, 
            sessionData.creator_id || '', 
            'leader'
          );
          
          // Initialize event listeners
          initializeEventListeners(set, get);
        }
        
        return session;
      },
      
      joinSession: async (sessionId, userId, role = 'member') => {
        const success = await collaborationManager.joinSession(sessionId, userId, role as any);
        
        if (success) {
          // Fetch session data
          const { data: session } = await supabase
            .from('lab_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();
            
          // Fetch session members
          const { data: members } = await supabase
            .from('session_members')
            .select(`
              *,
              profiles (id, display_name, avatar_url)
            `)
            .eq('session_id', sessionId);
            
          if (session && members) {
            set({ 
              currentSession: session,
              sessionMembers: members.map(m => ({
                ...m,
                display_name: m.profiles.display_name,
                avatar_url: m.profiles.avatar_url,
              })),
              isConnected: true,
            });
            
            // Initialize event listeners
            initializeEventListeners(set, get);
          }
        }
        
        return success;
      },
      
      leaveSession: async () => {
        await collaborationManager.leaveSession();
        set({ 
          currentSession: null,
          sessionMembers: [],
          isConnected: false,
          actionHistory: [],
          cursorPositions: [],
          userActivities: [],
          pendingApprovals: [],
        });
      },
      
      updateSessionSettings: async (sessionId, settings) => {
        try {
          await collaborationManager.executeAction('update_settings', {
            session_id: sessionId,
            settings,
          });
          
          set(state => ({
            currentSession: state.currentSession 
              ? { ...state.currentSession, settings }
              : null
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to update session settings:', error);
          return false;
        }
      },
      
      // User management
      inviteUser: async (sessionId, email) => {
        try {
          await collaborationManager.executeAction('invite_user', {
            session_id: sessionId,
            email,
          });
          return true;
        } catch (error) {
          console.error('Failed to invite user:', error);
          return false;
        }
      },
      
      kickUser: async (userId) => {
        try {
          await collaborationManager.executeAction('kick_user', {
            user_id: userId,
          });
          
          set(state => ({
            sessionMembers: state.sessionMembers.filter(m => m.user_id !== userId)
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to kick user:', error);
          return false;
        }
      },
      
      changeUserRole: async (userId, newRole) => {
        try {
          await collaborationManager.executeAction('change_role', {
            user_id: userId,
            role: newRole,
          });
          
          set(state => ({
            sessionMembers: state.sessionMembers.map(m => 
              m.user_id === userId ? { ...m, role: newRole as any } : m
            )
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to change user role:', error);
          return false;
        }
      },
      
      // Action management
      executeAction: async (actionType, actionData, requiresApproval = false) => {
        return await collaborationManager.executeAction(actionType, actionData, requiresApproval);
      },
      
      approveAction: async (actionId) => {
        const success = await collaborationManager.approveAction(actionId);
        
        if (success) {
          set(state => ({
            pendingApprovals: state.pendingApprovals.filter(a => a.id !== actionId)
          }));
        }
        
        return success;
      },
      
      rejectAction: async (actionId) => {
        try {
          await collaborationManager.executeAction('reject_action', {
            action_id: actionId,
          });
          
          set(state => ({
            pendingApprovals: state.pendingApprovals.filter(a => a.id !== actionId)
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to reject action:', error);
          return false;
        }
      },
      
      // Presence and communication
      broadcastCursorPosition: (x, y, tool) => {
        collaborationManager.broadcastCursorPosition(x, y, tool);
      },
      
      broadcastActivity: (activityType, data) => {
        collaborationManager.broadcastToolChange(activityType);
        
        // Update local state
        set(state => {
          const userId = collaborationManager.getUserId();
          if (!userId) return state;
          
          return {
            userActivities: [
              ...state.userActivities.filter(a => a.user_id !== userId),
              {
                user_id: userId,
                activity_type: activityType,
                timestamp: new Date(),
                data,
              }
            ]
          };
        });
      },
      
      recordVoiceNote: async (audioBlob, position) => {
        return await collaborationManager.recordVoiceNote(audioBlob, position);
      },
      
      addScreenAnnotation: async (type, position, data) => {
        return await collaborationManager.addScreenAnnotation(type as any, position, data);
      },
      
      // Turn-based collaboration
      requestControl: async () => {
        try {
          await collaborationManager.executeAction('request_control', {});
          return true;
        } catch (error) {
          console.error('Failed to request control:', error);
          return false;
        }
      },
      
      releaseControl: async () => {
        try {
          await collaborationManager.executeAction('release_control', {});
          return true;
        } catch (error) {
          console.error('Failed to release control:', error);
          return false;
        }
      },
      
      // Breakout groups
      createBreakoutGroup: async (groupData) => {
        try {
          const actionId = await collaborationManager.executeAction('create_breakout_group', groupData);
          
          // In a real implementation, this would be handled by the event system
          // For now, we'll simulate it
          const newGroup = {
            id: crypto.randomUUID(),
            ...groupData,
            is_active: true,
            created_at: new Date(),
          };
          
          return newGroup;
        } catch (error) {
          console.error('Failed to create breakout group:', error);
          return null;
        }
      },
      
      joinBreakoutGroup: async (groupId) => {
        try {
          await collaborationManager.executeAction('join_breakout_group', {
            group_id: groupId,
          });
          return true;
        } catch (error) {
          console.error('Failed to join breakout group:', error);
          return false;
        }
      },
      
      leaveBreakoutGroup: async (groupId) => {
        try {
          await collaborationManager.executeAction('leave_breakout_group', {
            group_id: groupId,
          });
          return true;
        } catch (error) {
          console.error('Failed to leave breakout group:', error);
          return false;
        }
      },
      
      moveUserToGroup: async (userId, groupId) => {
        try {
          await collaborationManager.executeAction('move_user_to_group', {
            user_id: userId,
            group_id: groupId,
          });
          return true;
        } catch (error) {
          console.error('Failed to move user to group:', error);
          return false;
        }
      },
      
      autoAssignGroups: async (groupSize) => {
        try {
          await collaborationManager.executeAction('auto_assign_groups', {
            group_size: groupSize,
          });
          return true;
        } catch (error) {
          console.error('Failed to auto-assign groups:', error);
          return false;
        }
      },
    }),
    {
      name: 'collaboration-store',
      partialize: (state) => ({
        // Only persist minimal state
        currentSession: state.currentSession ? {
          id: state.currentSession.id,
          session_name: state.currentSession.session_name,
        } : null,
      }),
    }
  )
);

// Initialize event listeners for real-time updates
function initializeEventListeners(set: any, get: any) {
  // Action received
  collaborationManager.on('action_received', (action: CollaborativeAction) => {
    set(state => ({
      actionHistory: [...state.actionHistory, action],
    }));
    
    // Check if action requires approval
    if (action.requires_approval && !action.approved_by) {
      const member = get().sessionMembers.find((m: SessionMember) => m.user_id === action.user_id);
      
      set(state => ({
        pendingApprovals: [...state.pendingApprovals, {
          ...action,
          user_name: member?.display_name || 'Unknown',
        }],
      }));
    }
  });
  
  // Member updated
  collaborationManager.on('member_updated', (member: any) => {
    set(state => ({
      sessionMembers: state.sessionMembers.map((m: SessionMember) => 
        m.user_id === member.user_id ? { ...m, ...member } : m
      ),
    }));
  });
  
  // Member joined
  collaborationManager.on('member_joined', (payload: any) => {
    const newMember = payload.newPresences[0];
    
    set(state => ({
      sessionMembers: [...state.sessionMembers, {
        ...newMember,
        is_online: true,
      }],
    }));
  });
  
  // Member left
  collaborationManager.on('member_left', (payload: any) => {
    const leftMember = payload.leftPresences[0];
    
    set(state => ({
      sessionMembers: state.sessionMembers.map((m: SessionMember) => 
        m.user_id === leftMember.user_id ? { ...m, is_online: false } : m
      ),
    }));
  });
  
  // Cursor moved
  collaborationManager.on('cursor_moved', (cursor: CursorPosition) => {
    set(state => ({
      cursorPositions: [
        ...state.cursorPositions.filter(c => c.user_id !== cursor.user_id),
        cursor,
      ],
    }));
  });
  
  // Tool changed
  collaborationManager.on('tool_changed', (data: any) => {
    set(state => ({
      userActivities: [
        ...state.userActivities.filter(a => a.user_id !== data.user_id),
        {
          user_id: data.user_id,
          activity_type: data.tool,
          timestamp: new Date(data.timestamp),
        },
      ],
    }));
  });
}

// Import supabase for database operations
import { supabase } from '@/lib/supabase';