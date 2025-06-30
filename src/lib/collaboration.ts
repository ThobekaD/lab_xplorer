import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface LabSession {
  id: string;
  experiment_id: string;
  session_name: string;
  creator_id: string;
  status: 'pending' | 'active' | 'paused' | 'completed';
  max_participants: number;
  current_participants: number;
  started_at?: Date;
  ended_at?: Date;
  session_data: any;
  settings: SessionSettings;
  created_at: Date;
}

export interface SessionMember {
  id: string;
  session_id: string;
  user_id: string;
  role: 'leader' | 'member' | 'observer';
  display_name: string;
  avatar_url?: string;
  joined_at: Date;
  last_active: Date;
  is_online: boolean;
  cursor_position?: { x: number; y: number };
  current_tool?: string;
  permissions: MemberPermissions;
}

export interface MemberPermissions {
  can_control_experiment: boolean;
  can_edit_notebook: boolean;
  can_manage_members: boolean;
  can_record_measurements: boolean;
  can_use_voice_chat: boolean;
  can_share_screen: boolean;
}

export interface SessionSettings {
  allow_voice_chat: boolean;
  allow_screen_sharing: boolean;
  require_approval_for_actions: boolean;
  auto_save_interval: number;
  max_undo_history: number;
  collaboration_mode: 'free' | 'turn_based' | 'leader_controlled';
}

export interface CollaborativeAction {
  id: string;
  session_id: string;
  user_id: string;
  action_type: string;
  action_data: any;
  timestamp: Date;
  requires_approval?: boolean;
  approved_by?: string;
  reverted_at?: Date;
  vector_clock: Record<string, number>;
}

export interface CursorPosition {
  user_id: string;
  x: number;
  y: number;
  tool?: string;
  timestamp: Date;
}

export interface VoiceNote {
  id: string;
  session_id: string;
  user_id: string;
  audio_url: string;
  duration: number;
  transcript?: string;
  timestamp: Date;
  position?: { x: number; y: number };
}

export interface ScreenAnnotation {
  id: string;
  session_id: string;
  user_id: string;
  type: 'arrow' | 'circle' | 'highlight' | 'text';
  position: { x: number; y: number };
  data: any;
  timestamp: Date;
  expires_at?: Date;
}

class CollaborationManager {
  private channel: RealtimeChannel | null = null;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private vectorClock: Record<string, number> = {};
  private actionHistory: CollaborativeAction[] = [];
  private presenceHeartbeat: NodeJS.Timeout | null = null;

  async createSession(sessionData: Partial<LabSession>): Promise<LabSession | null> {
    try {
      const { data, error } = await supabase
        .from('lab_sessions')
        .insert({
          ...sessionData,
          status: 'pending',
          current_participants: 1,
          session_data: sessionData.session_data || {},
          settings: sessionData.settings || this.getDefaultSettings(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create session:', error);
      return null;
    }
  }

  async joinSession(sessionId: string, userId: string, role: 'leader' | 'member' | 'observer' = 'member'): Promise<boolean> {
    try {
      // Check if session exists and has space
      const { data: session, error: sessionError } = await supabase
        .from('lab_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        throw new Error('Session not found');
      }

      if (session.current_participants >= session.max_participants) {
        throw new Error('Session is full');
      }

      // Add user to session
      const { error: memberError } = await supabase
        .from('session_members')
        .insert({
          session_id: sessionId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
          is_online: true,
          permissions: this.getDefaultPermissions(role),
        });

      if (memberError) throw memberError;

      // Update participant count
      await supabase
        .from('lab_sessions')
        .update({ 
          current_participants: session.current_participants + 1,
          status: session.status === 'pending' ? 'active' : session.status,
        })
        .eq('id', sessionId);

      // Initialize collaboration
      this.sessionId = sessionId;
      this.userId = userId;
      this.vectorClock = { [userId]: 0 };
      
      await this.initializeRealtimeChannel();
      this.startPresenceHeartbeat();

      return true;
    } catch (error) {
      console.error('Failed to join session:', error);
      return false;
    }
  }

  async leaveSession(): Promise<void> {
    if (!this.sessionId || !this.userId) return;

    try {
      // Update member status
      await supabase
        .from('session_members')
        .update({ 
          is_online: false,
          last_active: new Date().toISOString(),
        })
        .eq('session_id', this.sessionId)
        .eq('user_id', this.userId);

      // Update participant count
      const { data: session } = await supabase
        .from('lab_sessions')
        .select('current_participants')
        .eq('id', this.sessionId)
        .single();

      if (session) {
        await supabase
          .from('lab_sessions')
          .update({ current_participants: Math.max(0, session.current_participants - 1) })
          .eq('id', this.sessionId);
      }

      // Cleanup
      this.cleanup();
    } catch (error) {
      console.error('Failed to leave session:', error);
    }
  }

  private async initializeRealtimeChannel(): Promise<void> {
    if (!this.sessionId) return;

    this.channel = supabase.channel(`lab_session:${this.sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'collaborative_actions',
        filter: `session_id=eq.${this.sessionId}`,
      }, this.handleActionUpdate.bind(this))
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'session_members',
        filter: `session_id=eq.${this.sessionId}`,
      }, this.handleMemberUpdate.bind(this))
      .on('presence', { event: 'sync' }, this.handlePresenceSync.bind(this))
      .on('presence', { event: 'join' }, this.handlePresenceJoin.bind(this))
      .on('presence', { event: 'leave' }, this.handlePresenceLeave.bind(this))
      .on('broadcast', { event: 'cursor_move' }, this.handleCursorMove.bind(this))
      .on('broadcast', { event: 'tool_change' }, this.handleToolChange.bind(this))
      .on('broadcast', { event: 'voice_note' }, this.handleVoiceNote.bind(this))
      .on('broadcast', { event: 'screen_annotation' }, this.handleScreenAnnotation.bind(this))
      .subscribe();

    // Track presence
    await this.channel.track({
      user_id: this.userId,
      online_at: new Date().toISOString(),
    });
  }

  async executeAction(actionType: string, actionData: any, requiresApproval = false): Promise<string | null> {
    if (!this.sessionId || !this.userId) return null;

    try {
      // Increment vector clock
      this.vectorClock[this.userId] = (this.vectorClock[this.userId] || 0) + 1;

      const action: Omit<CollaborativeAction, 'id'> = {
        session_id: this.sessionId,
        user_id: this.userId,
        action_type: actionType,
        action_data: actionData,
        timestamp: new Date(),
        requires_approval: requiresApproval,
        vector_clock: { ...this.vectorClock },
      };

      const { data, error } = await supabase
        .from('collaborative_actions')
        .insert(action)
        .select()
        .single();

      if (error) throw error;

      // Add to local history
      this.actionHistory.push(data);
      this.trimActionHistory();

      return data.id;
    } catch (error) {
      console.error('Failed to execute action:', error);
      return null;
    }
  }

  async undoAction(actionId: string): Promise<boolean> {
    if (!this.sessionId || !this.userId) return false;

    try {
      // Mark action as reverted
      const { error } = await supabase
        .from('collaborative_actions')
        .update({ reverted_at: new Date().toISOString() })
        .eq('id', actionId)
        .eq('user_id', this.userId); // Only allow users to undo their own actions

      if (error) throw error;

      // Create undo action
      await this.executeAction('undo', { original_action_id: actionId });

      return true;
    } catch (error) {
      console.error('Failed to undo action:', error);
      return false;
    }
  }

  async approveAction(actionId: string): Promise<boolean> {
    if (!this.sessionId || !this.userId) return false;

    try {
      const { error } = await supabase
        .from('collaborative_actions')
        .update({ approved_by: this.userId })
        .eq('id', actionId)
        .eq('session_id', this.sessionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to approve action:', error);
      return false;
    }
  }

  broadcastCursorPosition(x: number, y: number, tool?: string): void {
    if (!this.channel || !this.userId) return;

    this.channel.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: {
        user_id: this.userId,
        x,
        y,
        tool,
        timestamp: new Date().toISOString(),
      },
    });
  }

  broadcastToolChange(tool: string): void {
    if (!this.channel || !this.userId) return;

    this.channel.send({
      type: 'broadcast',
      event: 'tool_change',
      payload: {
        user_id: this.userId,
        tool,
        timestamp: new Date().toISOString(),
      },
    });
  }

  async recordVoiceNote(audioBlob: Blob, position?: { x: number; y: number }): Promise<string | null> {
    if (!this.sessionId || !this.userId) return null;

    try {
      // Upload audio file
      const fileName = `voice_notes/${this.sessionId}/${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('collaboration')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('collaboration')
        .getPublicUrl(fileName);

      // Save voice note record
      const { data, error } = await supabase
        .from('voice_notes')
        .insert({
          session_id: this.sessionId,
          user_id: this.userId,
          audio_url: urlData.publicUrl,
          duration: 0, // Would be calculated from audio
          position,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Broadcast to other users
      this.channel?.send({
        type: 'broadcast',
        event: 'voice_note',
        payload: data,
      });

      return data.id;
    } catch (error) {
      console.error('Failed to record voice note:', error);
      return null;
    }
  }

  async addScreenAnnotation(
    type: 'arrow' | 'circle' | 'highlight' | 'text',
    position: { x: number; y: number },
    data: any,
    expiresIn?: number
  ): Promise<string | null> {
    if (!this.sessionId || !this.userId) return null;

    try {
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

      const { data: annotation, error } = await supabase
        .from('screen_annotations')
        .insert({
          session_id: this.sessionId,
          user_id: this.userId,
          type,
          position,
          data,
          timestamp: new Date().toISOString(),
          expires_at: expiresAt?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Broadcast to other users
      this.channel?.send({
        type: 'broadcast',
        event: 'screen_annotation',
        payload: annotation,
      });

      return annotation.id;
    } catch (error) {
      console.error('Failed to add screen annotation:', error);
      return null;
    }
  }

  // Event handlers
  private handleActionUpdate(payload: any): void {
    const action = payload.new as CollaborativeAction;
    
    // Update vector clock
    Object.keys(action.vector_clock).forEach(userId => {
      this.vectorClock[userId] = Math.max(
        this.vectorClock[userId] || 0,
        action.vector_clock[userId]
      );
    });

    // Add to history if not from current user
    if (action.user_id !== this.userId) {
      this.actionHistory.push(action);
      this.trimActionHistory();
    }

    // Emit event for UI updates
    this.emitEvent('action_received', action);
  }

  private handleMemberUpdate(payload: any): void {
    this.emitEvent('member_updated', payload.new);
  }

  private handlePresenceSync(): void {
    this.emitEvent('presence_sync', this.channel?.presenceState());
  }

  private handlePresenceJoin(payload: any): void {
    this.emitEvent('member_joined', payload);
  }

  private handlePresenceLeave(payload: any): void {
    this.emitEvent('member_left', payload);
  }

  private handleCursorMove(payload: any): void {
    this.emitEvent('cursor_moved', payload.payload);
  }

  private handleToolChange(payload: any): void {
    this.emitEvent('tool_changed', payload.payload);
  }

  private handleVoiceNote(payload: any): void {
    this.emitEvent('voice_note_added', payload.payload);
  }

  private handleScreenAnnotation(payload: any): void {
    this.emitEvent('annotation_added', payload.payload);
  }

  private startPresenceHeartbeat(): void {
    this.presenceHeartbeat = setInterval(async () => {
      if (this.sessionId && this.userId) {
        await supabase
          .from('session_members')
          .update({ last_active: new Date().toISOString() })
          .eq('session_id', this.sessionId)
          .eq('user_id', this.userId);
      }
    }, 30000); // Update every 30 seconds
  }

  private cleanup(): void {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }

    if (this.presenceHeartbeat) {
      clearInterval(this.presenceHeartbeat);
      this.presenceHeartbeat = null;
    }

    this.sessionId = null;
    this.userId = null;
    this.vectorClock = {};
    this.actionHistory = [];
  }

  private trimActionHistory(): void {
    const maxHistory = 1000;
    if (this.actionHistory.length > maxHistory) {
      this.actionHistory = this.actionHistory.slice(-maxHistory);
    }
  }

  private getDefaultSettings(): SessionSettings {
    return {
      allow_voice_chat: true,
      allow_screen_sharing: true,
      require_approval_for_actions: false,
      auto_save_interval: 30,
      max_undo_history: 50,
      collaboration_mode: 'free',
    };
  }

  private getDefaultPermissions(role: string): MemberPermissions {
    const basePermissions = {
      can_control_experiment: false,
      can_edit_notebook: false,
      can_manage_members: false,
      can_record_measurements: false,
      can_use_voice_chat: true,
      can_share_screen: false,
    };

    switch (role) {
      case 'leader':
        return {
          ...basePermissions,
          can_control_experiment: true,
          can_edit_notebook: true,
          can_manage_members: true,
          can_record_measurements: true,
          can_share_screen: true,
        };
      case 'member':
        return {
          ...basePermissions,
          can_control_experiment: true,
          can_edit_notebook: true,
          can_record_measurements: true,
        };
      case 'observer':
        return basePermissions;
      default:
        return basePermissions;
    }
  }

  // Event emitter functionality
  private eventListeners: Record<string, Function[]> = {};

  on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emitEvent(event: string, data: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Getters
  getSessionId(): string | null {
    return this.sessionId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  getActionHistory(): CollaborativeAction[] {
    return [...this.actionHistory];
  }

  getVectorClock(): Record<string, number> {
    return { ...this.vectorClock };
  }
}

export const collaborationManager = new CollaborationManager();