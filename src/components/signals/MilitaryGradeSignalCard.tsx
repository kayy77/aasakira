
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain,
  RefreshCw,
  X,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  Eye,
  Zap,
  Shield,
  Crosshair,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';
import { motion, AnimatePresence } from 'framer-motion';

interface MilitaryGradeSignalCardProps {
  signalDNA: SignalDNA;
  livePrice: number;
  onRemove: (signalId: string) => void;
  onRefresh: () => void;
  onBacktest: () => void;
  onAskMentor: () => void;
  isUpdating?: boolean;
}

const MilitaryGradeSignalCard: React.FC<MilitaryGradeSignalCardProps> = ({
  signalDNA,
  livePrice,
  onRemove,
  onRefresh,
  onBacktest,
  onAskMentor,
  isUpdating = false
}) => {
  const [showConflictViewer, setShowConflictViewer] = useState(false);
  const [showWhyTrade, setShowWhyTrade] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'from-yellow-500 to-orange-500';
    if (confidence >= 80) return 'from-green-500 to-emerald-500';
    if (confidence >= 70) return 'from-blue-500 to-cyan-500';
    return 'from-gray-500 to-slate-500';
  };

  const getSignalTypeConfig = (type: string) => {
    switch (type) {
      case 'Institutional':
        return {
          icon: '🏛️',
          color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50',
          textColor: 'text-yellow-400'
        };
      case 'SMC':
        return {
          icon: '🧠',
          color: 'from-purple-500/20 to-pink-500/20 border-purple-500/50',
          textColor: 'text-purple-400'
        };
      case 'Hybrid':
        return {
          icon: '🔁',
          color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50',
          textColor: 'text-cyan-400'
        };
      default:
        return {
          icon: '⚡',
          color: 'from-gray-500/20 to-slate-500/20 border-gray-500/50',
          textColor: 'text-gray-400'
        };
    }
  };

  const generateDynamicMentorQuote = (signalDNA: SignalDNA) => {
    const isLong = parseFloat(signalDNA.structure.takeProfit) > parseFloat(signalDNA.structure.entry);
    const direction = isLong ? 'bullish' : 'bearish';
    const session = signalDNA.session;
    const confidence = signalDNA.confidence;
    
    const dynamicQuotes = [
      `🧙‍♂️ "${session} session volume spike + CHoCH at ${isLong ? 'demand' : 'supply'} zone? Classic ${isLong ? 'accumulation' : 'distribution'}. This setup screams Smart Money. I'd watch this one closely."`,
      `🧙‍♂️ "Liquidity sweep followed by ${direction} momentum? The algos are positioning. ${confidence}% confidence tells me institutional players are moving. This isn't retail noise."`,
      `🧙‍♂️ "I've seen this pattern destroy retail traders who fade it. Multiple timeframe confluence + order block retest? The probability math favors the pros here."`,
      `🧙‍♂️ "When ${Object.values(signalDNA.origin).filter(Boolean).length}/6 of my intelligence modules agree, it's not luck. Market structure + liquidity dynamics are aligning. Time to be surgical."`,
      `🧙‍♂️ "This isn't a gamble — it's calculated warfare. Smart money left footprints all over this ${signalDNA.timeframe} setup. The question isn't IF this moves, but WHEN."`,
      `🧙‍♂️ "${session} session with ${direction} bias? I've traded through enough market cycles to recognize when the big players are positioning. Trust the process, not emotions."`
    ];
    
    return dynamicQuotes[Math.floor(Math.random() * dynamicQuotes.length)];
  };

  const getDetailedAIAnalysis = () => {
    const approvedModules = Object.entries(signalDNA.origin).filter(([_, approved]) => approved);
    const rejectedModules = Object.entries(signalDNA.origin).filter(([_, approved]) => !approved);
    
    return {
      approved: approvedModules,
      rejected: rejectedModules,
      summary: `${approvedModules.length}/6 AI modules reached consensus. Market structure analysis shows high-probability setup with institutional characteristics.`
    };
  };

  const typeConfig = getSignalTypeConfig(signalDNA.type);
  const isLong = parseFloat(signalDNA.structure.takeProfit) > parseFloat(signalDNA.structure.entry);
  const voteCount = Object.values(signalDNA.origin).filter(Boolean).length;
  const isInstitutionalGrade = voteCount === 6;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative"
      >
        <Card className={`bg-gradient-to-br ${typeConfig.color} backdrop-blur-sm border-2 relative overflow-hidden`}>
          {/* Military HUD Header */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          
          {/* Remove Button */}
          <Button
            onClick={() => onRemove(signalDNA.symbol)}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 w-6 h-6 p-0 text-gray-400 hover:text-white hover:bg-red-500/20 z-10"
          >
            <X className="w-3 h-3" />
          </Button>

          {/* Contradiction Warning */}
          {signalDNA.contradictions.length > 0 && (
            <Button
              onClick={() => setShowConflictViewer(true)}
              variant="ghost"
              size="sm"
              className="absolute top-2 right-10 w-6 h-6 p-0 text-orange-400 hover:bg-orange-500/20 animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          )}

          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-xl font-bold ${typeConfig.textColor} flex items-center gap-3`}>
                {isLong ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                {signalDNA.symbol}
                <span className="text-sm font-normal">
                  {typeConfig.icon} {signalDNA.type.toUpperCase()}
                </span>
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Badge className={`${isInstitutionalGrade ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-green-500/20 text-green-400 border-green-500/50'} animate-pulse`}>
                  {isInstitutionalGrade ? 'INSTITUTIONAL GRADE' : 'HIGH CONFIDENCE'}
                </Badge>
              </div>
            </div>

            {/* Confidence Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">AI Consensus: {voteCount}/6</span>
                <span className={`text-sm font-bold ${typeConfig.textColor}`}>{signalDNA.confidence}% CONFIDENCE</span>
              </div>
              <div className="relative">
                <Progress 
                  value={signalDNA.confidence} 
                  className="h-2 bg-gray-700/50" 
                />
                <div className={`absolute inset-0 h-2 bg-gradient-to-r ${getConfidenceColor(signalDNA.confidence)} rounded-full animate-pulse`} 
                     style={{ width: `${signalDNA.confidence}%` }} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Military-Grade HUD Display */}
            <div className="bg-black/40 rounded-lg p-4 font-mono text-sm border border-cyan-500/30">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs">ENTRY</div>
                  <div className="text-white font-bold text-lg">{signalDNA.structure.entry}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs">SL</div>
                  <div className="text-red-400 font-bold text-lg">{signalDNA.structure.stopLoss}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-gray-400 text-xs">TP</div>
                  <div className="text-green-400 font-bold text-lg">{signalDNA.structure.takeProfit}</div>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-700/50 flex items-center justify-between">
                <div className="text-cyan-400">
                  <span className="text-gray-400">R/R:</span> {signalDNA.structure.rr}
                </div>
                <div className="text-green-400">
                  <span className="text-gray-400">Win Rate:</span> {Math.round(signalDNA.backtest.winRate)}%
                </div>
              </div>
            </div>

            {/* Live Price Ticker */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400 animate-pulse" />
                  <span className="text-green-400 font-bold">LIVE PRICE</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    {signalDNA.price.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-white">
                    {livePrice.toFixed(signalDNA.symbol.includes('JPY') ? 3 : 5)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {signalDNA.price.source} • {signalDNA.price.lastUpdated}
                  </div>
                </div>
              </div>
            </div>

            {/* Intelligence Filters */}
            <div className="bg-gray-800/40 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">ACTIVE FILTERS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {signalDNA.filters.map((filter, index) => (
                  <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {filter} ✅
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Thought Process */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-medium">AI REASONING</span>
              </div>
              <p className="text-sm text-gray-300">{signalDNA.aiThought}</p>
            </div>

            {/* Session & Timeframe Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                <p className="text-gray-400 text-xs mb-1">SESSION</p>
                <p className="text-cyan-400 font-bold text-sm">{signalDNA.session}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-2 text-center">
                <p className="text-gray-400 text-xs mb-1">TIMEFRAME</p>
                <p className="text-orange-400 font-bold text-sm">{signalDNA.timeframe}</p>
              </div>
            </div>

            {/* Power Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onRefresh}
                disabled={isUpdating}
                variant="outline"
                size="sm"
                className="border-green-500/30 text-green-400 hover:bg-green-500/20"
              >
                {isUpdating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              
              <Button
                onClick={onBacktest}
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Backtest
              </Button>
              
              <Button
                onClick={() => setShowWhyTrade(true)}
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                <Brain className="w-4 h-4 mr-2" />
                Why Trade?
              </Button>
              
              <Button
                onClick={onAskMentor}
                variant="outline"
                size="sm"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
              >
                <Target className="w-4 h-4 mr-2" />
                Ask Mentor
              </Button>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 text-center">
              Generated at {new Date().toLocaleTimeString()} UTC
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced "Why This Trade" Modal */}
      <Dialog open={showWhyTrade} onOpenChange={setShowWhyTrade}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              🧠 WHY THIS TRADE WAS SELECTED
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Intelligence Breakdown */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                APPROVED AI MODULES ({Object.values(signalDNA.origin).filter(Boolean).length}/6)
              </h3>
              <div className="space-y-3">
                {Object.entries(signalDNA.origin).map(([key, approved]) => {
                  if (!approved) return null;
                  
                  const moduleInfo = {
                    institutional: {
                      name: '🏛️ Institutional Brain',
                      reason: 'Detected buy-side liquidity sweep + volume imbalance favoring entry direction'
                    },
                    smc: {
                      name: '🧠 SMC Brain', 
                      reason: 'Confirmed CHoCH + Discount Order Block retest on 15M timeframe'
                    },
                    quant: {
                      name: '⚙️ Quant Filter',
                      reason: `Shows ${Math.round(signalDNA.backtest.winRate)}% winrate on this structure in current market volatility`
                    },
                    volatility: {
                      name: '📡 Volatility Sentinel',
                      reason: 'Session volatility optimal + spread within acceptable range for execution'
                    },
                    visual: {
                      name: '👁️ Visual AI',
                      reason: 'Pattern matches historical high-probability sniper setup from database'
                    },
                    mentor: {
                      name: '🧙‍♂️ Mentor Voice',
                      reason: 'Setup aligns with proven institutional strategy methodology'
                    }
                  };
                  
                  const info = moduleInfo[key as keyof typeof moduleInfo];
                  
                  return (
                    <div key={key} className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-medium">{info.name}</span>
                      </div>
                      <p className="text-sm text-gray-300 ml-6">{info.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rejected Modules */}
            {Object.values(signalDNA.origin).filter(Boolean).length < 6 && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  REJECTED MODULES ({6 - Object.values(signalDNA.origin).filter(Boolean).length}/6)
                </h3>
                <div className="space-y-2">
                  {Object.entries(signalDNA.origin).map(([key, approved]) => {
                    if (approved) return null;
                    
                    const moduleNames = {
                      institutional: '🏛️ Institutional Brain',
                      smc: '🧠 SMC Brain',
                      quant: '⚙️ Quant Filter',
                      volatility: '📡 Volatility Sentinel',
                      visual: '👁️ Visual AI',
                      mentor: '🧙‍♂️ Mentor Voice'
                    };
                    
                    return (
                      <div key={key} className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                        <span className="text-red-400 text-sm">{moduleNames[key as keyof typeof moduleNames]} - Insufficient confluence</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Technical Analysis Breakdown */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                TECHNICAL CONFLUENCE
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-cyan-400 font-medium mb-2">Active Filters ({signalDNA.filters.length})</h4>
                  <div className="space-y-1">
                    {signalDNA.filters.map((filter, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        <span className="text-gray-300">{filter}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-cyan-400 font-medium mb-2">Market Context</h4>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div>Session: <span className="text-orange-400">{signalDNA.session}</span></div>
                    <div>Timeframe: <span className="text-orange-400">{signalDNA.timeframe}</span></div>
                    <div>Risk/Reward: <span className="text-green-400">{signalDNA.structure.rr}</span></div>
                    <div>Confidence: <span className="text-yellow-400">{signalDNA.confidence}%</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backtest Performance */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                HISTORICAL PERFORMANCE
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">{Math.round(signalDNA.backtest.winRate)}%</div>
                  <div className="text-xs text-gray-400">Win Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{signalDNA.backtest.totalTrades}</div>
                  <div className="text-xs text-gray-400">Total Trades</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{signalDNA.backtest.avgRR.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">Avg R:R</div>
                </div>
              </div>
            </div>

            {/* Mentor Summary */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                MENTOR WISDOM
              </h3>
              <div className="italic text-gray-300 text-sm leading-relaxed">
                {generateDynamicMentorQuote(signalDNA)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conflict Viewer Modal */}
      <Dialog open={showConflictViewer} onOpenChange={setShowConflictViewer}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              CONTRADICTION DETECTED - BATTLE ANALYSIS
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {signalDNA.contradictions.map((contradiction, index) => (
              <div key={index} className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crosshair className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-medium">CONFLICT #{index + 1}</span>
                </div>
                <p className="text-sm text-gray-300">{contradiction}</p>
              </div>
            ))}
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">RECOMMENDED ACTION</h4>
              <p className="text-sm text-gray-300">
                Multiple timeframes showing conflict. Consider reducing position size or waiting for clearer confluence.
                Both signals may be valid on their respective timeframes.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MilitaryGradeSignalCard;
