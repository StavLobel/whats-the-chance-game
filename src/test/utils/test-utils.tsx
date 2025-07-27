import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Custom test utilities
export const createMockUser = (overrides = {}) => ({
  uid: "test-user-id",
  email: "test@example.com",
  displayName: "Test User",
  photoURL: null,
  ...overrides,
});

export const createMockChallenge = (overrides = {}) => ({
  id: "test-challenge-id",
  title: "Test Challenge",
  description: "This is a test challenge",
  creatorId: "test-user-id",
  targetNumber: 42,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  status: "active",
  ...overrides,
});

export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0)); 