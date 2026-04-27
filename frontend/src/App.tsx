import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ForecastPage } from '@/pages/forecast/ForecastPage';
import { ExplainerPage } from '@/pages/explainer/ExplainerPage';
import { RiskPage } from '@/pages/risk/RiskPage';
import { SimulatorPage } from '@/pages/simulator/SimulatorPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/forecast" element={<ForecastPage />} />
              <Route path="/explainer" element={<ExplainerPage />} />
              <Route path="/risk" element={<RiskPage />} />
              <Route path="/simulator" element={<SimulatorPage />} />
              <Route element={<ProtectedRoute roles={['finance_team']} />}>
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(13,19,33,0.95)',
            color: '#F0F4FF',
            border: '1px solid rgba(255,255,255,0.10)',
            backdropFilter: 'blur(20px)',
            fontSize: 14,
          },
          success: {
            style: { borderLeft: '3px solid #00C896' },
          },
          error: {
            style: { borderLeft: '3px solid #EF4444' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
