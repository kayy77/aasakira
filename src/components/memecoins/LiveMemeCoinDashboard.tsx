
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { liveMemeCoinService, LiveMemeCoin } from '@/services/liveMemeCoinService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Clock,
  DollarSign,
  Shield,
  Target,
  ExternalLink,
  HelpCircle,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LiveMemeCoinDashboard: React.FC = () => {
  const [coins, setCoins] = useState<LiveMemeCoin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<LiveMemeCoin[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<LiveMemeCoin | null>(null);
  const { toast } = useToast();

  const scanCoins = async () => {
    setIsScanning(true);
    
    try {
      const newCoins = await liveMemeCoinService.scanLiveCoins();
      setCoins(newCoins);
      setLastScan(new Date());
      
      toast({
        title: "🎯 Fresh Scan Complete",
        description: `Found ${newCoins.length} high-potential meme coins`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to fetch live coin data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Filter coins based on search and risk
  useEffect(() => {
    let filtered = coins;
    
    if (searchTerm) {
      filtered = filtered.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (riskFilter !== 'All') {
      filtered = filtered.filter(coin => coin.riskScore === riskFilter);
    }
    
    setFilteredCoins(filtered);
  }, [coins, searchTerm, riskFilter]);

  // Auto-update prices
  useEffect(() => {
    const interval = setInterval(() => {
      if (coins.length > 0) {
        setCoins([...liveMemeCoinService.getCoins()]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [coins.length]);

  const MiniChart: React.FC<{ data: number[] }> = ({ data }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className="flex items-end h-8 gap-0.5">
        {data.map((value, index) => {
          const height = range > 0 ? ((value - min) / range) * 100 : 50;
          return (
            <div
              key={index}
              className="bg-green-400 w-1 opacity-60"
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Live Meme Coin Scanner</h2>
                <p className="text-sm text-gray-400">High-quality opportunities with live price feeds</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastScan && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {lastScan.toLocaleTimeString()}
                </div>
              )}
              <Button
                onClick={scanCoins}
                disabled={isScanning}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Scan Live Coins
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search coins by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Low', 'Medium', 'High'].map((risk) => (
                <Button
                  key={risk}
                  variant={riskFilter === risk ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRiskFilter(risk as any)}
                  className={riskFilter === risk ? "bg-purple-600" : "border-gray-600"}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  {risk} Risk
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Coins Grid */}
      <div className="grid gap-4">
        <AnimatePresence>
          {filteredCoins.map((coin, index) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Coin Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {coin.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{coin.name}</h3>
                          <Badge className="bg-gray-500/20 text-gray-400 border-0">
                            ${coin.symbol}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{coin.listedAgo}</p>
                      </div>
                    </div>

                    {/* Price & Change */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        ${coin.price.toFixed(coin.price < 0.01 ? 8 : 4)}
                      </div>
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
                    </div>

                    {/* Mini Chart */}
                    <div className="w-24">
                      <MiniChart data={coin.miniChart} />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Volume 24h</div>
                        <div className="text-white font-medium">
                          ${coin.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Liquidity</div>
                        <div className="text-white font-medium">
                          ${coin.liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Market Cap</div>
                        <div className="text-white font-medium">
                          ${(coin.marketCap / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>

                    {/* Risk & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          coin.riskScore === 'Low' ? 'bg-green-500/20 text-green-400' :
                          coin.riskScore === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        } border-0`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {coin.riskScore}
                        </Badge>
                        {coin.lpLocked && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-0">
                            LP Locked
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {coin.lastUpdated}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedCoin(coin)}
                          className="border-blue-500/30 hover:bg-blue-500/20"
                        >
                          <HelpCircle className="w-3 h-3 mr-1" />
                          Why?
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          onClick={() => window.open(coin.exchangeUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {coin.exchangeName}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Coin Explanation Modal */}
      {selectedCoin && (
        <Alert className="border-purple-500/30 bg-purple-500/10">
          <Brain className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">Why {selectedCoin.name} Was Selected</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCoin(null)}
                  className="text-purple-400 hover:bg-purple-500/20"
                >
                  ✕
                </Button>
              </div>
              <p className="text-sm">{selectedCoin.whyChosen}</p>
              
              <div className="flex items-center gap-4 text-xs">
                <span>💰 Volume: ${selectedCoin.volume24h.toLocaleString()}</span>
                <span>🏊 Liquidity: ${selectedCoin.liquidity.toLocaleString()}</span>
                <span>📈 Change: {selectedCoin.priceChange24h.toFixed(1)}%</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {filteredCoins.length === 0 && !isScanning && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {coins.length === 0 ? 'No Coins Scanned Yet' : 'No Coins Found'}
            </h3>
            <p className="text-gray-400 mb-4">
              {coins.length === 0 
                ? 'Start scanning to discover high-potential meme coins'
                : 'Try adjusting your search or risk filter settings'
              }
            </p>
            {coins.length === 0 && (
              <Button
                onClick={scanCoins}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Scanning
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveMemeCoinDashboard;
