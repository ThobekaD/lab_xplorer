import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Mic, 
  MicOff, 
  Send, 
  Paperclip, 
  Smile,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  MoreVertical,
  Download,
  Play,
  Pause
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollaborationStore } from '@/stores/useCollaborationStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface Message {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  type: 'text' | 'voice' | 'file' | 'system';
  timestamp: Date;
  file_url?: string;
  file_name?: string;
  voice_duration?: number;
  mentions?: string[];
  reactions?: { emoji: string; users: string[] }[];
}

interface VoiceCall {
  id: string;
  participants: string[];
  is_active: boolean;
  started_at: Date;
}

export function CommunicationHub() {
  const { user } = useAuthStore();
  const {
    sessionMembers,
    executeAction,
    recordVoiceNote,
  } = useCollaborationStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: user.display_name || 'Unknown',
      user_avatar: user.avatar_url,
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      mentions: extractMentions(newMessage),
      reactions: [],
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Broadcast to other users
    await executeAction('send_message', {
      message,
    });
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendVoiceMessage(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    if (!user) return;

    // Upload voice note
    const voiceNoteId = await recordVoiceNote(audioBlob);
    
    if (voiceNoteId) {
      const message: Message = {
        id: crypto.randomUUID(),
        user_id: user.id,
        user_name: user.display_name || 'Unknown',
        user_avatar: user.avatar_url,
        content: 'Voice message',
        type: 'voice',
        timestamp: new Date(),
        voice_duration: 0, // Would be calculated
        reactions: [],
      };

      setMessages(prev => [...prev, message]);

      await executeAction('send_voice_message', {
        message,
        voice_note_id: voiceNoteId,
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // In a real implementation, upload to storage
    const message: Message = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: user.display_name || 'Unknown',
      user_avatar: user.avatar_url,
      content: `Shared file: ${file.name}`,
      type: 'file',
      timestamp: new Date(),
      file_name: file.name,
      file_url: URL.createObjectURL(file),
      reactions: [],
    };

    setMessages(prev => [...prev, message]);

    await executeAction('send_file', {
      message,
    });
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(user.id)) {
            // Remove reaction
            existingReaction.users = existingReaction.users.filter(id => id !== user.id);
            if (existingReaction.users.length === 0) {
              msg.reactions = msg.reactions?.filter(r => r.emoji !== emoji);
            }
          } else {
            // Add reaction
            existingReaction.users.push(user.id);
          }
        } else {
          // New reaction
          msg.reactions = [...(msg.reactions || []), { emoji, users: [user.id] }];
        }
      }
      return msg;
    }));

    await executeAction('add_reaction', {
      message_id: messageId,
      emoji,
      user_id: user.id,
    });
  };

  const startVoiceCall = async () => {
    setIsInCall(true);
    await executeAction('start_voice_call', {
      participants: sessionMembers.map(m => m.user_id),
    });
  };

  const endVoiceCall = async () => {
    setIsInCall(false);
    await executeAction('end_voice_call', {});
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const playVoiceMessage = (messageId: string) => {
    if (playingVoiceId === messageId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(messageId);
      // In a real implementation, play the audio
      setTimeout(() => setPlayingVoiceId(null), 3000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserColor = (userId: string) => {
    const colors = [
      'text-red-600',
      'text-blue-600',
      'text-green-600',
      'text-yellow-600',
      'text-purple-600',
      'text-pink-600',
    ];
    
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Team Chat
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {!isInCall ? (
              <Button variant="outline" size="sm" onClick={startVoiceCall}>
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            ) : (
              <div className="flex items-center space-x-1">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="sm"
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  variant={isVideoEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button variant="destructive" size="sm" onClick={endVoiceCall}>
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-3 ${
                  message.user_id === user?.id ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.user_avatar} alt={message.user_name} />
                  <AvatarFallback className={getUserColor(message.user_id)}>
                    {message.user_name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className={`max-w-[80%] ${
                  message.user_id === user?.id 
                    ? 'bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                    : 'bg-gray-100 text-gray-900 rounded-tl-lg rounded-tr-lg rounded-br-lg'
                } p-3 relative`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${
                      message.user_id === user?.id ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {message.user_id === user?.id ? 'You' : message.user_name}
                    </span>
                    <span className={`text-xs ${
                      message.user_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  {message.type === 'text' && (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}

                  {message.type === 'voice' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playVoiceMessage(message.id)}
                        className={message.user_id === user?.id ? 'text-white' : ''}
                      >
                        {playingVoiceId === message.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            message.user_id === user?.id ? 'bg-blue-200' : 'bg-blue-500'
                          } rounded-full`}
                          style={{ 
                            width: playingVoiceId === message.id ? '100%' : '0%',
                            transition: 'width 3s linear'
                          }}
                        />
                      </div>
                      <span className={`text-xs ${
                        message.user_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.voice_duration || '0:00'}
                      </span>
                    </div>
                  )}

                  {message.type === 'file' && (
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm flex-1 truncate">{message.file_name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(message.file_url, '_blank')}
                        className={message.user_id === user?.id ? 'text-white' : ''}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.reactions.map((reaction, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`text-xs cursor-pointer ${
                            message.user_id === user?.id 
                              ? 'bg-blue-400 text-white' 
                              : 'bg-gray-200'
                          }`}
                          onClick={() => addReaction(message.id, reaction.emoji)}
                        >
                          {reaction.emoji} {reaction.users.length}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => addReaction(message.id, '👍')}>
                      React 👍
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addReaction(message.id, '❤️')}>
                      React ❤️
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addReaction(message.id, '😂')}>
                      React 😂
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addReaction(message.id, '🎉')}>
                      React 🎉
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Voice Call Indicator */}
        <AnimatePresence>
          {isInCall && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2 bg-green-50 border-t border-green-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                  <span className="text-sm text-green-800">Voice call active</span>
                </div>
                <div className="text-xs text-gray-500">
                  {sessionMembers.filter(m => m.is_online).length} participants
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className="flex-shrink-0"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </Button>

            <div className="relative flex-1">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                disabled={isRecording}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
              >
                <Smile className="h-4 w-4 text-gray-400" />
              </Button>
            </div>

            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isRecording}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Recording Indicator */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 flex items-center justify-between bg-red-50 p-2 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                  <span className="text-sm text-red-800">Recording voice message...</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopVoiceRecording}
                  className="text-red-600"
                >
                  Stop
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}