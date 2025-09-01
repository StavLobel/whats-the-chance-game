/**
 * WebSocket Hook
 * Provides WebSocket functionality to React components
 */

import { useEffect, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { wsService, WebSocketMessage } from '@/lib/websocket';

interface UseWebSocketOptions {
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true } = options;
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  // Connect WebSocket when user is authenticated
  useEffect(() => {
    if (autoConnect && user) {
      // Get auth token
      user.getIdToken().then(token => {
        wsService.connect(token);
      });

      // Monitor connection state
      const checkConnection = setInterval(() => {
        setIsConnected(wsService.isConnected);
      }, 1000);

      return () => {
        clearInterval(checkConnection);
        wsService.disconnect();
      };
    }
  }, [autoConnect, user]);

  // Subscribe to WebSocket messages
  const subscribe = useCallback((
    type: string,
    handler: (message: WebSocketMessage) => void
  ) => {
    return wsService.on(type, handler);
  }, []);

  // Send WebSocket message
  const send = useCallback((message: WebSocketMessage) => {
    wsService.send(message);
  }, []);

  return {
    isConnected,
    subscribe,
    send,
  };
}
