'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MapPin, User, ChevronRight } from 'lucide-react';
import type { Order } from '@/lib/types';
import { socketClient } from '@/lib/socket/client';

interface OrderGridProps {
  orders: Order[];
}

export default function OrderGrid({ orders }: OrderGridProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready_for_pickup: 'bg-green-100 text-green-800 border-green-300',
      picked_up: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivering: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      delivered: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready_for_pickup',
      ready_for_pickup: 'picked_up',
    };
    return statusFlow[currentStatus] || null;
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    socketClient.updateOrderStatus(orderId, newStatus);
  };

  // Sort orders by status priority and time
  const sortedOrders = [...orders].sort((a, b) => {
    const statusPriority: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      preparing: 3,
      ready_for_pickup: 4,
      picked_up: 5,
      delivering: 6,
      delivered: 7,
      cancelled: 8,
    };

    const priorityDiff =
      (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
    if (priorityDiff !== 0) return priorityDiff;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders yet</p>
          </div>
        ) : (
          sortedOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);
            const timeSinceOrder = Math.floor(
              (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
            );

            return (
              <Card
                key={order.id}
                className={`p-4 border-l-4 ${
                  order.status === 'pending' || order.status === 'ready_for_pickup'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </h4>
                      <Badge className={getStatusColor(order.status) + ' text-xs'}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{timeSinceOrder} min ago</span>
                      </div>
                    </div>

                    <div className="space-y-1 mb-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-gray-500">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    {order.deliveryAddress && (
                      <div className="flex items-start gap-1 text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{order.deliveryAddress}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-bold text-sm">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                      {nextStatus && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, nextStatus)}
                          className="h-7 text-xs bg-orange-600 hover:bg-orange-700"
                        >
                          Mark as {nextStatus.replace('_', ' ')}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
