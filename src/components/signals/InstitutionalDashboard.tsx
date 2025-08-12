
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useInstitutionalSignals } from '@/hooks/useInstitutionalSignals';
import InstitutionalSignalCard from './InstitutionalSignalCard';
import { 
  Target, 
  Brain, 
  BarChart3, 
  Clock, 
  TrendingUp,
  Shield,
  Play,
  Square,
  RefreshCw
} from 'lucide-react';

export const InstitutionalDashboard = () => {
  const {
    currentSignal,
    signalHistory,
    isScanning,
    scanCount,
    lastScanTime,
    scanningStats,
    successRate,
    averageGrade,
    generateSignal,
    startAutoScanning,
    stopScanning,
    clearHistory,
    getEliteSignals,
    getInstitutionalSignals
  } = useInstitutionalSignals();

  const eliteSignals = getEliteSignals();
  const institutionalSignals = getInstitutionalSignals();

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
          🏛️ Institutional Signal Engine
        </h1>
        <p className="text-gray-400 text-lg">
          Hedge Fund Grade Multi-AI Consensus with Deep Strategy Validation
        </p>
      </div>

      {/* Control Panel */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-purple-400" />
            Signal Command Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <Button
              onClick={isScanning ? stopScanning : () => startAutoScanning(60)}
              className={`flex items-center gap-2 ${
                isScanning 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isScanning ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop Scanning
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Auto-Scan
                </>
              )}
            </Button>
            
            <Button
              onClick={() => generateSignal()}
              variant="outline"
              disabled={isScanning}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Manual Scan
            </Button>
            
            <Button
              onClick={clearHistory}
              variant="outline"
              className="flex items-center gap-2 border-red-500 text-red-400 hover:bg-red-500/10"
            >
              Clear History
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{scanCount}</div>
              <div className="text-gray-400">Total Scans</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{successRate}%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{averageGrade.toFixed(1)}</div>
              <div className="text-gray-400">Avg Grade</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{lastScanTime || 'Never'}</div>
              <div className="text-gray-400">Last Scan</div>
            </div>
          </div>
          
          {isScanning && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <div className="animate-pulse w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">
                  Institutional AI scanning active - hunting for A+ and A grade signals...
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scanning Statistics */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Signal Quality Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-400">
                {scanningStats.eliteCount}
              </div>
              <div className="text-sm text-gray-400">Elite Signals</div>
              <Badge className="bg-purple-500/20 text-purple-400">A+/A Grade</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-400">
                {scanningStats.institutionalCount}
              </div>
              <div className="text-sm text-gray-400">Institutional</div>
              <Badge className="bg-blue-500/20 text-blue-400">B+/B Grade</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-yellow-400">
                {scanningStats.professionalCount}
              </div>
              <div className="text-sm text-gray-400">Professional</div>
              <Badge className="bg-yellow-500/20 text-yellow-400">C+ Grade</Badge>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-red-400">
                {scanningStats.rejectedCount}
              </div>
              <div className="text-sm text-gray-400">Rejected</div>
              <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Signal */}
      {currentSignal && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            Latest Institutional Signal
          </h2>
          <InstitutionalSignalCard
            signal={currentSignal}
          />
        </div>
      )}

      {/* Elite Signals Section */}
      {eliteSignals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Elite Signals ({eliteSignals.length})
          </h2>
          <div className="grid gap-4">
            {eliteSignals.slice(0, 3).map((signal, index) => (
              <InstitutionalSignalCard
                key={signal.id}
                signal={signal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Signal History */}
      {signalHistory.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-gray-400" />
              Signal History ({signalHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signalHistory.slice(0, 10).map((signal, index) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <Badge className={`px-3 py-1 ${
                      signal.institutionalGrade === 'A+' ? 'bg-purple-500 text-white' :
                      signal.institutionalGrade === 'A' ? 'bg-green-500 text-white' :
                      signal.institutionalGrade.startsWith('B') ? 'bg-blue-500 text-white' :
                      'bg-yellow-500 text-black'
                    }`}>
                      {signal.institutionalGrade}
                    </Badge>
                    <div>
                      <div className="font-semibold text-white">
                        {signal.pair} {signal.type}
                      </div>
                      <div className="text-sm text-gray-400">
                        {signal.institutionalGrade} • 
                        {signal.confidence}% • 
                        {signal.riskReward.riskRewardRatio}:1 R:R
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {new Date(signal.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Signals State */}
      {!currentSignal && signalHistory.length === 0 && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Institutional Signals Yet
            </h3>
            <p className="text-gray-400 mb-4">
              Start scanning to discover high-conviction trading opportunities
            </p>
            <Button
              onClick={() => startAutoScanning(60)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Begin Institutional Scanning
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
