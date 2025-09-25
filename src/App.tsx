
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Journal from '@/pages/Journal';
import Pricing from '@/pages/Pricing';
import Affiliate from '@/pages/Affiliate';
import SetupScanner from '@/pages/SetupScanner';
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
