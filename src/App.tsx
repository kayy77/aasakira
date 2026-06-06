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
import RequireAuth from '@/components/RequireAuth';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import TradingAccounts from '@/pages/account/TradingAccounts';
import Onboarding from '@/pages/Onboarding';
import ComingSoon from '@/pages/ComingSoon';

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
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected app shell */}
                  <Route element={<RequireAuth />}>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route element={<AppLayout />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/live-signals" element={<LiveSignals />} />
                      <Route path="/tools/lot-size" element={<LotSizeCalculatorPage />} />
                      <Route path="/portal" element={<ClientPortal />} />
                      <Route path="/client" element={<ClientDashboard />} />
                      <Route path="/account" element={<UserDashboard />} />
                      <Route path="/account/trading-accounts" element={<TradingAccounts />} />
                      <Route path="/risk-suite" element={<ComingSoon title="Risk Suite" description="Nine institutional-grade calculators ship with onboarding GA." items={["Lot Size", "Risk", "Drawdown", "Compounding", "Position Size", "Prop Firm Rules", "Daily Drawdown", "Weekly Drawdown", "Margin"]} />} />
                      <Route path="/community" element={<ComingSoon title="Community" description="Members-only feed, wins log, events and free signals — launching soon." />} />
                      <Route path="/coach" element={<ComingSoon title="AI Coach" description="Daily + weekly trading intelligence reviews powered by your trade history." />} />
                      <Route path="/academy" element={<ComingSoon title="Academy" description="Foundation → Intermediate → Advanced → Live Floor curriculum." />} />
                    </Route>
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
