import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Target, 
  RefreshCw,
  Trash2,
  Crown,
  Loader,
  Wifi,
  WifiOff
} from 'lucide-react';
import { EnhancedSignal, EnhancedEliteSignalEngine } from '@/services/enhancedEliteSignalEngine';
import { useSignalLimits } from '@/hooks/useSignalLimits';
import { useSubscription } from '@/contexts/SubscriptionContext';
import EnhancedSignalCard from './EnhancedSignalCard';
import SignalQualityFilter from './SignalQualityFilter';
import EnhancedConsensusDisplay from './EnhancedConsensusDisplay';
import { useEnhancedConsensusScanner } from '@/hooks/useEnhancedConsensusScanner';

const EnhancedSignalsDashboard: React.FC = () => {
  const [signals, setSignals] = useState<EnhancedSignal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<EnhancedSignal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'weak' | 'medium' | 'strong'>('all');
  
  const { toast } = useToast();
  const { canGenerateSignal, checkAndIncrementSignal, signalsUsedToday, dailyLimit } = useSignalLimits();
  const { subscription } = useSubscription();
  
  const isPremium = subscription?.tier === 'premium';

  const {
    isScanning: consensusScanning,
    consensusResult,
    scanCount,
    lastScanTime,
    lastError,
    refreshScan
  } = useEnhancedConsensusScanner();

  // Filter signals based on selected quality
  useEffect(() => {
    if (qualityFilter === 'all') {
      setFilteredSignals(signals);
    } else {
      setFilteredSignals(
        signals.filter((signal) => signal.quality === qualityFilter)
      );
    }
  }, [qualityFilter, signals]);

  // Calculate signal counts for filter
  const signalCounts = {
    all: signals.length,
    weak: signals.filter(s => s.quality === 'weak').length,
    medium: signals.filter(s => s.quality === 'medium').length,
    strong: signals.filter(s => s.quality === 'strong').length
  };

  const handleGenerateSignal = async () => {
    console.log('🎯 Generate enhanced signal clicked - checking limits...');
    
    // Check and increment usage first
    const canProceed = await checkAndIncrementSignal();
    if (!canProceed) {
      console.log('❌ Signal generation blocked by limits');
      return;
    }

    setIsGenerating(true);
    setConnectionStatus('connected');
    
    try {
      console.log('🚀 Starting enhanced elite signal generation...');
      
      const signal = await EnhancedEliteSignalEngine.generateSignal();
      
      if (signal) {
        console.log('✅ Enhanced signal generated successfully:', signal);
        setSignals(prev => [signal, ...prev.slice(0, 9)]);
        toast({
          title: `🎯 ${signal.quality.toUpperCase()} Signal Generated!`,
          description: `${signal.symbol} ${signal.type} | ${signal.confidence}% confidence | EV: ${signal.expectedValue.toFixed(2)}`,
        });
      } else {
        console.log('❌ Signal generation returned null');
        toast({
          title: "Generation Failed",
          description: "Unable to generate enhanced signal. Please try again.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Error generating enhanced signal:', error);
      toast({
        title: "Signal Generation Error",
        description: "Failed to generate enhanced signal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setConnectionStatus('disconnected');
    }
  };

  const handleRemoveSignal = (signalId: string) => {
    setSignals(prev => prev.filter(signal => signal.id !== signalId));
    toast({
      title: "Signal Removed",
      description: `Enhanced signal has been removed from the dashboard.`,
    });
  };

  const clearAllSignals = () => {
    setSignals([]);
    toast({
      title: "All Signals Cleared",
      description: "Enhanced signal history has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Signal Generator */}
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                Enhanced Elite Signal Engine
              </div>
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' ? (
                  <Wifi className="w-4 h-4 text-green-400" />
                ) : (
                  <WifiOff className="w-4 h-4 text-gray-400" />
                )}
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  Multi-Strategy + EV Scoring
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{signalCounts.strong}</div>
                <div className="text-sm text-gray-400">Strong Signals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{signalCounts.medium}</div>
                <div className="text-sm text-gray-400">Medium Signals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{signalCounts.weak}</div>
                <div className="text-sm text-gray-400">Weak Signals</div>
              </div>
            </div>

            <Button
              onClick={handleGenerateSignal}
              disabled={isGenerating || (!isPremium && !canGenerateSignal)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating Enhanced Signal...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Enhanced Elite Signal
                </>
              )}
            </Button>

            {/* Usage Display */}
            <div className="text-center text-sm">
              {isPremium ? (
                <div className="text-green-400">
                  ✨ Premium: Unlimited enhanced signals
                </div>
              ) : (
                <div className="text-orange-400">
                  🔒 Free: {signalsUsedToday}/{dailyLimit} signals used today
                  {signalsUsedToday >= dailyLimit && (
                    <div className="text-red-400 mt-1">
                      Daily limit reached! Upgrade to Premium for unlimited signals.
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Signal Quality Filter */}
        <SignalQualityFilter 
          selectedQuality={qualityFilter}
          onChange={setQualityFilter}
          signalCounts={signalCounts}
        />

        {/* Enhanced AI Consensus Section */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              🧠 Enhanced Multi-AI Consensus Engine
            </h2>
            <p className="text-gray-400">
              Weighted AI voting system with proper consensus logic
            </p>
          </div>
          
          <EnhancedConsensusDisplay
            consensusResult={consensusResult}
            isScanning={consensusScanning}
            scanCount={scanCount}
            lastScanTime={lastScanTime}
            lastError={lastError}
            onRefresh={refreshScan}
          />
        </div>

        {/* Actions */}
        {signals.length > 0 && (
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              Enhanced Signals ({filteredSignals.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllSignals}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}

        {/* Enhanced Signals List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSignals.map((signal) => (
            <EnhancedSignalCard 
              key={signal.id} 
              signal={signal} 
              onRemove={handleRemoveSignal}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredSignals.length === 0 && signals.length > 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No {qualityFilter} signals available
            </h3>
            <p className="text-gray-500">
              Try adjusting your quality filter or generate more signals
            </p>
          </div>
        )}

        {filteredSignals.length === 0 && signals.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No enhanced signals generated yet
            </h3>
            <p className="text-gray-500">
              Click "Generate Enhanced Elite Signal" to get started
            </p>
            {!isPremium && signalsUsedToday >= dailyLimit && (
              <div className="mt-4">
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  onClick={() => {/* Add upgrade logic */}}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium for Unlimited Signals
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSignalsDashboard;
