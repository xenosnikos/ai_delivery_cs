'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User, Store, Car, Brain, Zap, CheckCircle, AlertCircle, Clock
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

interface EventTimelineProps {
  events: OrchestrationEvent[];
  onEventSelect: (event: OrchestrationEvent) => void;
  selectedEventId?: string;
}

export default function EventTimeline({ events, onEventSelect, selectedEventId }: EventTimelineProps) {
  const getActorIcon = (actor: string) => {
    const icons: Record<string, React.ReactElement> = {
      customer: <User className="w-4 h-4 text-blue-600" />,
      business: <Store className="w-4 h-4 text-orange-600" />,
      driver: <Car className="w-4 h-4 text-green-600" />,
      system: <Brain className="w-4 h-4 text-purple-600" />
    };
    return icons[actor] || <Zap className="w-4 h-4 text-gray-600" />;
  };

  const getActorColor = (actor: string) => {
    const colors: Record<string, string> = {
      customer: 'bg-blue-100 border-blue-300 text-blue-700',
      business: 'bg-orange-100 border-orange-300 text-orange-700',
      driver: 'bg-green-100 border-green-300 text-green-700',
      system: 'bg-purple-100 border-purple-300 text-purple-700'
    };
    return colors[actor] || 'bg-gray-100 border-gray-300 text-gray-700';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      event: <Zap className="w-5 h-5 text-yellow-600" />,
      decision: <Brain className="w-5 h-5 text-purple-600" />,
      action: <CheckCircle className="w-5 h-5 text-green-600" />,
      escalation: <AlertCircle className="w-5 h-5 text-red-600" />
    };
    return icons[type] || <Clock className="w-5 h-5 text-gray-600" />;
  };

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      event: { label: 'EVENT', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      decision: { label: 'REASONING', color: 'bg-purple-100 text-purple-800 border-purple-300' },
      action: { label: 'ACTION', color: 'bg-green-100 text-green-800 border-green-300' },
      escalation: { label: 'ESCALATED', color: 'bg-red-100 text-red-800 border-red-300' }
    };
    return badges[type] || badges.event;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getElapsedTime = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <Card className="p-4 h-[calc(100vh-300px)]">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg">Event Timeline</h3>
        <Badge variant="secondary" className="ml-auto">
          {events.length} events
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100%-60px)]">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
            <Clock className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm font-medium">No events yet</p>
            <p className="text-xs mt-1">Trigger a scenario to see orchestration in action</p>
          </div>
        ) : (
          <div className="space-y-3 relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 via-blue-300 to-green-300" />

            {events.map((event, index) => {
              const typeBadge = getTypeBadge(event.type);
              const isSelected = selectedEventId === event.id;

              return (
                <div
                  key={event.id}
                  onClick={() => onEventSelect(event)}
                  className={`relative pl-14 cursor-pointer transition-all ${
                    isSelected
                      ? 'transform scale-102'
                      : 'hover:transform hover:scale-101'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-4 top-4 w-5 h-5 rounded-full flex items-center justify-center ${
                    isSelected
                      ? 'bg-purple-500 ring-4 ring-purple-200'
                      : 'bg-white border-2 border-purple-300'
                  }`}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </div>

                  <Card className={`p-4 ${
                    isSelected
                      ? 'border-2 border-purple-500 shadow-lg bg-purple-50'
                      : 'border hover:shadow-md hover:border-purple-200'
                  }`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${getActorColor(event.actor)}`}>
                          {getActorIcon(event.actor)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${typeBadge.color} text-xs font-semibold`}>
                              {typeBadge.label}
                            </Badge>
                            <span className="text-xs text-gray-500 capitalize">
                              {event.actor}
                            </span>
                          </div>
                          <p className="font-semibold text-sm mt-0.5">{event.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatTime(event.timestamp)}</p>
                        <p className="text-xs text-gray-400">{getElapsedTime(event.timestamp)}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>

                    {/* Manual Message Indicator */}
                    {event.metadata?.conversationId && (
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                          💬 From Chat Conversation
                        </Badge>
                      </div>
                    )}

                    {/* Actions Summary */}
                    {event.actions && event.actions.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {event.actions.map((action, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {action.channel === 'sms' && '📱'}
                            {action.channel === 'call' && '📞'}
                            {action.channel === 'push' && '🔔'}
                            {action.channel === 'chat' && '💬'}
                            <span className="ml-1">{action.channel.toUpperCase()}</span>
                          </Badge>
                        ))}
                        <span className="text-xs text-gray-500 ml-auto">
                          {event.actions.length} action{event.actions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Reasoning Preview */}
                    {event.reasoning && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-700">
                            Confidence: {Math.round(event.reasoning.confidence * 100)}%
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">
                            Click to see reasoning
                          </span>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
