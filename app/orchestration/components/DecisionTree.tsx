'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Brain, TrendingUp, CheckCircle, Info, AlertTriangle, Zap
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

interface DecisionTreeProps {
  event: OrchestrationEvent | null;
}

export default function DecisionTree({ event }: DecisionTreeProps) {
  if (!event) {
    return (
      <Card className="p-4 h-[calc(100vh-300px)] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-sm font-medium">No event selected</p>
          <p className="text-xs mt-1">Click an event to see AI reasoning</p>
        </div>
      </Card>
    );
  }

  const hasReasoning = event.reasoning && (event.type === 'decision' || event.type === 'action');

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-blue-600 bg-blue-100';
    if (confidence >= 0.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="p-4 h-[calc(100vh-300px)]">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-lg">Decision Tree</h3>
      </div>

      <ScrollArea className="h-[calc(100%-60px)]">
        {!hasReasoning ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
            <Info className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm text-center">
              {event.type === 'event'
                ? 'Initial event - reasoning will appear in next steps'
                : 'No reasoning data available for this event'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Event Summary */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-sm text-purple-900">Event Summary</h4>
              </div>
              <p className="text-sm text-purple-700">{event.title}</p>
              <p className="text-xs text-purple-600 mt-1">{event.description}</p>
            </div>

            <Separator />

            {/* Signals Considered */}
            {event.reasoning?.signals && event.reasoning?.signals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-sm">Signals Analyzed</h4>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {event.reasoning?.signals.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {event.reasoning?.signals.map((signal, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-blue-900">{signal}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Rules Applied */}
            {event.reasoning?.rules && event.reasoning?.rules.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <h4 className="font-semibold text-sm">Rules Applied</h4>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {event.reasoning?.rules.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {event.reasoning?.rules.map((rule, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-green-900">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* AI Decision */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-purple-600" />
                <h4 className="font-semibold text-sm">AI Decision</h4>
              </div>
              <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
                <p className="text-sm text-purple-900 leading-relaxed">
                  {event.reasoning?.decision}
                </p>
              </div>
            </div>

            <Separator />

            {/* Confidence Score */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <h4 className="font-semibold text-sm">Confidence Assessment</h4>
              </div>
              <div className="space-y-3">
                <div className={`p-4 rounded-lg border-2 ${getConfidenceColor(event.reasoning?.confidence ?? 0)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">
                      {getConfidenceLabel(event.reasoning?.confidence ?? 0)} Confidence
                    </span>
                    <span className="text-2xl font-bold">
                      {Math.round((event.reasoning?.confidence ?? 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-current transition-all duration-500"
                      style={{ width: `${(event.reasoning?.confidence ?? 0) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        {(event.reasoning?.confidence ?? 0) >= 0.9
                          ? 'Auto-execute recommended'
                          : (event.reasoning?.confidence ?? 0) >= 0.7
                          ? 'High certainty - proceed with monitoring'
                          : (event.reasoning?.confidence ?? 0) >= 0.5
                          ? 'Review suggested before execution'
                          : 'Manual review required'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {(event.reasoning?.confidence ?? 0) >= 0.7
                          ? 'All signals indicate clear path forward'
                          : 'Some uncertainty detected - escalation may be needed'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Taken */}
            {event.actions && event.actions.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <h4 className="font-semibold text-sm">Actions Executed</h4>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {event.actions.length} actions
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {event.actions.map((action, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {action.channel === 'sms' && '📱 SMS'}
                              {action.channel === 'call' && '📞 Call'}
                              {action.channel === 'push' && '🔔 Push'}
                              {action.channel === 'chat' && '💬 Chat'}
                            </Badge>
                            <span className="text-xs text-gray-600">{action.target}</span>
                          </div>
                          <Badge
                            className={
                              action.status === 'sent'
                                ? 'bg-green-100 text-green-800'
                                : action.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {action.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700 mb-2">{action.message}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Cost: ${action.cost.toFixed(3)}</span>
                          <span>~{Math.round(action.cost * 1000)}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-green-700">
                        Total Cost
                      </span>
                      <span className="text-sm font-bold text-green-800">
                        ${event.actions.reduce((sum, a) => sum + a.cost, 0).toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      vs. ~$3.00 for human agent handling
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Escalation Warning */}
            {(event.reasoning?.confidence ?? 0) < 0.7 && (
              <>
                <Separator />
                <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold text-sm text-yellow-900 mb-1">
                        Consider Escalation
                      </h5>
                      <p className="text-xs text-yellow-800">
                        Confidence below threshold. Human review recommended for this scenario.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
