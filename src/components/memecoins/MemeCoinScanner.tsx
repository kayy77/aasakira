
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Zap,
  ExternalLink,
  Activity,
  DollarSign,
  Clock,
  BarChart3,
  Users,
  Loader,
  Settings,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { memeCoinsService, TokenMetrics, RiskProfile } from '@/services/memeCoinsService';
import { TokenCard } from './TokenCard';
import { RiskProfileCard } from './RiskProfileCard';

const MemeCoinScanner = () => {
  const [tokens, setTokens] = useState<{ [key: string]: TokenMetrics[] }>({});
  const [isScanning, setIsScanning] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([]);
  const [useRelaxedFilters, setUseRelaxedFilters] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setRiskProfiles(memeCoinsService.getRiskProfiles());
    handleScan(); // Initial scan
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    
    try {
      // Set debug mode
      memeCoinsService.setDebugMode(debugMode);
      
      toast({
        title: "🔍 Scanning Meme Coins",
        description: `Analyzing tokens with ${useRelaxedFilters ? 'relaxed' : 'strict'} filters...`,
      });

      const results = await memeCoinsService.scanMemeCoins(useRelaxedFilters);
      setTokens(results);

      const totalFound = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
      
      if (totalFound === 0) {
        toast({
          title: "⚠️ No Opportunities Found",
          description: useRelaxedFilters 
            ? "Market conditions may be unfavorable. Try again later."
            : "Try enabling relaxed filters to discover more opportunities.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "✅ Scan Complete!",
          description: `Found ${totalFound} opportunities across all risk levels`,
        });
      }
    } catch (error) {
      toast({
        title: "Scan Error",
        description: "Failed to scan meme coins. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskIcon = (riskName: string) => {
    switch (riskName) {
      case 'Low Risk': return Shield;
      case 'Medium Risk': return TrendingUp;
      case 'High Risk': return Zap;
      default: return AlertTriangle;
    }
  };

  const getRiskColor = (riskName: string) => {
    switch (riskName) {
      case 'Low Risk': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium Risk': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'High Risk': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredTokens = selectedRisk ? { [selectedRisk]: tokens[selectedRisk] || [] } : tokens;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Meme Coin Scanner
          </h1>
          <p className="text-gray-400">
            Discover high-potential meme coins with AI-powered risk analysis
          </p>
        </div>
        <Button 
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover-lift cyber-glow"
          onClick={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Scan Now
            </>
          )}
        </Button>
      </div>

      {/* Scanner Controls */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Scanner Settings</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Relaxed Filters Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white">Relaxed Filters</label>
              <p className="text-xs text-gray-400">
                Use broader criteria to find more opportunities when market is quiet
              </p>
            </div>
            <Switch
              checked={useRelaxedFilters}
              onCheckedChange={setUseRelaxedFilters}
            />
          </div>

          {/* Debug Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white">Debug Mode</label>
              <p className="text-xs text-gray-400">
                Show detailed filtering logs in console for troubleshooting
              </p>
            </div>
            <Switch
              checked={debugMode}
              onCheckedChange={setDebugMode}
            />
          </div>
        </div>

        {/* Info Alert */}
        {useRelaxedFilters && (
          <Alert className="mt-4 border-yellow-500/30 bg-yellow-500/10">
            <Info className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              <strong>Relaxed Mode Active:</strong> Using broader criteria to discover more opportunities. 
              Results may include tokens with higher risk profiles.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Risk Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {riskProfiles.map((profile) => (
          <RiskProfileCard 
            key={profile.name}
            profile={profile}
            tokenCount={tokens[profile.name]?.length || 0}
            isSelected={selectedRisk === profile.name}
            onClick={() => setSelectedRisk(selectedRisk === profile.name ? null : profile.name)}
          />
        ))}
      </div>

      {/* Filter Controls */}
      {selectedRisk && (
        <div className="flex items-center justify-between glass-card p-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Filtering by:</span>
            <Badge className={getRiskColor(selectedRisk)}>
              {selectedRisk}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedRisk(null)}
          >
            Clear Filter
          </Button>
        </div>
      )}

      {/* Scanning Status */}
      {isScanning && (
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <Activity className="h-4 w-4 text-blue-400 animate-pulse" />
          <AlertDescription className="text-blue-300">
            <strong>Multi-API Scanning:</strong> Analyzing DexScreener, GeckoTerminal, and other premium data sources with {useRelaxedFilters ? 'relaxed' : 'strict'} filters...
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <div className="space-y-8">
        {Object.entries(filteredTokens).map(([riskLevel, tokenList]) => {
          if (tokenList.length === 0) return null;
          
          const Icon = getRiskIcon(riskLevel);
          
          return (
            <div key={riskLevel} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${getRiskColor(riskLevel)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{riskLevel} Opportunities</h2>
                    <p className="text-gray-400">
                      {riskProfiles.find(p => p.name === riskLevel)?.expectedReturn || 'Variable returns'}
                    </p>
                  </div>
                </div>
                <Badge className="bg-white/10 text-white border-white/20">
                  {tokenList.length} found
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {tokenList.slice(0, 12).map((token) => (
                  <TokenCard key={token.address} token={token} riskLevel={riskLevel} />
                ))}
              </div>
              
              {tokenList.length > 12 && (
                <div className="text-center">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Load More ({tokenList.length - 12} remaining)
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {!isScanning && Object.values(filteredTokens).every(arr => arr.length === 0) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Opportunities Found</h3>
          <p className="text-gray-400 mb-4">
            {useRelaxedFilters 
              ? "Market conditions may be unfavorable right now. Consider trying again later."
              : "Your filters are quite strict. Try enabling relaxed filters or scan again later."
            }
          </p>
          <div className="flex items-center justify-center space-x-3">
            <Button onClick={handleScan} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Scan Again
            </Button>
            {!useRelaxedFilters && (
              <Button 
                onClick={() => {
                  setUseRelaxedFilters(true);
                  setTimeout(handleScan, 100);
                }}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Try Relaxed Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemeCoinScanner;
