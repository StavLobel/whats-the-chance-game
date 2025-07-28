import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Create a custom render function that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test utilities for common scenarios
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  ...overrides,
})

export const createMockChallenge = (overrides = {}) => ({
  id: 'test-challenge-id',
  fromUser: 'user1',
  toUser: 'user2',
  description: 'What\'s the chance you\'ll sing in public?',
  status: 'pending' as const,
  createdAt: new Date(),
  ...overrides,
})

export const createMockGameSession = () => ({
  id: 'test-game-session-id',
  challengeId: 'test-challenge-id',
  players: ['user1', 'user2'],
  status: 'waiting' as const,
  numbers: {},
})

// Helper for async testing
export const waitFor = async (
  callback: () => void | Promise<void>,
  timeout = 1000
) => {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${timeout}ms`))
    }, timeout)

    const check = async () => {
      try {
        await callback()
        clearTimeout(timeoutId)
        resolve()
      } catch (error) {
        setTimeout(check, 10)
      }
    }

    check()
  })
}

// Mock Firebase user for testing
export const mockFirebaseUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  emailVerified: true,
  getIdToken: () => Promise.resolve('mock-token'),
  delete: () => Promise.resolve(),
  reload: () => Promise.resolve(),
}

// Mock Firebase auth state
export const mockAuthState = {
  user: mockFirebaseUser,
  loading: false,
  error: null,
}

// Legacy utilities for backward compatibility
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))
