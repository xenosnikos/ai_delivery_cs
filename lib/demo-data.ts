import type { Order, User, Conversation, Message } from './types';

// Demo Users
export const demoCustomers: User[] = [
  { id: 'customer-1', name: 'Sarah Johnson', role: 'customer', avatar: '👩' },
  { id: 'customer-2', name: 'Mike Chen', role: 'customer', avatar: '👨' },
  { id: 'customer-3', name: 'Emily Davis', role: 'customer', avatar: '👩‍🦰' },
  { id: 'customer-4', name: 'James Wilson', role: 'customer', avatar: '👨‍🦱' },
];

export const demoBusinesses: User[] = [
  { id: 'business-1', name: 'Pizza Palace', role: 'business', avatar: '🍕' },
  { id: 'business-2', name: 'Burger Haven', role: 'business', avatar: '🍔' },
  { id: 'business-3', name: 'Sushi Express', role: 'business', avatar: '🍱' },
];

export const demoDrivers: User[] = [
  { id: 'driver-1', name: 'John Smith', role: 'driver', avatar: '🚴' },
  { id: 'driver-2', name: 'Lisa Wong', role: 'driver', avatar: '🚗' },
  { id: 'driver-3', name: 'Carlos Rodriguez', role: 'driver', avatar: '🏍️' },
];

// Demo Orders
export const demoOrders: Order[] = [
  {
    id: 'order-1',
    customerId: 'customer-1',
    customerName: 'Sarah Johnson',
    businessId: 'business-1',
    businessName: 'Pizza Palace',
    driverId: 'driver-1',
    driverName: 'John Smith',
    items: [
      { id: 'item-1', name: 'Margherita Pizza', quantity: 2, price: 12.99 },
      { id: 'item-2', name: 'Caesar Salad', quantity: 1, price: 8.99 },
    ],
    totalAmount: 34.97,
    status: 'delivering',
    deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
    pickupAddress: '456 Pizza Ave, New York, NY 10002',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
    estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000),
  },
  {
    id: 'order-2',
    customerId: 'customer-2',
    customerName: 'Mike Chen',
    businessId: 'business-2',
    businessName: 'Burger Haven',
    driverId: 'driver-2',
    driverName: 'Lisa Wong',
    items: [
      { id: 'item-3', name: 'Classic Burger', quantity: 1, price: 11.99 },
      { id: 'item-4', name: 'Fries', quantity: 2, price: 4.99 },
      { id: 'item-5', name: 'Milkshake', quantity: 1, price: 5.99 },
    ],
    totalAmount: 27.96,
    status: 'preparing',
    deliveryAddress: '789 Oak Rd, Brooklyn, NY 11201',
    pickupAddress: '321 Burger Ln, Brooklyn, NY 11202',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000),
    estimatedDeliveryTime: new Date(Date.now() + 40 * 60 * 1000),
  },
  {
    id: 'order-3',
    customerId: 'customer-3',
    customerName: 'Emily Davis',
    businessId: 'business-3',
    businessName: 'Sushi Express',
    items: [
      { id: 'item-6', name: 'California Roll', quantity: 2, price: 9.99 },
      { id: 'item-7', name: 'Salmon Sashimi', quantity: 1, price: 14.99 },
      { id: 'item-8', name: 'Miso Soup', quantity: 2, price: 3.99 },
    ],
    totalAmount: 42.95,
    status: 'confirmed',
    deliveryAddress: '555 Park Ave, Manhattan, NY 10022',
    pickupAddress: '888 Sushi St, Manhattan, NY 10023',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 1000),
    estimatedDeliveryTime: new Date(Date.now() + 50 * 60 * 1000),
  },
  {
    id: 'order-4',
    customerId: 'customer-4',
    customerName: 'James Wilson',
    businessId: 'business-1',
    businessName: 'Pizza Palace',
    driverId: 'driver-3',
    driverName: 'Carlos Rodriguez',
    items: [
      { id: 'item-9', name: 'Pepperoni Pizza', quantity: 1, price: 14.99 },
      { id: 'item-10', name: 'Garlic Bread', quantity: 1, price: 5.99 },
    ],
    totalAmount: 20.98,
    status: 'ready_for_pickup',
    deliveryAddress: '777 Elm St, Queens, NY 11354',
    pickupAddress: '456 Pizza Ave, New York, NY 10002',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 60 * 1000),
    estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000),
  },
];

// Demo Conversations
export const demoConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [demoCustomers[0], { id: 'ai', name: 'AI Assistant', role: 'customer' }],
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'customer-1',
        senderName: 'Sarah Johnson',
        senderRole: 'customer',
        content: 'I want to order some pizza for dinner',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        isAI: false,
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'ai',
        senderName: 'AI Assistant',
        senderRole: 'customer',
        content: "I'd be happy to help you order pizza! I can see there are several great options nearby. Would you like me to show you the menu from Pizza Palace? They have excellent reviews and are currently accepting orders.",
        timestamp: new Date(Date.now() - 34 * 60 * 1000),
        isAI: true,
      },
    ],
    lastMessageAt: new Date(Date.now() - 34 * 60 * 1000),
    orderId: 'order-1',
  },
  {
    id: 'conv-2',
    participants: [demoCustomers[1], { id: 'ai', name: 'AI Assistant', role: 'customer' }],
    messages: [
      {
        id: 'msg-3',
        conversationId: 'conv-2',
        senderId: 'customer-2',
        senderName: 'Mike Chen',
        senderRole: 'customer',
        content: 'Do you have any vegan burger options?',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        isAI: false,
      },
    ],
    lastMessageAt: new Date(Date.now() - 20 * 60 * 1000),
    orderId: 'order-2',
  },
  {
    id: 'conv-3',
    participants: [demoCustomers[2], { id: 'ai', name: 'AI Assistant', role: 'customer' }],
    messages: [
      {
        id: 'msg-4',
        conversationId: 'conv-3',
        senderId: 'customer-3',
        senderName: 'Emily Davis',
        senderRole: 'customer',
        content: 'I need sushi delivered ASAP',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        isAI: false,
      },
    ],
    lastMessageAt: new Date(Date.now() - 8 * 60 * 1000),
    orderId: 'order-3',
  },
];

// Menu items for different restaurants
export const restaurantMenus = {
  'business-1': [
    { id: 'menu-1-1', name: 'Margherita Pizza', price: 12.99, category: 'Pizza', description: 'Classic tomato sauce and fresh mozzarella' },
    { id: 'menu-1-2', name: 'Pepperoni Pizza', price: 14.99, category: 'Pizza', description: 'Spicy pepperoni with our signature cheese blend' },
    { id: 'menu-1-3', name: 'Veggie Supreme', price: 13.99, category: 'Pizza', description: 'Fresh vegetables on whole wheat crust' },
    { id: 'menu-1-4', name: 'Caesar Salad', price: 8.99, category: 'Salads', description: 'Crisp romaine with house-made dressing' },
    { id: 'menu-1-5', name: 'Garlic Bread', price: 5.99, category: 'Sides', description: 'Fresh baked with garlic butter' },
  ],
  'business-2': [
    { id: 'menu-2-1', name: 'Classic Burger', price: 11.99, category: 'Burgers', description: 'Beef patty with lettuce, tomato, and our special sauce' },
    { id: 'menu-2-2', name: 'Impossible Burger', price: 13.99, category: 'Burgers', description: 'Plant-based patty for our vegan friends' },
    { id: 'menu-2-3', name: 'Bacon Cheeseburger', price: 14.99, category: 'Burgers', description: 'Double beef with crispy bacon' },
    { id: 'menu-2-4', name: 'Fries', price: 4.99, category: 'Sides', description: 'Crispy golden french fries' },
    { id: 'menu-2-5', name: 'Milkshake', price: 5.99, category: 'Drinks', description: 'Chocolate, vanilla, or strawberry' },
  ],
  'business-3': [
    { id: 'menu-3-1', name: 'California Roll', price: 9.99, category: 'Rolls', description: 'Crab, avocado, and cucumber' },
    { id: 'menu-3-2', name: 'Spicy Tuna Roll', price: 11.99, category: 'Rolls', description: 'Fresh tuna with spicy mayo' },
    { id: 'menu-3-3', name: 'Salmon Sashimi', price: 14.99, category: 'Sashimi', description: '8 pieces of fresh salmon' },
    { id: 'menu-3-4', name: 'Miso Soup', price: 3.99, category: 'Soup', description: 'Traditional Japanese soup' },
    { id: 'menu-3-5', name: 'Edamame', price: 4.99, category: 'Appetizers', description: 'Steamed soybeans with sea salt' },
  ],
};
