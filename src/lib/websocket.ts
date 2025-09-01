/**
 * WebSocket Service
 * Manages WebSocket connections for real-time updates
 */

import { Challenge } from '@/types/challenge';
import { api } from './api';

export type WebSocketMessage = 
  | { type: 'challenge_updated'; data: Challenge }
  | { type: 'challenge_created'; data: Challenge }
  | { type: 'number_submitted'; data: { challengeId: string; userId: string } }
  | { type: 'challenge_completed'; data: { challengeId: string; result: 'match' | 'no_match' } }
  | { type: 'user_online'; data: { userId: string } }
  | { type: 'user_offline'; data: { userId: string } }
  | { type: 'ping'; data: null }
  | { type: 'pong'; data: null };

interface WebSocketServiceConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketServiceConfig>;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private messageHandlers = new Map<string, Set<(message: WebSocketMessage) => void>>();
  private isIntentionallyClosed = false;
  private authToken: string | null = null;

  constructor(config: WebSocketServiceConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(authToken: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.authToken = authToken;
    this.isIntentionallyClosed = false;

    try {
      // Use API utility to get WebSocket URL with auth token
      const wsUrl = api.getWebSocketUrl(authToken);
      
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.cleanup();
  }

  /**
   * Send message through WebSocket
   */
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  /**
   * Subscribe to specific message type
   */
  on(type: string, handler: (message: WebSocketMessage) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit({ type: 'user_online', data: { userId: 'current' } });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.cleanup();

      if (!this.isIntentionallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    // Handle pong messages for heartbeat
    if (message.type === 'pong') {
      return;
    }

    // Emit to specific handlers
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }

    // Emit to wildcard handlers
    const wildcardHandlers = this.messageHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in wildcard handler:', error);
        }
      });
    }
  }

  /**
   * Emit a message to handlers
   */
  private emit(message: WebSocketMessage): void {
    this.handleMessage(message);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', data: null });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1);

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = window.setTimeout(() => {
      if (this.authToken) {
        this.connect(this.authToken);
      }
    }, delay);
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get WebSocket state
   */
  get readyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws';
export const wsService = new WebSocketService({ url: wsUrl });
