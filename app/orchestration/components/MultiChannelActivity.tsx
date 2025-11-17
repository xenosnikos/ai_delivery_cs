'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare, Phone, Bell, Mail, CheckCircle, XCircle, Clock
} from 'lucide-react';

interface OrchestrationEvent {
  id: string;
  type: 'event' | 'decision' | 'action' | 'escalation';
  timestamp: Date;
  actor: 'customer' | 'business' | 'driver' | 'system';
  title: string;
  description: string;
  metadata?: any;
  reasoning?: {
    signals: string[];
    rules: string[];
    decision: string;
    confidence: number;
  };
  actions?: {
    channel: 'sms' | 'call' | 'push' | 'chat';
    target: string;
    message: string;
    status: 'pending' | 'sent' | 'failed';
    cost: number;
  }[];
}

interface MultiChannelActivityProps {
  events: OrchestrationEvent[];
}

export default function MultiChannelActivity({ events }: MultiChannelActivityProps) {
  // Extract all actions from events
  const allActions = events
    .filter(event => event.actions && event.actions.length > 0)
    .flatMap(event =>
      event.actions!.map(action => ({
        ...action,
        eventId: event.id,
        eventTitle: event.title,
        timestamp: event.timestamp
      }))
    );

  // Group by channel
  const smsActions = allActions.filter(a => a.channel === 'sms');
  const callActions = allActions.filter(a => a.channel === 'call');
  const pushActions = allActions.filter(a => a.channel === 'push');
  const chatActions = allActions.filter(a => a.channel === 'chat');

  const getStatusIcon = (status: string) => {
    if (status === 'sent') return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-yellow-600 animate-spin" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'sent') return 'bg-green-100 text-green-800 border-green-300';
    if (status === 'failed') return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderActionList = (actions: any[], emptyMessage: string) => {
    if (actions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Card key={index} className="p-4 border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(action.status)}
                <div>
                  <p className="font-semibold text-sm">{action.target}</p>
                  <p className="text-xs text-gray-500">{formatTime(action.timestamp)}</p>
                </div>
              </div>
              <Badge className={getStatusColor(action.status)}>
                {action.status.toUpperCase()}
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-700">{action.message}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Related to: {action.eventTitle}</span>
              <div className="flex items-center gap-3">
                <span>Cost: ${action.cost.toFixed(3)}</span>
                {action.channel === 'call' && <span>Duration: ~15s</span>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const totalCost = allActions.reduce((sum, action) => sum + action.cost, 0);
  const sentCount = allActions.filter(a => a.status === 'sent').length;
  const failedCount = allActions.filter(a => a.status === 'failed').length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Multi-Channel Activity</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Actions</p>
            <p className="text-lg font-bold">{allActions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Success Rate</p>
            <p className="text-lg font-bold text-green-600">
              {allActions.length > 0
                ? Math.round((sentCount / allActions.length) * 100)
                : 0}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Total Cost</p>
            <p className="text-lg font-bold text-purple-600">${totalCost.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="text-sm">
            All ({allActions.length})
          </TabsTrigger>
          <TabsTrigger value="sms" className="text-sm">
            📱 SMS ({smsActions.length})
          </TabsTrigger>
          <TabsTrigger value="call" className="text-sm">
            📞 Call ({callActions.length})
          </TabsTrigger>
          <TabsTrigger value="push" className="text-sm">
            🔔 Push ({pushActions.length})
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-sm">
            💬 Chat ({chatActions.length})
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[300px] mt-4">
          <TabsContent value="all" className="mt-0">
            {renderActionList(allActions, 'No communication sent yet')}
          </TabsContent>

          <TabsContent value="sms" className="mt-0">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">SMS Messages</span>
              </div>
              <p className="text-xs text-blue-700">
                Direct text messages sent via Twilio. Average delivery time: 2-5 seconds.
              </p>
            </div>
            {renderActionList(smsActions, 'No SMS messages sent yet')}
          </TabsContent>

          <TabsContent value="call" className="mt-0">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Voice Calls</span>
              </div>
              <p className="text-xs text-green-700">
                Automated voice calls with text-to-speech. Includes voicemail capability.
              </p>
            </div>
            {renderActionList(
              callActions.map(action => ({
                ...action,
                message: action.status === 'sent'
                  ? `Call connected. Message delivered via TTS.`
                  : action.status === 'failed'
                  ? `Call failed - No answer. Voicemail left.`
                  : `Attempting outbound call...`
              })),
              'No voice calls made yet'
            )}
          </TabsContent>

          <TabsContent value="push" className="mt-0">
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">Push Notifications</span>
              </div>
              <p className="text-xs text-purple-700">
                In-app notifications delivered instantly. Highest engagement rate.
              </p>
            </div>
            {renderActionList(pushActions, 'No push notifications sent yet')}
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-900">Chat Messages</span>
              </div>
              <p className="text-xs text-orange-700">
                Platform chat messages to business partners and drivers.
              </p>
            </div>
            {renderActionList(chatActions, 'No chat messages sent yet')}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Summary Stats */}
      {allActions.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 mb-1">Delivered</p>
              <p className="text-2xl font-bold text-green-700">{sentCount}</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-700">{failedCount}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Avg Cost/Action</p>
              <p className="text-2xl font-bold text-blue-700">
                ${allActions.length > 0 ? (totalCost / allActions.length).toFixed(3) : '0.000'}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Time Saved</p>
              <p className="text-2xl font-bold text-purple-700">
                {Math.round(allActions.length * 2.5)}min
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
