import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Journal from '@/pages/Journal';
import Pricing from '@/pages/Pricing';
import Affiliate from '@/pages/Affiliate';

import LiveSignals from '@/pages/LiveSignals';
import ClientPortal from '@/pages/ClientPortal';
import UserDashboard from '@/pages/UserDashboard';
import ClientDashboard from '@/pages/ClientDashboard';
import NotFound from '@/pages/NotFound';

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
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/setup-scanner" element={<SetupScanner />} />
                  <Route path="/live-signals" element={<LiveSignals />} />
                  <Route path="/portal" element={<ClientPortal />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/client" element={<ClientDashboard />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/affiliate" element={<Affiliate />} />
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
