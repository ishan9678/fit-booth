import { Socket, Server } from 'socket.io';
import { db } from '../db/client';
import { sessions, views as viewsTable, reactions as reactionsTable } from '../db/schema';
import { eq, and, gte } from 'drizzle-orm';

export interface SocketEvents {
  // Session events
  'session:join': (sessionId: string) => void;
  'session:leave': (sessionId: string) => void;
  'session:view': (data: { sessionId: string; anonymousId?: string; userId?: string }) => void;
  
  // Reaction events
  'reaction:add': (data: { sessionId: string; emoji: string; anonymousId?: string; userId?: string }) => void;
  'reaction:remove': (data: { reactionId: number }) => void;
  
  // Real-time updates
  'session:update': (data: { sessionId: string; updates: any }) => void;
  'session:expired': (sessionId: string) => void;
  
  // User presence
  'user:presence': (data: { sessionId: string; status: 'online' | 'offline' }) => void;
}

export function handleSocketEvents(socket: Socket, io: Server) {
  // Join a session room
  socket.on('session:join', async (sessionId: string) => {
    try {
      console.log(`📺 User ${socket.id} joining session: ${sessionId}`);
      
      // Verify session exists and is active
      const session = await db.select().from(sessions)
        .where(and(
          eq(sessions.id, sessionId),
          eq(sessions.isActive, true),
          gte(sessions.expiresAt, new Date())
        ));
      
      if (session.length === 0) {
        socket.emit('error', { message: 'Session not found or expired' });
        return;
      }
      
      // Join the session room
      await socket.join(`session:${sessionId}`);
      
      // Get current session stats
      const [viewCount, reactionCount] = await Promise.all([
        db.select({ count: viewsTable.id }).from(viewsTable).where(eq(viewsTable.sessionId, sessionId)),
        db.select({ count: reactionsTable.id }).from(reactionsTable).where(eq(reactionsTable.sessionId, sessionId))
      ]);
      
      // Send session data to the user
      socket.emit('session:joined', {
        sessionId,
        session: session[0],
        stats: {
          views: viewCount[0]?.count || 0,
          reactions: reactionCount[0]?.count || 0
        }
      });
      
      // Notify others in the room
      socket.to(`session:${sessionId}`).emit('user:joined', {
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error joining session:', error);
      socket.emit('error', { message: 'Failed to join session' });
    }
  });
  
  // Leave a session room
  socket.on('session:leave', async (sessionId: string) => {
    try {
      console.log(`📺 User ${socket.id} leaving session: ${sessionId}`);
      
      await socket.leave(`session:${sessionId}`);
      
      // Notify others in the room
      socket.to(`session:${sessionId}`).emit('user:left', {
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  });
  
  // Record a view
  socket.on('session:view', async (data) => {
    try {
      const { sessionId, anonymousId, userId } = data;
      
      // Record the view in database
      await db.insert(viewsTable).values({
        sessionId,
        anonymousId,
        userId,
        ipAddress: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent'] || 'Unknown'
      });
      
      // Broadcast updated view count to session room
      const viewCount = await db.select({ count: viewsTable.id })
        .from(viewsTable)
        .where(eq(viewsTable.sessionId, sessionId));
      
      io.to(`session:${sessionId}`).emit('session:view-count', {
        sessionId,
        count: viewCount[0]?.count || 0
      });
      
    } catch (error) {
      console.error('Error recording view:', error);
    }
  });
  
  // Add a reaction
  socket.on('reaction:add', async (data) => {
    try {
      const { sessionId, emoji, anonymousId, userId } = data;
      
      // Add reaction to database
      const [reaction] = await db.insert(reactionsTable).values({
        sessionId,
        emoji,
        anonymousId,
        userId,
        ipAddress: socket.handshake.address
      }).returning();
      
      // Broadcast new reaction to session room
      io.to(`session:${sessionId}`).emit('reaction:added', {
        reaction,
        timestamp: new Date().toISOString()
      });
      
      // Send updated reaction counts
      const reactionCounts = await db.select({ 
        emoji: reactionsTable.emoji,
        count: reactionsTable.id 
      })
      .from(reactionsTable)
      .where(eq(reactionsTable.sessionId, sessionId));
      
      io.to(`session:${sessionId}`).emit('reaction:counts', {
        sessionId,
        counts: reactionCounts
      });
      
    } catch (error) {
      console.error('Error adding reaction:', error);
      socket.emit('error', { message: 'Failed to add reaction' });
    }
  });
  
  // Remove a reaction
  socket.on('reaction:remove', async (data) => {
    try {
      const { reactionId } = data;
      
      // Get reaction details before deletion
      const reactionToDelete = await db.select()
        .from(reactionsTable)
        .where(eq(reactionsTable.id, reactionId));
      
      if (reactionToDelete.length === 0) {
        socket.emit('error', { message: 'Reaction not found' });
        return;
      }
      
      const sessionId = reactionToDelete[0].sessionId;
      
      // Remove reaction from database
      await db.delete(reactionsTable).where(eq(reactionsTable.id, reactionId));
      
      // Broadcast reaction removal to session room
      io.to(`session:${sessionId}`).emit('reaction:removed', {
        reactionId,
        sessionId,
        timestamp: new Date().toISOString()
      });
      
      // Send updated reaction counts
      const reactionCounts = await db.select({ 
        emoji: reactionsTable.emoji,
        count: reactionsTable.id 
      })
      .from(reactionsTable)
      .where(eq(reactionsTable.sessionId, sessionId));
      
      io.to(`session:${sessionId}`).emit('reaction:counts', {
        sessionId,
        counts: reactionCounts
      });
      
    } catch (error) {
      console.error('Error removing reaction:', error);
      socket.emit('error', { message: 'Failed to remove reaction' });
    }
  });
  
  // Handle session updates
  socket.on('session:update', async (data) => {
    try {
      const { sessionId, updates } = data;
      
      // Update session in database
      await db.update(sessions)
        .set(updates)
        .where(eq(sessions.id, sessionId));
      
      // Broadcast update to session room
      io.to(`session:${sessionId}`).emit('session:updated', {
        sessionId,
        updates,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error updating session:', error);
      socket.emit('error', { message: 'Failed to update session' });
    }
  });
  
  // Handle user presence
  socket.on('user:presence', async (data) => {
    try {
      const { sessionId, status } = data;
      
      // Broadcast presence update to session room
      socket.to(`session:${sessionId}`).emit('user:presence-update', {
        socketId: socket.id,
        status,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  });
  
  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });
}

// Utility function to get session stats
export async function getSessionStats(sessionId: string) {
  try {
    const [viewStats, reactionStats] = await Promise.all([
      db.select({ count: viewsTable.id }).from(viewsTable).where(eq(viewsTable.sessionId, sessionId)),
      db.select({ count: reactionsTable.id }).from(reactionsTable).where(eq(reactionsTable.sessionId, sessionId))
    ]);
    
    return {
      views: viewStats[0]?.count || 0,
      reactions: reactionStats[0]?.count || 0
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return { views: 0, reactions: 0 };
  }
}
