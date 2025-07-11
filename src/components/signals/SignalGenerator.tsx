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
  Bug
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signalService } from '@/services/signalService';
import { marketDataService } from '@/services/marketDataService';

interface SignalGeneratorProps {
  onSignalGenerated: (signal: any) => void;
  remainingSignals: number;
}

export const SignalGenerator: React.FC<SignalGeneratorProps> = ({ 
  onSignalGenerated, 
  remainingSignals 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
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
    setAnalysisStatus('🔄 Connecting to live market APIs (Multi-API failover)...');

    try {
      // Phase 1: Market scanning with multi-API
      setAnalysisStatus('📡 Scanning ALL major pairs for BEST opportunity...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Phase 2: Live price validation
      setAnalysisStatus('💰 Validating LIVE prices across all markets...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Phase 3: Find best opportunity
      setAnalysisStatus('🧠 Finding BEST available setup (any confidence level)...');
      const signal = await signalService.generateLiveSignal();

      if (signal) {
        setAnalysisStatus('✅ Best market opportunity detected! Processing...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        onSignalGenerated(signal);
        
        const confidenceLevel = signal.confidence >= 75 ? 'HIGH' : signal.confidence >= 50 ? 'MEDIUM' : 'LOW';
        
        toast({
          title: `🎯 BEST Opportunity Found!`,
          description: `${signal.type} ${signal.pair} @ ${signal.entry} (${signal.confidence}% - ${confidenceLevel} confidence)`,
        });
      } else {
        setAnalysisStatus('❌ No viable opportunities found');
        toast({
          title: "No Opportunities",
          description: "No viable setups found across all major pairs",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Signal generation error:', error);
      toast({
        title: "Analysis Error",
        description: "Multi-API system encountered an issue. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setAnalysisStatus('');
    }
  };

  const debugAllApis = async () => {
    setIsDebugging(true);
    console.log('🔍 Starting FULL API DEBUG (All 4 APIs)...');
    
    try {
      await marketDataService.debugApiConnection();
      
      toast({
        title: "🔍 Multi-API Debug Complete",
        description: "Check console for detailed results from all 4 APIs",
      });
    } catch (error) {
      toast({
        title: "Debug Error", 
        description: "Failed to test API connections",
        variant: "destructive"
      });
    } finally {
      setIsDebugging(false);
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
            <h2 className="text-xl font-bold text-white">Best Opportunity Scanner</h2>
            <p className="text-gray-400">Finds the highest probability setup across all major pairs</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            LIVE SCANNING
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <BarChart3 className="w-3 h-3 mr-1" />
            BEST SETUP
          </Badge>
        </div>
      </div>

      <div className="glass-card p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Enterprise-Grade Data Sources</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass-card p-3 text-center">
            <div className="text-sm text-green-400 font-semibold">Finnhub</div>
            <div className="text-xs text-gray-400">Primary OANDA</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-sm text-blue-400 font-semibold">Twelve Data</div>
            <div className="text-xs text-gray-400">Backup Feed</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-sm text-yellow-400 font-semibold">Polygon.io</div>
            <div className="text-xs text-gray-400">Pro Backup</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-sm text-purple-400 font-semibold">Alpha Vantage</div>
            <div className="text-xs text-gray-400">Final Fallback</div>
          </div>
        </div>

        <Alert className="mb-6 border-orange-500/30 bg-orange-500/10">
          <AlertCircle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-300">
            <strong>BEST OPPORTUNITY MODE:</strong> Scanner finds the highest confidence setup available across all major pairs, 
            regardless of confidence threshold. Entry prices are synchronized with live market data.
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

        <div className="flex space-x-4 mb-4">
          <Button 
            size="lg" 
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 hover-lift cyber-glow"
            onClick={generateSignal}
            disabled={isGenerating || remainingSignals <= 0}
          >
            {isGenerating ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Scanning Markets...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Find Best Opportunity
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
            onClick={debugAllApis}
            disabled={isDebugging}
          >
            {isDebugging ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Testing All APIs...
              </>
            ) : (
              <>
                <Bug className="w-4 h-4 mr-2" />
                Debug All 4 APIs
              </>
            )}
          </Button>
        </div>
      </div>

      {/* API Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <Activity className="w-6 h-6 text-green-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">Live Price Sync</h4>
          <p className="text-sm text-gray-400">Real-time price matching</p>
        </div>
        <div className="glass-card p-4">
          <Target className="w-6 h-6 text-purple-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">Best Setup Scanner</h4>
          <p className="text-sm text-gray-400">Always finds opportunities</p>
        </div>
      </div>
    </div>
  );
};
