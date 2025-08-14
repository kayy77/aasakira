import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import FeatureGate from '@/components/FeatureGate';
import EnhancedSignalsDashboard from '@/components/signals/EnhancedSignalsDashboard';
import { useSniperScanner } from '@/hooks/useSniperScanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Signals = () => {
  const isMobile = useIsMobile();
  const [activeEngine, setActiveEngine] = useState<'enhanced' | 'sniper'>('sniper');
  const sniperScanner = useSniperScanner();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <div className="relative z-10 pt-16 md:pt-20 lg:pt-24 pb-8 md:pb-12">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-4 md:mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold gradient-text mb-2 md:mb-3 lg:mb-4">
              🎯 SNIPER Signal Engine
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 md:px-4">
              Precision institutional signals with multi-layer confluence, pullback entries, and hidden stop zones
            </p>
            <div className={`flex justify-center gap-1 sm:gap-2 md:gap-4 mt-2 md:mt-3 lg:mt-4 ${
              isMobile ? 'flex-wrap px-2' : ''
            }`}>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={isMobile ? 'text-xs' : ''}>Zero Garbage Signals</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className={isMobile ? 'text-xs' : ''}>Pullback Entries Only</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className={isMobile ? 'text-xs' : ''}>Hidden SL Zones</span>
              </div>
            </div>
          </div>

          <FeatureGate feature="signals" featureName="SNIPER Signal Engine">
            <Tabs value={activeEngine} onValueChange={(value) => setActiveEngine(value as 'enhanced' | 'sniper')} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sniper" className="relative">
                  🎯 SNIPER Engine
                  <Badge variant="destructive" className="ml-2 text-xs">FIXED</Badge>
                </TabsTrigger>
                <TabsTrigger value="enhanced">
                  🚀 Enhanced Engine
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sniper">
                <SniperDashboard {...sniperScanner} />
              </TabsContent>

              <TabsContent value="enhanced">
                <EnhancedSignalsDashboard />
              </TabsContent>
            </Tabs>
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};

// 🎯 SNIPER Dashboard Component  
const SniperDashboard = ({ 
  scanResult, 
  isScanning, 
  scanCount, 
  lastScanTime, 
  qualityMetrics, 
  successRate,
  startSniperScanning, 
  stopSniperScanning 
}: any) => {
  const currentSignal = scanResult?.signal;
  
  return (
    <div className="space-y-6">
      {/* Sniper Controls */}
      <Card className="bg-card/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            🎯 SNIPER Signal Engine
            <Badge variant={isScanning ? "default" : "outline"}>
              {isScanning ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={isScanning ? stopSniperScanning : startSniperScanning}
              variant={isScanning ? "destructive" : "default"}
              size="lg"
            >
              {isScanning ? '⏹️ Stop Scanning' : '🎯 Start SNIPER'}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Scans: {scanCount} | Last: {lastScanTime} | Success: {successRate}%
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{qualityMetrics.eliteSignalRate}%</div>
              <div className="text-sm text-gray-400">Elite Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{qualityMetrics.averageConfluence}%</div>
              <div className="text-sm text-gray-400">Avg Confluence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{qualityMetrics.sessionOptimization}%</div>
              <div className="text-sm text-gray-400">Session Optimization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Signal */}
      {currentSignal && (
        <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-foreground">
              <span className="flex items-center gap-2">
                🎯 {currentSignal.symbol} {currentSignal.direction}
                <Badge variant="default" className="bg-green-500">
                  {currentSignal.grade}
                </Badge>
              </span>
              <Badge variant="outline">
                {currentSignal.confluenceScore}% Confluence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-400">Entry</div>
                <div className="font-bold text-green-400">{currentSignal.entry.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Stop Loss</div>
                <div className="font-bold text-red-400">{currentSignal.sl.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Take Profit</div>
                <div className="font-bold text-blue-400">{currentSignal.tp.toFixed(5)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Risk:Reward</div>
                <div className="font-bold text-foreground">1:{currentSignal.riskReward}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
              <div>
                <div className="text-gray-400">Entry Method</div>
                <div className="font-medium text-foreground">{currentSignal.entryMethod}</div>
              </div>
              <div>
                <div className="text-gray-400">HTF Bias</div>
                <div className="font-medium text-foreground">{currentSignal.metadata.htfBias}</div>
              </div>
              <div>
                <div className="text-gray-400">Volume Profile</div>
                <div className="font-medium text-foreground">{currentSignal.metadata.volumeProfile}</div>
              </div>
            </div>

            {/* Validation Status */}
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-sm font-medium mb-2 text-foreground">Validation Status</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className={`flex items-center gap-1 ${currentSignal.validation.htfTrend ? 'text-green-400' : 'text-red-400'}`}>
                  {currentSignal.validation.htfTrend ? '✅' : '❌'} HTF Trend
                </div>
                <div className={`flex items-center gap-1 ${currentSignal.validation.marketStructure ? 'text-green-400' : 'text-red-400'}`}>
                  {currentSignal.validation.marketStructure ? '✅' : '❌'} Structure
                </div>
                <div className={`flex items-center gap-1 ${currentSignal.validation.volumeSpike ? 'text-green-400' : 'text-red-400'}`}>
                  {currentSignal.validation.volumeSpike ? '✅' : '❌'} Volume
                </div>
                <div className={`flex items-center gap-1 ${currentSignal.validation.pullbackZone ? 'text-green-400' : 'text-red-400'}`}>
                  {currentSignal.validation.pullbackZone ? '✅' : '❌'} Pullback
                </div>
                <div className={`flex items-center gap-1 ${currentSignal.validation.hiddenSL ? 'text-green-400' : 'text-red-400'}`}>
                  {currentSignal.validation.hiddenSL ? '✅' : '❌'} Hidden SL
                </div>
                <div className={`flex items-center gap-1 ${currentSignal.validation.sessionTiming ? 'text-green-400' : 'text-red-400'}`}>
                  {currentSignal.validation.sessionTiming ? '✅' : '❌'} Session
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Information */}
      {scanResult && !currentSignal && scanResult.rejectionReasons.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              ❌ Signal Rejected
              <Badge variant="destructive">No Trade</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanResult.rejectionReasons.map((reason: string, index: number) => (
                <div key={index} className="text-sm text-red-400 flex items-center gap-2">
                  • {reason}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Signals;
