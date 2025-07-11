
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
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signalService } from '@/services/signalService';

interface SignalGeneratorProps {
  onSignalGenerated: (signal: any) => void;
  remainingSignals: number;
}

export const SignalGenerator: React.FC<SignalGeneratorProps> = ({ 
  onSignalGenerated, 
  remainingSignals 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const { toast } = useToast();

  const generateSignal = async () => {
    if (remainingSignals <= 0) {
      toast({
        title: "No signals remaining",
        description: "Upgrade to Premium for unlimited signals",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setAnalysisStatus('Connecting to live market data...');

    try {
      // Phase 1: Market scanning
      setAnalysisStatus('Scanning major currency pairs...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Phase 2: Smart Money analysis
      setAnalysisStatus('Analyzing Smart Money Concepts...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Phase 3: Signal generation
      setAnalysisStatus('Detecting high-probability setups...');
      const signal = await signalService.generateLiveSignal();

      if (signal) {
        setAnalysisStatus('Signal confirmed! Processing...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onSignalGenerated(signal);
        
        toast({
          title: "🎯 High-Conviction Signal Generated!",
          description: `${signal.type} ${signal.pair} with ${signal.confidence}% confidence`,
        });
      } else {
        setAnalysisStatus('No high-probability setups found');
        toast({
          title: "No Signals Found",
          description: "Market conditions don't meet our strict criteria. Try again in 15 minutes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Signal generation error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze market data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setAnalysisStatus('');
    }
  };

  return (
    <div className="glass-card p-8 mb-8 hover-glow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Live AI Signal Generator</h2>
            <p className="text-gray-400">Real-time Smart Money Concepts analysis</p>
          </div>
        </div>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
          <Activity className="w-3 h-3 mr-1" />
          LIVE DATA
        </Badge>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Advanced Market Analysis</h3>
        </div>
        <p className="text-gray-300 mb-6">
          Our AI continuously monitors live market data from Yahoo Finance, analyzing major currency pairs 
          using institutional-grade Smart Money Concepts. Each signal undergoes rigorous validation including:
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass-card p-3 text-center">
            <div className="text-sm text-blue-400 font-semibold">Break of Structure</div>
            <div className="text-xs text-gray-400">Higher highs/lows</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-sm text-green-400 font-semibold">Fair Value Gaps</div>
            <div className="text-xs text-gray-400">Price imbalances</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-sm text-yellow-400 font-semibold">Liquidity Sweeps</div>
            <div className="text-xs text-gray-400">Stop hunts</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-sm text-purple-400 font-semibold">Confluence</div>
            <div className="text-xs text-gray-400">Key levels</div>
          </div>
        </div>

        <Alert className="mb-6 border-green-500/30 bg-green-500/10">
          <AlertCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-300">
            <strong>Live Analysis:</strong> All signals are based on real-time market data with 
            minimum 75% confidence threshold. Only high-conviction setups are selected.
          </AlertDescription>
        </Alert>

        {isGenerating && analysisStatus && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-blue-300 text-sm">{analysisStatus}</span>
            </div>
          </div>
        )}

        <Button 
          size="lg" 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 hover-lift cyber-glow"
          onClick={generateSignal}
          disabled={isGenerating || remainingSignals <= 0}
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Analyzing Live Markets...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Live Signal
            </>
          )}
        </Button>
      </div>

      {/* AI Features */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <Activity className="w-6 h-6 text-green-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">Real-Time Data</h4>
          <p className="text-sm text-gray-400">Live market feeds from Yahoo Finance</p>
        </div>
        <div className="glass-card p-4">
          <Target className="w-6 h-6 text-blue-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">High Conviction</h4>
          <p className="text-sm text-gray-400">75%+ confidence threshold</p>
        </div>
      </div>
    </div>
  );
};
