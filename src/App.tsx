
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Signals from '@/pages/Signals';
import Education from '@/pages/Education';
import Trading from '@/pages/Trading';
import NotFound from '@/pages/NotFound';
import MemeCoins from '@/pages/MemeCoins';
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
                <Route path="/education" element={<Education />} />
                <Route path="/trading" element={<Trading />} />
                <Route path="/memecoins" element={<MemeCoins />} />
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
