# Wolt AI Agent Demo Platform 🤖🍕

A comprehensive demonstration platform showcasing AI-powered delivery management for customers, businesses, and drivers with real-time reasoning visualization.

## ✨ Features

### 🧠 AI Reasoning Visualization
- **4 Visualization Modes**: Activity Feed, Timeline View, Flow Diagram, Debug Panel
- **Real-time Insights**: See Claude's thinking process as it happens
- **MCP Tool Monitoring**: Track every tool call with inputs and outputs
- **System Prompt Viewer**: Inspect the prompts sent to the AI

### 🎯 Three Specialized Interfaces

#### 1. Customer Interface
- Conversational AI assistant for ordering food
- Real-time order tracking
- Smart menu recommendations
- Chat-based ordering experience

#### 2. Business Dashboard
- Multi-customer chat management
- Order queue with status updates
- Complete AI reasoning panel with all visualization modes
- Real-time synchronization across all customers

#### 3. Driver Interface
- Delivery queue management
- AI-powered route optimization
- Earnings tracking
- Real-time navigation assistance

### 🛠️ Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, React Flow
- **AI**: Anthropic Claude API with streaming
- **Real-time**: Socket.io for WebSocket communication
- **State Management**: Zustand
- **Backend**: Express.js, Node.js

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Anthropic API key

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd wolt-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Edit `.env.local` file in the root directory and add your Anthropic API key:
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   PORT=3001
   ```

4. **Start the development servers**

   You'll need to run two servers:

   **Terminal 1 - Backend Server:**
   ```bash
   npm run server
   ```

   **Terminal 2 - Next.js Frontend:**
   ```bash
   npm run dev
   ```

   Or run both concurrently:
   ```bash
   npm run dev:all
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000`

## 📖 Usage

### Demo Flow

1. **Landing Page**: Choose which interface to explore
   - Customer: Experience AI-powered ordering
   - Business: Manage orders and see AI reasoning
   - Driver: Handle deliveries with AI assistance

2. **Customer Interface** (`/customer`)
   - Try: "Show me pizza places nearby"
   - Try: "I want to order a burger with fries"
   - Try: "Track my order"

3. **Business Dashboard** (`/business`)
   - View multiple customer conversations
   - Watch AI reasoning in real-time across 4 different views
   - Manage orders and update statuses
   - Switch between customers to see different conversations

4. **Driver Interface** (`/driver`)
   - View active deliveries
   - Update order statuses (Picked Up → Delivering → Delivered)
   - Ask AI for route optimization
   - Track earnings

## 🎨 Key Components

### AI Reasoning Panel

The Business Dashboard includes a sophisticated AI reasoning panel with 4 views:

1. **Activity Feed**: Stream of all AI events with detailed information
2. **Timeline View**: Chronological visualization of the conversation
3. **Flow Diagram**: Visual representation of tool calls and data flow
4. **Debug Panel**: Raw JSON payloads and system prompts

### MCP Tools

10 delivery-specific tools available to Claude:

- `search_menu`: Search restaurant menus
- `create_order`: Place new orders
- `update_order_status`: Update order progress
- `get_order_details`: Retrieve order information
- `find_nearest_driver`: Find available drivers
- `optimize_route`: Calculate optimal delivery routes
- `send_notification`: Send user notifications
- `check_restaurant_availability`: Check if restaurants are open
- `apply_discount`: Apply promo codes
- `track_delivery`: Real-time delivery tracking

## 🏗️ Project Structure

```
wolt-demo/
├── app/
│   ├── customer/           # Customer interface
│   ├── business/           # Business dashboard
│   │   └── components/     # Business-specific components
│   ├── driver/             # Driver interface
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── shared/             # Shared components
├── lib/
│   ├── ai/                 # AI integration
│   ├── mcp/                # MCP tool definitions
│   │   └── tools.ts        # Tool schemas and mock implementations
│   ├── socket/             # WebSocket client
│   │   └── client.ts       # Socket.io client wrapper
│   ├── store/              # Zustand state management
│   │   └── index.ts        # Global app store
│   ├── types/              # TypeScript types
│   │   └── index.ts        # Shared type definitions
│   ├── demo-data.ts        # Demo users, orders, conversations
│   └── utils.ts            # Utility functions
├── server/
│   ├── index.ts            # Express + Socket.io server
│   ├── routes/             # API routes
│   └── ai-handlers/        # AI request handlers
└── public/                 # Static assets
```

## 🎯 Demo Scenarios

### Scenario 1: Customer Orders Pizza
1. Open Customer interface
2. Send: "I want to order pizza"
3. Watch AI search menus and make recommendations
4. Observe tool calls in Business dashboard's AI panel

### Scenario 2: Business Manages Multiple Customers
1. Open Business dashboard
2. Select different customers from the sidebar
3. Switch between visualization modes (Activity, Timeline, Flow, Debug)
4. Watch real-time AI events as customers interact

### Scenario 3: Driver Completes Delivery
1. Open Driver interface
2. Select an active delivery
3. Update status: Ready for Pickup → Picked Up → Delivering → Delivered
4. Ask AI for route optimization

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |
| `NEXT_PUBLIC_SOCKET_URL` | WebSocket server URL | Yes |
| `PORT` | Backend server port | No (default: 3001) |
| `NEXT_PUBLIC_APP_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |

## 📝 Notes

- **Demo Data**: The app uses mock data and simulated tool responses
- **Real AI**: Claude integration is real - you'll see actual AI responses
- **WebSocket**: Real-time updates work across all interfaces
- **Production**: This is a demo - add authentication, validation, and error handling for production use

## 🐛 Troubleshooting

### Socket connection fails
- Ensure backend server is running on port 3001
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`

### AI not responding
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API quota and billing
- Look for errors in server console

### Port already in use
- Change `PORT` in `.env.local`
- Update `NEXT_PUBLIC_SOCKET_URL` accordingly

## 📄 License

MIT

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Anthropic Claude](https://www.anthropic.com/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for demonstrating AI agent capabilities**
