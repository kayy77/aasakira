import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Brain,
  Loader,
  Sparkles,
  Activity,
  BarChart3,
  Crown,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { eliteSignalEngine, EliteSignal } from '@/services/eliteSignalEngine';
import { trueLivePriceService } from '@/services/trueLivePriceService';

interface SignalGeneratorProps {
  onSignalGenerated?: (signal: EliteSignal) => void;
  onFeatureUse?: () => void;
}

export const SignalGenerator: React.FC<SignalGeneratorProps> = ({ 
  onSignalGenerated,
  onFeatureUse
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [lastFilterResults, setLastFilterResults] = useState<string[]>([]);
  const { toast } = useToast();

  const generateEliteSignal = async () => {
    // Track feature usage
    onFeatureUse?.();

    setIsGenerating(true);
    setAnalysisStatus('🎯 INSTITUTIONAL SIGNAL PROTOCOL INITIALIZING...');

    try {
      // Phase 1: Get live price (KEEPING EXACTLY THE SAME)
      setAnalysisStatus('📡 Fetching LIVE market price (unchanged system)...');
      const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD'];
      const selectedPair = pairs[Math.floor(Math.random() * pairs.length)];
      
      const livePriceData = await trueLivePriceService.getTrueLivePrice(selectedPair);
      const livePrice = livePriceData.price;
      
      setAnalysisStatus('🧠 Running Institutional 6-Filter Analysis...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAnalysisStatus('⚡ Institutional Signal Engine Processing...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Phase 2: Generate elite signal using upgraded engine
      setAnalysisStatus('🏛️ Validating Institutional-Grade Confluence...');
      const eliteSignal = await eliteSignalEngine.generateEliteSignal(livePrice, selectedPair);

      if (eliteSignal && onSignalGenerated) {
        onSignalGenerated(eliteSignal);
        
        // Store filter results for display
        setLastFilterResults(eliteSignal.filterBreakdown.passed);
        
        const strengthEmoji = {
          'ULTRA': '🚨',
          'STRONG': '⚡',
          'MEDIUM': '⚠️',
          'WEAK': '❌'
        };
        
        toast({
          title: `${strengthEmoji[eliteSignal.signalStrength]} ${eliteSignal.signalStrength} INSTITUTIONAL SIGNAL!`,
          description: `${eliteSignal.pair} ${eliteSignal.type} @ ${eliteSignal.entry} | Filters: ${eliteSignal.filtersScore}/6 | RR: ${eliteSignal.riskReward.toFixed(1)}:1 | Lot: ${eliteSignal.lotSize}`,
        });
      } else {
        setAnalysisStatus('❌ Signal rejected by Institutional Filter Gate');
        setLastFilterResults([]);
        toast({
          title: "Institutional Filter Gate Rejection",
          description: "Signal failed to meet institutional criteria (minimum 3/6 confluence filters required)",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Institutional signal generation error:', error);
      toast({
        title: "Institutional Signal Engine Error",
        description: "Elite signal engine encountered an issue. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setAnalysisStatus('');
    }
  };

  return (
    <div className="glass-card p-8 mb-8 hover-glow border-purple-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Institutional Signal Protocol</h2>
            <p className="text-gray-400">6-filter confluence system with smart rejection</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse">
            <Crown className="w-3 h-3 mr-1" />
            INSTITUTIONAL
          </Badge>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Activity className="w-3 h-3 mr-1" />
            LIVE FEEDS
          </Badge>
        </div>
      </div>

      <div className="glass-card p-6 mb-6 border-purple-500/10">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">6-Filter Institutional Analysis</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="glass-card p-3 text-center border-purple-500/10">
            <div className="text-sm text-green-400 font-semibold">Structure Break</div>
            <div className="text-xs text-gray-400">BOS Confirmation</div>
          </div>
          <div className="glass-card p-3 text-center border-purple-500/10">
            <div className="text-sm text-blue-400 font-semibold">Liquidity Sweep</div>
            <div className="text-xs text-gray-400">Smart Money Hunt</div>
          </div>
          <div className="glass-card p-3 text-center border-purple-500/10">
            <div className="text-sm text-yellow-400 font-semibold">Fair Value Gap</div>
            <div className="text-xs text-gray-400">Order Block Touch</div>
          </div>
          <div className="glass-card p-3 text-center border-purple-500/10">
            <div className="text-sm text-purple-400 font-semibold">Volume Spike</div>
            <div className="text-xs text-gray-400">Institutional Flow</div>
          </div>
          <div className="glass-card p-3 text-center border-purple-500/10">
            <div className="text-sm text-orange-400 font-semibold">RSI Divergence</div>
            <div className="text-xs text-gray-400">Extreme Levels</div>
          </div>
          <div className="glass-card p-3 text-center border-purple-500/10">
            <div className="text-sm text-pink-400 font-semibold">Session Filter</div>
            <div className="text-xs text-gray-400">Active Sessions</div>
          </div>
        </div>

        <Alert className="mb-6 border-yellow-500/30 bg-yellow-500/10">
          <Crown className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <strong>INSTITUTIONAL PROTOCOL:</strong> Signals must pass minimum 3/6 institutional filters. 
            Strength scoring: 6/6 = ELITE, 5/6 = STRONG, 4/6 = MEDIUM, 3/6 = WEAK.
            Smart rejection prevents weak entries. Live prices remain unchanged.
          </AlertDescription>
        </Alert>

        {/* Last Filter Results */}
        {lastFilterResults.length > 0 && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-semibold">Last Signal Passed Filters:</span>
            </div>
            <div className="space-y-1">
              {lastFilterResults.map((filter, index) => (
                <div key={index} className="text-sm text-green-200 flex items-center space-x-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                  <span>{filter}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isGenerating && analysisStatus && (
          <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-purple-300 text-sm">{analysisStatus}</span>
            </div>
          </div>
        )}

        <div className="flex space-x-4 mb-4">
          <Button 
            size="lg" 
            className="flex-1 bg-gradient-to-r from-yellow-600 to-purple-600 hover:from-yellow-700 hover:to-purple-700 text-white font-bold py-4 hover-lift cyber-glow"
            onClick={generateEliteSignal}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Institutional Analysis...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Generate Institutional Signal
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Signal Strength Guide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-yellow-500/20">
          <Crown className="w-6 h-6 text-yellow-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">ELITE (6/6)</h4>
          <p className="text-sm text-gray-400">All filters aligned</p>
          <p className="text-xs text-yellow-400">1.0 lot | 2.8:1 RR</p>
        </div>
        <div className="glass-card p-4 border-green-500/20">
          <Zap className="w-6 h-6 text-green-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">STRONG (5/6)</h4>
          <p className="text-sm text-gray-400">Strong confluence</p>
          <p className="text-xs text-green-400">0.75 lot | 2.5:1 RR</p>
        </div>
        <div className="glass-card p-4 border-blue-500/20">
          <Target className="w-6 h-6 text-blue-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">MEDIUM (4/6)</h4>
          <p className="text-sm text-gray-400">Good setup</p>
          <p className="text-xs text-blue-400">0.5 lot | 2.2:1 RR</p>
        </div>
        <div className="glass-card p-4 border-red-500/20">
          <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">REJECTED (&lt;3/6)</h4>
          <p className="text-sm text-gray-400">Filter gate failed</p>
          <p className="text-xs text-red-400">No signal generated</p>
        </div>
      </div>
    </div>
  );
};

export default SignalGenerator;
