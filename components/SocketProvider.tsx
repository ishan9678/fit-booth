'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

interface SocketContextType {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (...args: any[]) => void) => (() => void);
  off: (event: string, callback?: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}

// Connection status component
export function SocketConnectionStatus() {
  const { connected, connecting, error } = useSocketContext();
  
  if (connecting) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        Connecting to live updates...
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        Connection error: {error}
      </div>
    );
  }
  
  if (connected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        Live updates connected
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      Live updates disconnected
    </div>
  );
}
