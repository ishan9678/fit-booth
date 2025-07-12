import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface SocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

const DEFAULT_OPTIONS: UseSocketOptions = {
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};

export function useSocket(options: UseSocketOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: null,
  });

  const config = { ...DEFAULT_OPTIONS, ...options };

  useEffect(() => {
    if (!config.autoConnect) return;

    setState(prev => ({ ...prev, connecting: true, error: null }));

    const newSocket = io(config.url!, {
      autoConnect: config.autoConnect,
      reconnection: config.reconnection,
      reconnectionAttempts: config.reconnectionAttempts,
      reconnectionDelay: config.reconnectionDelay,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket.IO connected');
      setState(prev => ({ ...prev, connected: true, connecting: false, error: null }));
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      setState(prev => ({ ...prev, connected: false, connecting: false }));
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket.IO connection error:', error);
      setState(prev => ({ 
        ...prev, 
        connected: false, 
        connecting: false, 
        error: error.message 
      }));
    });

    newSocket.on('error', (error) => {
      console.error('🔌 Socket.IO error:', error);
      setState(prev => ({ ...prev, error: error.message }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [config.url, config.autoConnect, config.reconnection, config.reconnectionAttempts, config.reconnectionDelay]);

  const connect = useCallback(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket && socket.connected) {
      socket.disconnect();
    }
  }, [socket]);

  const emit = useCallback((event: string, data?: any) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }, [socket]);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  }, [socket]);

  const off = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

  return {
    socket,
    ...state,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}

// Specialized hook for session-related socket events
export function useSessionSocket(sessionId: string | null) {
  const { socket, connected, emit, on, off } = useSocket();
  const [sessionState, setSessionState] = useState({
    joined: false,
    viewCount: 0,
    reactionCounts: {} as Record<string, number>,
    activeUsers: [] as string[],
  });

  // Join session when socket connects and sessionId is available
  useEffect(() => {
    if (!connected || !socket || !sessionId) return;

    console.log('🎬 Joining session:', sessionId);
    emit('session:join', sessionId);

    // Listen for session events
    const unsubscribeJoined = on('session:joined', (data) => {
      console.log('🎬 Session joined:', data);
      setSessionState(prev => ({
        ...prev,
        joined: true,
        viewCount: data.stats?.views || 0,
        reactionCounts: data.stats?.reactions || {},
      }));
    });

    const unsubscribeViewCount = on('session:view-count', (data) => {
      setSessionState(prev => ({
        ...prev,
        viewCount: data.count,
      }));
    });

    const unsubscribeReactionCounts = on('reaction:counts', (data) => {
      setSessionState(prev => ({
        ...prev,
        reactionCounts: data.counts,
      }));
    });

    const unsubscribeUserJoined = on('user:joined', (data) => {
      setSessionState(prev => ({
        ...prev,
        activeUsers: [...prev.activeUsers, data.socketId],
      }));
    });

    const unsubscribeUserLeft = on('user:left', (data) => {
      setSessionState(prev => ({
        ...prev,
        activeUsers: prev.activeUsers.filter(id => id !== data.socketId),
      }));
    });

    return () => {
      // Clean up listeners
      unsubscribeJoined();
      unsubscribeViewCount();
      unsubscribeReactionCounts();
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      
      // Leave session
      if (sessionId) {
        emit('session:leave', sessionId);
      }
    };
  }, [connected, socket, sessionId, emit, on]);

  // Session-specific actions
  const recordView = useCallback((anonymousId?: string, userId?: string) => {
    if (!sessionId) return;
    emit('session:view', { sessionId, anonymousId, userId });
  }, [sessionId, emit]);

  const addReaction = useCallback((emoji: string, anonymousId?: string, userId?: string) => {
    if (!sessionId) return;
    emit('reaction:add', { sessionId, emoji, anonymousId, userId });
  }, [sessionId, emit]);

  const removeReaction = useCallback((reactionId: number) => {
    emit('reaction:remove', { reactionId });
  }, [emit]);

  const updateSession = useCallback((updates: any) => {
    if (!sessionId) return;
    emit('session:update', { sessionId, updates });
  }, [sessionId, emit]);

  const updatePresence = useCallback((status: 'online' | 'offline') => {
    if (!sessionId) return;
    emit('user:presence', { sessionId, status });
  }, [sessionId, emit]);

  return {
    socket,
    connected,
    sessionState,
    recordView,
    addReaction,
    removeReaction,
    updateSession,
    updatePresence,
  };
}
