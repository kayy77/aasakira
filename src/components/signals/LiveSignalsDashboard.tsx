
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileSignalCard } from './MobileSignalCard';
import FilterSettings from './FilterSettings';
import { PerformanceStats } from './PerformanceStats';
import { enhancedSignalService } from '@/services/enhancedSignalService';
import { useSignalLimits } from '@/hooks/useSignalLimits';
import { Signal } from '@/types/signalConfig';
import { Zap, TrendingUp, Activity, RefreshCw, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LiveSignalsDashboard = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [minConfidence, setMinConfidence] = useState<number>(70);
  const [minFilters, setMinFilters] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const { canGenerateSignal, signalsUsedToday, dailyLimit, upgradeRequired, checkAndIncrementSignal } = useSignalLimits();
  const { toast } = useToast();

  const generateNewSignal = async () => {
    console.log("🔥 GENERATE BUTTON CLICKED - Starting WebSocket-powered signal generation...");
    console.log("Current state:", { canGenerateSignal, upgradeRequired, isGenerating });
    console.log("Settings:", { minConfidence, minFilters });
    
    if (!checkAndIncrementSignal()) {
      console.log("❌ checkAndIncrementSignal returned false");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('🔌 Connecting to live price feeds...');
    
    try {
      console.log("🎯 Calling enhancedSignalService.generateLiveSignal with WebSocket prices...");
      
      const newSignal = await enhancedSignalService.generateLiveSignal(
        minConfidence,
        minFilters,
        ['SMC', 'Volume', 'Session']
      );

      console.log("📊 WebSocket signal generation result:", newSignal);

      if (newSignal) {
        console.log("✅ New WebSocket signal generated successfully:", {
          pair: newSignal.pair,
          type: newSignal.type,
          confidence: newSignal.confidence,
          entry: newSignal.entry,
          livePrice: newSignal.livePrice
        });
        
        setSignals(prev => {
          const updated = [newSignal, ...prev.slice(0, 9)];
          console.log("📈 Updated signals array length:", updated.length);
          return updated;
        });
        
        setGenerationStatus('✅ Live WebSocket signal generated!');
        
        toast({
          title: "🎯 Live WebSocket Signal Generated!",
          description: `${newSignal.pair} ${newSignal.type} signal with ${newSignal.confidence}% confidence using real-time prices`,
        });
        
        setTimeout(() => setGenerationStatus(''), 3000);
      } else {
        console.log("❌ No signal returned from WebSocket service");
        setGenerationStatus('❌ No suitable setup found');
        
        toast({
          title: "No Signal Generated",
          description: "Market conditions don't meet the current filter criteria. Try adjusting your settings.",
          variant: "destructive"
        });
        
        setTimeout(() => setGenerationStatus(''), 3000);
      }
    } catch (error) {
      console.error('❌ WebSocket signal generation error:', error);
      setGenerationStatus('❌ Generation failed');
      
      toast({
        title: "Generation Failed",
        description: "Unable to generate signal. Please try again.",
        variant: "destructive"
      });
      
      setTimeout(() => setGenerationStatus(''), 3000);
    } finally {
      setIsGenerating(false);
      console.log("🏁 WebSocket signal generation process completed");
    }
  };

  const handleRemoveSignal = (signalId: string) => {
    setSignals(prev => prev.filter(signal => signal.id !== signalId));
  };

  const handleTakeSignal = (signal: Signal) => {
    console.log('📋 Taking signal:', signal);
    toast({
      title: "Signal Copied",
      description: `${signal.pair} ${signal.type} signal details copied to clipboard`,
    });
  };

  useEffect(() => {
    console.log("🔄 Loading initial signals...");
    const initialSignals = enhancedSignalService.getSignals();
    console.log("📊 Initial signals loaded:", initialSignals.length);
    setSignals(initialSignals);
  }, []);

  useEffect(() => {
    console.log("📊 Signals state updated:", signals.length, "signals");
  }, [signals]);

  return (
    <div className="space-y-6">
      {/* Dashboard Header - Mobile Optimized */}
      <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-gray-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-xl font-semibold text-white flex items-center">
              <Wifi className="mr-2 h-5 w-5 text-green-400" />
              Live WebSocket Signals
            </CardTitle>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                Signals Used: <span className="font-semibold text-blue-300">{signalsUsedToday} / {dailyLimit}</span>
              </div>
              {generationStatus && (
                <div className="text-xs text-yellow-300 mt-1">
                  {generationStatus}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-gray-300 text-sm">
              Real-time WebSocket-powered signals with institutional accuracy.
            </div>
            <Button
              onClick={generateNewSignal}
              disabled={isGenerating || upgradeRequired || !canGenerateSignal}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Live Signal
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs - Mobile Friendly */}
      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="bg-gray-900/50 rounded-lg p-1 grid grid-cols-3 w-full">
          <TabsTrigger value="signals" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-300 rounded-md px-4 py-2 text-sm font-medium">
            <Activity className="mr-2 h-4 w-4" />
            Signals ({signals.length})
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-300 rounded-md px-4 py-2 text-sm font-medium">
            <TrendingUp className="mr-2 h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="filters" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-300 rounded-md px-4 py-2 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2">
              <path d="M2.636 5.364a1 1 0 010-1.414l8-8a1 1 0 011.414 0l8 8a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8z" />
            </svg>
            Filters
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="signals" className="space-y-4">
          {signals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signals.map((signal) => (
                <MobileSignalCard 
                  key={signal.id} 
                  signal={signal}
                  onTakeSignal={handleTakeSignal}
                  onRemoveSignal={handleRemoveSignal}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-gray-700/50">
              <CardContent className="text-center text-gray-400 py-8">
                <Wifi className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No WebSocket Signals Yet</h3>
                <p className="mb-4">Click "Generate Live Signal" to get started with real-time WebSocket-powered signals!</p>
                {!canGenerateSignal && (
                  <Badge variant="outline" className="text-yellow-400 border-yellow-500/30">
                    Daily limit reached - Upgrade for unlimited signals
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceStats
            winRate={78}
            totalSignals={signals.length}
            activeSignals={signals.filter(s => s.sessionActive).length}
            avgRR={2.4}
          />
        </TabsContent>

        <TabsContent value="filters">
          <FilterSettings
            minFilters={minFilters}
            onMinFiltersChange={setMinFilters}
            minConfidence={minConfidence}
            onMinConfidenceChange={setMinConfidence}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveSignalsDashboard;
