
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  X,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  Eye,
  Clock
} from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';
import { motion } from 'framer-motion';
import StrategicBreakdownModal from './StrategicBreakdownModal';
import ConflictingOutlookModal from './ConflictingOutlookModal';
import { generateMentorResponse } from './AskMentorEngine';
import { useToast } from '@/hooks/use-toast';

interface SignalCardV2Props {
  signalDNA: SignalDNA;
  livePrice: number;
  onRemove: (signalId: string) => void;
  onRefresh: () => void;
  onBacktest: () => void;
  isUpdating?: boolean;
}

const SignalCardV2: React.FC<SignalCardV2Props> = ({
  signalDNA,
  livePrice,
  onRemove,
  onRefresh,
  onBacktest,
  isUpdating = false
}) => {
  const [showStrategicBreakdown, setShowStrategicBreakdown] = useState(false);
  const [showConflictingOutlook, setShowConflictingOutlook] = useState(false);
  const { toast } = useToast();

  const getStrategySymbol = (type: string) => {
    switch (type) {
      case 'Institutional': return '⛩️';
      case 'SMC': return '🥋';
      case 'Hybrid': return '⚡';
      default: return '🎯';
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 90) return { label: 'ELITE', color: 'from-yellow-400 to-orange-400' };
    if (confidence >= 80) return { label: 'PROFESSIONAL', color: 'from-pink-400 to-red-400' };
    if (confidence >= 70) return { label: 'TACTICAL', color: 'from-blue-400 to-cyan-400' };
    return { label: 'DEVELOPING', color: 'from-gray-400 to-slate-400' };
  };

  const isLong = parseFloat(signalDNA.structure.takeProfit) > parseFloat(signalDNA.structure.entry);
  const voteCount = Object.values(signalDNA.origin).filter(Boolean).length;
  const confidenceLevel = getConfidenceLevel(signalDNA.confidence);
  const isInstitutionalGrade = voteCount === 6;

  const handleAskMentor = () => {
    const response = generateMentorResponse(signalDNA);
    toast({
      title: "Strategic Assessment",
      description: response,
      duration: 8000,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative animate-section-load"
      >
        <Card className="bg-gradient-to-br from-gray-950 to-gray-900 border border-pink-500/20 relative overflow-hidden backdrop-blur-sm glow-soft hover-lift">
          {/* Subtle Cherry Blossom Accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-2xl" />
          
          {/* Remove Button */}
          <Button
            onClick={() => onRemove(signalDNA.symbol)}
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 w-6 h-6 p-0 text-gray-400 hover:text-white hover:bg-red-500/20 z-10"
          >
            <X className="w-3 h-3" />
          </Button>

          {/* Contradiction Indicator */}
          {signalDNA.contradictions.length > 0 && (
            <Button
              onClick={() => setShowConflictingOutlook(true)}
              variant="ghost"
              size="sm"
              className="absolute top-3 right-11 w-6 h-6 p-0 text-orange-400 hover:bg-orange-500/20 animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          )}

          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-zen-maru text-white flex items-center gap-3">
                {isLong ? (
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                {signalDNA.symbol}
                <span className="text-sm font-normal text-pink-300 font-noto">
                  {getStrategySymbol(signalDNA.type)} {signalDNA.type}
                </span>
              </CardTitle>
              
              <Badge className={`bg-gradient-to-r ${confidenceLevel.color} text-black font-bold px-3 py-1 glow-soft`}>
                {confidenceLevel.label}
              </Badge>
            </div>

            {/* Confidence Visualization */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400 font-zen-maru">Confluence Score: {voteCount}/6</span>
                <span className="text-sm font-bold text-pink-300 font-noto">Confidence Level: {signalDNA.confidence}%</span>
              </div>
              <div className="relative">
                <Progress value={signalDNA.confidence} className="h-1.5 bg-gray-800" />
                <div 
                  className={`absolute inset-0 h-1.5 bg-gradient-to-r ${confidenceLevel.color} rounded-full transition-all duration-1000 glow-soft`}
                  style={{ width: `${signalDNA.confidence}%` }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            {/* Trading Levels */}
            <div className="bg-black/30 rounded border border-gray-700/50 p-4 font-mono glow-soft">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-gray-400 mb-1 font-zen-maru">ENTRY</div>
                  <div className="text-white font-bold">{signalDNA.structure.entry}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1 font-zen-maru">STOP</div>
                  <div className="text-red-400 font-bold">{signalDNA.structure.stopLoss}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1 font-zen-maru">TARGET</div>
                  <div className="text-green-400 font-bold">{signalDNA.structure.takeProfit}</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between text-xs font-noto">
                <span className="text-pink-300">R:R {signalDNA.structure.rr}</span>
                <span className="text-blue-300">Win Rate: {Math.round(signalDNA.backtest.winRate)}%</span>
              </div>
            </div>

            {/* Live Price Display */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded p-3 glow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-green-400 font-zen-maru">Live Price</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-white">
                    {livePrice.toFixed(signalDNA.symbol.includes('JPY') ? 3 : 5)}
                  </div>
                  <div className="text-xs text-gray-400 font-noto">
                    {signalDNA.price.source} • {signalDNA.price.lastUpdated}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            <div className="bg-gray-800/30 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-zen-maru text-sm">Technical Confluence</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {signalDNA.filters.slice(0, 4).map((filter, index) => (
                  <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs font-noto">
                    {filter}
                  </Badge>
                ))}
                {signalDNA.filters.length > 4 && (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs font-noto">
                    +{signalDNA.filters.length - 4} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Session & Timeframe */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700/20 rounded p-2 text-center">
                <p className="text-gray-400 text-xs mb-1 font-zen-maru">Session</p>
                <p className="text-pink-300 font-bold text-sm font-noto">{signalDNA.session}</p>
              </div>
              <div className="bg-gray-700/20 rounded p-2 text-center">
                <p className="text-gray-400 text-xs mb-1 font-zen-maru">Timeframe</p>
                <p className="text-orange-300 font-bold text-sm font-noto">{signalDNA.timeframe}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onRefresh}
                disabled={isUpdating}
                variant="outline"
                size="sm"
                className="border-pink-500/30 text-pink-400 hover:bg-pink-500/20 font-zen-maru glow-soft"
              >
                {isUpdating ? (
                  <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-2" />
                )}
                Refresh
              </Button>
              
              <Button
                onClick={onBacktest}
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 font-zen-maru glow-soft"
              >
                <BarChart3 className="w-3 h-3 mr-2" />
                Backtest
              </Button>
              
              <Button
                onClick={() => setShowStrategicBreakdown(true)}
                variant="outline"
                size="sm"
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 font-zen-maru glow-soft"
              >
                <Target className="w-3 h-3 mr-2" />
                Strategic Breakdown
              </Button>
              
              <Button
                onClick={handleAskMentor}
                variant="outline"
                size="sm"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 font-zen-maru glow-soft"
              >
                <Eye className="w-3 h-3 mr-2" />
                Assessment
              </Button>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 text-center font-zen-maru flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Generated at {new Date().toLocaleTimeString()} UTC
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals */}
      <StrategicBreakdownModal
        open={showStrategicBreakdown}
        onOpenChange={setShowStrategicBreakdown}
        signalDNA={signalDNA}
      />

      <ConflictingOutlookModal
        open={showConflictingOutlook}
        onOpenChange={setShowConflictingOutlook}
        contradictions={signalDNA.contradictions}
        symbol={signalDNA.symbol}
      />
    </>
  );
};

export default SignalCardV2;
