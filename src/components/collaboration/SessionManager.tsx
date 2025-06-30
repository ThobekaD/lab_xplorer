import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Settings, 
  Share2, 
  Lock, 
  Unlock,
  Crown,
  Eye,
  Mic,
  MicOff,
  Video,
  VideoOff,
  UserPlus,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollaborationStore } from '@/stores/useCollaborationStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';
import type { LabSession, SessionSettings } from '@/lib/collaboration';

interface SessionManagerProps {
  experimentId?: string;
  onSessionJoined?: (session: LabSession) => void;
}

export function SessionManager({ experimentId, onSessionJoined }: SessionManagerProps) {
  const { user } = useAuthStore();
  const {
    currentSession,
    sessionMembers,
    isConnected,
    createSession,
    joinSession,
    leaveSession,
    updateSessionSettings,
    inviteUser,
    kickUser,
    changeUserRole,
  } = useCollaborationStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const [sessionName, setSessionName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState([4]);
  const [sessionCode, setSessionCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    allow_voice_chat: true,
    allow_screen_sharing: true,
    require_approval_for_actions: false,
    auto_save_interval: 30,
    max_undo_history: 50,
    collaboration_mode: 'free',
  });

  const handleCreateSession = async () => {
    if (!user || !experimentId) return;

    const session = await createSession({
      experiment_id: experimentId,
      session_name: sessionName || `${user.display_name}'s Lab`,
      creator_id: user.id,
      max_participants: maxParticipants[0],
      settings: sessionSettings,
    });

    if (session) {
      setShowCreateDialog(false);
      onSessionJoined?.(session);
      toast.success('Lab session created!', {
        description: 'You can now invite others to join your collaborative lab.',
      });
    }
  };

  const handleJoinSession = async () => {
    if (!user || !sessionCode) return;

    const success = await joinSession(sessionCode, user.id);
    if (success) {
      setShowJoinDialog(false);
      toast.success('Joined lab session!', {
        description: 'You are now connected to the collaborative lab.',
      });
    } else {
      toast.error('Failed to join session', {
        description: 'Please check the session code and try again.',
      });
    }
  };

  const handleLeaveSession = async () => {
    await leaveSession();
    toast.info('Left lab session', {
      description: 'You have disconnected from the collaborative lab.',
    });
  };

  const handleUpdateSettings = async () => {
    if (!currentSession) return;

    await updateSessionSettings(currentSession.id, sessionSettings);
    setShowSettingsDialog(false);
    toast.success('Session settings updated');
  };

  const handleInviteUser = async () => {
    if (!currentSession || !inviteEmail) return;

    const success = await inviteUser(currentSession.id, inviteEmail);
    if (success) {
      setInviteEmail('');
      setShowInviteDialog(false);
      toast.success('Invitation sent!');
    }
  };

  const copySessionCode = () => {
    if (currentSession) {
      navigator.clipboard.writeText(currentSession.id);
      toast.success('Session code copied to clipboard');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'member': return <Users className="h-4 w-4 text-blue-500" />;
      case 'observer': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'leader': return 'bg-yellow-100 text-yellow-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'observer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (currentSession && isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {currentSession.session_name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Connected
              </Badge>
              <Button variant="outline" size="sm" onClick={copySessionCode}>
                <Copy className="h-4 w-4 mr-1" />
                Copy Code
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Participants:</span>
              <span className="ml-2 font-medium">
                {currentSession.current_participants}/{currentSession.max_participants}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Mode:</span>
              <span className="ml-2 font-medium capitalize">
                {currentSession.settings.collaboration_mode.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Participants</h4>
              <div className="flex items-center space-x-1">
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite to Lab Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="invite-email">Email Address</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@university.edu"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleInviteUser} className="flex-1">
                          Send Invitation
                        </Button>
                        <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Session Settings</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="general">
                      <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="permissions">Permissions</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="general" className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Voice Chat</Label>
                              <p className="text-sm text-gray-600">Allow voice communication</p>
                            </div>
                            <Switch
                              checked={sessionSettings.allow_voice_chat}
                              onCheckedChange={(checked) => 
                                setSessionSettings(prev => ({ ...prev, allow_voice_chat: checked }))
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <Label>Screen Sharing</Label>
                              <p className="text-sm text-gray-600">Allow screen sharing</p>
                            </div>
                            <Switch
                              checked={sessionSettings.allow_screen_sharing}
                              onCheckedChange={(checked) => 
                                setSessionSettings(prev => ({ ...prev, allow_screen_sharing: checked }))
                              }
                            />
                          </div>

                          <div>
                            <Label>Collaboration Mode</Label>
                            <Select
                              value={sessionSettings.collaboration_mode}
                              onValueChange={(value: any) => 
                                setSessionSettings(prev => ({ ...prev, collaboration_mode: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">Free Collaboration</SelectItem>
                                <SelectItem value="turn_based">Turn-Based</SelectItem>
                                <SelectItem value="leader_controlled">Leader Controlled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="permissions" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Require Approval for Actions</Label>
                            <p className="text-sm text-gray-600">Leader must approve member actions</p>
                          </div>
                          <Switch
                            checked={sessionSettings.require_approval_for_actions}
                            onCheckedChange={(checked) => 
                              setSessionSettings(prev => ({ ...prev, require_approval_for_actions: checked }))
                            }
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="advanced" className="space-y-4">
                        <div>
                          <Label>Auto-save Interval (seconds)</Label>
                          <Slider
                            value={[sessionSettings.auto_save_interval]}
                            onValueChange={(value) => 
                              setSessionSettings(prev => ({ ...prev, auto_save_interval: value[0] }))
                            }
                            max={300}
                            min={10}
                            step={10}
                            className="mt-2"
                          />
                          <div className="text-sm text-gray-500 mt-1">
                            {sessionSettings.auto_save_interval} seconds
                          </div>
                        </div>

                        <div>
                          <Label>Max Undo History</Label>
                          <Slider
                            value={[sessionSettings.max_undo_history]}
                            onValueChange={(value) => 
                              setSessionSettings(prev => ({ ...prev, max_undo_history: value[0] }))
                            }
                            max={100}
                            min={10}
                            step={5}
                            className="mt-2"
                          />
                          <div className="text-sm text-gray-500 mt-1">
                            {sessionSettings.max_undo_history} actions
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateSettings}>
                        Save Settings
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessionMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} alt={member.display_name} />
                        <AvatarFallback>
                          {member.display_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        member.is_online ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.display_name}</div>
                      <div className="text-xs text-gray-500">
                        {member.is_online ? 'Online' : `Last seen ${new Date(member.last_active).toLocaleTimeString()}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleBadgeColor(member.role)}>
                      {getRoleIcon(member.role)}
                      <span className="ml-1 capitalize">{member.role}</span>
                    </Badge>
                    
                    {member.user_id !== user?.id && currentSession.creator_id === user?.id && (
                      <Select
                        value={member.role}
                        onValueChange={(newRole: any) => changeUserRole(member.user_id, newRole)}
                      >
                        <SelectTrigger className="w-24 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="leader">Leader</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="observer">Observer</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Actions */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleLeaveSession} className="flex-1">
              Leave Session
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Collaborative Lab
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm">
          Work together with classmates in real-time virtual experiments
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Lab Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="My Chemistry Lab"
                  />
                </div>

                <div>
                  <Label>Max Participants</Label>
                  <Slider
                    value={maxParticipants}
                    onValueChange={setMaxParticipants}
                    max={8}
                    min={2}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {maxParticipants[0]} participants
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Quick Settings</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Voice Chat</span>
                      <Switch
                        checked={sessionSettings.allow_voice_chat}
                        onCheckedChange={(checked) => 
                          setSessionSettings(prev => ({ ...prev, allow_voice_chat: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Screen Sharing</span>
                      <Switch
                        checked={sessionSettings.allow_screen_sharing}
                        onCheckedChange={(checked) => 
                          setSessionSettings(prev => ({ ...prev, allow_screen_sharing: checked }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleCreateSession} className="flex-1">
                    Create Session
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Join Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Lab Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-code">Session Code</Label>
                  <Input
                    id="session-code"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value)}
                    placeholder="Enter session code"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleJoinSession} className="flex-1">
                    Join Session
                  </Button>
                  <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-center text-sm text-gray-500">
          Collaborate in real-time with voice chat, shared controls, and synchronized notebooks
        </div>
      </CardContent>
    </Card>
  );
}