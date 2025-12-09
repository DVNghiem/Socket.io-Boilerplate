# Socket.IO Boilerplate - Quick Reference

## 🚀 Quick Start Commands

```bash
# Setup
git clone https://github.com/DVNghiem/Socket.io-Boilerplate
cd Socket.io-Boilerplate
npm install
cp .env.example .env

# Start Redis
docker run -d -p 6379:6379 redis

# Development
npm run dev

# Production
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── config/              # Configuration
├── core/
│   ├── event/          # Event system
│   ├── socket/         # Socket.IO manager
│   └── strategy/       # Message strategies
├── modules/
│   └── room/           # Room management
├── workers/            # Worker threads
└── utils/              # Utilities (Logger)
```

## 🔧 Configuration (.env)

```env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
LOG_LEVEL=info
```

## 📡 Client Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', { 
  transports: ['websocket'] 
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  socket.emit('join:room', 'room-id');
});

socket.on('chat:message', (message) => {
  console.log('Message:', message);
});

socket.emit('chat:message', {
  roomId: 'room-id',
  content: 'Hello!',
  user: 'username'
});
```

## 🎯 Core Events

| Event | Parameters | Description |
|-------|-----------|-------------|
| `join:room` | `roomId: string` | Join a room |
| `chat:message` | `{ roomId, content, user }` | Send message |
| `client:connect` | `socket: Socket` | Client connected |
| `client:disconnect` | `socket: Socket` | Client disconnected |

## 🏗️ Creating Custom Components

### Custom Event Handler

```typescript
// 1. Add to EventMap
export interface EventMap {
  'my:event': [Socket, MyData];
}

// 2. Create handler
export class MyHandler implements EventHandler<[Socket, MyData]> {
  handle(socket: Socket, data: MyData): void {
    // Your logic
  }
}

// 3. Register
EventEmitter.getInstance().on('my:event', new MyHandler());
```

### Custom Strategy

```typescript
export class MyStrategy implements MessageStrategy {
  async process(socket: Socket, message: any): Promise<void> {
    // Process message
    const room = RoomFactory.getRoom(message.roomId);
    room.broadcast(socket, 'my:event', result);
  }
}
```

### Custom Worker

```typescript
// 1. Create strategy
export class MyWorkerStrategy implements WorkerStrategy {
  name = 'my-worker';
  process(message: any): any {
    // Heavy computation
    return result;
  }
}

// 2. Register in WorkerManager and WorkerThread

// 3. Use
await workerManager.processMessage(taskId, data, 'my-worker');
```

## 🧪 Testing

```bash
# Unit tests (after setting up Jest)
npm test

# Load testing
npm install -g artillery
artillery run examples/artillery-test.yml

# Quick load test
artillery quick --count 100 --num 10 http://localhost:3000
```

## 🚢 Deployment

### Docker

```bash
docker-compose up -d
```

### PM2

```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx

```bash
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo nginx -s reload
```

## 📊 Monitoring

```typescript
// Add to your code
import { Logger } from './utils/Logger';

Logger.info('Message');
Logger.error('Error');
Logger.debug('Debug info');
```

## 🔍 Debugging

```bash
# Enable debug logs
LOG_LEVEL=debug npm run dev

# Check Redis
redis-cli ping

# Monitor Redis
redis-cli monitor

# Check connections
netstat -an | grep 3000
```

## ⚡ Performance Tips

1. **Use WebSocket only**: `transports: ['websocket']`
2. **Enable compression**: `perMessageDeflate: { threshold: 1024 }`
3. **Use binary data**: `socket.emit('data', Buffer.from([1,2,3]))`
4. **Limit max listeners**: `emitter.setMaxListeners(100)`
5. **Use worker threads**: For CPU-intensive tasks

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| uWebSockets.js build fails | Install C++ compiler: `sudo apt-get install build-essential` |
| Redis connection refused | Start Redis: `docker run -d -p 6379:6379 redis` |
| Worker path not found | Run `npm run build` for production |
| High memory usage | Increase Node.js memory: `node --max-old-space-size=4096` |
| CORS errors | Check `SocketManager.ts` CORS config |

## 📚 Resources

- **Full Guide**: [GUIDE.md](./GUIDE.md)
- **Examples**: [examples/](./examples/)
- **Socket.IO Docs**: https://socket.io/docs/v4/
- **uWebSockets.js**: https://github.com/uNetworking/uWebSockets.js

## 🎨 Example Files

- `examples/chat-client.html` - Standalone chat UI
- `examples/react-chat-client.tsx` - React component
- `examples/artillery-test.yml` - Load testing

## 🔐 Production Checklist

- [ ] Configure `.env` with production values
- [ ] Set up Redis cluster
- [ ] Configure Nginx with SSL/TLS
- [ ] Set up monitoring (Prometheus)
- [ ] Configure log aggregation
- [ ] Set up CI/CD pipeline
- [ ] Implement rate limiting
- [ ] Add authentication
- [ ] Set up backups
- [ ] Document runbooks

## 💡 Tips

- Open `examples/chat-client.html` in multiple browser windows to test
- Use `LOG_LEVEL=debug` for detailed logs
- Monitor event loop lag in production
- Use Redis Cluster for high availability
- Implement graceful shutdown handlers
- Add health check endpoints
- Use PM2 for process management
- Set up alerts for errors

---

**Need more details?** Check [GUIDE.md](./GUIDE.md) for comprehensive documentation!
