import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Eye, 
  RefreshCw,
  BookOpen,
  Target,
  Loader,
  Clock,
  TrendingUp,
  AlertTriangle,
  Crown,
  Lock
} from 'lucide-react';
import { aiSetupScanner, MarketSetup, SetupScanResult } from '@/services/aiSetupScanner';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useSignalLimits } from '@/hooks/useSignalLimits';

const AISetupScanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<SetupScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState<string>('');
  const [selectedStrength, setSelectedStrength] = useState<'all' | 'High' | 'Moderate' | 'Low'>('all');
  
  const { toast } = useToast();
  const { subscription } = useSubscription();
  const { canGenerateSignal, checkAndIncrementSignal, signalsUsedToday, dailyLimit } = useSignalLimits();
  
  const isPremium = subscription?.tier === 'premium';

  // Auto-scan every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPremium) {
        performScan();
      }
    }, 30000);

    // Initial scan
    performScan();

    return () => clearInterval(interval);
  }, [isPremium]);

  const performScan = async () => {
    if (!isPremium) {
      // Check limits for free users
      const canProceed = await checkAndIncrementSignal();
      if (!canProceed) return;
    }

    setIsScanning(true);
    
    try {
      console.log('🔍 Scanning markets for trading setups...');
      const result = await aiSetupScanner.scanMarketSetups();
      
      setScanResult(result);
      setScanCount(prev => prev + 1);
      setLastScanTime(new Date().toLocaleTimeString());
      
      toast({
        title: "🔍 Market Scan Complete",
        description: `Found ${result.setupsFound} trading setups (${result.highProbabilitySetups.length} high probability)`,
      });
      
    } catch (error) {
      console.error('❌ Setup scan failed:', error);
      toast({
        title: "Scan Error",
        description: "Failed to scan market setups. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getFilteredSetups = (): MarketSetup[] => {
    if (!scanResult) return [];
    
    let allSetups = [
      ...scanResult.highProbabilitySetups,
      ...scanResult.moderateSetups,
      ...scanResult.lowProbabilitySetups
    ];

    if (selectedStrength !== 'all') {
      allSetups = allSetups.filter(setup => setup.setupStrength === selectedStrength);
    }

    // Limit free users to 2 setups per scan
    if (!isPremium) {
      allSetups = allSetups.slice(0, 2);
    }

    return allSetups;
  };

  const getStrengthColor = (strength: string): string => {
    switch (strength) {
      case 'High': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'Moderate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'Low': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredSetups = getFilteredSetups();

  return (
    <div className="space-y-6">
      {/* Scanner Header */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              🔍 AI Setup Scanner
            </div>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              Educational Mode
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {scanResult?.totalScanned || 0}
              </div>
              <div className="text-sm text-gray-400">Pairs Scanned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {scanResult?.setupsFound || 0}
              </div>
              <div className="text-sm text-gray-400">Setups Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {scanResult?.highProbabilitySetups.length || 0}
              </div>
              <div className="text-sm text-gray-400">High Probability</div>
            </div>
          </div>

          <Button
            onClick={performScan}
            disabled={isScanning || (!isPremium && !canGenerateSignal)}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {isScanning ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Scanning Market...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                🔍 Scan Market Setups
              </>
            )}
          </Button>

          {/* Usage Display */}
          <div className="text-center text-sm">
            {isPremium ? (
              <div className="text-green-400">
                ✨ Premium: Auto-scanning every 30s
              </div>
            ) : (
              <div className="text-orange-400">
                🔒 Free: {signalsUsedToday}/{dailyLimit} scans used today
                {signalsUsedToday >= dailyLimit && (
                  <div className="text-red-400 mt-1">
                    Daily limit reached! Upgrade for unlimited scanning.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Last Scan Info */}
          {lastScanTime && (
            <div className="text-center text-sm text-gray-400">
              <Clock className="w-4 h-4 inline mr-1" />
              Last scan: {lastScanTime} | Scan #{scanCount}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Controls */}
      {scanResult && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {(['all', 'High', 'Moderate', 'Low'] as const).map((strength) => (
                <Button
                  key={strength}
                  variant={selectedStrength === strength ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStrength(strength)}
                  className={selectedStrength === strength ? 
                    "bg-blue-600 text-white" : 
                    "border-gray-500/30 text-gray-400"
                  }
                >
                  {strength === 'all' ? 'All Setups' : `${strength} Probability`}
                  {strength !== 'all' && scanResult && (
                    <span className="ml-1 text-xs">
                      ({strength === 'High' ? scanResult.highProbabilitySetups.length :
                        strength === 'Moderate' ? scanResult.moderateSetups.length :
                        scanResult.lowProbabilitySetups.length})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Cards */}
      {filteredSetups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSetups.map((setup) => (
            <Card key={setup.id} className="glass-card border-l-4 border-l-blue-400">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{setup.pair}</h3>
                    <Badge className="text-xs">{setup.timeframe}</Badge>
                    <Badge className="text-xs bg-purple-500/20 text-purple-400">
                      {setup.session}
                    </Badge>
                  </div>
                  <Badge className={`text-xs ${getStrengthColor(setup.setupStrength)}`}>
                    {setup.setupStrength}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400">{setup.setupType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className={`w-4 h-4 ${getRiskColor(setup.riskLevel)}`} />
                    <span className={getRiskColor(setup.riskLevel)}>{setup.riskLevel} Risk</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Setup Analysis</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {setup.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Next Steps
                  </h4>
                  <p className="text-blue-300 text-sm leading-relaxed">
                    {setup.nextSteps}
                  </p>
                </div>

                {setup.watchZones.entry && (
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h5 className="font-medium text-white mb-2">Watch Zones</h5>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {setup.watchZones.entry && (
                        <div className="text-center">
                          <div className="text-green-400 font-mono">{setup.watchZones.entry}</div>
                          <div className="text-xs text-gray-400">Entry Zone</div>
                        </div>
                      )}
                      {setup.watchZones.invalidation && (
                        <div className="text-center">
                          <div className="text-red-400 font-mono">{setup.watchZones.invalidation}</div>
                          <div className="text-xs text-gray-400">Invalidation</div>
                        </div>
                      )}
                      {setup.watchZones.target && (
                        <div className="text-center">
                          <div className="text-yellow-400 font-mono">{setup.watchZones.target}</div>
                          <div className="text-xs text-gray-400">Target</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
                  <h5 className="font-medium text-blue-400 mb-1 flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    Educational Note
                  </h5>
                  <p className="text-blue-200 text-xs leading-relaxed">
                    {setup.educationalNote}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                  <span>Confidence: {setup.confidenceLevel}%</span>
                  <span>{new Date(setup.timestamp).toLocaleTimeString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Premium Upsell for Free Users */}
      {!isPremium && scanResult && scanResult.setupsFound > 2 && (
        <Card className="glass-card border-yellow-500/20 bg-gradient-to-r from-yellow-900/10 to-orange-900/10">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-400">
                {scanResult.setupsFound - 2} More Setups Available
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Upgrade to Premium to see all market setups, get real-time scanning, and unlock advanced analysis features.
            </p>
            <Button
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              onClick={() => window.location.href = '/pricing'}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {scanResult && filteredSetups.length === 0 && (
        <div className="text-center py-12">
          <Eye className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No setups found for current filter
          </h3>
          <p className="text-gray-500">
            Try adjusting your filter or wait for the next market scan
          </p>
        </div>
      )}

      {!scanResult && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Ready to scan the markets
          </h3>
          <p className="text-gray-500">
            Click "Scan Market Setups" to discover trading opportunities
          </p>
        </div>
      )}
    </div>
  );
};

export default AISetupScanner;