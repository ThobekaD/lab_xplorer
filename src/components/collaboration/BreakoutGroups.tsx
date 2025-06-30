import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Shuffle, 
  ArrowLeftRight,
  LayoutGrid,
  Layers,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollaborationStore } from '@/stores/useCollaborationStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface BreakoutGroup {
  id: string;
  name: string;
  members: string[];
  experiment_id?: string;
  is_active: boolean;
  created_at: Date;
}

export function BreakoutGroups() {
  const { user } = useAuthStore();
  const {
    sessionMembers,
    createBreakoutGroup,
    joinBreakoutGroup,
    leaveBreakoutGroup,
    moveUserToGroup,
    autoAssignGroups,
  } = useCollaborationStore();

  const [groups, setGroups] = useState<BreakoutGroup[]>([
    {
      id: '1',
      name: 'Group 1',
      members: ['user1', 'user2'],
      experiment_id: 'exp1',
      is_active: true,
      created_at: new Date(),
    },
    {
      id: '2',
      name: 'Group 2',
      members: ['user3', 'user4'],
      experiment_id: 'exp2',
      is_active: true,
      created_at: new Date(),
    },
  ]);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [groupSize, setGroupSize] = useState<string>('2');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    const newGroup = await createBreakoutGroup({
      name: newGroupName,
      members: [user?.id || ''],
    });

    if (newGroup) {
      setGroups(prev => [...prev, newGroup]);
      setNewGroupName('');
      setShowCreateDialog(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    const success = await joinBreakoutGroup(groupId);
    if (success) {
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, members: [...group.members, user?.id || ''] }
          : group
      ));
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    const success = await leaveBreakoutGroup(groupId);
    if (success) {
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, members: group.members.filter(id => id !== user?.id) }
          : group
      ));
    }
  };

  const handleMoveUser = async (userId: string, groupId: string) => {
    const success = await moveUserToGroup(userId, groupId);
    if (success) {
      setGroups(prev => {
        // Remove user from current group
        const updatedGroups = prev.map(group => ({
          ...group,
          members: group.members.filter(id => id !== userId)
        }));
        
        // Add user to new group
        return updatedGroups.map(group => 
          group.id === groupId 
            ? { ...group, members: [...group.members, userId] }
            : group
        );
      });
    }
  };

  const handleAutoAssign = async () => {
    const size = parseInt(groupSize, 10);
    if (isNaN(size) || size < 2) return;

    const success = await autoAssignGroups(size);
    if (success) {
      // In a real implementation, this would update from the server
      // For now, we'll simulate it
      const totalMembers = sessionMembers.length;
      const numGroups = Math.ceil(totalMembers / size);
      
      const newGroups: BreakoutGroup[] = [];
      for (let i = 0; i < numGroups; i++) {
        const startIdx = i * size;
        const endIdx = Math.min(startIdx + size, totalMembers);
        const groupMembers = sessionMembers.slice(startIdx, endIdx).map(m => m.user_id);
        
        newGroups.push({
          id: `auto-${i + 1}`,
          name: `Group ${i + 1}`,
          members: groupMembers,
          is_active: true,
          created_at: new Date(),
        });
      }
      
      setGroups(newGroups);
    }
  };

  const getUserName = (userId: string) => {
    const member = sessionMembers.find(m => m.user_id === userId);
    return member?.display_name || 'Unknown';
  };

  const isUserInGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.members.includes(user?.id || '') || false;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            Breakout Groups
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
              <UserPlus className="h-4 w-4 mr-1" />
              New Group
            </Button>
            
            <Select value={groupSize} onValueChange={setGroupSize}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Group Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 per group</SelectItem>
                <SelectItem value="3">3 per group</SelectItem>
                <SelectItem value="4">4 per group</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={handleAutoAssign}>
              <Shuffle className="h-4 w-4 mr-1" />
              Auto-Assign
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4 mr-1" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="list">
              <Layers className="h-4 w-4 mr-1" />
              List View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <Card key={group.id} className={`hover:shadow-md transition-shadow ${
                  isUserInGroup(group.id) ? 'border-blue-200 bg-blue-50' : ''
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge variant="outline">
                        {group.members.length} members
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Members */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {group.members.map((memberId) => (
                          <Avatar key={memberId} className="h-8 w-8 border-2 border-white">
                            <AvatarFallback>
                              {getUserName(memberId).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      {isUserInGroup(group.id) ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleLeaveGroup(group.id)}
                          className="flex-1"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Leave
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleJoinGroup(group.id)}
                          className="flex-1"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Create Group Card */}
              <AnimatePresence>
                {showCreateDialog && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Create New Group</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="group-name">Group Name</Label>
                          <Input
                            id="group-name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="Enter group name"
                          />
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button onClick={handleCreateGroup} className="flex-1">
                            Create Group
                          </Button>
                          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="pt-4">
            <div className="space-y-3">
              {groups.map((group) => (
                <div 
                  key={group.id} 
                  className={`p-3 rounded-lg border ${
                    isUserInGroup(group.id) ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{group.name}</h3>
                    <Badge variant="outline">
                      {group.members.length} members
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {group.members.map((memberId) => {
                      const member = sessionMembers.find(m => m.user_id === memberId);
                      
                      return (
                        <div key={memberId} className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 text-xs border">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member?.avatar_url} alt={member?.display_name} />
                            <AvatarFallback>
                              {getUserName(memberId).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{getUserName(memberId)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    {isUserInGroup(group.id) ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleLeaveGroup(group.id)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Leave
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleJoinGroup(group.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}