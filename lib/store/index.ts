import { create } from 'zustand';
import type { Message, AIEvent, Order, Conversation, TimelineEvent, MCPTool, FlowNode, FlowEdge, SystemPrompt } from '@/lib/types';

interface AppStore {
  // Conversations
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  setActiveConversation: (id: string) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;

  // Messages
  messages: Map<string, Message[]>;
  addMessage: (conversationId: string, message: Message) => void;
  getMessagesForConversation: (conversationId: string) => Message[];

  // AI Events
  aiEvents: Map<string, AIEvent[]>;
  addAIEvent: (conversationId: string, event: AIEvent) => void;
  getAIEventsForConversation: (conversationId: string) => AIEvent[];
  clearAIEvents: (conversationId: string) => void;

  // Orders
  orders: Map<string, Order>;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  getAllOrders: () => Order[];
  getOrderById: (orderId: string) => Order | undefined;

  // Timeline
  timelineEvents: Map<string, TimelineEvent[]>;
  addTimelineEvent: (conversationId: string, event: TimelineEvent) => void;
  getTimelineEventsForConversation: (conversationId: string) => TimelineEvent[];

  // Flow Diagram
  flowNodes: Map<string, FlowNode[]>;
  flowEdges: Map<string, FlowEdge[]>;
  addFlowNode: (conversationId: string, node: FlowNode) => void;
  addFlowEdge: (conversationId: string, edge: FlowEdge) => void;
  getFlowDataForConversation: (conversationId: string) => { nodes: FlowNode[]; edges: FlowEdge[] };
  clearFlowData: (conversationId: string) => void;

  // System Prompts
  systemPrompts: Map<string, SystemPrompt[]>;
  addSystemPrompt: (conversationId: string, prompt: SystemPrompt) => void;
  getSystemPromptsForConversation: (conversationId: string) => SystemPrompt[];

  // MCP Tools
  availableTools: MCPTool[];
  setAvailableTools: (tools: MCPTool[]) => void;
  toolCallHistory: Map<string, any[]>;
  addToolCall: (conversationId: string, toolCall: any) => void;

  // UI State
  selectedUserInBusiness: string | null;
  setSelectedUserInBusiness: (userId: string | null) => void;
  debugPanelExpanded: boolean;
  setDebugPanelExpanded: (expanded: boolean) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Conversations
  conversations: new Map(),
  activeConversationId: null,
  setActiveConversation: (id) => set({ activeConversationId: id }),
  addConversation: (conversation) =>
    set((state) => {
      const newConversations = new Map(state.conversations);
      newConversations.set(conversation.id, conversation);
      return { conversations: newConversations };
    }),
  updateConversation: (id, updates) =>
    set((state) => {
      const newConversations = new Map(state.conversations);
      const existing = newConversations.get(id);
      if (existing) {
        newConversations.set(id, { ...existing, ...updates });
      }
      return { conversations: newConversations };
    }),

  // Messages
  messages: new Map(),
  addMessage: (conversationId, message) =>
    set((state) => {
      const newMessages = new Map(state.messages);
      const existing = newMessages.get(conversationId) || [];

      // Check for duplicate message IDs to avoid React key errors
      const isDuplicate = existing.some((msg) => msg.id === message.id);
      if (isDuplicate) {
        return state; // Don't add duplicate
      }

      newMessages.set(conversationId, [...existing, message]);
      return { messages: newMessages };
    }),
  getMessagesForConversation: (conversationId) => {
    const state = get();
    return state.messages.get(conversationId) || [];
  },

  // AI Events
  aiEvents: new Map(),
  addAIEvent: (conversationId, event) =>
    set((state) => {
      const newEvents = new Map(state.aiEvents);
      const existing = newEvents.get(conversationId) || [];
      newEvents.set(conversationId, [...existing, event]);

      // Also add to timeline
      const timelineEvent: TimelineEvent = {
        id: event.id,
        type: 'ai_event',
        timestamp: event.timestamp,
        title: event.type.toUpperCase().replace('_', ' '),
        description: event.data.thinking || event.data.toolName || event.data.content || '',
        data: event.data,
        color: getEventColor(event.type),
      };

      const newTimelineEvents = new Map(state.timelineEvents);
      const existingTimeline = newTimelineEvents.get(conversationId) || [];
      newTimelineEvents.set(conversationId, [...existingTimeline, timelineEvent]);

      // Also update flow diagram if it's a tool call
      if (event.type === 'tool_call' || event.type === 'tool_result') {
        const newFlowNodes = new Map(state.flowNodes);
        const newFlowEdges = new Map(state.flowEdges);

        const existingNodes = newFlowNodes.get(conversationId) || [];
        const existingEdges = newFlowEdges.get(conversationId) || [];

        if (event.type === 'tool_call') {
          const node: FlowNode = {
            id: event.id,
            type: 'tool',
            data: {
              label: event.data.toolName || 'Tool',
              content: JSON.stringify(event.data.toolInput, null, 2),
              timestamp: event.timestamp,
            },
            position: { x: 200 + existingNodes.length * 250, y: 100 },
          };
          newFlowNodes.set(conversationId, [...existingNodes, node]);

          // Add edge from previous node
          if (existingNodes.length > 0) {
            const edge: FlowEdge = {
              id: `edge-${existingNodes.length}`,
              source: existingNodes[existingNodes.length - 1].id,
              target: node.id,
              label: 'calls',
            };
            newFlowEdges.set(conversationId, [...existingEdges, edge]);
          }
        } else if (event.type === 'tool_result') {
          const node: FlowNode = {
            id: event.id,
            type: 'result',
            data: {
              label: 'Result',
              content: JSON.stringify(event.data.toolOutput, null, 2),
              timestamp: event.timestamp,
            },
            position: { x: 200 + existingNodes.length * 250, y: 300 },
          };
          newFlowNodes.set(conversationId, [...existingNodes, node]);

          // Add edge from tool call
          if (existingNodes.length > 0) {
            const edge: FlowEdge = {
              id: `edge-${existingNodes.length}`,
              source: existingNodes[existingNodes.length - 1].id,
              target: node.id,
              label: 'returns',
            };
            newFlowEdges.set(conversationId, [...existingEdges, edge]);
          }
        }

        return {
          aiEvents: newEvents,
          timelineEvents: newTimelineEvents,
          flowNodes: newFlowNodes,
          flowEdges: newFlowEdges,
        };
      }

      return { aiEvents: newEvents, timelineEvents: newTimelineEvents };
    }),
  getAIEventsForConversation: (conversationId) => {
    const state = get();
    return state.aiEvents.get(conversationId) || [];
  },
  clearAIEvents: (conversationId) =>
    set((state) => {
      const newEvents = new Map(state.aiEvents);
      newEvents.delete(conversationId);
      return { aiEvents: newEvents };
    }),

  // Orders
  orders: new Map(),
  addOrder: (order) =>
    set((state) => {
      const newOrders = new Map(state.orders);
      newOrders.set(order.id, order);
      return { orders: newOrders };
    }),
  updateOrder: (orderId, updates) =>
    set((state) => {
      const newOrders = new Map(state.orders);
      const existing = newOrders.get(orderId);
      if (existing) {
        newOrders.set(orderId, { ...existing, ...updates });
      }
      return { orders: newOrders };
    }),
  getAllOrders: () => {
    const state = get();
    return Array.from(state.orders.values());
  },
  getOrderById: (orderId) => {
    const state = get();
    return state.orders.get(orderId);
  },

  // Timeline
  timelineEvents: new Map(),
  addTimelineEvent: (conversationId, event) =>
    set((state) => {
      const newEvents = new Map(state.timelineEvents);
      const existing = newEvents.get(conversationId) || [];
      newEvents.set(conversationId, [...existing, event]);
      return { timelineEvents: newEvents };
    }),
  getTimelineEventsForConversation: (conversationId) => {
    const state = get();
    return state.timelineEvents.get(conversationId) || [];
  },

  // Flow Diagram
  flowNodes: new Map(),
  flowEdges: new Map(),
  addFlowNode: (conversationId, node) =>
    set((state) => {
      const newNodes = new Map(state.flowNodes);
      const existing = newNodes.get(conversationId) || [];
      newNodes.set(conversationId, [...existing, node]);
      return { flowNodes: newNodes };
    }),
  addFlowEdge: (conversationId, edge) =>
    set((state) => {
      const newEdges = new Map(state.flowEdges);
      const existing = newEdges.get(conversationId) || [];
      newEdges.set(conversationId, [...existing, edge]);
      return { flowEdges: newEdges };
    }),
  getFlowDataForConversation: (conversationId) => {
    const state = get();
    return {
      nodes: state.flowNodes.get(conversationId) || [],
      edges: state.flowEdges.get(conversationId) || [],
    };
  },
  clearFlowData: (conversationId) =>
    set((state) => {
      const newNodes = new Map(state.flowNodes);
      const newEdges = new Map(state.flowEdges);
      newNodes.delete(conversationId);
      newEdges.delete(conversationId);
      return { flowNodes: newNodes, flowEdges: newEdges };
    }),

  // System Prompts
  systemPrompts: new Map(),
  addSystemPrompt: (conversationId, prompt) =>
    set((state) => {
      const newPrompts = new Map(state.systemPrompts);
      const existing = newPrompts.get(conversationId) || [];
      newPrompts.set(conversationId, [...existing, prompt]);
      return { systemPrompts: newPrompts };
    }),
  getSystemPromptsForConversation: (conversationId) => {
    const state = get();
    return state.systemPrompts.get(conversationId) || [];
  },

  // MCP Tools
  availableTools: [],
  setAvailableTools: (tools) => set({ availableTools: tools }),
  toolCallHistory: new Map(),
  addToolCall: (conversationId, toolCall) =>
    set((state) => {
      const newHistory = new Map(state.toolCallHistory);
      const existing = newHistory.get(conversationId) || [];
      newHistory.set(conversationId, [...existing, toolCall]);
      return { toolCallHistory: newHistory };
    }),

  // UI State
  selectedUserInBusiness: null,
  setSelectedUserInBusiness: (userId) => set({ selectedUserInBusiness: userId }),
  debugPanelExpanded: true,
  setDebugPanelExpanded: (expanded) => set({ debugPanelExpanded: expanded }),
}));

// Helper function to get color for event types
function getEventColor(type: string): string {
  const colorMap: Record<string, string> = {
    thinking: 'blue',
    tool_call: 'purple',
    tool_result: 'green',
    response: 'cyan',
    error: 'red',
  };
  return colorMap[type] || 'gray';
}
