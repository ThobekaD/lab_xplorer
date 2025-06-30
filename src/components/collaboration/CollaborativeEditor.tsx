import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Users, 
  MessageSquare, 
  Save, 
  History,
  Eye,
  Edit3,
  Download,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollaborationStore } from '@/stores/useCollaborationStore';
import { useAuthStore } from '@/stores/useAuthStore';

interface CollaborativeEditorProps {
  documentId?: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

interface TextOperation {
  type: 'insert' | 'delete' | 'retain';
  length?: number;
  text?: string;
  attributes?: Record<string, any>;
}

interface DocumentChange {
  id: string;
  user_id: string;
  user_name: string;
  operations: TextOperation[];
  timestamp: Date;
  cursor_position: number;
}

export function CollaborativeEditor({ 
  documentId, 
  initialContent = '', 
  onContentChange,
  className = '' 
}: CollaborativeEditorProps) {
  const { user } = useAuthStore();
  const {
    sessionMembers,
    executeAction,
    actionHistory,
  } = useCollaborationStore();

  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [documentChanges, setDocumentChanges] = useState<DocumentChange[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastContentRef = useRef(initialContent);
  const operationQueueRef = useRef<TextOperation[]>([]);

  useEffect(() => {
    setContent(initialContent);
    lastContentRef.current = initialContent;
  }, [initialContent]);

  // Operational Transform implementation
  const applyOperation = (text: string, operation: TextOperation): string => {
    switch (operation.type) {
      case 'insert':
        return text.slice(0, cursorPosition) + (operation.text || '') + text.slice(cursorPosition);
      case 'delete':
        return text.slice(0, cursorPosition) + text.slice(cursorPosition + (operation.length || 0));
      case 'retain':
        return text;
      default:
        return text;
    }
  };

  const transformOperation = (op1: TextOperation, op2: TextOperation): TextOperation => {
    // Simplified OT - in production, use a proper OT library
    if (op1.type === 'insert' && op2.type === 'insert') {
      // Handle concurrent insertions
      return op1;
    }
    return op1;
  };

  const generateOperations = (oldText: string, newText: string): TextOperation[] => {
    const operations: TextOperation[] = [];
    
    // Simple diff algorithm - in production, use a proper diff library
    if (oldText !== newText) {
      if (newText.length > oldText.length) {
        // Text was inserted
        operations.push({
          type: 'insert',
          text: newText.slice(oldText.length),
        });
      } else if (newText.length < oldText.length) {
        // Text was deleted
        operations.push({
          type: 'delete',
          length: oldText.length - newText.length,
        });
      }
    }
    
    return operations;
  };

  const handleContentChange = (newContent: string) => {
    const operations = generateOperations(lastContentRef.current, newContent);
    
    if (operations.length > 0) {
      const change: DocumentChange = {
        id: crypto.randomUUID(),
        user_id: user?.id || '',
        user_name: user?.display_name || 'Unknown',
        operations,
        timestamp: new Date(),
        cursor_position: cursorPosition,
      };

      // Apply locally
      setContent(newContent);
      setDocumentChanges(prev => [...prev, change]);
      lastContentRef.current = newContent;

      // Broadcast to other users
      executeAction('document_edit', {
        document_id: documentId,
        operations,
        cursor_position: cursorPosition,
      });

      onContentChange?.(newContent);
    }
  };

  const handleCursorChange = () => {
    if (textareaRef.current) {
      const newPosition = textareaRef.current.selectionStart;
      setCursorPosition(newPosition);
      
      executeAction('cursor_move', {
        document_id: documentId,
        position: newPosition,
      });
    }
  };

  const addComment = (text: string, position: number) => {
    const comment = {
      id: crypto.randomUUID(),
      user_id: user?.id,
      user_name: user?.display_name,
      text,
      position,
      timestamp: new Date(),
      resolved: false,
    };

    setComments(prev => [...prev, comment]);
    
    executeAction('add_comment', {
      document_id: documentId,
      comment,
    });
  };

  const exportDocument = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-notebook-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUserColor = (userId: string) => {
    const colors = [
      'border-red-500 bg-red-100 text-red-800',
      'border-blue-500 bg-blue-100 text-blue-800',
      'border-green-500 bg-green-100 text-green-800',
      'border-yellow-500 bg-yellow-100 text-yellow-800',
      'border-purple-500 bg-purple-100 text-purple-800',
    ];
    
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Collaborative Lab Notebook
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* Active Collaborators */}
              <div className="flex -space-x-2">
                {sessionMembers
                  .filter(member => member.is_online)
                  .slice(0, 3)
                  .map((member) => (
                    <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                      <AvatarImage src={member.avatar_url} alt={member.display_name} />
                      <AvatarFallback className={`text-xs ${getUserColor(member.user_id)}`}>
                        {member.display_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                {sessionMembers.filter(m => m.is_online).length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                    +{sessionMembers.filter(m => m.is_online).length - 3}
                  </div>
                )}
              </div>

              <Button variant="outline" size="sm" onClick={exportDocument}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onSelect={handleCursorChange}
                  onFocus={() => setIsEditing(true)}
                  onBlur={() => setIsEditing(false)}
                  placeholder="Start documenting your experiment..."
                  className="min-h-[400px] font-mono text-sm resize-none"
                />

                {/* Real-time Cursors */}
                <div className="absolute inset-0 pointer-events-none">
                  {collaborators.map((collaborator) => (
                    <motion.div
                      key={collaborator.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        left: `${collaborator.cursor_position * 0.6}ch`, // Approximate character width
                        top: `${Math.floor(collaborator.cursor_position / 80) * 1.5}em`, // Approximate line height
                      }}
                      className="w-0.5 h-5 bg-blue-500"
                    >
                      <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                        {collaborator.user_name}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Editing Indicator */}
                {isEditing && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Editing
                    </Badge>
                  </div>
                )}
              </div>

              {/* Markdown Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </h4>
                <div className="prose prose-sm max-w-none">
                  {content.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {documentChanges.map((change) => (
                  <div key={change.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={getUserColor(change.user_id)}>
                        {change.user_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{change.user_name}</span>
                        <span className="text-xs text-gray-500">
                          {change.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {change.operations.map((op, index) => (
                          <span key={index}>
                            {op.type === 'insert' && `Added "${op.text}"`}
                            {op.type === 'delete' && `Deleted ${op.length} characters`}
                            {op.type === 'retain' && 'Formatting change'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{comment.user_name}</span>
                      <span className="text-xs text-gray-500">
                        {comment.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Position: {comment.position}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Textarea
                  placeholder="Add a comment..."
                  className="flex-1"
                  rows={2}
                />
                <Button size="sm">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Comment
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}