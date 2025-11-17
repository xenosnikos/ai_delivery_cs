'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Store, Users, MessageSquare, Activity, Brain,
  Code, Clock, Workflow, ChevronRight, DollarSign, Timer
} from 'lucide-react';
import { socketClient } from '@/lib/socket/client';
import { useAppStore } from '@/lib/store';
import { demoOrders, demoCustomers, demoConversations } from '@/lib/demo-data';
import ChatPanel from './components/ChatPanel';
import AIReasoningPanel from './components/AIReasoningPanel';
import OrderGrid from './components/OrderGrid';

export default function BusinessPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeView, setActiveView] = useState<'activity' | 'timeline' | 'flow' | 'debug'>('activity');

  const {
    orders,
    addOrder,
    selectedUserInBusiness,
    setSelectedUserInBusiness,
    conversations,
    addConversation,
    messages,
    addMessage,
  } = useAppStore();

  const businessId = 'business-1'; // Pizza Palace
  const businessName = 'Pizza Palace 🍕';

  // Get orders for this business
  const businessOrders = Array.from(orders.values()).filter(
    (order) => order.businessId === businessId
  );

  // Get customers who have orders with this business
  const businessCustomers = demoCustomers.filter((customer) =>
    businessOrders.some((order) => order.customerId === customer.id)
  );

  useEffect(() => {
    // Connect to socket
    const socket = socketClient.connect();
    setIsConnected(true);

    // Load demo data
    demoOrders
      .filter((order) => order.businessId === businessId)
      .forEach((order) => addOrder(order));

    demoConversations.forEach((conv) => {
      addConversation(conv);
      conv.messages.forEach((msg) => addMessage(conv.id, msg));
    });

    // Auto-select first customer
    if (businessCustomers.length > 0 && !selectedUserInBusiness) {
      setSelectedUserInBusiness(businessCustomers[0].id);
    }

    return () => {
      socketClient.removeAllListeners();
    };
  }, []);

  // Calculate stats
  const stats = {
    totalOrders: businessOrders.length,
    activeOrders: businessOrders.filter((o) =>
      !['delivered', 'cancelled'].includes(o.status)
    ).length,
    revenue: businessOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    avgOrderValue: businessOrders.length > 0
      ? businessOrders.reduce((sum, order) => sum + order.totalAmount, 0) / businessOrders.length
      : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{businessName}</h1>
              <p className="text-gray-600 mt-1">Business Dashboard with AI Insights</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </Badge>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <Store className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold">{stats.activeOrders}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue Today</p>
                  <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Order</p>
                  <p className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Customer List */}
          <div className="col-span-2">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold">Customers</h3>
              </div>
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-2">
                  {businessCustomers.map((customer) => {
                    const customerOrders = businessOrders.filter(
                      (order) => order.customerId === customer.id
                    );
                    const hasUnread = false; // Can be enhanced with unread message tracking

                    return (
                      <button
                        key={customer.id}
                        onClick={() => setSelectedUserInBusiness(customer.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedUserInBusiness === customer.id
                            ? 'bg-orange-100 border-2 border-orange-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{customer.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {customer.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {customerOrders.length} order{customerOrders.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          {hasUnread && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="col-span-10">
            <div className="grid grid-cols-12 gap-6">
              {/* Order Grid + Chat */}
              <div className="col-span-7">
                <Card className="p-4 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-lg">Order Queue</h3>
                  </div>
                  <OrderGrid orders={businessOrders} />
                </Card>

                {selectedUserInBusiness && (
                  <ChatPanel
                    customerId={selectedUserInBusiness}
                    businessId={businessId}
                  />
                )}
              </div>

              {/* AI Reasoning Panel */}
              <div className="col-span-5">
                <Card className="p-4 h-[calc(100vh-250px)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h3 className="font-semibold text-lg">AI Reasoning</h3>
                    </div>
                    <Tabs value={activeView} onValueChange={(v: any) => setActiveView(v)} className="w-auto">
                      <TabsList className="grid grid-cols-4">
                        <TabsTrigger value="activity" className="text-xs px-2">
                          <Activity className="w-3 h-3" />
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="text-xs px-2">
                          <Timer className="w-3 h-3" />
                        </TabsTrigger>
                        <TabsTrigger value="flow" className="text-xs px-2">
                          <Workflow className="w-3 h-3" />
                        </TabsTrigger>
                        <TabsTrigger value="debug" className="text-xs px-2">
                          <Code className="w-3 h-3" />
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <Separator className="mb-4" />

                  {selectedUserInBusiness ? (
                    <AIReasoningPanel
                      conversationId={`customer-conv-${selectedUserInBusiness}`}
                      activeView={activeView}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[calc(100%-100px)] text-gray-400">
                      <div className="text-center">
                        <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Select a customer to view AI reasoning</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
