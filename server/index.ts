import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { deliveryTools, executeToolMock } from '../lib/mcp/tools';
import { AIEvent, Message, Order, Conversation } from '../lib/types';

const app = express();
const httpServer = createServer(app);

// CORS configuration
app.use(cors());
app.use(express.json());

// Socket.io setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// In-memory storage (for demo purposes)
const conversations = new Map<string, Conversation>();
const orders = new Map<string, Order>();
const aiEvents = new Map<string, AIEvent[]>();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join a conversation room
  socket.on('conversation:join', (conversationId: string) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Handle incoming messages
  socket.on('message:send', async (data: {
    conversationId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderRole: 'customer' | 'business' | 'driver';
  }) => {
    console.log('Received message:', data);

    // Create user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: data.conversationId,
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      content: data.content,
      timestamp: new Date(),
      isAI: false,
    };

    // Broadcast user message to conversation room
    io.to(data.conversationId).emit('message:received', userMessage);

    // Process with AI
    await handleAIInteraction(data.conversationId, data.content, data.senderRole, socket);
  });

  // Handle order updates
  socket.on('order:update', (data: { orderId: string; status: string }) => {
    console.log('Order update:', data);
    const order = orders.get(data.orderId);
    if (order) {
      order.status = data.status as any;
      order.updatedAt = new Date();
      orders.set(data.orderId, order);
      io.emit('order:updated', order);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Generate orchestration actions based on context
function generateOrchestrationActions(
  userMessage: string,
  userRole: 'customer' | 'business' | 'driver',
  toolCalls: any[],
  aiResponse: string
) {
  const actions: any[] = [];
  const messageLower = userMessage.toLowerCase();

  // Analyze message intent and generate appropriate actions
  if (userRole === 'customer') {
    // Customer scenarios
    if (messageLower.includes('add') || messageLower.includes('modify') || messageLower.includes('change')) {
      // Customer wants to modify order
      actions.push({
        channel: 'chat',
        target: 'Restaurant',
        message: `Customer requests: "${userMessage}". Please confirm if modification is possible.`,
        status: 'sent',
        cost: 0.001
      });
      actions.push({
        channel: 'push',
        target: 'Customer',
        message: 'We\'ve contacted the restaurant about your request. You\'ll hear back shortly!',
        status: 'sent',
        cost: 0.002
      });
    } else if (messageLower.includes('where') || messageLower.includes('status') || messageLower.includes('eta')) {
      // Customer asking about delivery status
      actions.push({
        channel: 'push',
        target: 'Customer',
        message: aiResponse.substring(0, 100) + '...',
        status: 'sent',
        cost: 0.002
      });
      actions.push({
        channel: 'sms',
        target: 'Customer (+1-555-0123)',
        message: 'Your order is on the way! Track it in the app.',
        status: 'sent',
        cost: 0.008
      });
    } else if (messageLower.includes('refund') || messageLower.includes('wrong') || messageLower.includes('missing')) {
      // Customer has an issue
      actions.push({
        channel: 'push',
        target: 'Customer',
        message: 'We\'re sorry about that! Processing your request now...',
        status: 'sent',
        cost: 0.002
      });
      actions.push({
        channel: 'chat',
        target: 'Support Team',
        message: `Issue reported: "${userMessage}". Customer tier: Premium. Auto-refund eligible.`,
        status: 'sent',
        cost: 0.001
      });
    }
  } else if (userRole === 'business') {
    // Business scenarios
    if (messageLower.includes('out of') || messageLower.includes('unavailable') || messageLower.includes('missing')) {
      // Item unavailable
      actions.push({
        channel: 'sms',
        target: 'Customer (+1-555-0123)',
        message: 'Hi! An item in your order is unavailable. We\'re finding alternatives. Check your app!',
        status: 'sent',
        cost: 0.008
      });
      actions.push({
        channel: 'push',
        target: 'Customer',
        message: 'Restaurant update: We need to substitute an item. Tap to review options.',
        status: 'sent',
        cost: 0.002
      });
    } else if (messageLower.includes('delay') || messageLower.includes('late') || messageLower.includes('busy')) {
      // Prep delay
      actions.push({
        channel: 'push',
        target: 'Customer',
        message: 'Your order is taking a bit longer. New ETA: +15 min. Thanks for your patience!',
        status: 'sent',
        cost: 0.002
      });
      actions.push({
        channel: 'push',
        target: 'Driver',
        message: 'Pickup time updated: +15 minutes. Order #1234 at Pizza Palace.',
        status: 'sent',
        cost: 0.002
      });
    } else if (messageLower.includes('ready') || messageLower.includes('prepared')) {
      // Order ready
      actions.push({
        channel: 'push',
        target: 'Driver',
        message: 'Order #1234 is ready for pickup at Pizza Palace!',
        status: 'sent',
        cost: 0.002
      });
    }
  } else if (userRole === 'driver') {
    // Driver scenarios
    if (messageLower.includes('no answer') || messageLower.includes('not answering') || messageLower.includes('door')) {
      // Customer not answering
      actions.push({
        channel: 'call',
        target: 'Customer (+1-555-0123)',
        message: 'Automated call: "Hi, your delivery driver is at your door. Please come to the entrance."',
        status: 'sent',
        cost: 0.015
      });
      actions.push({
        channel: 'sms',
        target: 'Customer (+1-555-0123)',
        message: 'Your delivery is here! Please answer the door or call us at (555) 0199.',
        status: 'sent',
        cost: 0.008
      });
      actions.push({
        channel: 'push',
        target: 'Customer',
        message: '🚨 Your driver is waiting at your door! Please collect your order.',
        status: 'sent',
        cost: 0.002
      });
    } else if (messageLower.includes('address') || messageLower.includes('find') || messageLower.includes('location')) {
      // Address issue
      actions.push({
        channel: 'sms',
        target: 'Customer (+1-555-0123)',
        message: 'Hi! Your driver needs help finding you. Can you share your exact location? Reply with details or call (555) 0199.',
        status: 'sent',
        cost: 0.008
      });
      actions.push({
        channel: 'push',
        target: 'Customer',
        message: 'Location clarification needed. Tap here to help your driver find you!',
        status: 'sent',
        cost: 0.002
      });
    } else if (messageLower.includes('delivered') || messageLower.includes('complete')) {
      // Delivery complete
      actions.push({
        channel: 'push',
        target: 'Customer',
        message: '✅ Your order has been delivered! Enjoy your meal!',
        status: 'sent',
        cost: 0.002
      });
    }
  }

  // If tool calls were made, add notification about automation
  if (toolCalls.length > 0 && actions.length > 0) {
    actions.push({
      channel: 'chat',
      target: 'Operations Log',
      message: `AI executed ${toolCalls.length} tool(s) and sent ${actions.length} notification(s) automatically.`,
      status: 'sent',
      cost: 0.001
    });
  }

  return actions;
}

// Match user message to scenario intent
function matchScenarioIntent(message: string, userRole: 'customer' | 'business' | 'driver'): {
  scenario: string;
  confidence: number;
  description: string;
} {
  const messageLower = message.toLowerCase();

  if (userRole === 'customer') {
    if (messageLower.includes('add') || messageLower.includes('modify') || messageLower.includes('change') ||
        messageLower.includes('extra') || messageLower.includes('more')) {
      return {
        scenario: 'add-item',
        confidence: 0.95,
        description: 'Customer wants to modify their order (add/change items)'
      };
    }
    if (messageLower.includes('refund') || messageLower.includes('wrong') || messageLower.includes('missing') ||
        messageLower.includes('incorrect') || messageLower.includes('quality')) {
      return {
        scenario: 'refund',
        confidence: 0.93,
        description: 'Customer reports quality issue or missing items'
      };
    }
    if (messageLower.includes('where') || messageLower.includes('status') || messageLower.includes('eta') ||
        messageLower.includes('when') || messageLower.includes('arrive')) {
      return {
        scenario: 'status-check',
        confidence: 0.90,
        description: 'Customer checking order status'
      };
    }
  } else if (userRole === 'business') {
    if (messageLower.includes('out of') || messageLower.includes('unavailable') || messageLower.includes('missing') ||
        messageLower.includes('no') && messageLower.includes('stock')) {
      return {
        scenario: 'missing-ingredient',
        confidence: 0.96,
        description: 'Restaurant reports ingredient unavailable'
      };
    }
    if (messageLower.includes('delay') || messageLower.includes('late') || messageLower.includes('busy') ||
        messageLower.includes('backed up') || messageLower.includes('longer')) {
      return {
        scenario: 'delay',
        confidence: 0.94,
        description: 'Restaurant reports preparation delay'
      };
    }
    if (messageLower.includes('ready') || messageLower.includes('prepared') || messageLower.includes('done')) {
      return {
        scenario: 'order-ready',
        confidence: 0.92,
        description: 'Order is ready for pickup'
      };
    }
  } else if (userRole === 'driver') {
    if (messageLower.includes('no answer') || messageLower.includes('not answering') || messageLower.includes('door') ||
        messageLower.includes('not home') || messageLower.includes('nobody')) {
      return {
        scenario: 'no-answer',
        confidence: 0.97,
        description: 'Driver reports customer not answering'
      };
    }
    if (messageLower.includes('address') || messageLower.includes('find') || messageLower.includes('location') ||
        messageLower.includes('wrong place') || messageLower.includes('can\'t locate')) {
      return {
        scenario: 'address-issue',
        confidence: 0.95,
        description: 'Driver has trouble finding delivery location'
      };
    }
    if (messageLower.includes('delivered') || messageLower.includes('complete') || messageLower.includes('dropped off')) {
      return {
        scenario: 'delivered',
        confidence: 0.98,
        description: 'Delivery completed successfully'
      };
    }
  }

  return {
    scenario: 'general',
    confidence: 0.70,
    description: 'General inquiry or support request'
  };
}

// Generate AI response based on matched scenario
function generateScenarioResponse(
  scenario: string,
  userRole: 'customer' | 'business' | 'driver',
  userMessage: string
): string {
  const responses: Record<string, Record<string, string>> = {
    customer: {
      'add-item': `I understand you'd like to modify your order. I've immediately contacted the restaurant to check if we can add that to your order while it's still being prepared. You'll receive a confirmation within 2 minutes. Is there anything else I can help you with?`,
      'refund': `I'm really sorry to hear that! I've processed your request and since you're a valued customer, I've automatically approved a refund for the affected items. You should see it in your account within 5-10 minutes. I've also flagged this with the restaurant to ensure quality going forward.`,
      'status-check': `Your order is currently on its way! Your driver is about 8 minutes away. You can track their location in real-time on the app. They'll call when they arrive. Estimated delivery: 7:45 PM.`,
      'general': `I'm here to help! Can you tell me more about what you need? I can help with order modifications, delivery status, refunds, or any other questions you might have.`
    },
    business: {
      'missing-ingredient': `Got it - I've immediately notified the customer about the unavailable item and offered them alternative options. They'll be able to choose a substitute or get a refund. I'll update you once they respond. In the meantime, should I adjust the prep time estimate?`,
      'delay': `Thanks for the heads up! I've proactively notified the customer about the 15-minute delay and updated the driver's pickup time. I've also offered the customer a $5 voucher for their next order. The customer has been informed and seems understanding.`,
      'order-ready': `Perfect! I've alerted the driver that order #1234 is ready for pickup. They're currently 3 minutes away and will arrive shortly. I've updated the status in the system.`,
      'general': `I'm here to help manage your orders and coordinate with customers and drivers. What do you need assistance with?`
    },
    driver: {
      'no-answer': `I've immediately attempted to reach the customer through multiple channels - automated call, SMS, and push notification. I'm monitoring for their response. If they don't respond within 5 minutes, I'll authorize you to leave the order in a safe location or return it. Stand by for customer response.`,
      'address-issue': `I've sent an SMS to the customer asking for clarification on their exact location. I've also sent them a map link so they can share their precise coordinates. You should hear back within 2 minutes. In the meantime, here's what the customer originally provided: [Address details]`,
      'delivered': `Excellent! I've notified the customer that their order has been delivered. Marking this delivery as complete. Great job! Your next pickup is ready in 12 minutes at Mario's Pizzeria.`,
      'general': `I'm here to help with your deliveries! I can assist with navigation, customer communication, order issues, or any other challenges you encounter.`
    }
  };

  const roleResponses = responses[userRole];
  return roleResponses[scenario] || roleResponses['general'];
}

// AI interaction handler with streaming and tool calling
async function handleAIInteraction(
  conversationId: string,
  userMessage: string,
  userRole: 'customer' | 'business' | 'driver',
  socket: any
) {
  try {
    // Initialize events array for this conversation if not exists
    if (!aiEvents.has(conversationId)) {
      aiEvents.set(conversationId, []);
    }

    const events = aiEvents.get(conversationId)!;

    // Match message to scenario
    const intent = matchScenarioIntent(userMessage, userRole);
    console.log(`📋 Understood task: ${intent.description} (confidence: ${Math.round(intent.confidence * 100)}%)`);

    // Create thinking event
    const thinkingEvent: AIEvent = {
      id: `event-${Date.now()}-thinking`,
      conversationId,
      type: 'thinking',
      timestamp: new Date(),
      data: {
        thinking: `Analyzing request: "${intent.description}" (${Math.round(intent.confidence * 100)}% confidence)`,
      },
    };
    events.push(thinkingEvent);
    io.to(conversationId).emit('ai:event', thinkingEvent);

    // Try to use Claude API, fall back to scenario matching if it fails
    let assistantResponse = '';
    let toolCalls: any[] = [];

    try {
      const systemPrompt = buildSystemPrompt(userRole);

      // Call Claude API with the correct model name
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022', // Latest Sonnet model
        max_tokens: 2048,
        system: systemPrompt,
        tools: deliveryTools.map(tool => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema as any,
        })),
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      console.log('✅ Claude API response received');

      // Process response content
      for (const block of response.content) {
        if (block.type === 'text') {
          assistantResponse += block.text;
        } else if (block.type === 'tool_use') {
          toolCalls.push(block);

          // Emit tool call event
          const toolCallEvent: AIEvent = {
            id: `event-${Date.now()}-tool-${block.id}`,
            conversationId,
            type: 'tool_call',
            timestamp: new Date(),
            data: {
              toolName: block.name,
              toolInput: block.input,
            },
          };
          events.push(toolCallEvent);
          io.to(conversationId).emit('ai:event', toolCallEvent);

          // Execute tool (mock)
          try {
            const toolResult = await executeToolMock(block.name, block.input);

            // Emit tool result event
            const toolResultEvent: AIEvent = {
              id: `event-${Date.now()}-result-${block.id}`,
              conversationId,
              type: 'tool_result',
              timestamp: new Date(),
              data: {
                toolName: block.name,
                toolOutput: toolResult,
              },
            };
            events.push(toolResultEvent);
            io.to(conversationId).emit('ai:event', toolResultEvent);
          } catch (error: any) {
            console.error('Tool execution error:', error);
          }
        }
      }

      // If we have tool calls, get final response
      if (toolCalls.length > 0) {
        const followUpMessages: any[] = [
          { role: 'user', content: userMessage },
          { role: 'assistant', content: response.content },
        ];

        // Add tool results
        for (const toolCall of toolCalls) {
          const toolResult = await executeToolMock(toolCall.name, toolCall.input);
          followUpMessages.push({
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolCall.id,
                content: JSON.stringify(toolResult),
              },
            ],
          });
        }

        const finalResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          system: systemPrompt,
          tools: deliveryTools.map(tool => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.inputSchema as any,
          })),
          messages: followUpMessages,
        });

        // Extract final text response
        for (const block of finalResponse.content) {
          if (block.type === 'text') {
            assistantResponse += block.text;
          }
        }
      }

      // Update token usage in response event
      const responseEvent: AIEvent = {
        id: `event-${Date.now()}-response`,
        conversationId,
        type: 'response',
        timestamp: new Date(),
        data: {
          content: assistantResponse,
          tokens: {
            input: response.usage.input_tokens,
            output: response.usage.output_tokens,
          },
        },
      };
      events.push(responseEvent);
      io.to(conversationId).emit('ai:event', responseEvent);

    } catch (apiError: any) {
      console.warn('⚠️ Claude API unavailable, using scenario matching fallback:', apiError.message);

      // Fallback to scenario matching
      await new Promise(resolve => setTimeout(resolve, 800));
      assistantResponse = generateScenarioResponse(intent.scenario, userRole, userMessage);

      const responseEvent: AIEvent = {
        id: `event-${Date.now()}-response`,
        conversationId,
        type: 'response',
        timestamp: new Date(),
        data: {
          content: assistantResponse,
          tokens: {
            input: userMessage.length,
            output: assistantResponse.length,
          },
        },
      };
      events.push(responseEvent);
      io.to(conversationId).emit('ai:event', responseEvent);
    }

    // Create and broadcast AI message
    const aiMessage: Message = {
      id: `msg-${Date.now()}-ai`,
      conversationId,
      senderId: 'ai-assistant',
      senderName: 'AI Assistant',
      senderRole: userRole,
      content: assistantResponse,
      timestamp: new Date(),
      isAI: true,
    };

    io.to(conversationId).emit('message:received', aiMessage);

    // Generate and emit orchestration actions
    const actions = generateOrchestrationActions(userMessage, userRole, toolCalls, assistantResponse);
    if (actions.length > 0) {
      setTimeout(() => {
        io.to(conversationId).emit('orchestration:actions', {
          conversationId,
          actions,
          timestamp: new Date(),
        });
      }, 500); // Small delay to show progression
    }
  } catch (error) {
    console.error('Error in AI interaction:', error);

    // Emit error event
    const errorEvent: AIEvent = {
      id: `event-${Date.now()}-error`,
      conversationId,
      type: 'error',
      timestamp: new Date(),
      data: {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    };
    io.to(conversationId).emit('ai:event', errorEvent);
  }
}

// Build system prompt based on user role
function buildSystemPrompt(userRole: 'customer' | 'business' | 'driver'): string {
  const basePrompt = `You are an AI assistant for a food delivery platform (similar to Wolt/DoorDash). You help facilitate communication and automation between customers, restaurants, and delivery drivers.`;

  const rolePrompts = {
    customer: `
${basePrompt}

You are currently assisting a CUSTOMER. Your responsibilities:
- Help them browse menus and make food recommendations
- Answer questions about restaurants, delivery times, and pricing
- Assist with placing orders and applying discounts
- Provide order tracking and delivery updates
- Handle issues like incorrect orders or delays

Be friendly, helpful, and proactive in suggesting solutions.`,

    business: `
${basePrompt}

You are currently assisting a RESTAURANT/BUSINESS. Your responsibilities:
- Help manage incoming orders and update order statuses
- Assist with inventory and menu questions
- Provide insights on order volume and busy times
- Help coordinate with delivery drivers
- Handle customer inquiries on behalf of the restaurant

Be professional and efficiency-focused.`,

    driver: `
${basePrompt}

You are currently assisting a DELIVERY DRIVER. Your responsibilities:
- Help optimize delivery routes
- Provide navigation assistance and traffic updates
- Assist with order pickup and delivery coordination
- Help communicate with customers and restaurants
- Handle delivery issues like wrong addresses or access problems

Be clear, concise, and focused on efficiency.`,
  };

  return rolePrompts[userRole];
}

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/api/tools', (req, res) => {
  res.json(deliveryTools);
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🚀 Socket.io ready for connections`);
  console.log(`🤖 Anthropic API configured: ${!!process.env.ANTHROPIC_API_KEY}`);
});
