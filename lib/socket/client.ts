import { io, Socket } from 'socket.io-client';
import type { Message, AIEvent, Order, Conversation } from '@/lib/types';

class SocketClient {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  }

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Conversation methods
  joinConversation(conversationId: string): void {
    this.socket?.emit('conversation:join', conversationId);
  }

  sendMessage(data: {
    conversationId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderRole: 'customer' | 'business' | 'driver';
  }): void {
    this.socket?.emit('message:send', data);
  }

  onMessageReceived(callback: (message: Message) => void): void {
    this.socket?.on('message:received', callback);
  }

  onAIEvent(callback: (event: AIEvent) => void): void {
    this.socket?.on('ai:event', callback);
  }

  // Order methods
  updateOrderStatus(orderId: string, status: string): void {
    this.socket?.emit('order:update', { orderId, status });
  }

  onOrderUpdated(callback: (order: Order) => void): void {
    this.socket?.on('order:updated', callback);
  }

  // Conversation updates
  onConversationUpdated(callback: (conversation: Conversation) => void): void {
    this.socket?.on('conversation:updated', callback);
  }

  // Cleanup
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default socketClient;
