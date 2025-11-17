// User Types
export type UserRole = 'customer' | 'business' | 'driver';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Order Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'picked_up'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  businessId: string;
  businessName: string;
  driverId?: string;
  driverName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: string;
  pickupAddress: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDeliveryTime?: Date;
}

// Message Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: Date;
  isAI: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessageAt: Date;
  orderId?: string;
}

// AI Reasoning Types
export type AIEventType =
  | 'thinking'
  | 'tool_call'
  | 'tool_result'
  | 'response'
  | 'error';

export interface AIEvent {
  id: string;
  conversationId: string;
  type: AIEventType;
  timestamp: Date;
  data: {
    thinking?: string;
    toolName?: string;
    toolInput?: any;
    toolOutput?: any;
    content?: string;
    error?: string;
    tokens?: {
      input: number;
      output: number;
    };
  };
}

// MCP Tool Types
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ToolCall {
  id: string;
  name: string;
  input: any;
  result?: any;
  error?: string;
  timestamp: Date;
}

// Flow Diagram Types
export interface FlowNode {
  id: string;
  type: 'ai' | 'tool' | 'user' | 'result';
  data: {
    label: string;
    content?: string;
    timestamp?: Date;
  };
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Socket Event Types
export interface SocketEvents {
  // Client to Server
  'message:send': (data: { conversationId: string; content: string; senderId: string }) => void;
  'order:update': (data: { orderId: string; status: OrderStatus }) => void;
  'conversation:join': (conversationId: string) => void;

  // Server to Client
  'message:received': (message: Message) => void;
  'ai:event': (event: AIEvent) => void;
  'order:updated': (order: Order) => void;
  'conversation:updated': (conversation: Conversation) => void;
}

// System Prompt Types
export interface SystemPrompt {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// Timeline Event Types
export interface TimelineEvent {
  id: string;
  type: 'message' | 'ai_event' | 'order_update' | 'tool_call';
  timestamp: Date;
  title: string;
  description: string;
  data?: any;
  icon?: string;
  color?: string;
}
