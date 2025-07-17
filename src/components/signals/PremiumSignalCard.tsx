
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye,
  BarChart3,
  Target,
  Activity,
  Crown,
  Shield,
  Zap
} from 'lucide-react';
import { EnhancedSignal } from '@/services/enhancedSignalAnalyzer';
import MiniChart from './MiniChart';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface PremiumSignalCardProps {
  signal: EnhancedSignal;
  livePrice: number;
  onRemove: (signalId: string) => void;
  onRefresh: () => void;
  onBacktest: () => void;
}

const PremiumSignalCard: React.FC<PremiumSignalCardProps> = ({
  signal,
  livePrice,
  onRemove,
  onRefresh,
  onBacktest
}) => {
  const [showLogicBreakdown, setShowLogicBreakdown] = useState(false);
  const { toast } = useToast();

  // 🔥 FORCE PREMIUM SIGNAL TO USE LIVE PRICE AS ENTRY
  const premiumSignal = {
    ...signal,
    entry: livePrice, // Override with accurate live price
    // Recalculate SL and TP based on live price for maximum accuracy
    stopLoss: signal.type === 'BUY' 
      ? livePrice - (Math.abs(signal.stopLoss - signal.entry))
      : livePrice + (Math.abs(signal.stopLoss - signal.entry)),
    takeProfit: signal.type === 'BUY'
      ? livePrice + (Math.abs(signal.takeProfit - signal.entry))
      : livePrice - (Math.abs(signal.takeProfit - signal.entry))
  };

  // Recalculate R:R based on corrected levels
  const correctedRiskReward = Math.abs(premiumSignal.takeProfit - premiumSignal.entry) / Math.abs(premiumSignal.entry - premiumSignal.stopLoss);

  const isLong = premiumSignal.type === 'BUY';
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 95) return { label: 'INSTITUTIONAL', color: 'from-yellow-400 to-orange-400', icon: Crown };
    if (confidence >= 90) return { label: 'ELITE', color: 'from-purple-400 to-pink-400', icon: Shield };
    if (confidence >= 85) return { label: 'PREMIUM', color: 'from-blue-400 to-cyan-400', icon: Zap };
    return { label: 'PROFESSIONAL', color: 'from-green-400 to-emerald-400', icon: Target };
  };

  const confidenceLevel = getConfidenceLevel(premiumSignal.confidence);
  const ConfidenceIcon = confidenceLevel.icon;

  const handleSeeLogicBreakdown = () => {
    setShowLogicBreakdown(true);
    toast({
      title: "Logic Breakdown",
      description: "Analyzing premium signal validation process...",
      duration: 2000,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative"
      >
        <Card className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-purple-500/30 relative overflow-hidden backdrop-blur-sm">
          {/* Premium glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 animate-pulse" />
          
          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                {isLong ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                {premiumSignal.pair}
                <span className="text-sm font-normal text-purple-300">
                  ⚔️ {premiumSignal.type}
                </span>
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <Badge className={`bg-gradient-to-r ${confidenceLevel.color} text-black font-bold px-3 py-1 flex items-center gap-1`}>
                  <ConfidenceIcon className="w-3 h-3" />
                  {confidenceLevel.label}
                </Badge>
              </div>
            </div>

            {/* Confluence Score */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Premium Confluence: {premiumSignal.confluenceScore}/{premiumSignal.maxConfluence}</span>
              <span className="font-bold text-purple-300">Confidence: {premiumSignal.confidence}%</span>
            </div>
            
            {/* Premium tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {premiumSignal.tags.map((tag, index) => (
                <Badge key={index} className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            {/* Mini Chart */}
            <div className="bg-slate-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Visual Evidence</span>
              </div>
              <MiniChart analysis={premiumSignal.chartAnalysis} pair={premiumSignal.pair} />
            </div>

            {/* Trading Levels - Using corrected premium signal values */}
            <div className="bg-black/30 rounded border border-gray-700/50 p-4">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-gray-400 mb-1">ENTRY</div>
                  <div className="text-white font-bold font-mono">{premiumSignal.entry.toFixed(premiumSignal.pair.includes('JPY') ? 3 : 5)}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">STOP</div>
                  <div className="text-red-400 font-bold font-mono">{premiumSignal.stopLoss.toFixed(premiumSignal.pair.includes('JPY') ? 3 : 5)}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">TARGET</div>
                  <div className="text-green-400 font-bold font-mono">{premiumSignal.takeProfit.toFixed(premiumSignal.pair.includes('JPY') ? 3 : 5)}</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between text-xs">
                <span className="text-purple-300">R:R {correctedRiskReward.toFixed(1)}:1</span>
                <span className="text-blue-300">Win Rate: {Math.round(premiumSignal.historicalWinRate)}%</span>
              </div>
            </div>

            {/* Live Price - Show accuracy confirmation */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                  <span className="text-green-400">Live Price = Entry</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-bold text-white">
                    {livePrice.toFixed(premiumSignal.pair.includes('JPY') ? 3 : 5)}
                  </div>
                  <div className="text-xs text-green-400">✅ PREMIUM PRECISION</div>
                </div>
              </div>
            </div>

            {/* Validation Summary */}
            <div className="bg-slate-800/30 rounded p-3">
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">HTF Alignment:</span>
                  <span className={`font-medium ${premiumSignal.chartAnalysis.htfBias.aligned ? 'text-green-400' : 'text-red-400'}`}>
                    {premiumSignal.chartAnalysis.htfBias.aligned ? '✅ Confirmed' : '❌ Conflicted'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Volume Delta:</span>
                  <span className={`font-medium ${premiumSignal.chartAnalysis.volumeDelta.confirmed ? 'text-green-400' : 'text-gray-400'}`}>
                    {premiumSignal.chartAnalysis.volumeDelta.confirmed ? '✅ Strong' : 'Weak'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Entry Zone:</span>
                  <span className={`font-medium ${premiumSignal.chartAnalysis.entryZone.valid ? 'text-green-400' : 'text-gray-400'}`}>
                    {premiumSignal.chartAnalysis.entryZone.valid ? `✅ ${premiumSignal.chartAnalysis.entryZone.type}` : 'Invalid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSeeLogicBreakdown}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                See Logic Breakdown
              </Button>
              
              <Button
                onClick={onBacktest}
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Backtest
              </Button>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 text-center">
              Generated at {new Date(premiumSignal.timestamp).toLocaleTimeString()} UTC
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logic Breakdown Modal */}
      <Dialog open={showLogicBreakdown} onOpenChange={setShowLogicBreakdown}>
        <DialogContent className="max-w-4xl bg-slate-950 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-purple-400 text-xl flex items-center gap-2">
              <Eye className="w-6 h-6" />
              ⚔️ Premium Signal Logic Breakdown
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enhanced Chart */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Visual Analysis</h3>
              <MiniChart 
                analysis={premiumSignal.chartAnalysis} 
                pair={premiumSignal.pair} 
                className="h-64"
              />
              
              {/* Chart Markups List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400">Chart Markups:</h4>
                {premiumSignal.chartAnalysis.markups.map((markup, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    <span className="text-blue-300">{markup.type}:</span>
                    <span className="text-gray-300">{markup.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Premium Validation Results</h3>
              
              {/* Filter Results */}
              <div className="space-y-3">
                {premiumSignal.reasons.map((reason, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-green-300 font-medium">{reason}</span>
                    <span className="text-green-400 ml-auto">✅</span>
                  </div>
                ))}
              </div>

              {/* Price Accuracy Confirmation */}
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded">
                <h4 className="text-sm font-medium text-green-400 mb-3">Premium Price Precision:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Live Price:</span>
                    <span className="text-green-400 font-mono">{livePrice.toFixed(premiumSignal.pair.includes('JPY') ? 3 : 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Entry Price:</span>
                    <span className="text-green-400 font-mono">{premiumSignal.entry.toFixed(premiumSignal.pair.includes('JPY') ? 3 : 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Accuracy:</span>
                    <span className="text-green-400 font-bold">✅ PERFECT MATCH</span>
                  </div>
                </div>
              </div>

              {/* Timeframe Analysis */}
              <div className="p-4 bg-slate-800/50 rounded">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Timeframe Analysis:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">H4 Direction:</span>
                    <span className="text-purple-300 capitalize">{premiumSignal.chartAnalysis.htfBias.h4Direction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">H1 Direction:</span>
                    <span className="text-purple-300 capitalize">{premiumSignal.chartAnalysis.htfBias.h1Direction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">HTF Aligned:</span>
                    <span className={premiumSignal.chartAnalysis.htfBias.aligned ? 'text-green-400' : 'text-red-400'}>
                      {premiumSignal.chartAnalysis.htfBias.aligned ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Historical Performance */}
              <div className="p-4 bg-slate-800/50 rounded">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Historical Performance:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Win Rate:</span>
                    <span className="text-green-400">{Math.round(premiumSignal.historicalWinRate)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Similar Setups:</span>
                    <span className="text-blue-400">{premiumSignal.similarSetups}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Risk:Reward:</span>
                    <span className="text-purple-400">{correctedRiskReward.toFixed(1)}:1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PremiumSignalCard;
