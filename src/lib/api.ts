/**
 * API Utility Functions
 * Provides helper functions for API calls
 */

import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000/ws';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get the current user's token
  const currentUser = auth.currentUser;
  const token = currentUser ? await currentUser.getIdToken() : null;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw { response: { data: error, status: response.status } };
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

// Create an axios-like client for compatibility
export const apiClient = {
  get: (url: string, config?: { params?: any }) => {
    const queryString = config?.params 
      ? '?' + new URLSearchParams(config.params).toString()
      : '';
    return api.get(`${url}${queryString}`).then(data => ({ data }));
  },
  
  post: (url: string, data?: any) => {
    return api.post(url, data).then(data => ({ data }));
  },
  
  put: (url: string, data?: any) => {
    return api.put(url, data).then(data => ({ data }));
  },
  
  delete: (url: string) => {
    return api.delete(url).then(data => ({ data }));
  },
};
