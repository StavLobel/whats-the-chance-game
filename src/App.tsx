import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import Landing from './pages/Landing';
import Game from './pages/Game';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public route - Landing page for unauthenticated users */}
                <Route 
                  path='/' 
                  element={
                    <PublicRoute>
                      <Landing />
                    </PublicRoute>
                  } 
                />
                
                {/* Protected routes - Main app for authenticated users */}
                <Route 
                  path='/app/*' 
                  element={
                    <ProtectedRoute>
                      <Game />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Legacy route redirect for backward compatibility */}
                <Route 
                  path='/game' 
                  element={
                    <ProtectedRoute redirectTo="/app">
                      <Game />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path='*' element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
