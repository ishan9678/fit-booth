'use client';

import { useState, useEffect } from 'react';
import { useSessionSocket } from '../hooks/useSocket';
import { SocketConnectionStatus } from './SocketProvider';

interface SessionViewerProps {
  sessionId: string;
  userId?: string;
  anonymousId?: string;
}

export function SessionViewer({ sessionId, userId, anonymousId }: SessionViewerProps) {
  const {
    connected,
    sessionState,
    recordView,
    addReaction,
    updatePresence,
  } = useSessionSocket(sessionId);
  
  const [selectedEmoji, setSelectedEmoji] = useState('👍');
  const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '💪', '🔥', '⭐', '🎉'];
  
  // Record view when component mounts
  useEffect(() => {
    if (connected && sessionId) {
      recordView(anonymousId, userId);
    }
  }, [connected, sessionId, recordView, anonymousId, userId]);
  
  // Update presence when connected
  useEffect(() => {
    if (connected) {
      updatePresence('online');
      return () => updatePresence('offline');
    }
  }, [connected, updatePresence]);
  
  const handleAddReaction = () => {
    addReaction(selectedEmoji, anonymousId, userId);
  };
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Session Viewer</h2>
      
      {/* Connection Status */}
      <div className="mb-4">
        <SocketConnectionStatus />
      </div>
      
      {/* Session Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Session: {sessionId}</h3>
        <div className="text-sm text-gray-600">
          <p>Status: {sessionState.joined ? 'Joined' : 'Not joined'}</p>
          <p>Views: {sessionState.viewCount}</p>
          <p>Active Users: {sessionState.activeUsers.length}</p>
        </div>
      </div>
      
      {/* Reaction Controls */}
      <div className="mb-4">
        <h4 className="text-md font-semibold mb-2">Add Reaction</h4>
        <div className="flex gap-2 mb-2">
          {availableEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              className={`p-2 rounded ${
                selectedEmoji === emoji
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <button
          onClick={handleAddReaction}
          disabled={!connected || !sessionState.joined}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Add {selectedEmoji} Reaction
        </button>
      </div>
      
      {/* Reaction Counts */}
      <div className="mb-4">
        <h4 className="text-md font-semibold mb-2">Reactions</h4>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(sessionState.reactionCounts).map(([emoji, count]) => (
            <div key={emoji} className="text-center">
              <div className="text-2xl">{emoji}</div>
              <div className="text-sm text-gray-600">{count}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Debug Info */}
      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
        <h5 className="font-semibold mb-1">Debug Info:</h5>
        <p>Connected: {connected ? 'Yes' : 'No'}</p>
        <p>Session Joined: {sessionState.joined ? 'Yes' : 'No'}</p>
        <p>Active Users: {sessionState.activeUsers.join(', ')}</p>
      </div>
    </div>
  );
}

// Example usage component
export function SocketExample() {
  const [sessionId, setSessionId] = useState('demo-session-123');
  const [userId, setUserId] = useState('user-456');
  const [anonymousId, setAnonymousId] = useState('anon-789');
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Socket.IO Integration Test</h1>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Session ID</label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Anonymous ID</label>
            <input
              type="text"
              value={anonymousId}
              onChange={(e) => setAnonymousId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </div>
      
      <SessionViewer 
        sessionId={sessionId} 
        userId={userId} 
        anonymousId={anonymousId} 
      />
    </div>
  );
}
