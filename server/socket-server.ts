import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import 'dotenv/config';
import { handleSocketEvents } from './socket-handlers';

const app = express();
const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Basic Express route for health check
app.get('/api/socket/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    activeConnections: io.engine.clientsCount
  });
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log(`📡 Client connected: ${socket.id}`);
  
  // Handle all socket events
  handleSocketEvents(socket, io);
  
  socket.on('disconnect', (reason) => {
    console.log(`📡 Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
});

export { io };
