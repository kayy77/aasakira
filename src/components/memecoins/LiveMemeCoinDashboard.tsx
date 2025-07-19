
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { liveMemeCoinService, LiveMemeCoin } from '@/services/liveMemeCoinService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Clock,
  Shield,
  Target,
  ExternalLink,
  AlertTriangle,
  Activity,
  Brain,
  Bell,
  Eye,
  Flame
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LiveMemeCoinDashboard: React.FC = () => {
  const [coins, setCoins] = useState<LiveMemeCoin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<LiveMemeCoin[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Safe' | 'Medium' | 'High Risk'>('All');
  const [minAge, setMinAge] = useState<number>(0);
  const [maxAge, setMaxAge] = useState<number>(24);
  const [minMcap, setMinMcap] = useState<number>(0);
  const [maxMcap, setMaxMcap] = useState<number>(5000000);
  const [showRugRisk, setShowRugRisk] = useState<boolean>(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<LiveMemeCoin | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const { toast } = useToast();

  const scanCoins = async () => {
    setIsScanning(true);
    
    try {
      const newCoins = await liveMemeCoinService.scanLiveCoins();
      setCoins(newCoins);
      setLastScan(new Date());
      
      toast({
        title: "🎯 Alpha Scan Complete",
        description: `Found ${newCoins.length} high-potential opportunities`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "Unable to fetch live alpha data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Filter coins based on all criteria
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
    
    // Age filter
    filtered = filtered.filter(coin => 
      coin.pairAge >= minAge && coin.pairAge <= maxAge
    );
    
    // Market cap filter
    filtered = filtered.filter(coin => 
      coin.marketCap >= minMcap && coin.marketCap <= maxMcap
    );
    
    // Rug risk filter
    if (!showRugRisk) {
      filtered = filtered.filter(coin => !coin.rugRisk);
    }
    
    setFilteredCoins(filtered);
  }, [coins, searchTerm, riskFilter, minAge, maxAge, minMcap, maxMcap, showRugRisk]);

  // Auto-update prices and check alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (coins.length > 0) {
        const updatedCoins = liveMemeCoinService.getCoins();
        setCoins([...updatedCoins]);
        
        // Check for new alerts
        const newAlerts = liveMemeCoinService.getAlerts();
        if (newAlerts.length > alerts.length) {
          setAlerts(newAlerts);
          // Show toast for new alerts
          const latestAlert = newAlerts[0];
          if (latestAlert && !alerts.includes(latestAlert)) {
            toast({
              title: "🚨 Alert",
              description: latestAlert,
              duration: 5000,
            });
          }
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [coins.length, alerts, toast]);

  const HealthScoreBar: React.FC<{ score: number; riskScore: string }> = ({ score, riskScore }) => (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            score >= 75 ? 'bg-green-500' : 
            score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-gray-400">{score}/100</span>
    </div>
  );

  const MiniChart: React.FC<{ data: number[]; volumeSpike: boolean }> = ({ data, volumeSpike }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className={`flex items-end h-8 gap-0.5 ${volumeSpike ? 'animate-pulse' : ''}`}>
        {data.map((value, index) => {
          const height = range > 0 ? ((value - min) / range) * 100 : 50;
          return (
            <div
              key={index}
              className={`w-1 opacity-80 ${
                volumeSpike ? 'bg-yellow-400' : 'bg-green-400'
              }`}
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
                <h2 className="text-xl font-bold text-white">Alpha Meme Coin Scanner</h2>
                <p className="text-sm text-gray-400">Live price feeds • Real-time health scoring • Volume spike alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastScan && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {lastScan.toLocaleTimeString()}
                </div>
              )}
              <Badge className="bg-green-500/20 text-green-400 animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
              <Button
                onClick={scanCoins}
                disabled={isScanning}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Scanning Alpha...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Scan Alpha
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Risk Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search alpha opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div className="flex gap-2">
              {['All', 'Safe', 'Medium', 'High Risk'].map((risk) => (
                <Button
                  key={risk}
                  variant={riskFilter === risk ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRiskFilter(risk as any)}
                  className={riskFilter === risk ? "bg-purple-600" : "border-gray-600"}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  {risk}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-800/30 rounded-lg">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Pair Age (hours)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="bg-gray-700 border-gray-600 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="bg-gray-700 border-gray-600 text-xs"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Market Cap ($)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minMcap}
                  onChange={(e) => setMinMcap(Number(e.target.value))}
                  className="bg-gray-700 border-gray-600 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxMcap}
                  onChange={(e) => setMaxMcap(Number(e.target.value))}
                  className="bg-gray-700 border-gray-600 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={showRugRisk}
                onCheckedChange={setShowRugRisk}
              />
              <label className="text-xs text-gray-400">Show Rug Risk</label>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Bell className="w-3 h-3" />
              {alerts.length} Active Alerts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Alerts */}
      {alerts.length > 0 && (
        <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-yellow-400 animate-bounce" />
              <span className="text-sm font-medium text-yellow-400">Live Alerts</span>
            </div>
            <div className="space-y-1">
              {alerts.slice(0, 3).map((alert, index) => (
                <div key={index} className="text-xs text-yellow-300">{alert}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alpha Opportunities Grid */}
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
              <Card className={`glass-card transition-all ${
                coin.volumeSpike 
                  ? 'border-yellow-400/40 bg-yellow-500/5 animate-pulse' 
                  : 'border-purple-500/20 hover:border-purple-400/40'
              }`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Coin Info with Health Score */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {coin.symbol.charAt(0)}
                        </div>
                        {coin.volumeSpike && (
                          <Flame className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-bounce" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{coin.name}</h3>
                          <Badge className="bg-gray-500/20 text-gray-400 border-0">
                            ${coin.symbol}
                          </Badge>
                          {coin.volumeSpike && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-0 animate-pulse">
                              <Flame className="w-3 h-3 mr-1" />
                              HOT
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{coin.listedAgo}</span>
                          <span>•</span>
                          <span>{coin.txCount1h} txns/1h</span>
                          <span>•</span>
                          <HealthScoreBar score={coin.healthScore} riskScore={coin.riskScore} />
                        </div>
                      </div>
                    </div>

                    {/* Price & Changes */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        ${coin.price.toFixed(coin.price < 0.01 ? 8 : 6)}
                      </div>
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <div className={`flex items-center gap-1 ${
                          coin.priceChange5m >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          5m: {coin.priceChange5m >= 0 ? '+' : ''}{coin.priceChange5m.toFixed(1)}%
                        </div>
                        <div className={`flex items-center gap-1 ${
                          coin.priceChange1h >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          1h: {coin.priceChange1h >= 0 ? '+' : ''}{coin.priceChange1h.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    {/* Mini Chart */}
                    <div className="w-24">
                      <MiniChart data={coin.miniChart} volumeSpike={coin.volumeSpike} />
                    </div>

                    {/* Key Metrics */}
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
                        <div className="text-gray-400">LP Locked</div>
                        <div className="text-white font-medium">
                          {coin.liquidityLocked.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Risk & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          coin.riskScore === 'Safe' ? 'bg-green-500/20 text-green-400' :
                          coin.riskScore === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        } border-0`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {coin.riskScore}
                        </Badge>
                        {coin.lpLocked && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-0">
                            LP 🔒
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Updated: {coin.lastUpdated}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedCoin(coin)}
                          className="border-blue-500/30 hover:bg-blue-500/20"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Alpha
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                          onClick={() => window.open(coin.exchangeUrl, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Trade
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

      {/* Alpha Explanation Modal */}
      {selectedCoin && (
        <Alert className="border-purple-500/30 bg-purple-500/10">
          <Brain className="h-4 w-4 text-purple-400" />
          <AlertDescription className="text-purple-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">Why {selectedCoin.name} is Alpha</h4>
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
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Health Score:</span>
                  <span className="ml-2 font-bold">{selectedCoin.healthScore}/100</span>
                </div>
                <div>
                  <span className="text-gray-400">LP Locked:</span>
                  <span className="ml-2 font-bold">{selectedCoin.liquidityLocked.toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-gray-400">TX Count (1h):</span>
                  <span className="ml-2 font-bold">{selectedCoin.txCount1h}</span>
                </div>
                <div>
                  <span className="text-gray-400">Pair Age:</span>
                  <span className="ml-2 font-bold">{selectedCoin.pairAge.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {filteredCoins.length === 0 && !isScanning && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {coins.length === 0 ? 'No Alpha Scanned Yet' : 'No Opportunities Match Filters'}
            </h3>
            <p className="text-gray-400 mb-4">
              {coins.length === 0 
                ? 'Start scanning to discover high-alpha meme coin opportunities'
                : 'Try adjusting your filters to find more opportunities'
              }
            </p>
            {coins.length === 0 && (
              <Button
                onClick={scanCoins}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                Start Alpha Hunt
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveMemeCoinDashboard;
