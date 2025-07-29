
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Shield, 
  Zap, 
  RefreshCw,
  Trash2,
  Activity,
  AlertTriangle,
  Crown,
  Loader,
  CheckCircle2,
  XCircle,
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react';
import { EnhancedSignal, enhancedSignalEngine } from '@/services/enhancedSignalEngine';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSignalLimits } from '@/hooks/useSignalLimits';
import { useSubscription } from '@/contexts/SubscriptionContext';
import SignalStrengthFilter from './SignalStrengthFilter';

interface LiveSignalsDashboardProps {
  selectedStrength?: string;
  onFeatureUse?: () => void;
}

const LiveSignalsDashboard: React.FC<LiveSignalsDashboardProps> = ({ 
  selectedStrength = 'all',
  onFeatureUse
}) => {
  const [signals, setSignals] = useState<EnhancedSignal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<EnhancedSignal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [filterStrength, setFilterStrength] = useState(selectedStrength);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { canGenerateSignal, checkAndIncrementSignal } = useSignalLimits();
  const { subscription } = useSubscription();
  
  const isPremium = subscription?.tier === 'premium';

  // Filter signals based on selected strength
  useEffect(() => {
    if (filterStrength === 'all') {
      setFilteredSignals(signals);
    } else {
      setFilteredSignals(
        signals.filter((signal) => signal.strength.toLowerCase() === filterStrength.toLowerCase())
      );
    }
  }, [filterStrength, signals]);

  // Calculate signal counts for filter
  const signalCounts = {
    all: signals.length,
    weak: signals.filter(s => s.strength === 'WEAK').length,
    decent: signals.filter(s => s.strength === 'DECENT').length,
    strong: signals.filter(s => s.strength === 'STRONG').length
  };

  const handleGenerateSignal = async () => {
    if (!canGenerateSignal) {
      toast({
        title: "🔒 Daily Limit Reached",
        description: "Free users get 1 signal per day. Upgrade to Premium for unlimited signals!",
        variant: "destructive"
      });
      return;
    }

    // Check and increment usage
    const canProceed = await checkAndIncrementSignal();
    if (!canProceed) {
      return;
    }

    setIsGenerating(true);
    setConnectionStatus('connected');
    
    if (onFeatureUse) {
      onFeatureUse();
    }
    
    try {
      console.log('🚀 Starting enhanced signal generation...');
      
      const signal = await enhancedSignalEngine.generateEnhancedSignal();
      
      if (signal) {
        setSignals(prev => [signal, ...prev.slice(0, 9)]);
        toast({
          title: `🎯 ${signal.strength} Signal Generated!`,
          description: `${signal.pair} ${signal.type} | ${signal.confidence}% confidence | Live Price: ${signal.livePrice.toFixed(5)}`,
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "Unable to generate signal. Please try again.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error generating enhanced signal:', error);
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
      description: `Signal has been removed from the dashboard.`,
    });
  };

  const clearAllSignals = () => {
    setSignals([]);
    toast({
      title: "All Signals Cleared",
      description: "Signal history has been cleared.",
    });
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'STRONG': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'DECENT': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'WEAK': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Signal Generator */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Enhanced FX Signal Engine
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Multi-Strategy + Groq AI
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
              <div className="text-2xl font-bold text-yellow-400">{signalCounts.decent}</div>
              <div className="text-sm text-gray-400">Decent Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{signalCounts.weak}</div>
              <div className="text-sm text-gray-400">Weak Signals</div>
            </div>
          </div>

          <Button
            onClick={handleGenerateSignal}
            disabled={isGenerating || !canGenerateSignal}
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
                Generate Enhanced FX Signal
              </>
            )}
          </Button>

          {!isPremium && (
            <div className="text-center text-sm text-gray-400">
              Free users: 1 signal per day | Premium: Unlimited signals
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signal Strength Filter */}
      <SignalStrengthFilter 
        selectedStrength={filterStrength}
        onChange={setFilterStrength}
        signalCounts={signalCounts}
      />

      {/* Actions */}
      {signals.length > 0 && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            Live Signals ({filteredSignals.length})
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
          <Card key={signal.id} className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {signal.type === 'BUY' ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                  <span className="font-bold text-white">{signal.pair}</span>
                  <Badge className={getStrengthColor(signal.strength)}>
                    {signal.strength}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSignal(signal.id)}
                  className="text-gray-400 hover:text-red-400"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Price and Confidence */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Live Entry Price</div>
                  <div className="font-bold text-white">{signal.livePrice.toFixed(5)}</div>
                  <div className="text-xs text-green-400">{signal.priceValidation.source}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Confidence</div>
                  <div className="font-bold text-white">{signal.confidence}%</div>
                  <div className={`text-xs ${getRiskColor(signal.riskLevel)}`}>
                    {signal.riskLevel} Risk
                  </div>
                </div>
              </div>

              {/* Levels */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-gray-400">Stop Loss</div>
                  <div className="text-red-400 font-mono">{signal.stopLoss.toFixed(5)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Take Profit</div>
                  <div className="text-green-400 font-mono">{signal.takeProfit.toFixed(5)}</div>
                </div>
                <div>
                  <div className="text-gray-400">R:R</div>
                  <div className="text-blue-400 font-mono">{signal.riskReward}:1</div>
                </div>
              </div>

              {/* Strategy Breakdown */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-300">Strategy Analysis:</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {Object.entries(signal.strategies).map(([key, strategy]) => (
                    <div key={key} className="flex items-center gap-1">
                      {strategy.passed ? (
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-400" />
                      )}
                      <span className={strategy.passed ? 'text-green-400' : 'text-red-400'}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Groq Analysis */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">Groq AI Analysis:</span>
                </div>
                <p className="text-sm text-gray-300">{signal.groqAnalysis}</p>
              </div>

              {/* Session and Timestamp */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{signal.sessionContext} Session</span>
                </div>
                <span>{new Date(signal.timestamp).toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredSignals.length === 0 && signals.length > 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No {filterStrength} signals available
          </h3>
          <p className="text-gray-500">
            Try adjusting your filter or generate more signals
          </p>
        </div>
      )}

      {filteredSignals.length === 0 && signals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No signals generated yet
          </h3>
          <p className="text-gray-500">
            Click "Generate Enhanced FX Signal" to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveSignalsDashboard;
