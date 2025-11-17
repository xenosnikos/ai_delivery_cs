import { MCPTool } from '@/lib/types';

// MCP Tool Definitions for Wolt Delivery Platform
export const deliveryTools: MCPTool[] = [
  {
    name: 'search_menu',
    description: 'Search for menu items from a restaurant. Returns available dishes with prices and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        restaurantId: {
          type: 'string',
          description: 'The ID of the restaurant to search',
        },
        query: {
          type: 'string',
          description: 'Search query for menu items (e.g., "pizza", "vegan")',
        },
        category: {
          type: 'string',
          description: 'Optional category filter (e.g., "main", "dessert", "drinks")',
        },
      },
      required: ['restaurantId'],
    },
  },
  {
    name: 'create_order',
    description: 'Create a new order with the specified items. Returns the order ID and estimated delivery time.',
    inputSchema: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'ID of the customer placing the order',
        },
        restaurantId: {
          type: 'string',
          description: 'ID of the restaurant',
        },
        items: {
          type: 'array',
          description: 'Array of order items',
          items: {
            type: 'object',
            properties: {
              itemId: { type: 'string' },
              quantity: { type: 'number' },
              notes: { type: 'string' },
            },
          },
        },
        deliveryAddress: {
          type: 'string',
          description: 'Delivery address for the order',
        },
      },
      required: ['customerId', 'restaurantId', 'items', 'deliveryAddress'],
    },
  },
  {
    name: 'update_order_status',
    description: 'Update the status of an existing order. Used by business or driver to track order progress.',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'ID of the order to update',
        },
        status: {
          type: 'string',
          enum: ['confirmed', 'preparing', 'ready_for_pickup', 'picked_up', 'delivering', 'delivered', 'cancelled'],
          description: 'New status for the order',
        },
        estimatedTime: {
          type: 'number',
          description: 'Optional estimated time in minutes for completion',
        },
      },
      required: ['orderId', 'status'],
    },
  },
  {
    name: 'get_order_details',
    description: 'Retrieve detailed information about an order including status, items, and delivery information.',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'ID of the order to retrieve',
        },
      },
      required: ['orderId'],
    },
  },
  {
    name: 'find_nearest_driver',
    description: 'Find the nearest available driver for order pickup. Returns driver information and ETA.',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'ID of the order needing a driver',
        },
        pickupLocation: {
          type: 'object',
          properties: {
            lat: { type: 'number' },
            lng: { type: 'number' },
          },
          description: 'Pickup location coordinates',
        },
      },
      required: ['orderId', 'pickupLocation'],
    },
  },
  {
    name: 'optimize_route',
    description: 'Calculate the optimal delivery route considering traffic and multiple stops.',
    inputSchema: {
      type: 'object',
      properties: {
        driverId: {
          type: 'string',
          description: 'ID of the driver',
        },
        waypoints: {
          type: 'array',
          description: 'Array of delivery waypoints',
          items: {
            type: 'object',
            properties: {
              orderId: { type: 'string' },
              address: { type: 'string' },
              priority: { type: 'number' },
            },
          },
        },
      },
      required: ['driverId', 'waypoints'],
    },
  },
  {
    name: 'send_notification',
    description: 'Send a notification to a user (customer, business, or driver).',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'ID of the user to notify',
        },
        userRole: {
          type: 'string',
          enum: ['customer', 'business', 'driver'],
          description: 'Role of the user',
        },
        message: {
          type: 'string',
          description: 'Notification message',
        },
        orderId: {
          type: 'string',
          description: 'Optional related order ID',
        },
      },
      required: ['userId', 'userRole', 'message'],
    },
  },
  {
    name: 'check_restaurant_availability',
    description: 'Check if a restaurant is currently accepting orders and their estimated preparation time.',
    inputSchema: {
      type: 'object',
      properties: {
        restaurantId: {
          type: 'string',
          description: 'ID of the restaurant to check',
        },
      },
      required: ['restaurantId'],
    },
  },
  {
    name: 'apply_discount',
    description: 'Apply a discount code or promotional offer to an order.',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'ID of the order',
        },
        discountCode: {
          type: 'string',
          description: 'Discount code to apply',
        },
      },
      required: ['orderId', 'discountCode'],
    },
  },
  {
    name: 'track_delivery',
    description: 'Get real-time location and status of a delivery in progress.',
    inputSchema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'ID of the order to track',
        },
      },
      required: ['orderId'],
    },
  },
];

// Mock tool execution results
export const executeToolMock = async (toolName: string, input: any): Promise<any> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

  switch (toolName) {
    case 'search_menu':
      return {
        items: [
          { id: 'item-1', name: 'Margherita Pizza', price: 12.99, description: 'Classic tomato and mozzarella' },
          { id: 'item-2', name: 'Pepperoni Pizza', price: 14.99, description: 'Spicy pepperoni with cheese' },
          { id: 'item-3', name: 'Caesar Salad', price: 8.99, description: 'Fresh romaine with parmesan' },
        ],
      };

    case 'create_order':
      return {
        orderId: `order-${Date.now()}`,
        status: 'pending',
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000),
        totalAmount: 27.97,
      };

    case 'update_order_status':
      return {
        orderId: input.orderId,
        status: input.status,
        updatedAt: new Date(),
      };

    case 'get_order_details':
      return {
        orderId: input.orderId,
        status: 'preparing',
        items: [
          { name: 'Margherita Pizza', quantity: 2, price: 12.99 },
        ],
        totalAmount: 25.98,
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
      };

    case 'find_nearest_driver':
      return {
        driverId: 'driver-123',
        driverName: 'John Smith',
        eta: 5,
        distance: 1.2,
      };

    case 'optimize_route':
      return {
        route: ['waypoint-1', 'waypoint-2', 'waypoint-3'],
        estimatedDuration: 25,
        totalDistance: 8.5,
      };

    case 'send_notification':
      return {
        notificationId: `notif-${Date.now()}`,
        sent: true,
        timestamp: new Date(),
      };

    case 'check_restaurant_availability':
      return {
        available: true,
        preparationTime: 20,
        busyLevel: 'moderate',
      };

    case 'apply_discount':
      return {
        discountApplied: true,
        discountAmount: 5.00,
        newTotal: 22.97,
      };

    case 'track_delivery':
      return {
        currentLocation: { lat: 40.7128, lng: -74.0060 },
        status: 'delivering',
        eta: 12,
        driverName: 'John Smith',
      };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
};
