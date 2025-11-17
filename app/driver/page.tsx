'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Navigation, Package, MapPin, Clock, DollarSign,
  TrendingUp, Send, Brain, CheckCircle, Route
} from 'lucide-react';
import { socketClient } from '@/lib/socket/client';
import { useAppStore } from '@/lib/store';
import { demoOrders, demoDrivers } from '@/lib/demo-data';
import type { Order, Message } from '@/lib/types';

export default function DriverPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

  const { orders, addOrder, messages, addMessage } = useAppStore();

  const currentDriver = demoDrivers[0]; // John Smith
  const conversationId = `driver-conv-${currentDriver.id}`;

  // Get deliveries assigned to this driver
  const myDeliveries = Array.from(orders.values()).filter(
    (order) => order.driverId === currentDriver.id
  );

  const activeDeliveries = myDeliveries.filter(
    (order) => !['delivered', 'cancelled'].includes(order.status)
  );

  const conversationMessages = messages.get(conversationId) || [];

  useEffect(() => {
    // Connect to socket
    const socket = socketClient.connect();
    setIsConnected(true);

    // Join conversation
    socketClient.joinConversation(conversationId);

    // Load demo orders
    demoOrders
      .filter((order) => order.driverId === currentDriver.id)
      .forEach((order) => addOrder(order));

    // Listen for messages
    socketClient.onMessageReceived((message: Message) => {
      if (message.conversationId === conversationId) {
        addMessage(conversationId, message);
      }
    });

    // Add welcome message
    if (conversationMessages.length === 0) {
      const welcomeMessage: Message = {
        id: `msg-welcome-${Date.now()}`,
        conversationId,
        senderId: 'ai-assistant',
        senderName: 'AI Assistant',
        senderRole: 'driver',
        content: `Hey ${currentDriver.name}! 🚴 I'm here to help with your deliveries. I can optimize routes, handle customer issues, and keep you updated. What do you need help with?`,
        timestamp: new Date(),
        isAI: true,
      };
      addMessage(conversationId, welcomeMessage);
    }

    // Auto-select first active delivery
    if (activeDeliveries.length > 0 && !selectedDelivery) {
      setSelectedDelivery(activeDeliveries[0].id);
    }

    return () => {
      socketClient.removeAllListeners();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    socketClient.sendMessage({
      conversationId,
      content: inputMessage,
      senderId: currentDriver.id,
      senderName: currentDriver.name,
      senderRole: 'driver',
    });

    setInputMessage('');
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    socketClient.updateOrderStatus(orderId, newStatus);
  };

  const selectedOrder = selectedDelivery
    ? myDeliveries.find((o) => o.id === selectedDelivery)
    : null;

  // Calculate earnings
  const totalEarnings = myDeliveries
    .filter((o) => o.status === 'delivered')
    .reduce((sum, order) => sum + order.totalAmount * 0.15, 0); // 15% commission

  const todayDeliveries = myDeliveries.filter(
    (o) => o.status === 'delivered'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600 mt-1">Delivery management with AI assistance</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? '🟢 Online' : '🔴 Offline'}
              </Badge>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
                <span className="text-2xl">{currentDriver.avatar}</span>
                <span className="font-medium">{currentDriver.name}</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Deliveries</p>
                  <p className="text-2xl font-bold">{activeDeliveries.length}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold">{todayDeliveries}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Earnings</p>
                  <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">4.8 ⭐</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Delivery Queue */}
          <div className="col-span-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-lg">Delivery Queue</h3>
              </div>

              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-3">
                  {activeDeliveries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No active deliveries</p>
                    </div>
                  ) : (
                    activeDeliveries.map((order) => (
                      <Card
                        key={order.id}
                        onClick={() => setSelectedDelivery(order.id)}
                        className={`p-3 cursor-pointer transition-all ${
                          selectedDelivery === order.id
                            ? 'border-2 border-green-500 bg-green-50'
                            : 'border hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">
                              {order.businessName}
                            </p>
                            <p className="text-xs text-gray-500">
                              #{order.id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-xs">
                            <Navigation className="w-3 h-3 mt-0.5 text-blue-600" />
                            <div className="flex-1">
                              <p className="font-medium">Pickup:</p>
                              <p className="text-gray-600">{order.pickupAddress}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-xs">
                            <MapPin className="w-3 h-3 mt-0.5 text-green-600" />
                            <div className="flex-1">
                              <p className="font-medium">Deliver to:</p>
                              <p className="text-gray-600">{order.deliveryAddress}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              ETA:{' '}
                              {order.estimatedDeliveryTime
                                ? new Date(
                                    order.estimatedDeliveryTime
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'TBD'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                          <span className="text-xs text-green-600 font-medium">
                            Earn: ${(order.totalAmount * 0.15).toFixed(2)}
                          </span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Selected Delivery Details + Route */}
          <div className="col-span-5">
            {selectedOrder ? (
              <div className="space-y-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Delivery Details</h3>
                    <Badge className="bg-green-600 text-white">
                      {selectedOrder.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Customer
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.customerName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Order Items
                      </p>
                      <div className="space-y-1">
                        {selectedOrder.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="text-gray-500">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Quick Actions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedOrder.status === 'ready_for_pickup' && (
                          <Button
                            onClick={() =>
                              handleStatusUpdate(selectedOrder.id, 'picked_up')
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-sm"
                          >
                            Mark Picked Up
                          </Button>
                        )}
                        {selectedOrder.status === 'picked_up' && (
                          <Button
                            onClick={() =>
                              handleStatusUpdate(selectedOrder.id, 'delivering')
                            }
                            className="bg-purple-600 hover:bg-purple-700 text-sm"
                          >
                            Start Delivery
                          </Button>
                        )}
                        {selectedOrder.status === 'delivering' && (
                          <Button
                            onClick={() =>
                              handleStatusUpdate(selectedOrder.id, 'delivered')
                            }
                            className="bg-green-600 hover:bg-green-700 text-sm"
                          >
                            Mark Delivered
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="text-sm"
                          onClick={() =>
                            setInputMessage(`Get navigation to ${selectedOrder.deliveryAddress}`)
                          }
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Navigate
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Route Visualization Placeholder */}
                <Card className="p-4 h-[400px]">
                  <div className="flex items-center gap-2 mb-4">
                    <Route className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">Optimized Route</h3>
                  </div>
                  <div className="h-[320px] bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-16 h-16 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Map visualization would go here</p>
                      <p className="text-xs mt-1">
                        AI-optimized route with traffic updates
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-4 h-[600px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>Select a delivery to view details</p>
                </div>
              </Card>
            )}
          </div>

          {/* AI Assistant Chat */}
          <div className="col-span-3">
            <Card className="h-[calc(100vh-250px)] flex flex-col">
              <div className="p-3 border-b bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  <div>
                    <h4 className="font-semibold text-sm">AI Assistant</h4>
                    <p className="text-xs text-green-100">Route & delivery help</p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {conversationMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.isAI ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 ${
                          message.isAI
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-green-600 text-white'
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
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-3 border-t bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    placeholder="Ask for route help, customer info..."
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInputMessage('Optimize my route')}
                  >
                    📍 Optimize Route
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setInputMessage("What's the fastest delivery?")}
                  >
                    ⚡ Fastest Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
