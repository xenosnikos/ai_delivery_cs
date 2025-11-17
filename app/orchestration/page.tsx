'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Play, Brain, Zap, Clock, DollarSign, TrendingUp,
  AlertTriangle, CheckCircle, Phone, MessageSquare,
  Bell, ChevronRight, Activity, User, Store, Car
} from 'lucide-react';
import EventTimeline from './components/EventTimeline';
import DecisionTree from './components/DecisionTree';
import MultiChannelActivity from './components/MultiChannelActivity';
import ChatModal from './components/ChatModal';
import { socketClient } from '@/lib/socket/client';
import { useAppStore } from '@/lib/store';

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

export default function OrchestrationPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<OrchestrationEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<OrchestrationEvent | null>(null);
  const [metrics, setMetrics] = useState({
    autoResolved: 0,
    avgResponseTime: 0,
    costSaved: 0,
    escalations: 0,
    totalEvents: 0
  });

  // Chat modal state
  const [openChatModal, setOpenChatModal] = useState<'customer' | 'business' | 'driver' | null>(null);

  // Get AI events from store for integration
  const { aiEvents, timelineEvents } = useAppStore();

  useEffect(() => {
    const socket = socketClient.connect();
    setIsConnected(true);

    // Listen for AI events from manual chat messages
    socketClient.onAIEvent((aiEvent) => {
      // Convert AI event to orchestration event
      if (aiEvent.type === 'thinking' || aiEvent.type === 'tool_call') {
        // Create reasoning event
        const reasoningEvent: OrchestrationEvent = {
          id: `decision-${Date.now()}-${Math.random()}`,
          type: 'decision',
          timestamp: new Date(),
          actor: 'system',
          title: 'AI Processing Message',
          description: aiEvent.data.thinking || aiEvent.data.content || 'Analyzing user request...',
          reasoning: {
            signals: [
              'User message received',
              'Context analyzed',
              'Available actions identified'
            ],
            rules: [
              'Process natural language request',
              'Determine appropriate response',
              'Execute necessary actions'
            ],
            decision: aiEvent.data.thinking || aiEvent.data.content || 'Processing request',
            confidence: 0.88
          }
        };
        setEvents(prev => [...prev, reasoningEvent]);
      }

      // Update metrics when AI processes messages
      setMetrics(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + 1
      }));
    });

    // Listen for messages to create event entries
    socketClient.onMessageReceived((message) => {
      // If message is from a persona (not AI), create an event
      if (!message.isAI && message.conversationId.startsWith('orchestration-')) {
        const eventActor = message.senderRole as 'customer' | 'business' | 'driver' | 'system';

        const messageEvent: OrchestrationEvent = {
          id: `event-${Date.now()}-${Math.random()}`,
          type: 'event',
          timestamp: new Date(message.timestamp),
          actor: eventActor,
          title: `${message.senderRole.charAt(0).toUpperCase() + message.senderRole.slice(1)} Message`,
          description: message.content.length > 100
            ? message.content.substring(0, 100) + '...'
            : message.content,
          metadata: {
            messageId: message.id,
            conversationId: message.conversationId
          }
        };

        setEvents(prev => [...prev, messageEvent]);
      }
    });

    // Listen for orchestration actions from manual chat
    socket.on('orchestration:actions', (data: {
      conversationId: string;
      actions: any[];
      timestamp: Date;
    }) => {
      console.log('Received orchestration actions:', data);

      // Create action event with the actions
      const actionEvent: OrchestrationEvent = {
        id: `action-${Date.now()}-${Math.random()}`,
        type: 'action',
        timestamp: new Date(data.timestamp),
        actor: 'system',
        title: 'Automated Actions Triggered',
        description: `${data.actions.length} actions executed across multiple channels`,
        actions: data.actions,
        metadata: {
          conversationId: data.conversationId,
          fromManualChat: true
        }
      };

      setEvents(prev => [...prev, actionEvent]);

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + 1,
        autoResolved: prev.autoResolved + 1,
        avgResponseTime: 3,
        costSaved: prev.costSaved + data.actions.reduce((sum: number, a: any) => sum + a.cost, 0)
      }));
    });

    return () => {
      socketClient.removeAllListeners();
    };
  }, []);

  const scenarios = [
    {
      id: 'add-item',
      title: 'Customer Adds Item',
      description: 'Post-checkout modification',
      icon: '🍕',
      color: 'blue'
    },
    {
      id: 'missing-ingredient',
      title: 'Missing Ingredient',
      description: 'Restaurant out of stock',
      icon: '🥬',
      color: 'orange'
    },
    {
      id: 'no-answer',
      title: 'No Answer at Door',
      description: 'Driver unable to deliver',
      icon: '🚪',
      color: 'red'
    },
    {
      id: 'delay',
      title: 'Prep Delay',
      description: 'Proactive ETA update',
      icon: '⏰',
      color: 'yellow'
    },
    {
      id: 'address-issue',
      title: 'Address Mismatch',
      description: 'Wrong delivery location',
      icon: '📍',
      color: 'purple'
    },
    {
      id: 'refund',
      title: 'Quality Issue',
      description: 'Auto-refund request',
      icon: '💰',
      color: 'green'
    }
  ];

  const handleScenarioTrigger = async (scenarioId: string) => {
    // This will trigger the event orchestration
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Create initial event
    const initialEvent: OrchestrationEvent = {
      id: `event-${Date.now()}`,
      type: 'event',
      timestamp: new Date(),
      actor: getActorForScenario(scenarioId),
      title: scenario.title,
      description: getScenarioDescription(scenarioId),
    };

    setEvents(prev => [...prev, initialEvent]);

    // Simulate AI reasoning
    setTimeout(() => {
      const reasoningEvent: OrchestrationEvent = {
        id: `decision-${Date.now()}`,
        type: 'decision',
        timestamp: new Date(),
        actor: 'system',
        title: 'AI Analyzing Situation',
        description: 'Processing event and determining actions...',
        reasoning: {
          signals: getSignalsForScenario(scenarioId),
          rules: getRulesForScenario(scenarioId),
          decision: getDecisionForScenario(scenarioId),
          confidence: 0.92
        }
      };
      setEvents(prev => [...prev, reasoningEvent]);
    }, 800);

    // Simulate actions being taken
    setTimeout(() => {
      const actionEvent: OrchestrationEvent = {
        id: `action-${Date.now()}`,
        type: 'action',
        timestamp: new Date(),
        actor: 'system',
        title: 'Automated Actions Triggered',
        description: 'Contacting relevant parties...',
        actions: getActionsForScenario(scenarioId)
      };
      setEvents(prev => [...prev, actionEvent]);

      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + 1,
        autoResolved: prev.autoResolved + (Math.random() > 0.1 ? 1 : 0),
        avgResponseTime: 3,
        costSaved: prev.costSaved + 2.92
      }));
    }, 2500);
  };

  const getActorForScenario = (scenarioId: string): 'customer' | 'business' | 'driver' | 'system' => {
    const actorMap: Record<string, any> = {
      'add-item': 'customer',
      'missing-ingredient': 'business',
      'no-answer': 'driver',
      'delay': 'business',
      'address-issue': 'driver',
      'refund': 'customer'
    };
    return actorMap[scenarioId] || 'system';
  };

  const getScenarioDescription = (scenarioId: string): string => {
    const descriptions: Record<string, string> = {
      'add-item': 'Customer Sarah wants to add "Garlic Bread" to order #1234 (currently in preparation)',
      'missing-ingredient': 'Pizza Palace reports out of "Pepperoni" for order #1235',
      'no-answer': 'Driver John reports "No answer at door" for order #1236',
      'delay': 'Pizza Palace kitchen backed up - 15min prep delay for order #1237',
      'address-issue': 'Driver unable to find address - GPS mismatch for order #1238',
      'refund': 'Customer reports missing "Fries" from delivered order #1239'
    };
    return descriptions[scenarioId] || 'Event triggered';
  };

  const getSignalsForScenario = (scenarioId: string): string[] => {
    const signals: Record<string, string[]> = {
      'add-item': [
        'Order status: Preparing (not picked up yet)',
        'Time since order: 4 minutes',
        'Modification allowed within 5min window',
        'Customer has payment method on file'
      ],
      'missing-ingredient': [
        'Order status: Confirmed',
        'Alternative items available',
        'Customer has no dietary restrictions',
        'Average substitution acceptance rate: 85%'
      ],
      'no-answer': [
        'Delivery attempt #1 of 3',
        'Customer last active: 12 minutes ago',
        'Phone reachable (carrier check: active)',
        'Order value: $34.50 (medium priority)'
      ],
      'delay': [
        'Current ETA vs Original: +15 minutes',
        'Customer patience threshold: 20min',
        'Proactive notification recommended',
        'Voucher budget available'
      ],
      'address-issue': [
        'GPS coordinates mismatch',
        'Driver 0.3mi from pin',
        'Customer provided notes unclear',
        'Similar issue history: 0'
      ],
      'refund': [
        'Order delivered 8 minutes ago',
        'Customer tier: Premium',
        'Item cost: $4.99',
        'Incident history: 0 in last 6 months'
      ]
    };
    return signals[scenarioId] || [];
  };

  const getRulesForScenario = (scenarioId: string): string[] => {
    const rules: Record<string, string[]> = {
      'add-item': [
        'Rule: Post-checkout modifications allowed if not picked up',
        'Rule: Business must confirm within 2 minutes',
        'Rule: Auto-update driver ETA based on prep time'
      ],
      'missing-ingredient': [
        'Rule: Offer alternatives before cancellation',
        'Rule: No upcharge for substitutions',
        'Rule: Customer approval required for changes'
      ],
      'no-answer': [
        'Rule: Call customer before escalation',
        'Rule: SMS backup if call fails',
        'Rule: Wait 5 minutes before second attempt',
        'Rule: Escalate to support after 3 failed attempts'
      ],
      'delay': [
        'Rule: Notify customer if delay > 10 minutes',
        'Rule: Offer $5 voucher for delays > 20 minutes',
        'Rule: Update all parties simultaneously'
      ],
      'address-issue': [
        'Rule: SMS customer with quick-reply for clarification',
        'Rule: Provide driver with phone call option',
        'Rule: 10-minute resolution window'
      ],
      'refund': [
        'Rule: Auto-approve refunds < $10 for premium customers',
        'Rule: Partial refund only (not full order)',
        'Rule: Flag merchant for quality review'
      ]
    };
    return rules[scenarioId] || [];
  };

  const getDecisionForScenario = (scenarioId: string): string => {
    const decisions: Record<string, string> = {
      'add-item': 'Approve modification. Contact business for prep update, adjust driver ETA, confirm with customer.',
      'missing-ingredient': 'Offer "Italian Sausage" as alternative via push notification, await customer response (3min), notify business of choice.',
      'no-answer': 'Sequence: 1) Call customer, 2) SMS with order details, 3) Wait 5min, 4) Second attempt, 5) Contact business for hold protocol.',
      'delay': 'Send proactive notification to customer with new ETA, offer $5 voucher, update driver pickup time.',
      'address-issue': 'Send SMS quick-reply to customer: "Driver at [address]. Correct?" with map link. Enable driver-customer call option.',
      'refund': 'Auto-approve $4.99 partial refund, send confirmation to customer, flag incident to Pizza Palace quality team.'
    };
    return decisions[scenarioId] || 'Processing...';
  };

  const getActionsForScenario = (scenarioId: string): OrchestrationEvent['actions'] => {
    const actions: Record<string, OrchestrationEvent['actions']> = {
      'add-item': [
        { channel: 'chat', target: 'Pizza Palace', message: 'Customer added Garlic Bread ($5.99). Please confirm prep time.', status: 'sent', cost: 0.001 },
        { channel: 'push', target: 'Customer Sarah', message: 'Item added! Waiting for restaurant confirmation...', status: 'sent', cost: 0.001 },
        { channel: 'push', target: 'Driver John', message: 'Order updated. New ETA: 6:45 PM', status: 'sent', cost: 0.001 }
      ],
      'missing-ingredient': [
        { channel: 'push', target: 'Customer Mike', message: 'Pepperoni unavailable. Italian Sausage OK? Same price!', status: 'sent', cost: 0.001 },
        { channel: 'sms', target: 'Customer Mike', message: 'Reply Y for Italian Sausage or N to cancel', status: 'sent', cost: 0.015 },
        { channel: 'chat', target: 'Pizza Palace', message: 'Awaiting customer response on substitution...', status: 'sent', cost: 0.001 }
      ],
      'no-answer': [
        { channel: 'call', target: 'Customer Sarah', message: 'Outbound call placed', status: 'sent', cost: 0.045 },
        { channel: 'sms', target: 'Customer Sarah', message: 'Driver at your door. Order #1236. Please answer!', status: 'sent', cost: 0.015 },
        { channel: 'push', target: 'Driver John', message: 'Customer contacted. Wait 5 minutes for response.', status: 'sent', cost: 0.001 }
      ],
      'delay': [
        { channel: 'push', target: 'Customer Emily', message: 'Heads up! Kitchen backed up. New ETA: 7:10 PM. Here\'s $5 off next order!', status: 'sent', cost: 0.001 },
        { channel: 'sms', target: 'Customer Emily', message: 'Order delayed. New ETA: 7:10 PM. Voucher: SORRY5', status: 'sent', cost: 0.015 },
        { channel: 'push', target: 'Driver Lisa', message: 'Pickup time updated: 6:55 PM', status: 'sent', cost: 0.001 }
      ],
      'address-issue': [
        { channel: 'sms', target: 'Customer James', message: 'Driver at 777 Elm St. Correct address? Reply YES or send new address.', status: 'sent', cost: 0.015 },
        { channel: 'push', target: 'Customer James', message: 'Address confirmation needed', status: 'sent', cost: 0.001 },
        { channel: 'chat', target: 'Driver Carlos', message: 'Customer contacted for address verification', status: 'sent', cost: 0.001 }
      ],
      'refund': [
        { channel: 'push', target: 'Customer Mike', message: '$4.99 refunded for missing fries. Sorry about that!', status: 'sent', cost: 0.001 },
        { channel: 'chat', target: 'Burger Haven', message: 'Quality issue reported: Missing fries on order #1239', status: 'sent', cost: 0.001 }
      ]
    };
    return actions[scenarioId] || [];
  };

  const calculateAutoResolveRate = () => {
    if (metrics.totalEvents === 0) return 0;
    return Math.round((metrics.autoResolved / metrics.totalEvents) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 p-4">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Orchestration Center</h1>
              <p className="text-gray-600 mt-1">Automated customer service with real-time reasoning</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? 'default' : 'destructive'} className="text-sm">
                {isConnected ? '🟢 System Online' : '🔴 Offline'}
              </Badge>
            </div>
          </div>

          {/* Metrics Bar */}
          <div className="grid grid-cols-5 gap-4 mt-4">
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Auto-Resolved</p>
                  <p className="text-2xl font-bold text-green-700">{calculateAutoResolveRate()}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold text-blue-700">{metrics.avgResponseTime}s</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Cost Saved</p>
                  <p className="text-2xl font-bold text-purple-700">${metrics.costSaved.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Escalations</p>
                  <p className="text-2xl font-bold text-orange-700">{metrics.escalations}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-indigo-700">{metrics.totalEvents}</p>
                </div>
                <Activity className="w-8 h-8 text-indigo-600" />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Scenario Launcher */}
          <div className="col-span-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Trigger Scenario</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Click to simulate customer service events</p>
              <div className="space-y-2">
                {scenarios.map((scenario) => (
                  <Button
                    key={scenario.id}
                    onClick={() => handleScenarioTrigger(scenario.id)}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <span className="text-2xl">{scenario.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{scenario.title}</p>
                        <p className="text-xs text-gray-500">{scenario.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Center - Event Timeline */}
          <div className="col-span-6">
            <EventTimeline
              events={events}
              onEventSelect={setSelectedEvent}
              selectedEventId={selectedEvent?.id}
            />
          </div>

          {/* Right - Decision Tree */}
          <div className="col-span-3">
            <DecisionTree
              event={selectedEvent}
            />
          </div>
        </div>

        {/* Bottom - Multi-Channel Activity */}
        <div className="mt-6">
          <MultiChannelActivity events={events} />
        </div>
      </div>

      {/* Floating Chat Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {/* Customer Chat Button */}
        <Button
          onClick={() => setOpenChatModal('customer')}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
          title="Customer Chat"
        >
          <User className="w-6 h-6" />
        </Button>

        {/* Business Chat Button */}
        <Button
          onClick={() => setOpenChatModal('business')}
          className="w-14 h-14 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all"
          title="Business Chat"
        >
          <Store className="w-6 h-6" />
        </Button>

        {/* Driver Chat Button */}
        <Button
          onClick={() => setOpenChatModal('driver')}
          className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
          title="Driver Chat"
        >
          <Car className="w-6 h-6" />
        </Button>
      </div>

      {/* Chat Modals */}
      {openChatModal && (
        <ChatModal
          persona={openChatModal}
          isOpen={!!openChatModal}
          onClose={() => setOpenChatModal(null)}
        />
      )}
    </div>
  );
}
