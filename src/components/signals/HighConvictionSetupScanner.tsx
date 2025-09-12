import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Play, Square, TrendingUp, AlertTriangle, Clock, Award } from 'lucide-react';
import { highConvictionSetupEngine, type MarketSetup, type SetupScanResult } from '@/services/enhanced/HighConvictionSetupEngine';

const HighConvictionSetupScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<SetupScanResult | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [scanInterval, setScanInterval] = useState<NodeJS.Timeout | null>(null);

  const startScanning = async () => {
    console.log('🎯 Starting High-Conviction Setup Scanner...');
    setIsScanning(true);
    
    // Perform initial scan
    await performScan();
    
    // Set up interval scanning every 30 seconds
    const interval = setInterval(async () => {
      await performScan();
    }, 30000);
    
    setScanInterval(interval);
  };

  const stopScanning = () => {
    console.log('⏹️ Stopping Setup Scanner');
    setIsScanning(false);
    
    if (scanInterval) {
      clearInterval(scanInterval);
      setScanInterval(null);
    }
  };

  const performScan = async () => {
    try {
      const results = await highConvictionSetupEngine.scanForHighConvictionSetups();
      setScanResults(results);
      setLastScanTime(new Date().toLocaleTimeString());
      
      console.log(`✅ Scan complete: ${results.qualitySetups.length} quality setups found`);
    } catch (error) {
      console.error('Setup scan failed:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, [scanInterval]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'ELITE': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'HIGH': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'BUY' 
      ? 'bg-green-500/20 text-green-400 border-green-500/50'
      : 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  return (
    <div className="space-y-6">
      {/* Scanner Control Panel */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-purple-400" />
            High-Conviction Setup Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={isScanning ? stopScanning : startScanning}
                className={`${
                  isScanning
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white`}
              >
                {isScanning ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Stop Scanner
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Scanner
                  </>
                )}
              </Button>
              
              {isScanning && (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Scanning for quality setups...</span>
                </div>
              )}
            </div>
            
            {lastScanTime && (
              <div className="text-sm text-gray-400">
                Last scan: {lastScanTime}
              </div>
            )}
          </div>

          {/* Scan Statistics */}
          {scanResults && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{scanResults.qualitySetups.length}</div>
                <div className="text-xs text-gray-400">Quality Setups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400">{scanResults.rejectedCount}</div>
                <div className="text-xs text-gray-400">Rejected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{scanResults.totalScanned}</div>
                <div className="text-xs text-gray-400">Total Scanned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{scanResults.scanDuration}ms</div>
                <div className="text-xs text-gray-400">Scan Time</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Results */}
      {scanResults && (
        <div className="space-y-4">
          {scanResults.qualitySetups.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No High-Quality Setups Found</h3>
                  <p className="text-gray-400 mb-4">
                    {scanResults.noSetupsReason || 'All setups failed to meet minimum quality standards (60+ points)'}
                  </p>
                  <div className="text-sm text-purple-400 bg-purple-500/10 p-3 rounded-lg">
                    <strong>Quality over Quantity:</strong> We only show setups with high conviction. 
                    Stay patient — forcing trades reduces win rate.
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">
                  Top {scanResults.qualitySetups.length} Quality Setup{scanResults.qualitySetups.length !== 1 ? 's' : ''}
                </h2>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  Ranked by Score
                </Badge>
              </div>

              {scanResults.qualitySetups.map((setup) => (
                <SetupCard key={setup.id} setup={setup} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const SetupCard: React.FC<{ setup: MarketSetup }> = ({ setup }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-white">{setup.symbol}</div>
            <Badge className={getDirectionColor(setup.direction)}>
              {setup.direction}
            </Badge>
            <Badge className={getGradeColor(setup.score.grade)}>
              {setup.score.grade} ({setup.score.percentage}%)
            </Badge>
            <div className="text-sm text-gray-400">#{setup.score.rank}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Setup Strength</div>
            <div className="text-2xl font-bold text-purple-400">
              {setup.score.totalPoints}
            </div>
          </div>
        </div>

        {/* Setup Type & Live Context (no entries/SL/TP shown) */}
        <div className="mb-4">
          <div className="text-lg font-semibold text-gray-200 mb-2">{setup.setupType}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Live Price:</span>
              <span className="text-white ml-2">{setup.keyLevels?.currentPrice ?? '—'}</span>
            </div>
            <div>
              <span className="text-gray-400">Timeframes:</span>
              <span className="text-gray-300 ml-2">{setup.timeframes.confirmation.join(', ') || '—'}</span>
            </div>
            <div>
              <span className="text-gray-400">Liquidity:</span>
              <span className="ml-2 {setup.quality.liquidityLevel === 'HIGH' ? 'text-green-400' : setup.quality.liquidityLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-gray-400'}">
                {setup.quality.liquidityLevel}
              </span>
            </div>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="mb-4 p-4 bg-gray-800/50 rounded-lg">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400">Why this matters:</span>
            </div>
            <p className="text-gray-300 text-sm">{setup.explanation.why}</p>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Next step:</span>
            </div>
            <p className="text-gray-300 text-sm">{setup.explanation.nextStep}</p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-400">Risk warning:</span>
            </div>
            <p className="text-gray-400 text-sm">{setup.explanation.riskWarning}</p>
          </div>
        </div>

        {/* Confluence Indicators */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-300 mb-2">Detected Confluences:</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {setup.filters.map((filter, index) => (
              <div
                key={index}
                className={`p-2 rounded text-xs ${
                  filter.detected
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-gray-700/50 text-gray-500 border border-gray-600/50'
                }`}
              >
                <div className="font-semibold">{filter.name}</div>
                <div className="text-xs">+{filter.points}pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeframe Analysis */}
        {setup.timeframes.confirmation.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-400">Multi-TF Confirmation:</span>
            <div className="flex gap-2 mt-1">
              {setup.timeframes.confirmation.map((tf, index) => (
                <Badge key={index} className="bg-green-500/20 text-green-400 text-xs">
                  {tf}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'ELITE': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    case 'HIGH': return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
};

const getDirectionColor = (direction: string) => {
  return direction === 'BUY' 
    ? 'bg-green-500/20 text-green-400 border-green-500/50'
    : 'bg-red-500/20 text-red-400 border-red-500/50';
};

export default HighConvictionSetupScanner;