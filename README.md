# Socket.IO TypeScript Template with uWebSockets.js

This is a high-performance Socket.IO server template built with TypeScript, optimized for up to 500,000 concurrent clients using **uWebSockets.js**. It supports complex logic, horizontal scaling with Redis, and extensibility through design patterns (Singleton, Factory, Observer, Strategy).

## Features
- **Ultra-High Performance**: Uses **uWebSockets.js** for low-latency WebSocket connections.
- **Scalability**: Handles 500k clients with Redis adapter and load balancing.
- **Modular Design**: Organized into core, modules (rooms), and workers.
- **Event Handling**: Type-safe `EventEmitter` with modular handlers for robust event processing.
- **Design Patterns**:
  - **Singleton**: Socket.IO management.
  - **Factory**: Room creation.
  - **Observer**: Event handling.
  - **Strategy**: Message and worker task processing.
- **Worker Threads**: Offloads heavy computations.
- **Redis Pub/Sub**: Ensures multi-instance communication.
- **Logging**: Integrated with Winston.

## Prerequisites
- **Node.js**: Version 18.x or higher.
- **Redis**: Version 6.x or higher.
- **Nginx**: Version 1.18 or higher (for production).
- **TypeScript**: Version 5.4.x or higher.
- **npm**: Version 8.x or higher.
- **C++ Compiler**: For uWebSockets.js.
  - **Linux**: `sudo apt-get install build-essential`.
  - **macOS**: `xcode-select --install`.
  - **Windows**: Visual Studio with C++ Build Tools.

## Project Structure
```
socketio-template/
├── src/
│   ├── config/                     # Configuration files
│   ├── core/                       # Core components
│   │   ├── event/                  # Event handling (EventEmitter, handlers)
│   │   ├── socket/                 # Socket.IO management
│   │   └── strategy/               # Message strategies
│   ├── modules/                    # Feature modules
│   │   └── room/                   # Room management
│   ├── workers/                    # Worker threads
│   ├── utils/                      # Utilities (logging)
│   └── index.ts                    # Entry point
├── nginx.conf                      # Nginx configuration
├── .env                            # Environment variables
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## Setup and Configuration

### 1. Clone the Repository
```bash
git clone https://github.com/DVNghiem/Socket.io-Boilerplate
cd socketio-template
```

### 2. Install Dependencies
```bash
npm install
```

**Note**: uWebSockets.js requires native compilation. Ensure a C++ compiler is installed:
- **Linux**: `sudo apt-get install build-essential`
- **macOS**: `xcode-select --install`
- **Windows**: Install Visual Studio with C++ Build Tools.

### 3. Set Up Redis
- **Local Installation**:
  - Install Redis: [Redis Installation Guide](https://redis.io/docs/getting-started/installation/).
  - Start Redis:
    ```bash
    redis-server
    ```
- **Docker**:
  ```bash
  docker run -d -p 6379:6379 redis
  ```

### 4. Set Up Nginx (Production)
1. Install Nginx:
   - **Linux**: `sudo apt-get install nginx`
   - **macOS**: `brew install nginx`
   - **Windows**: Download from [nginx.org](https://nginx.org).
2. Copy `nginx.conf` to `/etc/nginx/nginx.conf`:
   ```bash
   sudo cp nginx.conf /etc/nginx/nginx.conf
   sudo nginx -t
   sudo nginx
   ```

### 5. Configure Environment Variables
Create a `.env` file:
```
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 6. Build the Project
```bash
npm run build
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

Server runs on `http://localhost:3000`.

## Usage

### Connecting Clients
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('Connected via uWebSockets.js');
  
  // Join a room
  socket.emit('join:room', 'room1');
  
  // Send a message
  socket.emit('chat:message', { roomId: 'room1', content: 'Hello, world!' });
});

socket.on('chat:message', (message) => {
  console.log('Received message:', message);
});
```

### Server Events
- **join:room**: `{ roomId: string }` - Joins a room.
- **chat:message**: `{ roomId: string, content: string }` - Sends a message.
- **client:connect**: Triggered on connection.
- **client:disconnect**: Triggered on disconnection.

### Extending the Application
#### Adding a Message Strategy
1. Create in `src/core/strategy/strategies/`:
   ```typescript
   import { Socket } from 'socket.io';
   import { MessageStrategy } from '../MessageStrategy';

   export class NotificationStrategy implements MessageStrategy {
     async process(socket: Socket, message: any): Promise<void> {
       console.log('Notification:', message);
     }
   }
   ```
2. Create a handler in `src/core/event/handlers/`:
   ```typescript
   import { Socket } from 'socket.io';
   import { EventHandler } from '../EventHandler';
   import { NotificationStrategy } from '../../strategy/strategies/NotificationStrategy';

   export class NotificationHandler implements EventHandler<[Socket, any]> {
     private strategy = new NotificationStrategy();
     handle(socket: Socket, message: any): void {
       this.strategy.process(socket, message);
     }
   }
   ```
3. Register in `src/index.ts`:
   ```typescript
   EventEmitter.getInstance().on('notification:message', new NotificationHandler());
   ```

#### Adding a Worker Strategy
1. Create in `src/workers/strategies/`:
   ```typescript
   import { WorkerStrategy } from '@workers/base/WorkerStrategy';
   import { Logger } from '@utils/Logger';

   export class NotificationWorkerStrategy implements WorkerStrategy {
     name = 'notification';
     process(message: any): any {
       Logger.info(`Processing notification: ${JSON.stringify(message)}`);
       return { processed: true, data: message, type: 'notification' };
     }
   }
   ```
2. Register in `src/workers/WorkerManager.ts` and `src/workers/WorkerThread.ts`.

#### Scaling for 500k Clients
- **Nginx Load Balancing**: Configured in `nginx.conf`.
- **Redis Cluster**:
  ```bash
  docker run -d --name redis-cluster -p 7000-7005:7000-7005 redis:6 redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005
  ```
  Update `.env` with cluster details.
- **Kernel Tuning**:
  ```bash
  sudo sysctl -w net.core.somaxconn=65535
  sudo sysctl -w net.ipv4.tcp_max_syn_backlog=8192
  sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"
  ```
- **Clustering (Optional)**:
  ```typescript
  import cluster from 'cluster';
  import os from 'os';

  if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  } else {
    SocketManager.getInstance();
    EventEmitter.getInstance().on('client:connect', new ClientConnectHandler());
    EventEmitter.getInstance().on('chat:message', new ChatMessageHandler());
  }
  ```

## Troubleshooting
- **uWebSockets.js Compilation**:
  - Ensure C++ compiler is installed.
  - Reinstall: `npm install uWebSockets.js`.
- **Redis Issues**:
  - Verify Redis is running: `redis-cli ping`.
  - Check `.env` variables.
- **Event Handling**:
  - Use `EventEmitter.getInstance().emit` for emitting events (e.g., in `SocketManager` or handlers).
  - Check logs for `client:connect` and `chat:message` events.
  - Ensure handlers implement `EventHandler` with correct argument types.

## Performance Testing
Test with `artillery`:
```yaml
config:
  target: 'http://localhost'
  phases:
    - duration: 60
      arrivalRate: 1000
  socketio:
    transport: websocket
scenarios:
  - name: 'Chat Test'
    engine: socketio
    flow:
      - emit:
          channel: 'join:room'
          data: 'room1'
      - emit:
          channel: 'chat:message'
          data: { roomId: 'room1', content: 'Test' }
```

## Contributing
Submit issues or pull requests. Ensure changes are tested and maintain modularity.

## License
MIT License