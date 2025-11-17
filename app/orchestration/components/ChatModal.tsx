'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ChatInterface from './ChatInterface';

interface ChatModalProps {
  persona: 'customer' | 'business' | 'driver';
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ persona, isOpen, onClose }: ChatModalProps) {
  // Generate conversationId only on client side to avoid hydration mismatch
  const [conversationId, setConversationId] = useState<string>('');

  useEffect(() => {
    // Only generate new conversationId when modal opens
    if (isOpen && !conversationId) {
      setConversationId(`orchestration-${persona}-${Date.now()}`);
    }
  }, [isOpen, persona, conversationId]);

  // Static config without timestamp (avoids hydration issues)
  const getConfig = () => {
    switch (persona) {
      case 'customer':
        return {
          senderId: 'customer-001',
          senderName: 'Sarah Johnson',
          headerColor: 'text-white',
          headerBgColor: 'bg-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
          placeholder: 'Ask Wolt support anything...',
          title: '💬 Customer Chat',
        };
      case 'business':
        return {
          senderId: 'business-001',
          senderName: 'Pizza Palace',
          headerColor: 'text-white',
          headerBgColor: 'bg-orange-600',
          buttonColor: 'bg-orange-600 hover:bg-orange-700 text-white',
          placeholder: 'Send message to Wolt...',
          title: '🏪 Business Chat',
        };
      case 'driver':
        return {
          senderId: 'driver-001',
          senderName: 'Mike Chen',
          headerColor: 'text-white',
          headerBgColor: 'bg-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-700 text-white',
          placeholder: 'Contact Wolt support...',
          title: '🚗 Driver Chat',
        };
    }
  };

  const config = getConfig();

  // Don't render chat until we have a conversationId (client-side only)
  if (!conversationId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <ChatInterface
          persona={persona}
          conversationId={conversationId}
          senderId={config.senderId}
          senderName={config.senderName}
          headerColor={config.headerColor}
          headerBgColor={config.headerBgColor}
          buttonColor={config.buttonColor}
          placeholder={config.placeholder}
        />
      </DialogContent>
    </Dialog>
  );
}
