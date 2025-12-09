# Socket.IO Boilerplate Examples

This directory contains practical examples demonstrating how to use the Socket.IO boilerplate.

## Examples Included

### 1. Basic Chat Client (`chat-client.html`)

A standalone HTML file with a beautiful, modern chat interface.

**Features:**
- Real-time messaging
- Connection status indicator
- Auto-reconnection
- Message timestamps
- Responsive design
- No build process required

**How to use:**
```bash
# 1. Start the Socket.IO server
npm run dev

# 2. Open chat-client.html in your browser
# You can open multiple browser windows to test multi-user chat
```

### 2. React Chat Client (`react-chat-client.tsx`)

A React component with TypeScript and Tailwind CSS.

**Features:**
- Type-safe Socket.IO integration
- Modern React hooks
- Tailwind CSS styling
- Auto-scroll to latest messages
- Connection state management

**How to use:**
```bash
# In your React project:
npm install socket.io-client

# Copy react-chat-client.tsx to your project
# Import and use the component:
import ChatApp from './react-chat-client';

function App() {
  return <ChatApp />;
}
```

### 3. Artillery Load Test (`artillery-test.yml`)

Comprehensive load testing configuration.

**Test Phases:**
1. Warm up (30s, 10 users/sec)
2. Ramp up (60s, 10→100 users/sec)
3. Sustained load (120s, 100 users/sec)
4. Spike test (30s, 500 users/sec)
5. Cool down (30s, 10 users/sec)

**How to use:**
```bash
# Install Artillery
npm install -g artillery

# Run the test
artillery run artillery-test.yml

# Generate HTML report
artillery run --output report.json artillery-test.yml
artillery report report.json
```

## Quick Start

### Test the Chat System

1. **Start Redis:**
   ```bash
   docker run -d -p 6379:6379 redis
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **Open the chat client:**
   - Open `examples/chat-client.html` in multiple browser windows
   - Start chatting!

### Run Load Tests

```bash
# Basic test
artillery quick --count 100 --num 10 http://localhost:3000

# Full test suite
artillery run examples/artillery-test.yml
```

## Creating Your Own Examples

### Custom Event Handler Example

```typescript
// 1. Define event in EventMap
export interface EventMap {
  'custom:event': [Socket, CustomData];
}

// 2. Create handler
export class CustomHandler implements EventHandler<[Socket, CustomData]> {
  handle(socket: Socket, data: CustomData): void {
    // Your logic here
  }
}

// 3. Register in index.ts
EventEmitter.getInstance().on('custom:event', new CustomHandler());
```

### Custom Strategy Example

```typescript
// 1. Create strategy
export class CustomStrategy implements MessageStrategy {
  async process(socket: Socket, message: any): Promise<void> {
    // Your processing logic
  }
}

// 2. Use in handler
export class CustomMessageHandler implements EventHandler<[Socket, any]> {
  private strategy = new CustomStrategy();
  
  handle(socket: Socket, message: any): void {
    this.strategy.process(socket, message);
  }
}
```

## Additional Resources

- [Main Documentation](../README.md)
- [Complete Guide](../GUIDE.md)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)

## Support

For issues or questions, please refer to the main [README](../README.md) or open an issue on GitHub.
