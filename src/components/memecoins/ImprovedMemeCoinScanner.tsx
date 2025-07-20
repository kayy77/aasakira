
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

      // Get live meme coins
      const scannedCoins = await liveMemeCoinService.scanLiveMemecOins();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      if (scannedCoins && scannedCoins.length > 0) {
        setCoins(scannedCoins);
        toast({
          title: "Scan Complete!",
          description: `Found ${scannedCoins.length} promising meme coins`,
        });
      } else {
        toast({
          title: "No Coins Found",
          description: "No promising meme coins found in current scan",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Scan Failed",
        description: "Unable to scan for meme coins. Please try again.",
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
          {coins.map((coin, index) => (
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
                    <p className="text-gray-400 text-sm mt-1">
                      Contract: {coin.contract?.slice(0, 10)}...{coin.contract?.slice(-6)}
                    </p>
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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                    <div className="text-sm text-gray-400">Holders</div>
                    <div className="font-semibold text-white">
                      {coin.holders?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-400">Age</div>
                    <div className="font-semibold text-white">
                      {coin.age || 'New'}
                    </div>
                  </div>
                </div>

                {/* Opportunity Score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Opportunity Score</span>
                    <Badge className={`${
                      coin.score >= 80 ? 'bg-green-500/20 text-green-400' :
                      coin.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {coin.score}/100
                    </Badge>
                  </div>
                  <Progress 
                    value={coin.score} 
                    className={`w-full ${
                      coin.score >= 80 ? 'text-green-400' :
                      coin.score >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}
                  />
                </div>

                {/* Signals */}
                {coin.signals && coin.signals.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-400 mb-2">Key Signals</div>
                    <div className="flex flex-wrap gap-2">
                      {coin.signals.slice(0, 3).map((signal, idx) => (
                        <Badge key={idx} variant="outline" className="border-purple-500/30 text-purple-400">
                          {signal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

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
          ))}
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
