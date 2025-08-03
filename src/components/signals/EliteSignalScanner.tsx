
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAutoSignalScanner } from '@/hooks/useAutoSignalScanner';
import { Brain, Target, TrendingUp, Clock, BarChart3 } from 'lucide-react';

const EliteSignalScanner: React.FC = () => {
  const {
    isScanning,
    latestSignal,
    aiConsensus,
    scanCount,
    lastScanTime,
    signalHistory,
    startAutoScan,
    stopAutoScan,
    manualScan
  } = useAutoSignalScanner();

  const getConfidenceColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'A': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'B': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'C': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'D': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDirectionFromGroq = (groqDecision: string): 'BUY' | 'SELL' => {
    return groqDecision.includes('BUY') ? 'BUY' : 'SELL';
  };

  return (
    <div className="space-y-6">
      {/* Scanner Control Panel */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-purple-400" />
            Elite Signal Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={isScanning ? stopAutoScan : startAutoScan}
                variant={isScanning ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isScanning ? '⏹️ Stop Scanning' : '▶️ Start Auto-Scan'}
              </Button>
              
              <Button
                onClick={() => manualScan()}
                variant="outline"
                disabled={isScanning}
                className="flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Manual Scan
              </Button>
            </div>
            
            <div className="text-sm text-gray-400">
              Scans: {scanCount} | Last: {lastScanTime}
            </div>
          </div>
          
          <div className="text-sm text-gray-300">
            {isScanning 
              ? "🔄 Scanning for A+ and A grade signals every 30 seconds..."
              : "Scanner idle. Click Start Auto-Scan to begin hunting for elite signals."
            }
          </div>
        </CardContent>
      </Card>

      {/* Latest Elite Signal */}
      {latestSignal && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Latest Elite Signal: {latestSignal.pair}
              </CardTitle>
              <Badge className={`text-lg px-3 py-1 ${getConfidenceColor(latestSignal.confidenceGrade)}`}>
                {latestSignal.confidenceGrade} Grade
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Signal Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Signal Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Direction:</span>
                    <Badge className={getDirectionFromGroq(latestSignal.groqDecision) === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {getDirectionFromGroq(latestSignal.groqDecision)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry:</span>
                    <span className="text-white font-mono">{latestSignal.entry.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-white font-mono">{latestSignal.stopLoss.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="text-white font-mono">{latestSignal.takeProfit.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk/Reward:</span>
                    <span className="text-green-400 font-semibold">{latestSignal.riskReward.ratio}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected Value:</span>
                    <span className={latestSignal.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}>
                      {latestSignal.expectedValue > 0 ? '+' : ''}{latestSignal.expectedValue}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confluences Matched */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Strategy Confluences</h4>
                <div className="space-y-1">
                  {latestSignal.confluences.map((confluence, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{confluence.name}</span>
                      <Badge className={confluence.passed ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {confluence.passed ? '✓' : '✗'} {Math.round(confluence.score)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Consensus */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  AI Votes ({aiConsensus?.score || 0}/5)
                </h4>
                {aiConsensus ? (
                  <div className="space-y-1">
                    {aiConsensus.votes.map((vote, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">{vote.model}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white capitalize">{vote.opinion.replace('_', ' ')}</span>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {vote.confidence}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-700">
                      <Badge className={aiConsensus.consensus === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {aiConsensus.consensus} ({aiConsensus.averageConfidence}% avg)
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">AI consensus pending...</div>
                )}
              </div>
            </div>

            {/* Groq Justification */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Institutional Analysis</h4>
              <div className="text-sm text-gray-300 mb-2">
                <strong className="text-purple-400">{latestSignal.groqDecision}</strong>
              </div>
              <div className="text-sm text-gray-300">
                {latestSignal.groqJustification}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signal History */}
      {signalHistory.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Signal History ({signalHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {signalHistory.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getConfidenceColor(entry.signal.confidenceGrade)}>
                      {entry.signal.confidenceGrade}
                    </Badge>
                    <span className="text-white font-semibold">{entry.signal.pair}</span>
                    <span className="text-gray-400 text-sm">
                      {entry.signal.confidence.toFixed(1)}% | {entry.signal.riskReward.ratio}:1 R:R
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EliteSignalScanner;
