
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignalCard } from './SignalCard';
import FilterSettings from './FilterSettings';
import { PerformanceStats } from './PerformanceStats';
import { enhancedSignalService } from '@/services/enhancedSignalService';
import { useSignalLimits } from '@/hooks/useSignalLimits';
import { Signal } from '@/types/signalConfig';
import { Zap, TrendingUp, Activity, RefreshCw } from 'lucide-react';
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
    if (!checkAndIncrementSignal()) {
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Analyzing ultra-fresh market data...');
    
    try {
      const newSignal = await enhancedSignalService.generateLiveSignal(
        minConfidence,
        minFilters,
        []
      );

      if (newSignal) {
        setSignals(prev => [newSignal, ...prev.slice(0, 9)]);
        setGenerationStatus('✅ Ultra-accurate signal generated!');
        
        toast({
          title: "🎯 Ultra-Accurate Signal Generated!",
          description: `${newSignal.pair} ${newSignal.type} signal with ${newSignal.confidence}% confidence using live market prices`,
        });
        
        setTimeout(() => setGenerationStatus(''), 3000);
      } else {
        setGenerationStatus('❌ No suitable setup found');
        setTimeout(() => setGenerationStatus(''), 3000);
      }
    } catch (error) {
      console.error('Signal generation error:', error);
      setGenerationStatus('❌ Generation failed');
      setTimeout(() => setGenerationStatus(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const initialSignals = enhancedSignalService.getSignals();
    setSignals(initialSignals);
  }, []);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold gradient-text">
              <Zap className="mr-2 h-5 w-5 inline-block align-middle" />
              Live AI Signals
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
          <div className="flex items-center justify-between">
            <div className="text-gray-300">
              AI-powered trading signals based on real-time market analysis.
            </div>
            <Button
              onClick={generateNewSignal}
              disabled={isGenerating || upgradeRequired || !canGenerateSignal}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate New Signal
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="bg-gray-900/50 rounded-lg p-1 flex justify-between">
          <TabsTrigger value="signals" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-300 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
            <Activity className="mr-2 h-4 w-4 inline-block align-middle" />
            Live Signals
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-300 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
            <TrendingUp className="mr-2 h-4 w-4 inline-block align-middle" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="filters" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-300 rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-2 inline-block align-middle">
              <path d="M2.636 5.364a1 1 0 010-1.414l8-8a1 1 0 011.414 0l8 8a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8z" />
            </svg>
            Filters
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="signals" className="space-y-4">
          {signals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="text-center text-gray-400">
                No signals generated yet. Click "Generate New Signal" to get started!
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceStats
            winRate={78}
            totalSignals={42}
            activeSignals={3}
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
