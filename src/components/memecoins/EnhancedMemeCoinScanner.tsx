
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  Brain,
  Target,
  AlertTriangle,
  Zap,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { realMemeCoinService, RealMemeCoin } from '@/services/realMemeCoinService';

const EnhancedMemeCoinScanner = () => {
  const [coins, setCoins] = useState<RealMemeCoin[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const { toast } = useToast();

  const performRealScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      toast({
        title: "🧠 AI-Powered Scan Initiated",
        description: "Analyzing real market data with Groq AI...",
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const opportunities = await realMemeCoinService.scanRealOpportunities();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setCoins(opportunities);
      
      toast({
        title: `🎯 Found ${opportunities.length} Real Opportunities`,
        description: "AI-analyzed meme coins with high potential",
      });
      
    } catch (error) {
      toast({
        title: "Scan Error",
        description: "Using cached data with AI analysis",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500/20 text-green-400';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400';
      case 'HIGH': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  useEffect(() => {
    performRealScan();
  }, []);

  return (
    <div className="space-y-6">
      {/* Scanner Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              AI-Powered Meme Coin Scanner
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500">
                GROQ ENHANCED
              </Badge>
            </div>
            <Button
              onClick={performRealScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'AI Scanning...' : 'Deep Scan'}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {isScanning && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Analyzing market data...</span>
                <span className="text-purple-400">{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Opportunities Grid */}
      <div className="grid gap-4">
        {coins.map((coin) => (
          <Card key={coin.id} className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Coin Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {coin.symbol.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{coin.name}</h3>
                      <Badge className="bg-purple-500/20 text-purple-400">
                        ${coin.symbol}
                      </Badge>
                    </div>
                    <p className="text-gray-400">${coin.price.toFixed(8)}</p>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">AI Score</span>
                    <span className={`font-bold text-xl ${getScoreColor(coin.groqAnalysis.score)}`}>
                      {coin.groqAnalysis.score}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Risk Level</span>
                    <Badge className={getRiskColor(coin.groqAnalysis.riskLevel)}>
                      {coin.groqAnalysis.riskLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Recommendation</span>
                    <Badge className={
                      coin.groqAnalysis.recommendation === 'BUY' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }>
                      {coin.groqAnalysis.recommendation}
                    </Badge>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Market Cap</div>
                    <div className="text-white font-medium">
                      ${(coin.marketCap / 1000000).toFixed(2)}M
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">24h Change</div>
                    <div className={`font-medium ${coin.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.priceChange24h >= 0 ? '+' : ''}{coin.priceChange24h.toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Volume 24h</div>
                    <div className="text-white font-medium">
                      ${(coin.volume24h / 1000).toFixed(0)}K
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Liquidity</div>
                    <div className="text-white font-medium">
                      ${(coin.liquidity / 1000).toFixed(0)}K
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-blue-500"
                  >
                    <Target className="w-4 h-4 mr-1" />
                    Track
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-purple-500/30"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Trade
                  </Button>
                </div>
              </div>

              {/* AI Analysis Details */}
              <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-semibold">AI Analysis</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{coin.groqAnalysis.reasoning}</p>
                <p className="text-xs text-blue-300 italic">{coin.groqAnalysis.opportunity}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!isScanning && coins.length === 0 && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white mb-2">No Opportunities Found</h3>
            <p className="text-gray-400 mb-4">AI analysis didn't find any high-potential opportunities right now.</p>
            <Button onClick={performRealScan} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Zap className="w-4 h-4 mr-2" />
              Run Deep Scan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedMemeCoinScanner;
