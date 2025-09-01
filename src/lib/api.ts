/**
 * API Utility Functions
 * Provides helper functions for API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  baseUrl: API_BASE_URL,
  wsUrl: WS_BASE_URL,
  
  async get(endpoint: string) {
    return fetchAPI(endpoint);
  },
  
  async post(endpoint: string, data: any) {
    return fetchAPI(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async put(endpoint: string, data: any) {
    return fetchAPI(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async delete(endpoint: string) {
    return fetchAPI(endpoint, {
      method: 'DELETE',
    });
  },
  
  getWebSocketUrl(token: string) {
    return `${WS_BASE_URL}?token=${encodeURIComponent(token)}`;
  },
};
