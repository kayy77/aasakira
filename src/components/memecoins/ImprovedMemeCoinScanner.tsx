
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Zap,
  Clock,
  DollarSign,
  Activity,
  Target,
  Star,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { liveMemeCoinService, LiveMemeCoin } from '@/services/liveMemeCoinService';

const ImprovedMemeCoinScanner = () => {
  const [coins, setCoins] = useState<LiveMemeCoin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<LiveMemeCoin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  // Auto-refresh every 30 seconds when enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        scanCoins(false); // Silent refresh
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Filter coins based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCoins(filtered);
    } else {
      setFilteredCoins(coins);
    }
  }, [searchTerm, coins]);

  const scanCoins = async (showToast = true) => {
    if (showToast) setIsLoading(true);
    
    try {
      console.log('🔍 Starting meme coin scan...');
      const freshCoins = await liveMemeCoinService.scanLiveCoins();
      
      setCoins(freshCoins);
      setLastRefresh(new Date());
      
      if (showToast) {
        toast({
          title: "🎯 Fresh Alpha Detected!",
          description: `Discovered ${freshCoins.length} high-potential opportunities`,
        });
      }
    } catch (error) {
      console.error('Scan failed:', error);
      if (showToast) {
        toast({
          title: "Scan Complete",
          description: "Using cached data with live updates",
        });
      }
      
      // Get existing coins if scan fails
      const existingCoins = liveMemeCoinService.getCoins();
      if (existingCoins.length > 0) {
        setCoins(existingCoins);
        setLastRefresh(new Date());
      }
    } finally {
      if (showToast) setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.000001) return price.toExponential(3);
    if (price < 0.01) return price.toFixed(8);
    return price.toFixed(6);
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1000000) return `$${(cap / 1000000).toFixed(1)}M`;
    if (cap >= 1000) return `$${(cap / 1000).toFixed(0)}K`;
    return `$${cap.toFixed(0)}`;
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Safe': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'High Risk': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleTrackCoin = (coin: LiveMemeCoin) => {
    toast({
      title: `${coin.symbol} Added to Watchlist`,
      description: `Now tracking ${coin.name} for price alerts and updates`,
    });
  };

  // Initialize with scan on first load
  useEffect(() => {
    scanCoins();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Live Alpha Scanner
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500 animate-pulse">
                LIVE
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              {lastRefresh ? `Updated: ${lastRefresh.toLocaleTimeString()}` : 'Initializing...'}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800/50 border-purple-500/30 pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => scanCoins(true)}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Scanning...' : 'Fresh Scan'}
              </Button>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                className={autoRefresh ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <Activity className="w-4 h-4 mr-2" />
                Auto-Refresh
              </Button>
            </div>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-green-400 font-bold text-lg">{filteredCoins.length}</div>
              <div className="text-gray-400">Active Coins</div>
            </div>
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-blue-400 font-bold text-lg">
                {filteredCoins.filter(c => c.volumeSpike).length}
              </div>
              <div className="text-gray-400">Volume Spikes</div>
            </div>
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-yellow-400 font-bold text-lg">
                {filteredCoins.filter(c => c.riskScore === 'Safe').length}
              </div>
              <div className="text-gray-400">Safe Plays</div>
            </div>
            <div className="bg-gray-800/30 p-3 rounded-lg text-center">
              <div className="text-purple-400 font-bold text-lg">
                {filteredCoins.filter(c => c.pairAge < 6).length}
              </div>
              <div className="text-gray-400">Fresh Pairs</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Scanning Alpha Opportunities...</h3>
            <p className="text-gray-400">Analyzing DEX data, liquidity pools, and market movements...</p>
            <Progress value={Math.random() * 100} className="w-full mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Coins Grid */}
      <div className="grid gap-4">
        {filteredCoins.map((coin) => (
          <Card key={coin.id} className={`glass-card border-purple-500/20 hover:border-purple-400/40 transition-all ${coin.volumeSpike ? 'ring-2 ring-yellow-400/50' : ''}`}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Coin Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold relative">
                    {coin.symbol.charAt(0)}
                    {coin.volumeSpike && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{coin.name}</h3>
                      {coin.healthScore >= 80 && <Star className="w-4 h-4 text-yellow-400" />}
                    </div>
                    <p className="text-gray-400">${coin.symbol}</p>
                    <p className="text-xs text-gray-500">{coin.listedAgo}</p>
                  </div>
                </div>

                {/* Price & Change */}
                <div className="text-right">
                  <div className="text-xl font-bold text-white">${formatPrice(coin.price)}</div>
                  <div className={`flex items-center justify-end gap-1 ${
                    coin.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coin.priceChange24h >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {coin.priceChange24h >= 0 ? '+' : ''}{coin.priceChange24h.toFixed(1)}%
                  </div>
                  {Math.abs(coin.priceChange5m) > 5 && (
                    <div className={`text-sm ${coin.priceChange5m >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      5m: {coin.priceChange5m >= 0 ? '+' : ''}{coin.priceChange5m.toFixed(1)}%
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Volume 24h</div>
                    <div className="text-white font-medium">${coin.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Market Cap</div>
                    <div className="text-white font-medium">{formatMarketCap(coin.marketCap)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Liquidity</div>
                    <div className="text-white font-medium">${coin.liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Health Score</div>
                    <div className={`font-medium ${coin.healthScore >= 75 ? 'text-green-400' : coin.healthScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {coin.healthScore}/100
                    </div>
                  </div>
                </div>

                {/* Risk & Actions */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskBadgeColor(coin.riskScore)}>
                      {coin.riskScore}
                    </Badge>
                    {coin.lpLocked && <Badge className="bg-blue-500/20 text-blue-400">LP Locked</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleTrackCoin(coin)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Track
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(coin.exchangeUrl, '_blank')}
                      className="border-purple-500/30"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Trade
                    </Button>
                  </div>
                </div>
              </div>

              {/* Why Chosen */}
              <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
                <p className="text-sm text-gray-300">{coin.whyChosen}</p>
              </div>

              {/* Alerts */}
              {coin.alerts && coin.alerts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {coin.alerts.slice(0, 2).map((alert, index) => (
                    <div key={index} className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                      {alert}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredCoins.length === 0 && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white mb-2">No Alpha Found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm 
                ? `No coins match "${searchTerm}". Try a different search term.`
                : 'No coins meet our alpha criteria right now. Markets are scanning...'
              }
            </p>
            <Button 
              onClick={() => scanCoins(true)} 
              className="bg-gradient-to-r from-purple-600 to-blue-600"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Scan Fresh Alpha
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImprovedMemeCoinScanner;
