/**
 * Real-time Features Tests
 * Tests for WebSocket and FCM functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { WebSocketService } from '@/lib/websocket';
import { FCMService } from '@/lib/fcm';
import { useWebSocket } from '@/hooks/useWebSocket';
import { mockAuth } from './mocks/mock-auth';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  app: {},
}));

// Mock Firebase Messaging
vi.mock('firebase/messaging', () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: vi.fn(),
  onMessage: vi.fn(),
}));

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    getWebSocketUrl: vi.fn((token: string) => `ws://localhost:8000/ws?token=${token}`),
    post: vi.fn(),
  },
}));

describe('WebSocket Service', () => {
  let wsService: WebSocketService;
  let mockWebSocket: any;

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocket = {
      readyState: WebSocket.CONNECTING,
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    global.WebSocket = vi.fn(() => mockWebSocket) as any;
    
    wsService = new WebSocketService({
      url: 'ws://localhost:8000/ws',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should connect to WebSocket with auth token', () => {
    const token = 'test-auth-token';
    wsService.connect(token);

    expect(global.WebSocket).toHaveBeenCalledWith(
      `ws://localhost:8000/ws?token=${token}`
    );
    expect(mockWebSocket.addEventListener).toHaveBeenCalled();
  });

  it('should send messages when connected', () => {
    wsService.connect('test-token');
    mockWebSocket.readyState = WebSocket.OPEN;

    const message = { type: 'ping', data: null };
    wsService.send(message);

    expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(message));
  });

  it('should handle incoming messages', () => {
    const callback = vi.fn();
    wsService.subscribe('challenge_updated', callback);
    
    wsService.connect('test-token');
    
    // Simulate incoming message
    const messageHandler = mockWebSocket.addEventListener.mock.calls
      .find(call => call[0] === 'message')[1];
    
    const testMessage = {
      type: 'challenge_updated',
      data: { id: '123', status: 'completed' },
    };
    
    messageHandler({ data: JSON.stringify(testMessage) });
    
    expect(callback).toHaveBeenCalledWith(testMessage);
  });

  it('should reconnect on connection failure', async () => {
    wsService.connect('test-token');
    
    // Simulate connection error
    const errorHandler = mockWebSocket.addEventListener.mock.calls
      .find(call => call[0] === 'error')[1];
    
    errorHandler(new Event('error'));
    
    // Wait for reconnect attempt
    await waitFor(() => {
      expect(global.WebSocket).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle heartbeat', () => {
    vi.useFakeTimers();
    
    wsService.connect('test-token');
    mockWebSocket.readyState = WebSocket.OPEN;
    
    // Fast-forward to trigger heartbeat
    vi.advanceTimersByTime(30000);
    
    expect(mockWebSocket.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'ping', data: null })
    );
    
    vi.useRealTimers();
  });
});

describe('FCM Service', () => {
  let fcmService: FCMService;
  const mockGetToken = vi.mocked((await import('firebase/messaging')).getToken);
  const mockOnMessage = vi.mocked((await import('firebase/messaging')).onMessage);

  beforeEach(() => {
    fcmService = new FCMService();
    
    // Mock notification permission
    Object.defineProperty(window, 'Notification', {
      writable: true,
      value: {
        permission: 'default',
        requestPermission: vi.fn(() => Promise.resolve('granted')),
      },
    });
  });

  it('should request notification permission', async () => {
    mockGetToken.mockResolvedValue('test-fcm-token');
    
    const token = await fcmService.requestPermission();
    
    expect(window.Notification.requestPermission).toHaveBeenCalled();
    expect(mockGetToken).toHaveBeenCalled();
    expect(token).toBe('test-fcm-token');
  });

  it('should not request permission if already granted', async () => {
    window.Notification.permission = 'granted';
    mockGetToken.mockResolvedValue('test-fcm-token');
    
    const token = await fcmService.requestPermission();
    
    expect(window.Notification.requestPermission).not.toHaveBeenCalled();
    expect(token).toBe('test-fcm-token');
  });

  it('should handle permission denial', async () => {
    window.Notification.requestPermission = vi.fn(() => Promise.resolve('denied'));
    
    const token = await fcmService.requestPermission();
    
    expect(token).toBeNull();
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it('should subscribe to FCM topic', async () => {
    const mockApi = (await import('@/lib/api')).api;
    mockApi.post = vi.fn().mockResolvedValue({ success: true });
    
    const result = await fcmService.subscribeToTopic('test-token', 'challenges');
    
    expect(mockApi.post).toHaveBeenCalledWith('/api/notifications/subscribe', {
      token: 'test-token',
      topic: 'challenges',
    });
    expect(result).toBe(true);
  });

  it('should handle foreground messages', () => {
    const callback = vi.fn();
    fcmService.onMessage(callback);
    
    // Get the handler passed to onMessage
    const handler = mockOnMessage.mock.calls[0][1];
    
    const testPayload = {
      notification: {
        title: 'New Challenge',
        body: 'You have a new challenge!',
      },
      data: {
        type: 'challenge_created',
        challengeId: '123',
      },
    };
    
    handler(testPayload);
    
    expect(callback).toHaveBeenCalledWith(testPayload);
  });
});

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should connect when user is authenticated', async () => {
    const mockConnect = vi.fn();
    const mockSubscribe = vi.fn();
    
    vi.mock('@/lib/websocket', () => ({
      wsService: {
        connect: mockConnect,
        subscribe: mockSubscribe,
        isConnected: true,
      },
    }));
    
    const wrapper = ({ children }: any) => (
      <mockAuth.AuthProvider value={{
        user: { uid: 'test-user', getIdToken: () => Promise.resolve('test-token') },
      }}>
        {children}
      </mockAuth.AuthProvider>
    );
    
    const { result } = renderHook(() => useWebSocket(), { wrapper });
    
    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledWith('test-token');
    });
    
    expect(result.current.isConnected).toBe(true);
  });

  it('should not connect when user is not authenticated', () => {
    const mockConnect = vi.fn();
    
    vi.mock('@/lib/websocket', () => ({
      wsService: {
        connect: mockConnect,
        isConnected: false,
      },
    }));
    
    const wrapper = ({ children }: any) => (
      <mockAuth.AuthProvider value={{ user: null }}>
        {children}
      </mockAuth.AuthProvider>
    );
    
    renderHook(() => useWebSocket(), { wrapper });
    
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it('should handle subscriptions', () => {
    const mockSubscribe = vi.fn(() => vi.fn());
    
    vi.mock('@/lib/websocket', () => ({
      wsService: {
        subscribe: mockSubscribe,
        isConnected: true,
      },
    }));
    
    const { result } = renderHook(() => useWebSocket());
    
    const callback = vi.fn();
    act(() => {
      result.current.subscribe('challenge_updated', callback);
    });
    
    expect(mockSubscribe).toHaveBeenCalledWith('challenge_updated', callback);
  });
});
