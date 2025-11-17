'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Store, Car, Brain, Zap, MessageSquare, DollarSign } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const scenarios = [
    {
      id: 'orchestration',
      title: 'AI Orchestration Center',
      description: 'See how AI automates customer service tasks that agents normally handle',
      icon: Brain,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      features: [
        'Event-driven automation across all parties',
        'Multi-channel actions (SMS, calls, notifications)',
        'Real-time reasoning & decision trees',
        'Smart escalation to human agents',
      ],
      scenarios: [
        '🍕 Customer adds item post-checkout',
        '🥬 Restaurant missing ingredient',
        '🚪 Driver: No answer at door',
        '⏰ Proactive delay notifications',
        '📍 Address mismatch resolution',
        '💰 Auto-refund for quality issues',
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Wolt AI Agent Demo
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            Experience AI-powered food delivery with real-time reasoning visualization
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Claude AI Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Real-time Communication</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span>MCP Tool Calling</span>
            </div>
          </div>
        </div>

        {/* Main Demo Card */}
        <div className="max-w-4xl mx-auto mb-12">
          {scenarios.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className={`${item.bgColor} border-4 border-purple-200 hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                <div className={`h-3 bg-gradient-to-r ${item.color}`} />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        {item.title}
                      </h2>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-semibold text-sm mb-3 text-purple-700">Core Capabilities</h3>
                      <div className="space-y-2">
                        {item.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color}`}
                            />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-3 text-purple-700">Live Scenarios</h3>
                      <div className="space-y-2">
                        {item.scenarios.map((scenario, index) => (
                          <div key={index} className="text-sm text-gray-700 bg-white/50 px-3 py-2 rounded">
                            {scenario}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push(`/${item.id}`)}
                    className={`w-full h-14 text-lg bg-gradient-to-r ${item.color} hover:opacity-90 transition-opacity shadow-lg`}
                  >
                    Launch Demo →
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Business Value Section */}
        <Card className="bg-white/50 backdrop-blur-sm border-2">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-center mb-2 text-gray-900">
              💼 Business Impact
            </h3>
            <p className="text-center text-gray-600 mb-8">Replace manual customer service tasks with intelligent automation</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">3s Response Time</h4>
                <p className="text-sm text-gray-600">
                  vs. 2+ minutes with human agents
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">90%+ Auto-Resolved</h4>
                <p className="text-sm text-gray-600">
                  Most issues handled without human intervention
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Multi-Channel</h4>
                <p className="text-sm text-gray-600">
                  SMS, calls, push notifications - all coordinated
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold mb-2">$0.08 per Ticket</h4>
                <p className="text-sm text-gray-600">
                  vs. $3-5 for human agent handling
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Technical Stack */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Built with</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="px-3 py-1 bg-white rounded-full text-xs font-medium">
              Next.js 14
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-medium">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-medium">
              Anthropic Claude
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-medium">
              Socket.io
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-medium">
              Tailwind CSS
            </span>
            <span className="px-3 py-1 bg-white rounded-full text-xs font-medium">
              shadcn/ui
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
