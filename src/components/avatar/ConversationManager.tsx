//src/components/avatar/ConversationManager.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Loader2, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTavusStore } from '@/stores/useTavusStore';
import { conversationStarters } from '@/lib/tavus';
import type { ConversationMessage, ConversationContext } from '@/lib/tavus';

interface ConversationManagerProps {
  context?: ConversationContext;
  onMessageSent?: (message: string) => void;
  className?: string;
}

export function ConversationManager({ 
  context, 
  onMessageSent,
  className = '' 
}: ConversationManagerProps) {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    currentPersona,
    conversationHistory,
    isConnected,
    sendMessage,
    startListening,
    stopListening,
  } = useTavusStore();

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentPersona) return;

    const userMessage = message.trim();
    setMessage('');
    setIsTyping(true);

    try {
      await sendMessage(userMessage, context);
      onMessageSent?.(userMessage);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      startListening();
      setIsListening(true);
    }
  };

  const handleQuickStart = (starter: string) => {
    setMessage(starter);
    inputRef.current?.focus();
  };

  const getMessageIcon = (type: 'user' | 'avatar') => {
    return type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />;
  };

  const getMessageBgColor = (type: 'user' | 'avatar') => {
    return type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900';
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'encouraging': return 'border-l-green-400';
      case 'concerned': return 'border-l-yellow-400';
      case 'excited': return 'border-l-purple-400';
      default: return 'border-l-gray-300';
    }
  };

  const subject = currentPersona?.subject || 'general';
  const starters = conversationStarters[subject as keyof typeof conversationStarters] || [];

  return (
    <Card className={`flex flex-col h-96 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Chat with {currentPersona?.name || 'AI Assistant'}
          </span>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Connected' : 'Offline'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4">
            {conversationHistory.length === 0 && (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Start a conversation with {currentPersona?.name}
                </p>
                
                {/* Quick Starters */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {starters.slice(0, 3).map((starter, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickStart(starter)}
                        className="text-xs"
                      >
                        "{starter}"
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {conversationHistory.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.type === 'avatar' ? 'order-2' : ''}`}>
                  <div className={`flex items-start space-x-2 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getMessageBgColor(msg.type)}`}>
                      {getMessageIcon(msg.type)}
                    </div>
                    <div className={`rounded-lg p-3 ${getMessageBgColor(msg.type)} ${msg.type === 'avatar' ? `border-l-4 ${getEmotionColor(msg.emotion)}` : ''}`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${currentPersona?.name || 'AI Assistant'} a question...`}
                disabled={!isConnected}
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceInput}
                disabled={!isConnected}
                className={`absolute right-1 top-1/2 transform -translate-y-1/2 ${isListening ? 'text-red-500' : 'text-gray-400'}`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || !isConnected || isTyping}
              size="sm"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Actions */}
          {conversationHistory.length > 0 && starters.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {starters.slice(0, 2).map((starter, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickStart(starter)}
                  className="text-xs h-6 px-2"
                >
                  {starter.slice(0, 30)}...
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}