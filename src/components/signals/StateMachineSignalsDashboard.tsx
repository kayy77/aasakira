import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStateMachineEngine } from '@/hooks/useStateMachineEngine';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Play, Square, RotateCcw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Timer, Target, Shield, Zap } from 'lucide-react';

const StateMachineSignalsDashboard = () => {
  const {
    currentSignal,
    signalHistory,
    isScanning,
    scanCount,
    lastScanTime,
    stats,
    dailyStats,
    generateSignal,
    startAutoScanning,
    stopScanning,
    clearHistory,
    resetDailyStats,
    totalScans,
    successRate,
    avgEvidenceScore,
    shadowModePassRate,
    priceIntegrityRate,
    getApprovedSignals,
    getEliteSignals,
    getProfessionalSignals
  } = useStateMachineEngine();

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'approved' | 'elite' | 'professional'>('all');

  useEffect(() => {
    if (currentSignal) {
      if (currentSignal.status === 'APPROVED') {
        toast({
          title: "🎯 Signal Approved",
          description: `${currentSignal.symbol} ${currentSignal.direction} | Evidence: ${currentSignal.evidenceScore}/100 | RR: ${currentSignal.riskReward}:1`,
          duration: 5000,
        });
      } else {
        toast({
          title: "❌ Signal Rejected",
          description: `${currentSignal.rejectionReasons[0]}`,
          variant: "destructive",
          duration: 3000,
        });
      }
    }
  }, [currentSignal, toast]);

  const handleStartScanning = () => {
    startAutoScanning(60); // Scan every 60 seconds
    toast({
      title: "🚀 State Machine Active",
      description: "ICT/SMC signal engine is now scanning markets",
      duration: 3000,
    });
  };

  const handleStopScanning = () => {
    stopScanning();
    toast({
      title: "⏸️ Scanning Stopped", 
      description: "Signal engine has been paused",
      duration: 2000,
    });
  };

  const getFilteredSignals = () => {
    switch (selectedFilter) {
      case 'approved':
        return getApprovedSignals();
      case 'elite':
        return getEliteSignals();
      case 'professional':
        return getProfessionalSignals();
      default:
        return signalHistory;
    }
  };

  const getSignalStatusIcon = (signal: any) => {
    if (signal.status === 'APPROVED') {
      if (signal.evidenceScore >= 90) return <CheckCircle className="w-4 h-4 text-green-400" />;
      return <CheckCircle className="w-4 h-4 text-blue-400" />;
    }
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getSignalBadgeColor = (signal: any) => {
    if (signal.status === 'REJECTED') return 'destructive';
    if (signal.evidenceScore >= 90) return 'default'; // Elite
    if (signal.evidenceScore >= 80) return 'secondary'; // Professional
    return 'outline'; // Standard
  };

  const getSignalLabel = (signal: any) => {
    if (signal.status === 'REJECTED') return 'REJECTED';
    if (signal.evidenceScore >= 90) return '🔥 ELITE';
    if (signal.evidenceScore >= 80) return '✅ PROFESSIONAL';
    return '📊 STANDARD';
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Control Panel */}
      <Card className="border border-white/10 bg-gradient-to-r from-gray-900/80 to-purple-900/20 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            State Machine Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Button
              onClick={generateSignal}
              disabled={isScanning}
              className="flex-1 min-w-[140px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Target className="w-4 h-4 mr-2" />
              Single Scan
            </Button>
            
            {!isScanning ? (
              <Button
                onClick={handleStartScanning}
                className="flex-1 min-w-[140px] bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Auto Scan
              </Button>
            ) : (
              <Button
                onClick={handleStopScanning}
                variant="destructive"
                className="flex-1 min-w-[140px]"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            )}
            
            <Button
              onClick={clearHistory}
              variant="outline"
              className="flex-1 min-w-[120px] border-white/20 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          {isScanning && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>State machine actively scanning... Next scan in ~60s</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="border border-white/10 bg-gray-900/60 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-white">{totalScans}</div>
              <div className="text-xs md:text-sm text-gray-400">Total Scans</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-gray-900/60 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-green-400">{successRate.toFixed(1)}%</div>
              <div className="text-xs md:text-sm text-gray-400">Success Rate</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-gray-900/60 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-purple-400">{avgEvidenceScore.toFixed(0)}</div>
              <div className="text-xs md:text-sm text-gray-400">Avg Evidence</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-gray-900/60 backdrop-blur-sm">
          <CardContent className="p-3 md:p-4">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-blue-400">{shadowModePassRate.toFixed(0)}%</div>
              <div className="text-xs md:text-sm text-gray-400">Shadow Pass</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance */}
      <Card className="border border-white/10 bg-gradient-to-r from-gray-900/80 to-blue-900/20 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-400" />
            Daily Performance
            <Button 
              onClick={resetDailyStats}
              variant="outline" 
              size="sm"
              className="ml-auto border-white/20 text-white text-xs"
            >
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{dailyStats.signalsGenerated}</div>
              <div className="text-sm text-gray-400">Generated</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{dailyStats.signalsApproved}</div>
              <div className="text-sm text-gray-400">Approved</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${dailyStats.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {dailyStats.pnl > 0 ? '+' : ''}{dailyStats.pnl.toFixed(1)}R
              </div>
              <div className="text-sm text-gray-400">P&L</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">{dailyStats.consecutiveLosses}</div>
              <div className="text-sm text-gray-400">Consecutive Losses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Signal */}
      {currentSignal && (
        <Card className="border border-white/10 bg-gradient-to-r from-gray-900/80 to-green-900/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              {getSignalStatusIcon(currentSignal)}
              Latest Signal
              <Badge variant={getSignalBadgeColor(currentSignal)} className="ml-auto">
                {getSignalLabel(currentSignal)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentSignal.status === 'APPROVED' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {currentSignal.direction === 'BUY' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className="font-semibold text-white">
                      {currentSignal.symbol} {currentSignal.direction}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    State: <span className="text-white font-medium">{currentSignal.setupState}</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    Session: <span className="text-white font-medium">{currentSignal.metadata.session}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    Entry: <span className="text-white font-medium">{currentSignal.entry?.toFixed(5)}</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    SL: <span className="text-white font-medium">{currentSignal.stopLoss?.toFixed(5)}</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    TP: <span className="text-white font-medium">{currentSignal.takeProfit?.toFixed(5)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    RR: <span className="text-green-400 font-medium">{currentSignal.riskReward}:1</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    Evidence: <span className="text-purple-400 font-medium">{currentSignal.evidenceScore}/100</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    Quality: <span className="text-blue-400 font-medium">{currentSignal.metadata.entryQuality}</span>
                  </div>
                </div>

                <div className="md:col-span-3 mt-4 p-3 bg-black/20 rounded border border-white/10">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="text-gray-300">Shadow Mode: </span>
                      <span className={currentSignal.shadowModeValidated ? 'text-green-400' : 'text-red-400'}>
                        {currentSignal.shadowModeValidated ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                      <span className="text-gray-300">Price Integrity: </span>
                      <span className={currentSignal.priceIntegrityPassed ? 'text-green-400' : 'text-red-400'}>
                        {currentSignal.priceIntegrityPassed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-purple-400" />
                      <span className="text-gray-300">Tradability: </span>
                      <span className="text-purple-400">{currentSignal.tradabilityScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold">Signal Rejected</span>
                </div>
                <div className="text-sm text-gray-300">
                  Reasons: {currentSignal.rejectionReasons.join(', ')}
                </div>
                <div className="text-sm text-gray-300">
                  State: <span className="text-white">{currentSignal.setupState}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Signal History */}
      <Card className="border border-white/10 bg-gray-900/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">Signal History</CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {['all', 'approved', 'elite', 'professional'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter as any)}
                className="text-xs capitalize border-white/20"
              >
                {filter}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {getFilteredSignals().slice(0, 20).map((signal, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/10"
              >
                <div className="flex items-center gap-3">
                  {getSignalStatusIcon(signal)}
                  <div>
                    <div className="text-white font-medium text-sm">
                      {signal.symbol} {signal.direction}
                    </div>
                    <div className="text-xs text-gray-400">
                      {signal.metadata.session} • {signal.setupState}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge variant={getSignalBadgeColor(signal)} className="text-xs">
                    {signal.evidenceScore}/100
                  </Badge>
                  {signal.riskReward && (
                    <div className="text-xs text-gray-400 mt-1">
                      RR: {signal.riskReward}:1
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {getFilteredSignals().length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No signals available. Start scanning to generate signals.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {lastScanTime && (
        <div className="text-center text-xs text-gray-400">
          Last scan: {new Date(lastScanTime).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default StateMachineSignalsDashboard;