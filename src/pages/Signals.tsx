import React from 'react';
import Navigation from '@/components/Navigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import FeatureGate from '@/components/FeatureGate';
import { useUltraSignals } from '@/hooks/useUltraSignals';
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
    scanMarkets,
    startAutoScanning,
    stopScanning,
    clearHistory
  } = useUltraSignals();

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
                ⚡ ULTRA Signal Engine
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                XAUUSD & US30 • Live Price • Institutional Grade
              </p>
            </div>
            
            <div className="flex gap-2 md:gap-3">
              <Button onClick={scanMarkets} disabled={isScanning} size={isMobile ? 'sm' : 'default'}>
                <Zap className="w-4 h-4 mr-2" />
                Scan
              </Button>
              {!isScanning ? (
                <Button onClick={() => startAutoScanning(30)} size={isMobile ? 'sm' : 'default'}>
                  <Activity className="w-4 h-4 mr-2" />
                  {isMobile ? 'Auto' : 'Auto (30s)'}
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" size={isMobile ? 'sm' : 'default'}>
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
              <Card className="p-3 md:p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Total</div>
                <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">{stats.xauusd} Gold • {stats.us30} NASDAQ</div>
              </Card>
              
              <Card className="p-3 md:p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Legendary</div>
                <div className="text-xl md:text-2xl font-bold text-purple-500">{stats.legendary}</div>
                <div className="text-xs text-muted-foreground">95%+</div>
              </Card>
              
              <Card className="p-3 md:p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Elite</div>
                <div className="text-xl md:text-2xl font-bold text-yellow-500">{stats.elite}</div>
                <div className="text-xs text-muted-foreground">90%+</div>
              </Card>
              
              <Card className="p-3 md:p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Confidence</div>
                <div className="text-xl md:text-2xl font-bold">{Math.round(stats.avgConfidence || 0)}%</div>
              </Card>
              
              <Card className="p-3 md:p-4">
                <div className="text-xs md:text-sm text-muted-foreground">Avg R:R</div>
                <div className="text-xl md:text-2xl font-bold">{stats.avgRR.toFixed(1)}:1</div>
              </Card>
            </div>

            {/* Current Signal */}
            {currentSignal && (
              <Card className="p-4 md:p-6 border-2 border-purple-600 shadow-lg mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <h2 className="text-xl md:text-2xl font-bold">⚡ {currentSignal.symbol}</h2>
                      <Badge variant={currentSignal.direction === 'BUY' ? 'default' : 'destructive'}>
                        {currentSignal.direction}
                      </Badge>
                      <Badge className={currentSignal.grade === 'LEGENDARY' ? 'bg-purple-600' : 'bg-yellow-600'}>
                        {currentSignal.grade}
                      </Badge>
                      <Badge variant="secondary">{currentSignal.priceAge}ms</Badge>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl md:text-3xl font-bold">{currentSignal.confidence.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Live: {currentSignal.livePrice.toFixed(currentSignal.symbol === 'XAUUSD' ? 2 : 0)}</div>
                  </div>
                </div>

                {/* Trade Levels */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4">
                  <div className="bg-muted/50 p-2 md:p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Entry</div>
                    <div className="font-mono font-bold text-sm md:text-base">{currentSignal.entry.toFixed(currentSignal.symbol === 'XAUUSD' ? 2 : 0)}</div>
                  </div>
                  <div className="bg-destructive/10 p-2 md:p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Stop Loss</div>
                    <div className="font-mono font-bold text-sm md:text-base text-destructive">{currentSignal.stopLoss.toFixed(currentSignal.symbol === 'XAUUSD' ? 2 : 0)}</div>
                  </div>
                  <div className="bg-primary/10 p-2 md:p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Take Profit</div>
                    <div className="font-mono font-bold text-sm md:text-base text-primary">{currentSignal.takeProfit.toFixed(currentSignal.symbol === 'XAUUSD' ? 2 : 0)}</div>
                  </div>
                </div>

                {/* Risk Reward */}
                <div className="flex items-center justify-between mb-4 p-2 md:p-3 bg-muted/50 rounded-lg">
                  <span className="text-xs md:text-sm font-medium">Risk:Reward</span>
                  <span className="text-base md:text-lg font-bold">{currentSignal.riskReward.toFixed(2)}:1</span>
                </div>

                {/* Confluence Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                  <div className="bg-muted/30 p-2 rounded">
                    <div className="text-xs text-muted-foreground">TF Align</div>
                    <div className="font-bold">{currentSignal.confluence.tfAlignment.toFixed(0)}%</div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Structure</div>
                    <div className="font-bold">{currentSignal.confluence.structuralConfluence.toFixed(0)}</div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Volume</div>
                    <div className="font-bold">{currentSignal.confluence.volumeConfirmation.toFixed(0)}</div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Institution</div>
                    <div className="font-bold">{currentSignal.confluence.institutionalFootprint.toFixed(0)}</div>
                  </div>
                  <div className="bg-muted/30 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Smart $</div>
                    <div className="font-bold">{currentSignal.confluence.smartMoneyBehavior.toFixed(0)}</div>
                  </div>
                </div>

                {/* Critical Filters */}
                <div className="mb-3">
                  <h3 className="text-sm font-semibold mb-2">Critical Filters ({currentSignal.filters.filter((f: any) => f.critical && f.passed).length}/5)</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {currentSignal.filters.filter((f: any) => f.critical).map((filter: any, idx: number) => (
                      <div key={idx} className={`text-xs p-2 rounded flex justify-between ${filter.passed ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                        <span>{filter.passed ? '✓' : '✗'} {filter.name}</span>
                        <span className="font-semibold">{filter.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
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
