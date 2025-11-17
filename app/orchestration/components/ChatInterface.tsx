'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageSquare } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { socketClient } from '@/lib/socket/client';
import type { Message } from '@/lib/types';

interface ChatInterfaceProps {
  persona: 'customer' | 'business' | 'driver';
  conversationId: string;
  senderId: string;
  senderName: string;
  headerColor: string;
  headerBgColor: string;
  buttonColor: string;
  placeholder?: string;
}

export default function ChatInterface({
  persona,
  conversationId,
  senderId,
  senderName,
  headerColor,
  headerBgColor,
  buttonColor,
  placeholder = 'Type your message...',
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, addMessage } = useAppStore();
  const conversationMessages = messages.get(conversationId) || [];

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages.length]);

  useEffect(() => {
    // Join this conversation
    socketClient.joinConversation(conversationId);

    // Listen for messages
    const handleMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        addMessage(conversationId, message);
      }
    };

    socketClient.onMessageReceived(handleMessage);

    return () => {
      // Cleanup if needed
    };
  }, [conversationId, addMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    socketClient.sendMessage({
      conversationId,
      content: inputMessage,
      senderId,
      senderName,
      senderRole: persona,
    });

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPersonaIcon = () => {
    switch (persona) {
      case 'customer':
        return '👤';
      case 'business':
        return '🏪';
      case 'driver':
        return '🚗';
    }
  };

  const getPersonaLabel = () => {
    switch (persona) {
      case 'customer':
        return 'Customer Support Chat';
      case 'business':
        return 'Business Partner Chat';
      case 'driver':
        return 'Driver Support Chat';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className={`p-4 border-b ${headerBgColor} ${headerColor} rounded-t-lg`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getPersonaIcon()}</span>
          <div>
            <h4 className="font-semibold text-sm">{senderName}</h4>
            <p className="text-xs opacity-80">{getPersonaLabel()}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversationMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderRole === persona ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.senderRole === persona
                      ? buttonColor
                      : message.isAI
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium opacity-70">
                      {message.senderName}
                      {message.isAI && ' 🤖'}
                    </span>
                    <span className="text-xs opacity-50">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 text-sm"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            size="sm"
            className={buttonColor}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
