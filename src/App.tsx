//src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/stores/useAuthStore';
import { GamificationProvider } from '@/components/gamification/GamificationProvider';
import { SubscriptionProvider } from '@/components/subscription/SubscriptionProvider';

// Pages
import { Dashboard } from '@/pages/Dashboard';
import { AuthPage } from '@/pages/AuthPage';
import { Experiments } from '@/pages/Experiments';
import { ExperimentDetail } from '@/pages/ExperimentDetail';
import { Games } from '@/pages/Games';
import { Notebook } from '@/pages/Notebook';
import { NotebookDetail } from '@/pages/NotebookDetail';
import { Leaderboard } from '@/pages/Leaderboard';
import { Profile } from '@/pages/Profile';
import { ProfileManagement } from '@/components/auth/ProfileManagement';
import { AssessmentPage } from '@/pages/AssessmentPage';
import { Achievements } from '@/pages/Achievements';
import { SubscriptionPage } from '@/pages/SubscriptionPage';
// AppRouter.tsx (or wherever your <Routes> live)
<Route
  path="/experiments/:experimentId/assessment/:assessmentType"
  element={<AssessmentPage />}
/>


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <GamificationProvider>
        <SubscriptionProvider>
          <div className="min-h-screen bg-gray-50">
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route 
                    path="/auth" 
                    element={
                      <ProtectedRoute requireAuth={false}>
                        <AuthPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/experiments" 
                    element={
                      <ProtectedRoute>
                        <Experiments />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/experiment/:slug" 
                    element={
                      <ProtectedRoute>
                        <ExperimentDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/experiment/:experimentId/assessment/:assessmentType" 
                    element={
                      <ProtectedRoute>
                        <AssessmentPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/games" 
                    element={
                      <ProtectedRoute>
                        <Games />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/notebook" 
                    element={
                      <ProtectedRoute>
                        <Notebook />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/notebook/:entryId" 
                    element={
                      <ProtectedRoute>
                        <NotebookDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile/edit" 
                    element={
                      <ProtectedRoute>
                        <ProfileManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/leaderboard" 
                    element={
                      <ProtectedRoute>
                        <Leaderboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/achievements" 
                    element={
                      <ProtectedRoute>
                        <Achievements />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/subscription" 
                    element={
                      <ProtectedRoute>
                        <SubscriptionPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Layout>
              <Toaster richColors position="top-right" />
            </Router>
          </div>
        </SubscriptionProvider>
      </GamificationProvider>
    </QueryClientProvider>
  );
}

export default App;