# Socket.IO TypeScript Template with uWebSockets.js

This is a high-performance Socket.IO server template built with TypeScript, optimized for up to 500,000 concurrent clients using **uWebSockets.js** as the WebSocket engine. It supports complex logic, horizontal scaling with Redis, and extensibility through design patterns (Singleton, Factory, Observer, Strategy).

## Features
- **Ultra-High Performance**: Leverages **uWebSockets.js** for low-latency, high-throughput WebSocket connections, ideal for 500k clients.
- **Scalability**: Uses Redis adapter for multi-instance scaling and load balancing.
- **Modular Design**: Organized into core, modules, and workers for easy extension.
- **Design Patterns**:
  - **Singleton**: Socket.IO server management.
  - **Factory**: Room creation.
  - **Observer**: Event handling.
  - **Strategy**: Message and worker task processing.
- **Worker Threads**: Offloads heavy computations to separate threads.
- **Redis Pub/Sub**: Ensures seamless communication across instances.
- **Logging**: Integrated with Winston for robust logging.

## Prerequisites
- **Node.js**: Version 18.x or higher.
- **Redis**: Version 6.x or higher.
- **TypeScript**: Version 5.4.x or higher.
- **npm**: Version 8.x or higher.
- **C++ Compiler**: Required for uWebSockets.js native compilation.
  - **Linux**: Install `build-essential` (`sudo apt-get install build-essential`).
  - **macOS**: Install Xcode Command Line Tools (`xcode-select --install`).
  - **Windows**: Install Visual Studio with C++ Build Tools.

## Project Structure
```
socketio-template/
├── src/
│   ├── config/                     # Configuration files
│   ├── core/                       # Core components (Socket.IO, events, strategies)
│   ├── modules/                    # Feature modules (rooms, users)
│   ├── workers/                    # Worker threads for heavy tasks
│   ├── utils/                      # Utilities (logging)
│   └── index.ts                    # Application entry point
├── .env                            # Environment variables
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # This file
```

## Setup and Configuration

### 1. Clone the Repository
```bash
git clone <repository-url>
cd socketio-template
```

### 2. Install Dependencies
```bash
npm install
```

**Note**: uWebSockets.js requires native compilation. If you encounter errors, ensure a C++ compiler is installed:
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
- **Docker** (recommended):
  ```bash
  docker run -d -p 6379:6379 redis
  ```

### 4. Configure Environment Variables
Create a `.env` file:
```
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
```

- `PORT`: Socket.IO server port.
- `REDIS_HOST`: Redis server host.
- `REDIS_PORT`: Redis server port (default: 6379).

### 5. Build the Project
Compile TypeScript to JavaScript:
```bash
npm run build
```

This installs uWebSockets.js and generates the `dist/` directory.

## Running the Application

### Development Mode
Run with hot-reloading:
```bash
npm run dev
```

### Production Mode
Build and run:
```bash
npm run build
npm start
```

The server starts on `http://localhost:3000` (or the specified port).

## Usage

### Connecting Clients
Use a Socket.IO client to connect, ensuring WebSocket transport:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('Connected to server via uWebSockets.js');
  socket.emit('join:room', 'room1');
  socket.emit('chat:message', { roomId: 'room1', content: 'Hello, world!' });
});

socket.on('chat:message', (message) => {
  console.log('Received message:', message);
});
```

**Note**: The `transports: ['websocket']` option ensures uWebSockets.js is used exclusively.

### Server Events
- **join:room**: `{ roomId: string }` - Joins a room.
- **chat:message**: `{ roomId: string, content: string }` - Sends a message to the room.
- **client:connect**: Triggered on client connection.
- **client:disconnect**: Triggered on client disconnection.

### Extending the Application
#### Adding a New Message Strategy
1. Create a strategy in `src/core/strategy/strategies/`:
   ```typescript
   // src/core/strategy/strategies/NotificationStrategy.ts
   import { Socket } from 'socket.io';
   import { MessageStrategy } from '../MessageStrategy';

   export class NotificationStrategy implements MessageStrategy {
     async process(socket: Socket, message: any): Promise<void> {
       console.log('Processing notification:', message);
     }
   }
   ```
2. Register in `src/index.ts`:
   ```typescript
   EventEmitter.on('notification:message', {
     handle: (socket: Socket, message: any) => {
       new NotificationStrategy().process(socket, message);
     },
   });
   ```

#### Adding a New Worker Strategy
1. Create a strategy in `src/workers/strategies/`:
   ```typescript
   // src/workers/strategies/NotificationWorkerStrategy.ts
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
2. Register in `src/workers/WorkerManager.ts` and `src/workers/WorkerThread.ts`:
   ```typescript
   this.strategies.set('notification', new NotificationWorkerStrategy());
   // WorkerThread.ts
   strategies.set('notification', new NotificationWorkerStrategy());
   ```

#### Scaling for 500k Clients
- **Load Balancer**: Use Nginx or AWS ELB to distribute connections.
  Example Nginx config:
  ```nginx
  http {
    upstream socketio {
      least_conn;
      server 127.0.0.1:3000;
      server 127.0.0.1:3001;
    }
    server {
      listen 80;
      location / {
        proxy_pass http://socketio;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
      }
    }
  }
  ```
- **Redis Cluster**: Configure a Redis cluster for high availability.
- **Clustering**: Add Node.js `cluster`:
  ```typescript
  // src/index.ts
  import cluster from 'cluster';
  import os from 'os';

  if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  } else {
    SocketManager.getInstance();
    // Existing code
  }
  ```

## Troubleshooting
- **uWebSockets.js Compilation Errors**:
  - Ensure a C++ compiler is installed (see Prerequisites).
  - Reinstall: `npm install uWebSockets.js`.
  - Check platform compatibility: uWebSockets.js may fail on unsupported architectures (e.g., some ARM servers).
- **Redis Connection Issues**:
  - Verify Redis is running and `.env` variables are correct.
- **Worker Thread Errors**:
  - Ensure `WorkerThread.js` is in `dist/workers/` after `npm run build`.
  - Check `logs/error.log`.
- **Connection Issues**:
  - Confirm clients use `transports: ['websocket']` to avoid fallback to polling.
  - Check server logs for uWebSockets.js connection messages.

## Performance Testing
Test with tools like `artillery` to simulate 500k clients:
```yaml
config:
  target: 'http://localhost:3000'
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
Submit issues or pull requests to enhance the template. Ensure changes are tested and maintain modularity.

## License
MIT License