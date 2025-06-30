import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  MousePointer2,
  Pencil,
  Beaker,
  Calculator
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCollaborationStore } from '@/stores/useCollaborationStore';
import type { SessionMember, CursorPosition } from '@/lib/collaboration';

interface RealtimePresenceProps {
  showCursors?: boolean;
  showUserList?: boolean;
  className?: string;
}

export function RealtimePresence({ 
  showCursors = true, 
  showUserList = true,
  className = '' 
}: RealtimePresenceProps) {
  const {
    sessionMembers,
    cursorPositions,
    userActivities,
    broadcastCursorPosition,
    broadcastActivity,
  } = useCollaborationStore();

  const [localCursor, setLocalCursor] = useState<{ x: number; y: number } | null>(null);
  const [currentTool, setCurrentTool] = useState<string>('pointer');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      
      setLocalCursor({ x, y });
      broadcastCursorPosition(x, y, currentTool);
    };

    const handleToolChange = (e: KeyboardEvent) => {
      let newTool = currentTool;
      
      switch (e.key) {
        case '1': newTool = 'pointer'; break;
        case '2': newTool = 'pencil'; break;
        case '3': newTool = 'beaker'; break;
        case '4': newTool = 'calculator'; break;
      }
      
      if (newTool !== currentTool) {
        setCurrentTool(newTool);
        broadcastActivity('tool_change', { tool: newTool });
      }
    };

    if (showCursors) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('keydown', handleToolChange);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleToolChange);
    };
  }, [showCursors, currentTool, broadcastCursorPosition, broadcastActivity]);

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'pencil': return <Pencil className="h-3 w-3" />;
      case 'beaker': return <Beaker className="h-3 w-3" />;
      case 'calculator': return <Calculator className="h-3 w-3" />;
      default: return <MousePointer2 className="h-3 w-3" />;
    }
  };

  const getToolColor = (tool: string) => {
    switch (tool) {
      case 'pencil': return 'text-blue-500';
      case 'beaker': return 'text-green-500';
      case 'calculator': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getUserColor = (userId: string) => {
    const colors = [
      'border-red-500 bg-red-100',
      'border-blue-500 bg-blue-100',
      'border-green-500 bg-green-100',
      'border-yellow-500 bg-yellow-100',
      'border-purple-500 bg-purple-100',
      'border-pink-500 bg-pink-100',
      'border-indigo-500 bg-indigo-100',
      'border-orange-500 bg-orange-100',
    ];
    
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={className}>
      {/* Cursor Overlay */}
      {showCursors && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <AnimatePresence>
            {cursorPositions.map((cursor) => {
              const member = sessionMembers.find(m => m.user_id === cursor.user_id);
              if (!member) return null;

              return (
                <motion.div
                  key={cursor.user_id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  style={{
                    left: `${cursor.x}%`,
                    top: `${cursor.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute"
                >
                  <div className="flex items-center space-x-1">
                    <div className={`p-1 rounded-full border-2 ${getUserColor(cursor.user_id)}`}>
                      <div className={getToolColor(cursor.tool || 'pointer')}>
                        {getToolIcon(cursor.tool || 'pointer')}
                      </div>
                    </div>
                    <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {member.display_name}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* User List */}
      {showUserList && (
        <Card className="w-80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Online ({sessionMembers.filter(m => m.is_online).length})
              </h3>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sessionMembers
                .filter(member => member.is_online)
                .map((member) => {
                  const activity = userActivities.find(a => a.user_id === member.user_id);
                  const cursor = cursorPositions.find(c => c.user_id === member.user_id);
                  
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar_url} alt={member.display_name} />
                            <AvatarFallback className={getUserColor(member.user_id)}>
                              {member.display_name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Activity Indicator */}
                          {activity && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full border flex items-center justify-center">
                              <div className={`${getToolColor(activity.activity_type)} text-xs`}>
                                {getToolIcon(activity.activity_type)}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-sm">{member.display_name}</div>
                          <div className="text-xs text-gray-500 flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {member.role}
                            </Badge>
                            {activity && (
                              <span className="capitalize">
                                {activity.activity_type.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Media Status */}
                      <div className="flex items-center space-x-1">
                        {member.permissions.can_use_voice_chat && (
                          <div className="p-1 rounded bg-gray-100">
                            <Mic className="h-3 w-3 text-green-500" />
                          </div>
                        )}
                        {member.permissions.can_share_screen && (
                          <div className="p-1 rounded bg-gray-100">
                            <Video className="h-3 w-3 text-blue-500" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </div>

            {/* Offline Members */}
            {sessionMembers.some(m => !m.is_online) && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Offline ({sessionMembers.filter(m => !m.is_online).length})
                </h4>
                <div className="space-y-2">
                  {sessionMembers
                    .filter(member => !member.is_online)
                    .map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 opacity-60">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar_url} alt={member.display_name} />
                          <AvatarFallback className="text-xs">
                            {member.display_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm text-gray-500">{member.display_name}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}