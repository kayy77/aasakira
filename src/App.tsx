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
import RequireVerified from '@/components/RequireVerified';
import Profile from '@/pages/account/Profile';
import Notifications from '@/pages/account/Notifications';
import Security from '@/pages/account/Security';
import AIPreferences from '@/pages/account/AIPreferences';
import Verification from '@/pages/account/Verification';
import SignalCommandCenter from '@/pages/SignalCommandCenter';
import TradeReview from '@/pages/TradeReview';
import AICoach from '@/pages/AICoach';
import CopyOverview from '@/pages/copy/CopyOverview';
import CopyAccounts from '@/pages/copy/CopyAccounts';
import CopyMasters from '@/pages/copy/CopyMasters';
import CopyActivity from '@/pages/copy/CopyActivity';
import CopyRisk from '@/pages/copy/CopyRisk';
import CopyPerformance from '@/pages/copy/CopyPerformance';
import CopySettings from '@/pages/copy/CopySettings';
import CopyAdmin from '@/pages/copy/CopyAdmin';

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
                      {/* Account pages — accessible to any authenticated user */}
                      <Route path="/account" element={<Profile />} />
                      <Route path="/account/profile" element={<Profile />} />
                      <Route path="/account/trading-accounts" element={<TradingAccounts />} />
                      <Route path="/account/verification" element={<Verification />} />
                      <Route path="/account/notifications" element={<Notifications />} />
                      <Route path="/account/security" element={<Security />} />
                      <Route path="/account/ai-preferences" element={<AIPreferences />} />
                      <Route path="/tools/lot-size" element={<LotSizeCalculatorPage />} />

                      {/* Verified-only — server-trusted gate */}
                      <Route element={<RequireVerified />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/live-signals" element={<SignalCommandCenter />} />
                        <Route path="/signals" element={<SignalCommandCenter />} />
                        <Route path="/portal" element={<ClientPortal />} />
                        <Route path="/client" element={<ClientDashboard />} />
                        <Route path="/trade-review" element={<TradeReview />} />
                        <Route path="/risk-suite" element={<ComingSoon title="Risk Suite" description="Nine institutional-grade calculators ship with onboarding GA." items={["Lot Size", "Risk", "Drawdown", "Compounding", "Position Size", "Prop Firm Rules", "Daily Drawdown", "Weekly Drawdown", "Margin"]} />} />
                        <Route path="/community" element={<ComingSoon title="Community" description="Members-only feed, wins log, events and free signals — launching soon." />} />
                        <Route path="/coach" element={<AICoach />} />
                        <Route path="/academy" element={<ComingSoon title="Academy" description="Beginner → Elite curriculum." items={["MT5 Setup", "Risk Management", "Market Structure", "Liquidity & Supply/Demand", "Institutional Concepts", "Funded Account Scaling"]} />} />
                        <Route path="/copy" element={<CopyOverview />} />
                        <Route path="/copy/accounts" element={<CopyAccounts />} />
                        <Route path="/copy/masters" element={<CopyMasters />} />
                        <Route path="/copy/activity" element={<CopyActivity />} />
                        <Route path="/copy/risk" element={<CopyRisk />} />
                        <Route path="/copy/performance" element={<CopyPerformance />} />
                        <Route path="/copy/settings" element={<CopySettings />} />
                        <Route path="/copy/admin" element={<CopyAdmin />} />
                      </Route>
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
