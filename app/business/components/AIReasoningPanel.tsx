'use client';

import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Brain, Cog, CheckCircle, AlertCircle, Code2, Clock, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { socketClient } from '@/lib/socket/client';
import type { AIEvent } from '@/lib/types';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

interface AIReasoningPanelProps {
  conversationId: string;
  activeView: 'activity' | 'timeline' | 'flow' | 'debug';
}

export default function AIReasoningPanel({
  conversationId,
  activeView,
}: AIReasoningPanelProps) {
  const {
    aiEvents,
    addAIEvent,
    getTimelineEventsForConversation,
    getFlowDataForConversation,
    getSystemPromptsForConversation,
  } = useAppStore();

  const events = aiEvents.get(conversationId) || [];
  const timelineEvents = getTimelineEventsForConversation(conversationId);
  const flowData = getFlowDataForConversation(conversationId);
  const systemPrompts = getSystemPromptsForConversation(conversationId);

  useEffect(() => {
    // Listen for AI events
    const handleAIEvent = (event: AIEvent) => {
      if (event.conversationId === conversationId) {
        addAIEvent(conversationId, event);
      }
    };

    socketClient.onAIEvent(handleAIEvent);
  }, [conversationId]);

  const getEventIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      thinking: <Brain className="w-4 h-4 text-blue-600" />,
      tool_call: <Cog className="w-4 h-4 text-purple-600" />,
      tool_result: <CheckCircle className="w-4 h-4 text-green-600" />,
      response: <Zap className="w-4 h-4 text-cyan-600" />,
      error: <AlertCircle className="w-4 h-4 text-red-600" />,
    };
    return icons[type] || <Code2 className="w-4 h-4 text-gray-600" />;
  };

  const getEventColor = (type: string) => {
    const colors: Record<string, string> = {
      thinking: 'bg-blue-100 text-blue-800 border-blue-300',
      tool_call: 'bg-purple-100 text-purple-800 border-purple-300',
      tool_result: 'bg-green-100 text-green-800 border-green-300',
      response: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      error: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Activity Feed View
  const renderActivityFeed = () => (
    <ScrollArea className="h-[calc(100vh-400px)]">
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Brain className="w-16 h-16 mb-3 opacity-30" />
            <p className="text-sm">AI activity will appear here</p>
            <p className="text-xs mt-1">Send a message to see the magic ✨</p>
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={event.id}
              className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getEventIcon(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={`text-xs ${getEventColor(event.type)}`}>
                      {event.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  {event.data.thinking && (
                    <p className="text-sm text-gray-700 italic mt-1">
                      "{event.data.thinking}"
                    </p>
                  )}

                  {event.data.toolName && (
                    <div className="mt-2 bg-gray-50 rounded p-2">
                      <p className="text-xs font-mono font-semibold text-purple-700">
                        {event.data.toolName}()
                      </p>
                      {event.data.toolInput && (
                        <pre className="text-xs text-gray-600 mt-1 overflow-x-auto">
                          {JSON.stringify(event.data.toolInput, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}

                  {event.data.toolOutput && (
                    <div className="mt-2 bg-green-50 rounded p-2">
                      <p className="text-xs font-semibold text-green-700 mb-1">
                        Result:
                      </p>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(event.data.toolOutput, null, 2)}
                      </pre>
                    </div>
                  )}

                  {event.data.content && (
                    <p className="text-sm text-gray-700 mt-1">
                      {event.data.content.slice(0, 150)}
                      {event.data.content.length > 150 && '...'}
                    </p>
                  )}

                  {event.data.tokens && (
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>Input: {event.data.tokens.input}</span>
                      <span>Output: {event.data.tokens.output}</span>
                      <span className="font-semibold">
                        Total: {event.data.tokens.input + event.data.tokens.output}
                      </span>
                    </div>
                  )}

                  {event.data.error && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded p-2">
                      <p className="text-xs text-red-700">{event.data.error}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );

  // Timeline View
  const renderTimeline = () => (
    <ScrollArea className="h-[calc(100vh-400px)]">
      <div className="space-y-2 relative pl-6">
        {timelineEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Clock className="w-16 h-16 mb-3 opacity-30" />
            <p className="text-sm">Timeline will appear here</p>
          </div>
        ) : (
          <>
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />
            {timelineEvents.map((event, index) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-6 top-2 w-3 h-3 rounded-full bg-purple-500 border-2 border-white" />
                <div className="bg-white border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {event.title}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{event.description}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </ScrollArea>
  );

  // Flow Diagram View
  const renderFlowDiagram = () => (
    <div className="h-[calc(100vh-400px)] bg-gray-50 rounded-lg border">
      {flowData.nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Code2 className="w-16 h-16 mb-3 opacity-30" />
          <p className="text-sm">Flow diagram will appear here</p>
          <p className="text-xs mt-1">Tool calls will be visualized</p>
        </div>
      ) : (
        <ReactFlow
          nodes={flowData.nodes}
          edges={flowData.edges}
          fitView
          className="bg-gray-50"
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      )}
    </div>
  );

  // Debug Panel View
  const renderDebugPanel = () => (
    <ScrollArea className="h-[calc(100vh-400px)]">
      <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="system-prompts" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span className="font-semibold text-sm">System Prompts</span>
              <Badge variant="secondary" className="ml-2">
                {systemPrompts.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {systemPrompts.length === 0 ? (
              <p className="text-xs text-gray-500">No system prompts yet</p>
            ) : (
              <div className="space-y-2">
                {systemPrompts.map((prompt, index) => (
                  <div key={index} className="bg-gray-50 rounded p-2">
                    <Badge className="mb-1 text-xs">{prompt.role}</Badge>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {prompt.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ai-events" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="font-semibold text-sm">Raw AI Events</span>
              <Badge variant="secondary" className="ml-2">
                {events.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {events.length === 0 ? (
              <p className="text-xs text-gray-500">No events yet</p>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={event.id} className="bg-gray-50 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className={getEventColor(event.type) + ' text-xs'}>
                        {event.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(event.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mcp-tools" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <Cog className="w-4 h-4" />
              <span className="font-semibold text-sm">MCP Tool Calls</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-2">
              {events
                .filter((e) => e.type === 'tool_call')
                .map((event) => (
                  <div key={event.id} className="bg-purple-50 rounded p-2 border border-purple-200">
                    <p className="text-xs font-mono font-semibold text-purple-700 mb-1">
                      {event.data.toolName}
                    </p>
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(event.data.toolInput, null, 2)}
                    </pre>
                  </div>
                ))}
              {events.filter((e) => e.type === 'tool_call').length === 0 && (
                <p className="text-xs text-gray-500">No tool calls yet</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ScrollArea>
  );

  return (
    <div className="h-full">
      {activeView === 'activity' && renderActivityFeed()}
      {activeView === 'timeline' && renderTimeline()}
      {activeView === 'flow' && renderFlowDiagram()}
      {activeView === 'debug' && renderDebugPanel()}
    </div>
  );
}
