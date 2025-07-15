
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

  const isLong = parseFloat(signalDNA.structure.takeProfit) > parseFloat(signalDNA.structure.entry);
  const voteCount = Object.values(signalDNA.origin).filter(Boolean).length;
  const confidenceLevel = signalDNA.confidence >= 90 ? 'HIGH' : signalDNA.confidence >= 75 ? 'MEDIUM' : 'LOW';

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
        className="relative"
      >
        <Card className="bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 relative overflow-hidden backdrop-blur-sm">
          {/* Subtle glow accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-pink-500/5 to-transparent rounded-full blur-xl" />
          
          {/* Remove Button */}
          <Button
            onClick={() => onRemove(signalDNA.symbol)}
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 w-6 h-6 p-0 text-gray-500 hover:text-white hover:bg-red-500/10 z-10"
          >
            <X className="w-3 h-3" />
          </Button>

          {/* Contradiction Indicator */}
          {signalDNA.contradictions.length > 0 && (
            <Button
              onClick={() => setShowConflictingOutlook(true)}
              variant="ghost"
              size="sm"
              className="absolute top-3 right-11 w-6 h-6 p-0 text-orange-400 hover:bg-orange-500/10"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          )}

          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-medium text-white flex items-center gap-3">
                {isLong ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                {signalDNA.symbol}
                <span className="text-sm font-normal text-gray-400">
                  {signalDNA.type}
                </span>
              </CardTitle>
              
              <Badge className={`${
                confidenceLevel === 'HIGH' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                confidenceLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-gray-500/20 text-gray-400 border-gray-500/30'
              } px-3 py-1`}>
                {confidenceLevel}
              </Badge>
            </div>

            {/* Confidence Visualization */}
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Confluence: {voteCount}/6</span>
                <span className="text-sm text-gray-300">Confidence: {signalDNA.confidence}%</span>
              </div>
              <Progress value={signalDNA.confidence} className="h-1.5 bg-gray-800" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Trading Levels */}
            <div className="bg-gray-900/50 border border-gray-700 rounded p-4">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="text-gray-400 mb-1 text-xs">ENTRY</div>
                  <div className="text-white font-mono">{signalDNA.structure.entry}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1 text-xs">STOP</div>
                  <div className="text-red-400 font-mono">{signalDNA.structure.stopLoss}</div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1 text-xs">TARGET</div>
                  <div className="text-green-400 font-mono">{signalDNA.structure.takeProfit}</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs">
                <span className="text-gray-400">R:R {signalDNA.structure.rr}</span>
                <span className="text-gray-400">Win Rate: {Math.round(signalDNA.backtest.winRate)}%</span>
              </div>
            </div>

            {/* Live Price Display */}
            <div className="bg-green-500/5 border border-green-500/20 rounded p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Live Price</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono text-white">
                    {livePrice.toFixed(signalDNA.symbol.includes('JPY') ? 3 : 5)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {signalDNA.price.source} • {signalDNA.price.lastUpdated}
                  </div>
                </div>
              </div>
            </div>

            {/* Session & Timeframe */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/30 border border-gray-700 rounded p-2 text-center">
                <p className="text-gray-400 text-xs mb-1">Session</p>
                <p className="text-white text-sm">{signalDNA.session}</p>
              </div>
              <div className="bg-gray-800/30 border border-gray-700 rounded p-2 text-center">
                <p className="text-gray-400 text-xs mb-1">Timeframe</p>
                <p className="text-white text-sm">{signalDNA.timeframe}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onRefresh}
                disabled={isUpdating}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-gray-900/50"
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
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-gray-900/50"
              >
                <BarChart3 className="w-3 h-3 mr-2" />
                Backtest
              </Button>
              
              <Button
                onClick={() => setShowStrategicBreakdown(true)}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-gray-900/50"
              >
                <Target className="w-3 h-3 mr-2" />
                Strategic Breakdown
              </Button>
              
              <Button
                onClick={handleAskMentor}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-gray-900/50"
              >
                <Eye className="w-3 h-3 mr-2" />
                Assessment
              </Button>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
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
