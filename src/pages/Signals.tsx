import React from 'react';
import Navigation from '@/components/Navigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import FeatureGate from '@/components/FeatureGate';
import { usePowerfulSignals } from '@/hooks/usePowerfulSignals';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, TrendingUp, Activity, Zap } from 'lucide-react';

const Signals = () => {
  const isMobile = useIsMobile();
  const {
    currentSignal,
    signalHistory,
    isScanning,
    scanCount,
    stats,
    startAutoScanning,
    stopScanning,
    clearHistory
  } = usePowerfulSignals();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <div className="relative z-10 pt-16 md:pt-20 lg:pt-24 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Institutional Signal Engine
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Multi-Timeframe Analysis + Groq AI Validation
              </p>
            </div>
            
            <div className="flex gap-2 md:gap-3">
              {!isScanning ? (
                <Button onClick={() => startAutoScanning(45)} size={isMobile ? 'sm' : 'lg'}>
                  <Zap className="w-4 h-4 mr-2" />
                  {isMobile ? 'Start' : 'Start Scanning'}
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" size={isMobile ? 'sm' : 'lg'}>
                  Stop
                </Button>
              )}
              {!isMobile && (
                <Button onClick={clearHistory} variant="outline">
                  Clear
                </Button>
              )}
            </div>
          </div>

          <FeatureGate feature="signals" featureName="Institutional Signal Engine">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              <Card className="p-3 md:p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Total Scans</div>
                <div className="text-xl md:text-2xl font-bold">{scanCount}</div>
              </Card>
              
              <Card className="p-3 md:p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Elite Signals</div>
                <div className="text-xl md:text-2xl font-bold text-yellow-500">{stats.elite}</div>
              </Card>
              
              <Card className="p-3 md:p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Avg Confidence</div>
                <div className="text-xl md:text-2xl font-bold">{Math.round(stats.avgConfidence || 0)}%</div>
              </Card>
              
              <Card className="p-3 md:p-4">
                <div className="text-xs md:text-sm text-muted-foreground">TF Alignment</div>
                <div className="text-xl md:text-2xl font-bold">{Math.round(stats.avgTFAlignment || 0)}%</div>
              </Card>
            </div>

            {/* Current Signal */}
            {currentSignal && (
              <Card className="p-4 md:p-6 border-2 border-primary shadow-lg mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <h2 className="text-xl md:text-2xl font-bold">{currentSignal.symbol}</h2>
                      <Badge variant={currentSignal.direction === 'BUY' ? 'default' : 'destructive'} className="text-sm md:text-lg px-2 md:px-3 py-1">
                        {currentSignal.direction === 'BUY' ? <ArrowUp className="w-3 h-3 md:w-4 md:h-4 mr-1" /> : <ArrowDown className="w-3 h-3 md:w-4 md:h-4 mr-1" />}
                        {currentSignal.direction}
                      </Badge>
                      <Badge variant="outline" className="text-xs md:text-sm">
                        {currentSignal.institutionalGrade}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold">{currentSignal.confidence}%</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Confidence</div>
                  </div>
                </div>

                {/* Trade Levels */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
                  <div className="bg-muted/50 p-2 md:p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Entry</div>
                    <div className="font-mono font-bold text-sm md:text-base">{currentSignal.entry.toFixed(5)}</div>
                  </div>
                  <div className="bg-destructive/10 p-2 md:p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Stop Loss</div>
                    <div className="font-mono font-bold text-sm md:text-base text-destructive">{currentSignal.stopLoss.toFixed(5)}</div>
                  </div>
                  <div className="bg-primary/10 p-2 md:p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Take Profit</div>
                    <div className="font-mono font-bold text-sm md:text-base text-primary">{currentSignal.takeProfit.toFixed(5)}</div>
                  </div>
                </div>

                {/* Risk Reward */}
                <div className="flex items-center justify-between mb-4 p-2 md:p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs md:text-sm font-medium">Risk:Reward</span>
                  <span className="text-base md:text-lg font-bold">1:{currentSignal.riskReward}</span>
                </div>

                {/* Multi-Timeframe Analysis */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Multi-Timeframe Analysis
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-muted/30 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">H4</div>
                      <div className="font-bold text-sm">{currentSignal.analysis?.htfTrend?.trend || 'N/A'}</div>
                      <div className="text-xs">{currentSignal.analysis?.htfTrend?.strength || 0}%</div>
                    </div>
                    <div className="bg-muted/30 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">H1</div>
                      <div className="font-bold text-sm">{currentSignal.analysis?.mtfTrend?.trend || 'N/A'}</div>
                      <div className="text-xs">{currentSignal.analysis?.mtfTrend?.strength || 0}%</div>
                    </div>
                    <div className="bg-muted/30 p-2 rounded text-center">
                      <div className="text-xs text-muted-foreground">M15</div>
                      <div className="font-bold text-sm">{currentSignal.analysis?.ltfEntry?.trend || 'N/A'}</div>
                      <div className="text-xs">{currentSignal.analysis?.ltfEntry?.strength || 0}%</div>
                    </div>
                  </div>
                </div>

                {/* Institutional Filters */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Institutional Filters ({currentSignal.filters?.filter((f: any) => f.passed).length}/{currentSignal.filters?.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentSignal.filters?.filter((f: any) => f.passed).slice(0, 6).map((filter: any, idx: number) => (
                      <div key={idx} className="bg-primary/10 p-2 rounded text-xs md:text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{filter.name}</span>
                          <Badge variant="outline" className="text-xs">{Math.round(filter.score)}%</Badge>
                        </div>
                        {filter.institutional && (
                          <Badge className="mt-1 text-xs">Institutional</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Groq Validation */}
                {currentSignal.groqValidation && (
                  <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-3 md:p-4 rounded-lg">
                    <h3 className="text-sm md:text-base font-semibold mb-2">🤖 Groq AI Validation</h3>
                    <div className="space-y-1 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span>Verdict:</span>
                        <Badge variant={currentSignal.groqValidation.approved ? 'default' : 'destructive'}>
                          {currentSignal.groqValidation.approved ? 'APPROVED' : 'REJECTED'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>AI Confidence:</span>
                        <span className="font-bold">{currentSignal.groqValidation.adjustedConfidence}%</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {currentSignal.groqValidation.reasoning}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Signal History */}
            <div>
              <h2 className="text-lg md:text-xl font-bold mb-4">Recent Signals ({signalHistory.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {signalHistory.slice(0, 9).map((signal, idx) => (
                  <Card key={idx} className="p-3 md:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm md:text-base">{signal.symbol}</span>
                        <Badge variant={signal.direction === 'BUY' ? 'default' : 'destructive'} className="text-xs">
                          {signal.direction}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">{signal.institutionalGrade}</Badge>
                    </div>
                    
                    <div className="space-y-1 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="font-mono">{signal.entry.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence:</span>
                        <span className="font-bold">{signal.confidence}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">R:R:</span>
                        <span className="font-bold">1:{signal.riskReward}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TF Align:</span>
                        <span className="font-bold">{signal.timeframeAlignment}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};

export default Signals;
