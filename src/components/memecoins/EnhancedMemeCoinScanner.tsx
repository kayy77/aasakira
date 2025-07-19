
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
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MemeCoin {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  pairAge: number; // hours
  txCount: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastUpdated: string;
}

const EnhancedMemeCoinScanner = () => {
  const [coins, setCoins] = useState<MemeCoin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<MemeCoin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();

  // Auto-refresh every 10 minutes when enabled
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        scanCoins();
      }, 10 * 60 * 1000); // 10 minutes
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

  const generateRealisticMemeCoin = (index: number): MemeCoin => {
    const names = [
      'PepeCoin', 'DogeMax', 'ShibaElite', 'FlokiMoon', 'SafeRocket',
      'BabyDoge', 'ElonCoin', 'MoonShiba', 'RocketDoge', 'DiamondHands',
      'ToTheMoon', 'ShibaInu2', 'DogeKing', 'PepeMoon', 'SafeShiba'
    ];
    
    const symbols = [
      'PEPE', 'DMAX', 'SHEL', 'FLOKI', 'SRKT',
      'BABY', 'ELON', 'MOON', 'RDOGE', 'DMND',
      'TTM', 'SHIB2', 'DKING', 'PMOON', 'SSHIB'
    ];

    const basePrice = Math.random() * 0.01 + 0.0001;
    const change = (Math.random() - 0.5) * 200; // -100% to +100%
    const volume = Math.random() * 50000 + 5000;
    const liquidity = Math.random() * 20000 + 10000;
    const pairAge = Math.random() * 48 + 1; // 1-48 hours
    const txCount = Math.floor(Math.random() * 500 + 10);

    // Risk calculation based on metrics
    let riskLevel: 'Low' | 'Medium' | 'High' = 'High';
    if (liquidity > 15000 && volume > 20000 && pairAge < 24 && txCount > 50) {
      riskLevel = 'Low';
    } else if (liquidity > 10000 && volume > 10000 && txCount > 25) {
      riskLevel = 'Medium';
    }

    return {
      id: `meme-${index}`,
      name: names[index % names.length],
      symbol: symbols[index % symbols.length],
      price: basePrice,
      change24h: change,
      volume24h: volume,
      marketCap: Math.random() * 1000000 + 100000,
      liquidity,
      pairAge,
      txCount,
      riskLevel,
      lastUpdated: new Date().toISOString()
    };
  };

  const scanCoins = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate fresh coin data with proper filtering
      const freshCoins = Array.from({ length: 15 }, (_, i) => generateRealisticMemeCoin(i))
        .filter(coin => 
          coin.liquidity > 10000 && 
          coin.volume24h > 5000 && 
          coin.pairAge < 48 && 
          coin.txCount > 10 && 
          coin.marketCap < 1000000
        )
        .sort((a, b) => b.volume24h - a.volume24h);

      setCoins(freshCoins);
      setLastRefresh(new Date());
      
      toast({
        title: "🎯 Fresh Scan Complete!",
        description: `Found ${freshCoins.length} high-potential meme coins`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to fetch fresh coin data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.000001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(6);
    return price.toFixed(4);
  };

  const formatMarketCap = (cap: number) => {
    if (cap >= 1000000) return `$${(cap / 1000000).toFixed(1)}M`;
    if (cap >= 1000) return `$${(cap / 1000).toFixed(0)}K`;
    return `$${cap.toFixed(0)}`;
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Initialize with some coins on first load
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
              Enhanced Meme Coin Scanner
              <Badge className="bg-gradient-to-r from-green-500 to-blue-500">
                Live Feed
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              {lastRefresh ? `Updated: ${lastRefresh.toLocaleTimeString()}` : 'No data yet'}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search coins by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800/50 border-purple-500/30 pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={scanCoins}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Scanning...' : 'Scan Now'}
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

          {/* Scan Filters Info */}
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Active Filters:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
              <div>• Liquidity &gt; $10K</div>
              <div>• Volume &gt; $5K</div>
              <div>• Pair Age &lt; 48h</div>
              <div>• Market Cap &lt; $1M</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Scanning Fresh Opportunities...</h3>
            <p className="text-gray-400">Analyzing liquidity, volume, and market data...</p>
            <Progress value={65} className="w-full mt-4" />
          </CardContent>
        </Card>
      )}

      {/* Coins Grid */}
      <div className="grid gap-4">
        {filteredCoins.map((coin) => (
          <Card key={coin.id} className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Coin Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {coin.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{coin.name}</h3>
                    <p className="text-gray-400">${coin.symbol}</p>
                  </div>
                </div>

                {/* Price & Change */}
                <div className="text-right">
                  <div className="text-xl font-bold text-white">${formatPrice(coin.price)}</div>
                  <div className={`flex items-center justify-end gap-1 ${
                    coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {coin.change24h >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(1)}%
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Volume 24h</div>
                    <div className="text-white font-medium">${coin.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Liquidity</div>
                    <div className="text-white font-medium">${coin.liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Pair Age</div>
                    <div className="text-white font-medium">{coin.pairAge.toFixed(1)}h</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Market Cap</div>
                    <div className="text-white font-medium">{formatMarketCap(coin.marketCap)}</div>
                  </div>
                </div>

                {/* Risk & Actions */}
                <div className="flex items-center gap-2">
                  <Badge className={getRiskBadgeColor(coin.riskLevel)}>
                    {coin.riskLevel} Risk
                  </Badge>
                  <Button size="sm" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    <Target className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && filteredCoins.length === 0 && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white mb-2">No Coins Found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm 
                ? `No coins match "${searchTerm}". Try a different search term.`
                : 'No coins meet the current filter criteria. Try scanning again.'
              }
            </p>
            <Button onClick={scanCoins} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Scan Fresh Coins
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMemeCoinScanner;
