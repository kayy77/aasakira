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
    averageGrade
  } = useSignalEngine();

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'A': return 'default';
      case 'B': return 'secondary';
      case 'F': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'approved' ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getDirectionIcon = (direction: 'BULLISH' | 'BEARISH') => {
    return direction === 'BULLISH' ? (
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
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
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
                {getStatusIcon(currentSignal.status)}
                Current Signal: {currentSignal.pair}
              </span>
              <Badge variant={currentSignal.status === 'approved' ? 'default' : 'destructive'}>
                {currentSignal.status.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              {new Date(currentSignal.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSignal.reason && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{currentSignal.reason}</p>
              </div>
            )}

            {/* Consensus Details */}
            {currentSignal.consensus && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  {getDirectionIcon(currentSignal.consensus.direction)}
                  AI Consensus
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Direction:</span>
                    <div className="font-medium">{currentSignal.consensus.direction}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Agreement:</span>
                    <div className="font-medium">{(currentSignal.consensus.agreement * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <div className="font-medium">{currentSignal.consensus.confidence.toFixed(1)}%</div>
                  </div>
                </div>

                {/* AI Votes */}
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">AI Model Votes ({currentSignal.consensus.totalVotes})</span>
                  <div className="space-y-1">
                    {currentSignal.consensus.votes.map((vote, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                        <span className="font-medium">{vote.model}</span>
                        <div className="flex items-center gap-2">
                          {getDirectionIcon(vote.direction)}
                          <span>{vote.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Strategy Validation */}
            {currentSignal.validation && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Strategy Validation
                  <Badge variant={getGradeBadgeVariant(currentSignal.validation.finalGrade)}>
                    Grade {currentSignal.validation.finalGrade}
                  </Badge>
                </h4>
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="ml-2 font-medium">{currentSignal.validation.score.toFixed(1)}%</span>
                </div>

                {/* Passed Checks */}
                {currentSignal.validation.passedChecks.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Passed Checks:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentSignal.validation.passedChecks.map((check, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          {check}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed Checks */}
                {currentSignal.validation.failedChecks.length > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">Failed Checks:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentSignal.validation.failedChecks.map((check, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          {check}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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
                    {getStatusIcon(signal.status)}
                    <div>
                      <div className="font-medium">{signal.pair}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {signal.consensus && getDirectionIcon(signal.consensus.direction)}
                    {signal.validation && (
                      <Badge variant={getGradeBadgeVariant(signal.validation.finalGrade)}>
                        {signal.validation.finalGrade}
                      </Badge>
                    )}
                    {signal.consensus && (
                      <span className="text-sm text-muted-foreground">
                        {signal.consensus.confidence.toFixed(0)}%
                      </span>
                    )}
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