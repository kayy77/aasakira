import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSignalEngine } from '@/hooks/useSignalEngine';
import { Play, Square, RotateCcw, TrendingUp, TrendingDown, Activity, Brain, Target, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function SignalEngineDashboard() {
  const {
    currentSignal,
    signalHistory,
    isScanning,
    scanCount,
    lastScanTime,
    stats,
    generateSignal,
    startAutoScanning,
    stopScanning,
    clearHistory,
    successRate,
    averageEvidence
  } = useSignalEngine();

  const getQualityBadgeVariant = (quality: string) => {
    switch (quality) {
      case 'ELITE': return 'default';
      case 'PROFESSIONAL': return 'secondary';
      case 'INSTITUTIONAL': return 'outline';
      case 'STANDARD': return 'outline';
      default: return 'destructive';
    }
  };

  const getDirectionIcon = (direction: 'BUY' | 'SELL') => {
    return direction === 'BUY' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Signal Engine Control
          </CardTitle>
          <CardDescription>
            Multi-AI consensus engine with institutional strategy validation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={() => generateSignal()}
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Generate Signal
            </Button>
            
            {!isScanning ? (
              <Button
                onClick={() => startAutoScanning(30)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Start Auto Scan (30s)
              </Button>
            ) : (
              <Button
                onClick={stopScanning}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Scanning
              </Button>
            )}
            
            <Button
              onClick={clearHistory}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear History
            </Button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{scanCount}</div>
              <div className="text-sm text-muted-foreground">Total Scans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{averageEvidence.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Avg Evidence</div>
            </div>
          </div>

          {lastScanTime && (
            <div className="text-sm text-muted-foreground">
              Last scan: {new Date(lastScanTime).toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Signal Display */}
      {currentSignal && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Current Signal: {currentSignal.symbol}
              </span>
              <Badge variant={getQualityBadgeVariant(currentSignal.quality)}>
                {currentSignal.quality}
              </Badge>
            </CardTitle>
            <CardDescription>
              {new Date(currentSignal.createdAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Signal Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Direction</div>
                <div className="flex items-center gap-2 font-medium">
                  {getDirectionIcon(currentSignal.direction)}
                  {currentSignal.direction}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Entry</div>
                <div className="font-medium">{currentSignal.entry.toFixed(5)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Risk:Reward</div>
                <div className="font-medium">{currentSignal.riskReward.toFixed(1)}:1</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Confidence</div>
                <div className="font-medium">{currentSignal.confidence.toFixed(1)}%</div>
              </div>
            </div>

            {/* Evidence Score */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Evidence Score
              </h4>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-blue-600">
                  {currentSignal.evidenceScore}/100
                </div>
                <Badge variant={currentSignal.evidenceScore >= 85 ? 'default' : currentSignal.evidenceScore >= 80 ? 'secondary' : 'outline'}>
                  {currentSignal.evidenceScore >= 85 ? 'Elite' : currentSignal.evidenceScore >= 80 ? 'Strong' : 'Standard'}
                </Badge>
              </div>
            </div>

            {/* Setup State */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Setup State & Session
              </h4>
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  State: {currentSignal.setupState}
                </Badge>
                <Badge variant="outline">
                  Session: {currentSignal.session}
                </Badge>
              </div>
            </div>

            {/* Meta Information */}
            {currentSignal.meta && (
              <div className="space-y-2">
                <h4 className="font-semibold">Technical Details</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Price Integrity:</span>
                    <div className="font-medium">{currentSignal.meta.priceIntegrity ? '✅' : '❌'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">POI Quality:</span>
                    <div className="font-medium">{String(currentSignal.meta.poiQuality)}/20</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">LTF Confirm:</span>
                    <div className="font-medium">{String(currentSignal.meta.ltfConfirm)}/20</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Signal History */}
      <Card>
        <CardHeader>
          <CardTitle>Signal History</CardTitle>
          <CardDescription>
            Recent signals with grades and validation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {signalHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                No signals generated yet. Click "Generate Signal" to start.
              </div>
            ) : (
              signalHistory.slice(0, 10).map((signal, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="font-medium">{signal.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(signal.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getDirectionIcon(signal.direction)}
                    <Badge variant={getQualityBadgeVariant(signal.quality)}>
                      {signal.quality}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {signal.evidenceScore}/100
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}