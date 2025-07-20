
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Volume2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { liveMemeCoinService, LiveMemeCoin } from '@/services/liveMemeCoinService';
import { useToast } from '@/hooks/use-toast';

const ImprovedMemeCoinScanner = () => {
  const [coins, setCoins] = useState<LiveMemeCoin[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  const handleScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('🔍 Starting meme coin scan...');
      const scannedCoins = await liveMemeCoinService.scanLiveCoins();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      console.log('📊 Scan results:', scannedCoins);
      
      if (scannedCoins && scannedCoins.length > 0) {
        setCoins(scannedCoins);
        toast({
          title: "Scan Complete!",
          description: `Found ${scannedCoins.length} promising meme coins`,
        });
      } else {
        console.log('⚠️ No coins returned from scan, using fallback');
        // Use sample data if API fails
        const sampleCoins: LiveMemeCoin[] = [
          {
            id: '1',
            name: 'PEPE',
            symbol: 'PEPE',
            price: 0.00000123,
            price_change_24h: 15.6,
            market_cap: 1250000,
            volume_24h: 850000,
            last_updated: new Date().toISOString(),
            priceChange5m: 2.3
          },
          {
            id: '2', 
            name: 'SHIB',
            symbol: 'SHIB',
            price: 0.0000089,
            price_change_24h: -3.2,
            market_cap: 5600000,
            volume_24h: 2300000,
            last_updated: new Date().toISOString(),
            priceChange5m: -0.8
          }
        ];
        setCoins(sampleCoins);
        toast({
          title: "Sample Data Loaded",
          description: "API connection issue - showing sample data",
        });
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
      // Show sample coins on error
      const sampleCoins: LiveMemeCoin[] = [
        {
          id: '1',
          name: 'DOGE',
          symbol: 'DOGE',
          price: 0.08456,
          price_change_24h: 8.4,
          market_cap: 12400000,
          volume_24h: 4200000,
          last_updated: new Date().toISOString(),
          priceChange5m: 1.2
        }
      ];
      setCoins(sampleCoins);
      toast({
        title: "Connection Error",
        description: "Showing demo data while fixing live connection",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isScanning) {
        handleScan();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isScanning]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toExponential(2);
    return price.toFixed(6);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) return `$${(marketCap / 1000000).toFixed(1)}M`;
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}K`;
    return `$${marketCap.toFixed(0)}`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`;
    return `$${volume.toFixed(0)}`;
  };

  const calculateOpportunityScore = (coin: LiveMemeCoin) => {
    // Simple scoring algorithm
    let score = 50;
    if (coin.price_change_24h > 10) score += 20;
    if (coin.volume_24h > 1000000) score += 15;
    if (coin.market_cap < 10000000) score += 15; // Small cap bonus
    return Math.min(100, score);
  };

  return (
    <div className="space-y-6">
      {/* Scanner Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-400" />
              Live Meme Coin Scanner
            </div>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Scan for Gems
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {isScanning && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Scanning blockchain for high-potential meme coins...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results */}
      {coins.length > 0 && (
        <div className="grid gap-4">
          {coins.map((coin, index) => {
            const score = calculateOpportunityScore(coin);
            return (
              <Card key={`${coin.symbol}-${index}`} className="glass-card border-green-500/20 hover:border-green-500/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {coin.name}
                        <Badge className="bg-green-500/20 text-green-400">
                          {coin.symbol}
                        </Badge>
                      </h3>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        ${formatPrice(coin.price)}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        coin.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {coin.price_change_24h >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(coin.price_change_24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-400">Market Cap</div>
                      <div className="font-semibold text-white">
                        {formatMarketCap(coin.market_cap)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">24h Volume</div>
                      <div className="font-semibold text-white">
                        {formatVolume(coin.volume_24h)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-400">5m Change</div>
                      <div className={`font-semibold ${
                        (coin.priceChange5m || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(coin.priceChange5m || 0).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Opportunity Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Opportunity Score</span>
                      <Badge className={`${
                        score >= 80 ? 'bg-green-500/20 text-green-400' :
                        score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {score}/100
                      </Badge>
                    </div>
                    <Progress 
                      value={score} 
                      className={`w-full ${
                        score >= 80 ? 'text-green-400' :
                        score >= 60 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(coin.last_updated).toLocaleTimeString()}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-purple-500/30">
                        View Chart
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Track Coin
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {coins.length === 0 && !isScanning && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Scan</h3>
            <p className="text-gray-400 mb-6">
              Click "Scan for Gems" to discover high-potential meme coins
            </p>
            <Button
              onClick={handleScan}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImprovedMemeCoinScanner;
