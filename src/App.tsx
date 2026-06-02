import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Pricing from '@/pages/Pricing';
import LiveSignals from '@/pages/LiveSignals';
import ClientPortal from '@/pages/ClientPortal';
import UserDashboard from '@/pages/UserDashboard';
import ClientDashboard from '@/pages/ClientDashboard';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import LotSizeCalculatorPage from '@/pages/tools/LotSizeCalculatorPage';
import AppLayout from '@/components/app-shell/AppLayout';

import { Toaster } from "@/components/ui/toaster"
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
        <AuthProvider>
          <SubscriptionProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-black text-white">
                <Toaster />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/pricing" element={<Pricing />} />

                  {/* App shell — sidebar layout */}
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/live-signals" element={<LiveSignals />} />
                    <Route path="/tools/lot-size" element={<LotSizeCalculatorPage />} />
                    <Route path="/portal" element={<ClientPortal />} />
                    <Route path="/client" element={<ClientDashboard />} />
                    <Route path="/account" element={<UserDashboard />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </SubscriptionProvider>
        </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
