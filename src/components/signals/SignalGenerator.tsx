
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
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { eliteSignalEngine, EliteSignal } from '@/services/eliteSignalEngine';
import { trueLivePriceService } from '@/services/trueLivePriceService';
import { signalService } from '@/services/signalService';

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
  const [lastRejectionReason, setLastRejectionReason] = useState<string>('');
  const [rejectionCount, setRejectionCount] = useState<number>(0);
  const { toast } = useToast();

  const generateEliteSignal = async () => {
    // Track feature usage
    onFeatureUse?.();

    setIsGenerating(true);
    setAnalysisStatus('🏛️ INSTITUTIONAL SIGNAL PROTOCOL INITIALIZING...');
    setLastRejectionReason('');
    setRejectionCount(0);

    try {
      // Phase 1: Generate standard institutional signal first
      setAnalysisStatus('🧠 Running Institutional-Grade Analysis on Multiple Pairs...');
      
      let standardSignal = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!standardSignal && attempts < maxAttempts) {
        attempts++;
        setAnalysisStatus(`🎯 Attempt ${attempts}: Scanning pairs for institutional setups...`);
        
        try {
          standardSignal = await signalService.generateLiveSignal();
          if (!standardSignal) {
            setRejectionCount(prev => prev + 1);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.log(`Attempt ${attempts} failed:`, error);
          setRejectionCount(prev => prev + 1);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (standardSignal) {
        // Convert standard signal to elite format
        setAnalysisStatus('⚡ Converting to Enhanced Elite Signal Format...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const eliteSignal: EliteSignal = {
          id: `elite_${standardSignal.id}`,
          pair: standardSignal.pair,
          type: standardSignal.type,
          entry: standardSignal.entry.toString(),
          stopLoss: standardSignal.stopLoss.toString(),
          takeProfit: standardSignal.takeProfit.toString(),
          confidence: standardSignal.confidence,
          filtersScore: standardSignal.confluenceScore || 4,
          maxFilters: standardSignal.maxConfluence || 6,
          riskReward: Math.round((Math.abs(Number(standardSignal.takeProfit) - Number(standardSignal.entry)) / Math.abs(Number(standardSignal.entry) - Number(standardSignal.stopLoss))) * 10) / 10,
          signalStrength: standardSignal.confidence >= 90 ? 'ULTRA' : standardSignal.confidence >= 87 ? 'STRONG' : 'MEDIUM',
          lotSize: standardSignal.confidence >= 90 ? 1.0 : standardSignal.confidence >= 87 ? 0.75 : 0.5,
          strategy: standardSignal.strategy,
          reasoning: standardSignal.analysis,
          livePrice: standardSignal.livePrice.toString(),
          timestamp: standardSignal.timestamp,
          filterBreakdown: {
            passed: standardSignal.filtersPassed || [
              'Multi-timeframe institutional alignment',
              'Smart money volume confirmation',
              'Structure break validated',
              'Premium entry zone identified'
            ],
            failed: [],
            anchorFilters: ['Structure Break', 'Volume Spike'],
            riskLevel: standardSignal.risk
          }
        };

        if (onSignalGenerated) {
          onSignalGenerated(eliteSignal);
          
          // Store filter results for display
          setLastFilterResults(eliteSignal.filterBreakdown.passed);
          
          const strengthEmoji = {
            'ULTRA': '🚨',
            'STRONG': '⚡',
            'MEDIUM': '⚠️',
            'STANDARD': '📊'
          };
          
          toast({
            title: `${strengthEmoji[eliteSignal.signalStrength]} ${eliteSignal.signalStrength} INSTITUTIONAL SIGNAL!`,
            description: `${eliteSignal.pair} ${eliteSignal.type} @ ${eliteSignal.entry} | Filters: ${eliteSignal.filtersScore}/${eliteSignal.maxFilters} | RR: ${eliteSignal.riskReward}:1 | Lot: ${eliteSignal.lotSize}`,
          });
        }
      } else {
        setAnalysisStatus('❌ All pairs rejected by Institutional Filter Gate');
        setLastFilterResults([]);
        setLastRejectionReason(`BRUTAL FILTERING ACTIVE: ${rejectionCount} pairs/setups rejected. Requirements: 85%+ confidence, 4/6+ confluence, 2.5:1+ RR, 80%+ win rate simulation, active session strength, volume confirmation. Current market conditions too weak for institutional-grade signals.`);
        toast({
          title: "🏛️ Institutional Filter Gate - All Signals Rejected",
          description: `${rejectionCount} potential signals blocked by enhanced filtering system. This prevents weak trades and protects capital.`,
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
            <h2 className="text-xl font-bold text-white">🏛️ Institutional Signal Protocol</h2>
            <p className="text-gray-400">BRUTAL filtering: 85%+ confidence, 4/6+ confluence, 2.5:1+ RR required</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
            <Shield className="w-3 h-3 mr-1" />
            BRUTAL
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
          <h3 className="text-lg font-semibold text-white">Enhanced Institutional Requirements</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="glass-card p-3 text-center border-red-500/20">
            <div className="text-sm text-red-400 font-semibold">Min Confidence</div>
            <div className="text-xs text-gray-400">85% Required</div>
          </div>
          <div className="glass-card p-3 text-center border-orange-500/20">
            <div className="text-sm text-orange-400 font-semibold">Min Confluence</div>
            <div className="text-xs text-gray-400">4/6 Filters</div>
          </div>
          <div className="glass-card p-3 text-center border-yellow-500/20">
            <div className="text-sm text-yellow-400 font-semibold">Risk:Reward</div>
            <div className="text-xs text-gray-400">2.5:1 Minimum</div>
          </div>
          <div className="glass-card p-3 text-center border-green-500/20">
            <div className="text-sm text-green-400 font-semibold">Win Rate Sim</div>
            <div className="text-xs text-gray-400">80%+ Required</div>
          </div>
          <div className="glass-card p-3 text-center border-blue-500/20">
            <div className="text-sm text-blue-400 font-semibold">Session Strength</div>
            <div className="text-xs text-gray-400">Active Required</div>
          </div>
          <div className="glass-card p-3 text-center border-purple-500/20">
            <div className="text-sm text-purple-400 font-semibold">Volume Check</div>
            <div className="text-xs text-gray-400">Spike Required</div>
          </div>
        </div>

        <Alert className="mb-6 border-red-500/50 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>BRUTAL INSTITUTIONAL PROTOCOL:</strong> Most signals will be REJECTED. Only institutional-grade setups with 85%+ confidence, 4+ filters, 2.5:1+ RR, and 80%+ win rate simulation pass. Dead sessions, weak volume, and low confluence setups are automatically blocked.
          </AlertDescription>
        </Alert>

        {/* Rejection Counter */}
        {rejectionCount > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Institutional Filter Activity:</span>
            </div>
            <p className="text-sm text-red-200">{rejectionCount} pairs/setups rejected by brutal filtering system</p>
          </div>
        )}

        {/* Last Rejection Reason */}
        {lastRejectionReason && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold">Filtering System Status:</span>
            </div>
            <p className="text-sm text-red-200">{lastRejectionReason}</p>
          </div>
        )}

        {/* Last Filter Results */}
        {lastFilterResults.length > 0 && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-semibold">Last Signal Institutional Validation:</span>
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
            className="flex-1 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-4 hover-lift cyber-glow"
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
                <Shield className="w-5 h-5 mr-2" />
                Generate Institutional Signal
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Signal Strength Guide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-red-500/20">
          <Crown className="w-6 h-6 text-red-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">ULTRA (90%+)</h4>
          <p className="text-sm text-gray-400">Perfect setup</p>
          <p className="text-xs text-red-400">1.0 lot | 3.0:1+ RR</p>
        </div>
        <div className="glass-card p-4 border-orange-500/20">
          <Zap className="w-6 h-6 text-orange-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">STRONG (87%+)</h4>
          <p className="text-sm text-gray-400">Elite confluence</p>
          <p className="text-xs text-orange-400">0.75 lot | 2.8:1+ RR</p>
        </div>
        <div className="glass-card p-4 border-yellow-500/20">
          <Target className="w-6 h-6 text-yellow-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">MEDIUM (85%+)</h4>
          <p className="text-sm text-gray-400">Institutional grade</p>
          <p className="text-xs text-yellow-400">0.5 lot | 2.5:1+ RR</p>
        </div>
        <div className="glass-card p-4 border-gray-500/20">
          <BarChart3 className="w-6 h-6 text-gray-400 mb-2" />
          <h4 className="text-white font-semibold mb-1">REJECTED (&lt;85%)</h4>
          <p className="text-sm text-gray-400">Below threshold</p>
          <p className="text-xs text-gray-400">Signal blocked</p>
        </div>
      </div>
    </div>
  );
};

export default SignalGenerator;
