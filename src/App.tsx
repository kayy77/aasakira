
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Signals from '@/pages/Signals';
import Journal from '@/pages/Journal';
import Pricing from '@/pages/Pricing';
import Affiliate from '@/pages/Affiliate';
import NotFound from '@/pages/NotFound';

import { Toaster } from "@/components/ui/toaster"
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { AuthProvider } from '@/contexts/AuthContext';
import AuthGuard from '@/components/AuthGuard';

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-black text-white">
            <Toaster />
            <AuthGuard>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signals" element={<Signals />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/affiliate" element={<Affiliate />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthGuard>
          </div>
        </BrowserRouter>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
