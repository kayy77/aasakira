
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Shield, Clock, RefreshCw } from 'lucide-react';
import { ConsensusSignalResult } from '@/services/enhancedMultiAIConsensus';

interface EnhancedConsensusDisplayProps {
  consensusResult: ConsensusSignalResult | null;
  isScanning: boolean;
  scanCount: number;
  lastScanTime: string;
  onRefresh: () => void;
}

const EnhancedConsensusDisplay: React.FC<EnhancedConsensusDisplayProps> = ({
  consensusResult,
  isScanning,
  scanCount,
  lastScanTime,
  onRefresh
}) => {
  const getStatusColor = () => {
    if (!consensusResult) return 'border-gray-600 bg-gray-900/50';
    if (consensusResult.signalStrength === 'ELITE') return 'border-green-500 bg-green-500/10';
    if (consensusResult.signalStrength === 'STRONG') return 'border-blue-500 bg-blue-500/10';
    if (consensusResult.signalStrength === 'WEAK') return 'border-yellow-500 bg-yellow-500/10';
    return 'border-red-500 bg-red-500/10';
  };

  const getStatusIcon = () => {
    if (!consensusResult) return <Clock className="w-5 h-5 text-gray-400" />;
    if (consensusResult.hasConsensus) return <Shield className="w-5 h-5 text-green-400" />;
    return <RefreshCw className={`w-5 h-5 text-yellow-400 ${isScanning ? 'animate-spin' : ''}`} />;
  };

  const getStatusText = () => {
    if (!consensusResult) return 'Initializing AI Consensus...';
    if (consensusResult.hasConsensus) {
      return `${consensusResult.signalStrength} Signal Detected`;
    }
    return 'No High-Conviction Signal Yet — Still Scanning...';
  };

  const getStatusBadge = () => {
    if (!consensusResult) return <Badge variant="secondary">Pending</Badge>;
    if (consensusResult.hasConsensus) {
      const variant = consensusResult.signalStrength === 'ELITE' ? 'default' : 'secondary';
      return <Badge variant={variant}>{consensusResult.signalStrength}</Badge>;
    }
    return <Badge variant="destructive">No Consensus</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className={`${getStatusColor()} border-2`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-lg font-semibold text-white">
                AI Consensus Engine
              </CardTitle>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">{getStatusText()}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isScanning}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Scanning Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Scans:</span>
              <span className="text-white font-mono">{scanCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Scan:</span>
              <span className="text-white font-mono">{lastScanTime || 'N/A'}</span>
            </div>
          </div>

          {/* Consensus Details */}
          {consensusResult && (
            <div className="border-t border-gray-700 pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">AI Agreement:</span>
                <span className="text-white font-bold">
                  {consensusResult.consensusCount}/5 Models
                </span>
              </div>
              
              {consensusResult.hasConsensus && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg Confidence:</span>
                    <span className="text-green-400 font-bold">
                      {Math.round(consensusResult.avgConfidence)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Expected Value:</span>
                    <span className="text-blue-400 font-bold">
                      +{consensusResult.avgExpectedValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Risk:Reward:</span>
                    <span className="text-purple-400 font-bold">
                      {consensusResult.avgRiskReward.toFixed(1)}:1
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signal Details Card - Only show if we have consensus */}
      {consensusResult?.hasConsensus && consensusResult.finalSignal && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <CardTitle className="text-lg text-green-400">
                High-Conviction Signal
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Direction</div>
                <div className={`text-lg font-bold ${
                  consensusResult.finalSignal.direction === 'BUY' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {consensusResult.finalSignal.direction}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Entry</div>
                <div className="text-lg font-bold text-white font-mono">
                  {consensusResult.finalSignal.entry}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Stop Loss</div>
                <div className="text-sm font-mono text-red-400">
                  {consensusResult.finalSignal.stopLoss}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Take Profit</div>
                <div className="text-sm font-mono text-green-400">
                  {consensusResult.finalSignal.takeProfit}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3">
              <div className="text-sm text-gray-400 mb-2">Strategies:</div>
              <div className="flex flex-wrap gap-1">
                {consensusResult.finalSignal.strategies.map((strategy, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {strategy}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3">
              <div className="text-sm text-gray-400 mb-2">AI Analysis:</div>
              <div className="text-sm text-gray-300 italic">
                "{consensusResult.finalSignal.analysis}"
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Analysis Shimmer - Show when scanning without consensus */}
      {isScanning && (!consensusResult || !consensusResult.hasConsensus) && (
        <Card className="border-gray-600 bg-gray-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-700/30 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-400">
              Pending Analysis... {isScanning ? 'Scanning for high-conviction signals...' : ''}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedConsensusDisplay;
