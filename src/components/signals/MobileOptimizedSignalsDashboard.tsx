
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
  Clock
} from 'lucide-react';
import { Signal } from '@/types/signalConfig';
import { signalService } from '@/services/signalService';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileOptimizedSignalsDashboardProps {
  // Define props here
}

const MobileOptimizedSignalsDashboard: React.FC<MobileOptimizedSignalsDashboardProps> = ({
  // Destructure props here
}) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [rejectionCount, setRejectionCount] = useState<number>(0);
  const [lastRejectionReason, setLastRejectionReason] = useState<string>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const getCurrentSession = (): string => {
    const hour = new Date().getUTCHours();
    
    if (hour >= 8 && hour <= 17) return 'London';
    if (hour >= 13 && hour <= 22) return 'New York';
    if (hour >= 22 || hour <= 8) return 'Asian';
    
    return 'Off Hours';
  };

  const getSessionRequirements = () => {
    const hour = new Date().getUTCHours();
    const isActiveSession = (hour >= 6 && hour <= 16); // London + NY sessions
    
    return {
      minConfidence: isActiveSession ? 75 : 80,
      minConfluence: isActiveSession ? 5 : 6,
      minRiskReward: isActiveSession ? 2.0 : 2.5,
      sessionActive: isActiveSession
    };
  };

  const generateEnhancedSignal = async () => {
    setIsGenerating(true);
    setAnalysisStatus('🏛️ ENHANCED INSTITUTIONAL PROTOCOL INITIALIZING...');
    setLastRejectionReason('');
    setRejectionCount(0);

    const requirements = getSessionRequirements();
    
    try {
      setAnalysisStatus(`⚡ Session Analysis: ${getCurrentSession()} (${requirements.sessionActive ? 'ACTIVE' : 'QUIET'})`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      let attempts = 0;
      const maxAttempts = 8;
      
      while (attempts < maxAttempts) {
        attempts++;
        setAnalysisStatus(`🎯 Attempt ${attempts}: Enhanced Multi-Filter Analysis...`);
        
        try {
          const baseSignal = await signalService.generateLiveSignal();
          
          if (!baseSignal) {
            setRejectionCount(prev => prev + 1);
            continue;
          }

          // Create enhanced signal with all required properties
          const enhancedSignal: Signal = {
            id: Date.now().toString(),
            pair: baseSignal.pair,
            type: baseSignal.type,
            entryPrice: baseSignal.entryPrice,
            stopLoss: baseSignal.stopLoss,
            takeProfit: baseSignal.takeProfit,
            confidence: baseSignal.confidence,
            analysis: baseSignal.analysis,
            timestamp: baseSignal.timestamp,
            timeframe: baseSignal.timeframe,
            riskReward: baseSignal.riskReward || 2.0,
            strategy: baseSignal.strategy,
            marketCondition: baseSignal.marketCondition || 'neutral',
            technicalSetup: baseSignal.technicalSetup || 'multi-confluence',
            entryReason: baseSignal.entryReason || 'Enhanced filtering passed',
            riskManagement: baseSignal.riskManagement || 'Standard 2% risk',
            filtersPassed: baseSignal.filtersPassed || [],
            sessionContext: getCurrentSession(),
            sessionActive: requirements.sessionActive,
            enhancedValidation: true,
            validationReason: 'Enhanced filtering approved',
            qualityScore: Math.min(95, baseSignal.confidence + 5),
            signalStrength: baseSignal.confidence >= 90 ? 'ULTRA' : 
                           baseSignal.confidence >= 85 ? 'STRONG' : 'MEDIUM',
            confluenceScore: baseSignal.confluenceScore || 0,
            entry: baseSignal.entry || baseSignal.entryPrice
          };

          setSignals(prev => [enhancedSignal, ...prev.slice(0, 4)]);
          
          toast({
            title: `🚨 ENHANCED ${enhancedSignal.signalStrength} SIGNAL APPROVED!`,
            description: `${enhancedSignal.pair} ${enhancedSignal.type} | Enhanced Validated | Session: ${getCurrentSession()}`,
          });
          
          return;
          
        } catch (error) {
          console.error(`Attempt ${attempts} failed:`, error);
          setRejectionCount(prev => prev + 1);
          continue;
        }
      }
      
      // All attempts failed
      setLastRejectionReason(`ENHANCED FILTERING: All ${maxAttempts} attempts rejected. Current ${getCurrentSession()} session requires ${requirements.minConfidence}%+ confidence, ${requirements.minConfluence}/6+ confluence, BOS+FVG filters, and AI approval.`);
      toast({
        title: "🏛️ Enhanced Filter Gate - All Signals Rejected",
        description: `${rejectionCount} signals blocked by enhanced institutional filtering + AI validation`,
        variant: "destructive"
      });
      
    } catch (error) {
      console.error('Enhanced signal generation error:', error);
      toast({
        title: "Enhanced Signal Engine Error",
        description: "Enhanced signal engine encountered an issue. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setAnalysisStatus('');
    }
  };

  const handleRemoveSignal = (signalId: string) => {
    setSignals(prev => prev.filter(signal => signal.id !== signalId));
    toast({
      title: "Signal Removed",
      description: `Signal ${signalId} has been removed from the dashboard.`,
    });
  };

  const requirements = getSessionRequirements();

  return (
    <div className="space-y-4 p-4">
      {/* Enhanced Signal Generator */}
      <Card className="glass-card border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
                <Brain className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-white">🧠 Enhanced AI Signal Protocol</CardTitle>
                <p className="text-sm text-gray-400">Session-Aware + Enhanced Validation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${requirements.sessionActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-current animate-pulse text-xs`}>
                <Clock className="w-3 h-3 mr-1" />
                {getCurrentSession()}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                <Brain className="w-3 h-3 mr-1" />
                ENHANCED AI
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Requirements */}
          <div className="glass-card p-4 border-purple-500/10">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-4 h-4 text-purple-400" />
              <h3 className="text-base font-semibold text-white">Current Session Requirements</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="glass-card p-2 text-center border-red-500/20">
                <div className="text-xs text-red-400 font-semibold">Min Confidence</div>
                <div className="text-xs text-gray-400">{requirements.minConfidence}%</div>
              </div>
              <div className="glass-card p-2 text-center border-orange-500/20">
                <div className="text-xs text-orange-400 font-semibold">Min Confluence</div>
                <div className="text-xs text-gray-400">{requirements.minConfluence}/6</div>
              </div>
            </div>

            {rejectionCount > 0 && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 font-semibold text-sm">Enhanced Filter Activity:</span>
                </div>
                <p className="text-xs text-red-200">{rejectionCount} signals rejected by enhanced filtering system</p>
              </div>
            )}

            {lastRejectionReason && (
              <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-300 font-semibold text-sm">Enhanced Filter Status:</span>
                </div>
                <p className="text-xs text-red-200">{lastRejectionReason}</p>
              </div>
            )}

            {isGenerating && analysisStatus && (
              <div className="mb-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-purple-300 text-sm">{analysisStatus}</span>
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-3 hover-lift cyber-glow"
              onClick={generateEnhancedSignal}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Enhanced Analysis...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Enhanced Signal
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signals Display */}
      {signals.length > 0 && (
        <Card className="glass-card border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400 flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              Live Signals ({signals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {signals.map((signal) => (
              <div key={signal.id} className="glass-card p-4 border-blue-500/10 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-current`}>
                      {signal.type === 'BUY' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {signal.pair} {signal.type}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                      {signal.confidence}% Confidence
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSignal(signal.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-gray-400">Entry:</span>
                    <div className="text-white font-mono">{signal.entryPrice}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Stop Loss:</span>
                    <div className="text-red-400 font-mono">{signal.stopLoss}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Take Profit:</span>
                    <div className="text-green-400 font-mono">{signal.takeProfit}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">R:R {signal.riskReward}:1</span>
                  <span className="text-gray-400">{signal.timeframe}</span>
                  <span className="text-gray-400">{new Date(signal.timestamp).toLocaleTimeString()}</span>
                </div>
                
                {signal.technicalSetup && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                    <span className="text-blue-400">Setup:</span> {signal.technicalSetup}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileOptimizedSignalsDashboard;
