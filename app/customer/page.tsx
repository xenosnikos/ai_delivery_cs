'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, ShoppingBag, MapPin, Clock } from 'lucide-react';
import { socketClient } from '@/lib/socket/client';
import { useAppStore } from '@/lib/store';
import type { Message } from '@/lib/types';
import { demoCustomers, demoOrders } from '@/lib/demo-data';

export default function CustomerPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, addMessage, orders, addOrder } = useAppStore();

  const conversationId = 'customer-conv-1';
  const currentUser = demoCustomers[0];

  const conversationMessages = messages.get(conversationId) || [];
  const userOrders = Array.from(orders.values()).filter(
    (order) => order.customerId === currentUser.id
  );

  useEffect(() => {
    // Connect to socket
    const socket = socketClient.connect();
    setIsConnected(true);

    // Join conversation
    socketClient.joinConversation(conversationId);

    // Listen for messages
    socketClient.onMessageReceived((message: Message) => {
      if (message.conversationId === conversationId) {
        addMessage(conversationId, message);
        scrollToBottom();
      }
    });

    // Load demo orders
    demoOrders
      .filter((order) => order.customerId === currentUser.id)
      .forEach((order) => addOrder(order));

    // Add welcome message
    if (conversationMessages.length === 0) {
      const welcomeMessage: Message = {
        id: `msg-welcome-${Date.now()}`,
        conversationId,
        senderId: 'ai-assistant',
        senderName: 'AI Assistant',
        senderRole: 'customer',
        content: `Hi ${currentUser.name}! 👋 I'm your AI assistant. I can help you discover restaurants, place orders, track deliveries, and answer any questions you have. What would you like to do today?`,
        timestamp: new Date(),
        isAI: true,
      };
      addMessage(conversationId, welcomeMessage);
    }

    return () => {
      socketClient.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);

    socketClient.sendMessage({
      conversationId,
      content: inputMessage,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'customer',
    });

    setInputMessage('');
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Wolt Customer</h1>
              <p className="text-gray-600 mt-1">Order food with AI assistance</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </Badge>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-2xl">{currentUser.avatar}</span>
                <span className="font-medium">{currentUser.name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-sm text-blue-100">Always here to help</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.isAI
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium opacity-70">
                            {message.senderName}
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
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about restaurants, place an order, track delivery..."
                    className="flex-1"
                    disabled={isSending || !isConnected}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isSending || !isConnected}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Try: "Show me pizza places" or "Track my order"
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar - Active Orders */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Your Orders</h3>
              </div>

              {userOrders.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No active orders
                </p>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((order) => (
                    <Card key={order.id} className="p-3 border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{order.businessName}</h4>
                          <p className="text-xs text-gray-500">
                            Order #{order.id.slice(-6)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            order.status === 'delivered'
                              ? 'default'
                              : order.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-1 mb-2">
                        {order.items.slice(0, 2).map((item) => (
                          <p key={item.id} className="text-xs text-gray-600">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{order.items.length - 2} more items
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {order.estimatedDeliveryTime
                              ? new Date(order.estimatedDeliveryTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                              : 'TBD'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">
                            {order.deliveryAddress.split(',')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm font-semibold">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setInputMessage('Show me nearby pizza places')}
                >
                  🍕 Find Pizza
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setInputMessage('Show me healthy food options')}
                >
                  🥗 Healthy Options
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setInputMessage('Track my latest order')}
                >
                  📦 Track Order
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
