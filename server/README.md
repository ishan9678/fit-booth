# Socket.IO Integration - Fit Booth

This document describes the Socket.IO real-time communication setup for the Fit Booth application.

## Architecture

The Socket.IO integration consists of:

1. **Separate Express Server** (`server/socket-server.ts`) - Handles WebSocket connections
2. **Next.js Middleware** (`middleware.ts`) - Routes Socket.IO requests to the Express server
3. **React Hooks** (`hooks/useSocket.ts`) - Client-side Socket.IO integration
4. **React Context** (`components/SocketProvider.tsx`) - Application-wide Socket.IO state

## Setup Instructions

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Socket.IO Configuration
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### 3. Start Development Servers

```bash
# Start both Next.js and Socket.IO servers
yarn run dev

# Or start individually:
yarn run dev:next  # Next.js server (port 3000)
yarn run dev:socket  # Socket.IO server (port 3001)
```

## Socket.IO Events

### Session Events

- **`session:join`** - Join a session room
- **`session:leave`** - Leave a session room  
- **`session:view`** - Record a session view
- **`session:update`** - Update session data
- **`session:joined`** - Confirmation of joining session
- **`session:updated`** - Session data updated

### Reaction Events

- **`reaction:add`** - Add a reaction to a session
- **`reaction:remove`** - Remove a reaction
- **`reaction:added`** - New reaction added (broadcast)
- **`reaction:removed`** - Reaction removed (broadcast)
- **`reaction:counts`** - Updated reaction counts

### User Events

- **`user:presence`** - Update user presence status
- **`user:joined`** - User joined session (broadcast)
- **`user:left`** - User left session (broadcast)
- **`user:presence-update`** - User presence changed (broadcast)

### System Events

- **`ping`** - Connection health check
- **`pong`** - Health check response
- **`error`** - Error message

## Usage Examples

### Basic Socket Connection

```tsx
import { useSocket } from '../hooks/useSocket';

function MyComponent() {
  const { connected, emit, on } = useSocket();
  
  useEffect(() => {
    if (connected) {
      emit('session:join', 'session-123');
    }
  }, [connected, emit]);
  
  return <div>Connected: {connected ? 'Yes' : 'No'}</div>;
}
```

### Session-Specific Socket

```tsx
import { useSessionSocket } from '../hooks/useSocket';

function SessionComponent({ sessionId }: { sessionId: string }) {
  const { 
    connected, 
    sessionState, 
    recordView, 
    addReaction 
  } = useSessionSocket(sessionId);
  
  const handleReaction = () => {
    addReaction('👍', 'anonymous-id', 'user-id');
  };
  
  return (
    <div>
      <p>Views: {sessionState.viewCount}</p>
      <p>Active Users: {sessionState.activeUsers.length}</p>
      <button onClick={handleReaction}>👍</button>
    </div>
  );
}
```

### Using the Context Provider

```tsx
import { SocketProvider } from '../components/SocketProvider';

function App() {
  return (
    <SocketProvider>
      <MySocketComponent />
    </SocketProvider>
  );
}
```

## API Endpoints

### Health Check

```bash
GET /api/socket/health
```

Returns the status of the Socket.IO server:

```json
{
  "success": true,
  "socketServer": {
    "status": "healthy",
    "url": "http://localhost:3001",
    "timestamp": "2025-07-12T10:30:00.000Z",
    "activeConnections": 5
  }
}
```

## Development

### File Structure

```
server/
├── socket-server.ts      # Main Socket.IO server
└── socket-handlers.ts    # Event handlers

hooks/
└── useSocket.ts         # React hooks for Socket.IO

components/
├── SocketProvider.tsx   # Context provider
└── SocketExample.tsx    # Example usage component

middleware.ts            # Next.js middleware for routing
```

### Testing the Integration

1. Start the development servers:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000` to test the Next.js app

3. Check Socket.IO server health:
   ```bash
   curl http://localhost:3001/api/socket/health
   ```

### Database Integration

The Socket.IO server integrates with the Drizzle ORM database to:

- Record session views in real-time
- Store and broadcast reactions
- Track user presence and session statistics
- Maintain session state and expiration

### Performance Considerations

- **Connection Pooling**: Socket.IO server uses connection pooling for database queries
- **Room-based Broadcasting**: Events are broadcasted only to relevant session rooms
- **Indexed Queries**: Database queries use optimized indexes for performance
- **Memory Management**: Automatic cleanup of disconnected clients

### Error Handling

- Connection errors are handled gracefully with automatic reconnection
- Database errors are logged and don't crash the Socket.IO server
- Invalid events are rejected with appropriate error messages
- Rate limiting can be implemented for production use

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Use environment variables for all URLs
4. Implement rate limiting and authentication
5. Monitor connection health and performance
6. Set up SSL/TLS for secure WebSocket connections

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure Socket.IO server is running on the configured port
2. **CORS Errors**: Check `NEXT_PUBLIC_APP_URL` matches your frontend URL
3. **Database Errors**: Verify database connection and schema setup
4. **Event Not Received**: Check event names and ensure proper room joining

### Debug Mode

Enable verbose logging by setting environment variables:

```bash
DEBUG=socket.io:* npm run dev:socket
```
