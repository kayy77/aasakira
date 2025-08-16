import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignalEngineDashboard } from '@/components/signals/SignalEngineDashboard';
import { SignalHistoryDashboard } from '@/components/signals/SignalHistoryDashboard';
import { TrendingUp, History, Zap } from 'lucide-react';

const Signals = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Signal Engine</h1>
        <p className="text-muted-foreground">
          Professional trading signals with 1:1-2 R:R ratios and institutional-grade risk management
        </p>
      </div>

      <Tabs defaultValue="live-signals" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="live-signals" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Live Signals
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Signal History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live-signals">
          <SignalEngineDashboard />
        </TabsContent>

        <TabsContent value="history">
          <SignalHistoryDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Signals;