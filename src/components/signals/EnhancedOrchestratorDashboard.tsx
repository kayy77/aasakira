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
import { providerManager } from '@/services/orchestrator/ProviderAdapters';
import { useSignalLimits } from '@/hooks/useSignalLimits';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { SignalValidationStatus } from './SignalValidationStatus';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface EnhancedOrchestratorDashboardProps {
  className?: string;
}

const EnhancedOrchestratorDashboard: React.FC<EnhancedOrchestratorDashboardProps> = ({ className = "" }) => {
  const [signals, setSignals] = useState<OrchestrationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerationTime, setLastGenerationTime] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [providerStats, setProviderStats] = useState<any>({});
  const [expandedSignals, setExpandedSignals] = useState<Set<string>>(new Set());

  const { toast } = useToast();
  const { canGenerateSignal, checkAndIncrementSignal, signalsUsedToday, dailyLimit } = useSignalLimits();
  const { subscription } = useSubscription();
  
  const isPremium = subscription?.tier === 'premium';

  useEffect(() => {
    // Update provider stats periodically
    const interval = setInterval(() => {
      setProviderStats(providerManager.getProviderStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleGenerateSignal = async () => {
    console.log('🎯 Enhanced Orchestrator: Generate signal clicked');
    
    // Check signal limits
    const canProceed = await checkAndIncrementSignal();
    if (!canProceed) {
      console.log('❌ Signal generation blocked by limits');
      return;
    }

    setIsGenerating(true);
    setConnectionStatus('connected');
    
    try {
      console.log('🚀 Starting signal orchestration...');
      
      const result = await signalOrchestrator.generateSignal();
      setLastGenerationTime(new Date());
      
      if (result) {
        console.log('✅ Signal orchestration completed:', result);
        setSignals(prev => [result, ...prev.slice(0, 9)]);
        
        toast({
          title: `🎯 ${result.decision.ui_label} Signal Generated!`,
          description: `${result.pair} ${result.direction} | ${result.decision.institutionalGrade} grade | EV: ${result.decision.expectedValue.toFixed(2)}`,
        });
      } else {
        console.log('❌ Signal orchestration returned null (rejected)');
        toast({
          title: "Signal Quality Gate",
          description: "Generated signal was rejected by institutional validation. This protects you from low-quality setups.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('❌ Signal orchestration error:', error);
      toast({
        title: "Orchestration Error",
        description: "Failed to generate signal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setConnectionStatus('disconnected');
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
              Enhanced Signal Orchestrator
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Institutional Grade
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-gray-400" />
              )}
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Multi-AI + SMC/ICT
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                Orchestrating Signal...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Enhanced Signal
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
                    <Badge className={getGradeColor(signal.decision.institutionalGrade)}>
                      {signal.decision.institutionalGrade}
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
                    <div className="text-sm text-gray-400">AI Consensus</div>
                    <div className="font-bold text-white">
                      {(signal.consensus.scoreFraction * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Confluence</div>
                    <div className="font-bold text-white">{signal.consensus.confluenceBucket}/6</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Expected Value</div>
                    <div className={`font-bold ${signal.decision.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.decision.expectedValue.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Risk Level</div>
                    <div className={`font-bold ${getRiskColor(signal.decision.riskLevel)}`}>
                      {signal.decision.riskLevel}
                    </div>
                  </div>
                </div>

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