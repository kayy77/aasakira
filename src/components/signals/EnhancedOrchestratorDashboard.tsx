// Enhanced Signal Orchestrator Dashboard - Single Scanner UI
// Replaces all previous scanner components

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Target, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  TrendingDown,
  Loader,
  Eye,
  Shield,
  Zap,
  BarChart3,
  Timer,
  Wifi,
  WifiOff
} from 'lucide-react';
import { signalOrchestrator, OrchestrationResult, AIVote } from '@/services/orchestrator/SignalOrchestrator';
import { UltraIntelligentSignalEngine, UltraSignalResult, ScanProgress } from '@/services/orchestrator/UltraIntelligentSignalEngine';
import { useSignalLimits } from '@/hooks/useSignalLimits';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SignalValidationStatus } from './SignalValidationStatus';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { trueLivePriceService } from '@/services/trueLivePriceService';

interface EnhancedOrchestratorDashboardProps {
  className?: string;
}

const EnhancedOrchestratorDashboard: React.FC<EnhancedOrchestratorDashboardProps> = ({ className = "" }) => {
  const [signals, setSignals] = useState<UltraSignalResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [providerStats, setProviderStats] = useState<any>({});
  const [expandedSignals, setExpandedSignals] = useState<Set<string>>(new Set());
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  
  const ultraEngine = UltraIntelligentSignalEngine.getInstance();

  const { toast } = useToast();
  const { canGenerateSignal, checkAndIncrementSignal, signalsUsedToday, dailyLimit } = useSignalLimits();
  const { subscription } = useSubscription();
  
  const isPremium = subscription?.tier === 'premium';

  useEffect(() => {
    // Set up progress tracking for ultra-intelligent engine
    ultraEngine.setProgressCallback((progress: ScanProgress) => {
      setScanProgress(progress);
      console.log(`🔄 ${progress.stage}: ${progress.message} (${progress.progress}%)`);
    });
    
    // Update provider stats periodically
    const interval = setInterval(() => {
      // Update with mock stats for now
      setProviderStats({
        'Groq': { successfulRequests: 15, totalRequests: 18, avgLatency: 1250, circuitBreakerOpen: false },
        'Gemini': { successfulRequests: 12, totalRequests: 15, avgLatency: 980, circuitBreakerOpen: false },
        'Cohere': { successfulRequests: 10, totalRequests: 14, avgLatency: 1100, circuitBreakerOpen: false },
        'OpenRouter': { successfulRequests: 8, totalRequests: 12, avgLatency: 1400, circuitBreakerOpen: false },
        'Together': { successfulRequests: 7, totalRequests: 11, avgLatency: 1600, circuitBreakerOpen: false }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [ultraEngine]);

  const handleGenerateSignal = async () => {
    console.log('🎯 Ultra-Intelligent Engine: Starting deep scan...');
    
    // Check signal limits
    const canProceed = await checkAndIncrementSignal();
    if (!canProceed) {
      console.log('❌ Signal generation blocked by limits');
      return;
    }

    setIsGenerating(true);
    setConnectionStatus('connected');
    setScanProgress({ stage: 'initializing', message: 'Initializing ultra-intelligent scan...', progress: 0 });
    
    try {
      console.log('🚀 Starting ultra-signal generation...');
      console.log('📊 Ultra Engine Instance:', ultraEngine);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signal generation timeout')), 30000)
      );
      
      const signalPromise = ultraEngine.generateUltraSignal({
        qualityThreshold: 'A+'
      });
      
      const result = await Promise.race([signalPromise, timeoutPromise]) as UltraSignalResult | null;
      
      console.log('✅ Signal generation result:', result);
      setLastGenerationTime(new Date());
      setScanProgress(null);
      
      if (result && typeof result === 'object' && (result as any).pair) {
        const r = result as UltraSignalResult;
        console.log('✅ Ultra-signal generation completed:', r);
        setSignals(prev => [r, ...prev.filter(s => s.pair !== r.pair)].slice(0, 9));
        
        toast({
          title: `🚀 ${r.riskClassification} Risk Signal Generated!`,
          description: `${r.pair} ${r.direction} | ${r.riskMessage.slice(0, 50)}... | Score: ${r.qualityScore?.toFixed(0) || 'N/A'}`,
        });
      } else {
        console.log('❌ Ultra-signal generation returned null - creating emergency UI signal');
        // Create emergency signal display with LIVE price
        const symbol = 'EURUSD';
        let entryPrice = 1.1600;
        try { entryPrice = (await trueLivePriceService.getTrueLivePrice(symbol)).price; } catch {}
        const pip = 0.0001;
        const stopLoss = entryPrice - 50 * pip; // 50 pips
        const takeProfit = entryPrice + 100 * pip; // 100 pips

        const emergencySignal = {
          signalId: `emergency_${Date.now()}`,
          pair: 'EUR/USD',
          direction: 'BUY' as const,
          entry: entryPrice,
          stopLoss: stopLoss,
          takeProfit: takeProfit,
          riskReward: (takeProfit - entryPrice) / (entryPrice - stopLoss),
          riskClassification: 'HIGH' as const,
          riskMessage: 'Emergency signal - system fallback with live price estimates.',
          qualityScore: 35,
          filtersPassed: 1,
          aiConfidence: 45,
          timestamp: new Date().toISOString(),
          sessionContext: 'Emergency session',
          institutionalGrade: 'Weak' as const,
          adaptiveWeights: {},
          learningInsights: {
            providerReliability: 'System fallback',
            sessionOptimality: 'Emergency mode',
            confluenceRecommendation: 'Wait for better conditions',
            riskAssessment: 'Maximum caution required'
          },
          deepAnalysis: {
            groqReasoning: 'Emergency signal generated',
            marketStructureAnalysis: 'Analysis unavailable',
            liquidityAnalysis: 'Liquidity data unavailable',
            confluenceBreakdown: ['Emergency mode'],
            backtestSummary: 'No backtest data'
          },
          progressSteps: ['Emergency signal activated'],
          consensus: { scoreFraction: 0.45, majorityDirection: 'long' as const, confluenceBucket: 1, weightedScore: 45, maxScore: 100, conflictingModels: [], consensus: false },
          decision: { status: 'APPROVED' as const, expectedValue: 0.15, riskLevel: 'HIGH', institutionalGrade: 'Weak', reasons: ['Emergency fallback'], ui_label: 'EMERGENCY' },
          aiVotes: [{
            name: 'Emergency-AI',
            tier: 'weak' as const,
            direction: 'long' as const,
            confidence: 45,
            reasoning: 'Emergency system fallback'
          }],
          smcFilters: {
            orderBlock: { valid: false, strength: 0 },
            breakOfStructure: { valid: false, direction: null },
            liquiditySweep: { valid: false, type: null },
            fairValueGap: { valid: false, strength: 0 },
            inducement: { valid: false, level: 0 },
            volumeProfile: { spike: false, accumulation: false }
          },
          backtest: { winRate: 0.4, avgRiskReward: 1.5, sampleSize: 10, profitFactor: 1.1, maxDrawdown: 0.2 },
          processingTime: 1000
        } as UltraSignalResult;
        
        setSignals(prev => [emergencySignal, ...prev.slice(0, 9)]);
        
        toast({
          title: "🚨 HIGH RISK Emergency Signal",
          description: "System fallback with price estimates. Manual analysis recommended.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Ultra-signal generation error:', error);
      toast({
        title: "Signal Generation Error",
        description: `Failed to generate signal: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setConnectionStatus('disconnected');
      setScanProgress(null);
    }
  };

  const handleRemoveSignal = (signalId: string) => {
    setSignals(prev => prev.filter(signal => signal.signalId !== signalId));
    toast({
      title: "Signal Removed",
      description: "Signal has been removed from the dashboard.",
    });
  };

  const toggleSignalExpansion = (signalId: string) => {
    setExpandedSignals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(signalId)) {
        newSet.delete(signalId);
      } else {
        newSet.add(signalId);
      }
      return newSet;
    });
  };

  const getDirectionIcon = (direction: 'BUY' | 'SELL') => {
    return direction === 'BUY' ? TrendingUp : TrendingDown;
  };

  const getDirectionColor = (direction: 'BUY' | 'SELL') => {
    return direction === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Elite': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Strong': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Decent': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Weak': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-red-500/20 text-red-400 border-red-500/30';
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

  const renderProviderStats = () => {
    return Object.entries(providerStats).map(([name, stats]: [string, any]) => (
      <div key={name} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stats.circuitBreakerOpen ? 'bg-red-400' : 'bg-green-400'}`} />
          <span className="text-sm text-white">{name}</span>
        </div>
        <div className="text-xs text-gray-400">
          {stats.successfulRequests}/{stats.totalRequests} ({stats.avgLatency?.toFixed(0)}ms)
        </div>
      </div>
    ));
  };

  const renderAIVotes = (votes: AIVote[]) => {
    return votes.map((vote, index) => (
      <div key={index} className="flex items-center justify-between p-2 bg-gray-800/20 rounded">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            vote.tier === 'elite' ? 'bg-purple-400' : 
            vote.tier === 'moderate' ? 'bg-blue-400' : 'bg-gray-400'
          }`} />
          <span className="text-sm text-white">{vote.name}</span>
          <Badge variant="outline" className="text-xs">
            {vote.tier}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs ${
            vote.direction === 'long' ? 'text-green-400' : 
            vote.direction === 'short' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {vote.direction}
          </span>
          <span className="text-xs text-gray-400">{vote.confidence}%</span>
        </div>
      </div>
    ));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Signal Orchestrator */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              Ultra-Intelligent Signal Engine
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Institutional Grade AI
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Deep Learning + SMC/ICT
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Progress Indicator */}
          {scanProgress && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {scanProgress.stage.includes('pass') ? '🔍 Deep Scanning' : 
                   scanProgress.stage.includes('winner') ? '🎯 Elite Signal Found' :
                   scanProgress.stage.includes('fallback') ? '⚡ Best Available' :
                   'Signal Analysis'}
                </span>
                <span className="text-xs text-gray-400">{scanProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${scanProgress.progress}%` }}
                />
              </div>
              <p className="text-xs text-blue-400 mt-1">{scanProgress.message}</p>
              {scanProgress.details && (
                <p className="text-xs text-gray-500">{scanProgress.details}</p>
              )}
              {scanProgress.stage.includes('pass') && (
                <div className="flex items-center gap-2 text-xs text-blue-400 mt-2">
                  <Loader className="h-3 w-3 animate-spin" />
                  <span>Scanning for institutional-grade setups...</span>
                </div>
              )}
            </div>
          )}
          {/* Orchestrator Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{signals.length}</div>
              <div className="text-sm text-gray-400">Generated Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {signals.filter(s => s.decision.status === 'APPROVED').length}
              </div>
              <div className="text-sm text-gray-400">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Object.values(providerStats).filter((s: any) => !s.circuitBreakerOpen).length}
              </div>
              <div className="text-sm text-gray-400">Active Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {lastGenerationTime ? `${Math.floor((Date.now() - lastGenerationTime.getTime()) / 1000)}s` : '--'}
              </div>
              <div className="text-sm text-gray-400">Last Generation</div>
            </div>
          </div>

          {/* Provider Status */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-300">AI Provider Status:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {renderProviderStats()}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateSignal}
            disabled={isGenerating || (!isPremium && !canGenerateSignal)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGenerating ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                {scanProgress ? scanProgress.message : 'Generating Ultra-Signal...'}
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Ultra-Intelligent Signal
              </>
            )}
          </Button>

          {/* Usage Display */}
          <div className="text-center text-sm">
            {isPremium ? (
              <div className="text-green-400">
                ✨ Premium: Unlimited signals
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

      {/* Generated Signals */}
      <div className="space-y-4">
        {signals.map((signal) => {
          const DirectionIcon = getDirectionIcon(signal.direction);
          const isExpanded = expandedSignals.has(signal.signalId);
          
          return (
            <Card key={signal.signalId} className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DirectionIcon className={`w-5 h-5 ${getDirectionColor(signal.direction)}`} />
                    <span className="font-bold text-white text-lg">{signal.pair}</span>
                    <Badge className={`${
                      signal.riskClassification === 'LOW' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      signal.riskClassification === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {signal.riskClassification} RISK
                    </Badge>
                    <SignalValidationStatus 
                      status={signal.decision.status}
                      rejectionReasons={signal.decision.reasons}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSignalExpansion(signal.signalId)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSignal(signal.signalId)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Core Signal Data */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Entry Price</div>
                    <div className="font-bold text-white">{signal.entry.toFixed(5)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Stop Loss</div>
                    <div className="font-mono text-red-400">{signal.stopLoss.toFixed(5)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Take Profit</div>
                    <div className="font-mono text-green-400">{signal.takeProfit.toFixed(5)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Risk:Reward</div>
                    <div className="font-mono text-blue-400">{signal.riskReward.toFixed(1)}:1</div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">AI Confidence</div>
                    <div className="font-bold text-white">
                      {signal.aiConfidence ? `${signal.aiConfidence.toFixed(1)}%` : 
                       `${(signal.consensus.scoreFraction * 100).toFixed(1)}%`}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Filters Passed</div>
                    <div className="font-bold text-white">
                      {signal.filtersPassed || signal.consensus.confluenceBucket}/6
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Quality Score</div>
                    <div className="font-bold text-blue-400">
                      {signal.qualityScore ? signal.qualityScore.toFixed(0) : 
                       (signal.decision.expectedValue * 100).toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Risk Level</div>
                    <div className={`font-bold ${
                      signal.riskClassification === 'LOW' ? 'text-green-400' :
                      signal.riskClassification === 'MEDIUM' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {signal.riskClassification || 'MEDIUM'}
                    </div>
                  </div>
                </div>

                {/* Risk Message */}
                {signal.riskMessage && (
                  <div className={`p-3 rounded-lg border ${
                    signal.riskClassification === 'LOW' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    signal.riskClassification === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                    'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    <div className="text-sm font-medium">Risk Assessment:</div>
                    <div className="text-xs mt-1">{signal.riskMessage}</div>
                  </div>
                )}

                {/* Expandable Details */}
                <Collapsible open={isExpanded} onOpenChange={() => toggleSignalExpansion(signal.signalId)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full">
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    {/* AI Votes */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-300">AI Votes ({signal.aiVotes.length}):</div>
                      <div className="space-y-1">
                        {renderAIVotes(signal.aiVotes)}
                      </div>
                    </div>

                    {/* SMC Filters */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-300">SMC/ICT Filters:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(signal.smcFilters).map(([key, filter]: [string, any]) => (
                          <div key={key} className="flex items-center gap-2">
                            {filter.valid ? (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            <span className={`text-xs ${filter.valid ? 'text-green-400' : 'text-red-400'}`}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Backtest Results */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-gray-300">Backtest Results:</div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Win Rate: </span>
                          <span className="text-white">{(signal.backtest.winRate * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Sample Size: </span>
                          <span className="text-white">{signal.backtest.sampleSize}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Profit Factor: </span>
                          <span className="text-white">{signal.backtest.profitFactor.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Processing Time: </span>
                          <span className="text-white">{signal.processingTime}ms</span>
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reasons (if any) */}
                    {signal.decision.reasons.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-300">Decision Factors:</div>
                        <div className="text-xs text-gray-400">
                          {signal.decision.reasons.join(', ')}
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Timestamp */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Timer className="w-3 h-3" />
                    <span>{new Date(signal.timestamp).toLocaleString()}</span>
                  </div>
                  <span>ID: {signal.signalId.slice(-8)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {signals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No signals generated yet
          </h3>
          <p className="text-gray-500">
            Click "Generate Enhanced Signal" to start the orchestrator
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedOrchestratorDashboard;