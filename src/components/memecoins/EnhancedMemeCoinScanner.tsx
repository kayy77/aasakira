import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  Zap, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Lock,
  Unlock,
  AlertTriangle,
  Brain,
  Bell,
  Crown,
  RefreshCw,
  Eye,
  DollarSign,
  Users,
  Activity,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedToken {
  address: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  riskScore: number;
  hypeScore: number;
  trendDirection: 'up' | 'down' | 'sideways';
  contractSafety: {
    renounced: boolean;
    lpLocked: boolean;
    maxWallet: number;
    buyTax: number;
    sellTax: number;
  };
  socialMetrics: {
    telegramMembers: number;
    twitterMentions: number;
    holderCount: number;
    buysLast15m: number;
    sellsLast15m: number;
  };
  aiVerdict: string;
  sparklineData: number[];
}

interface AlertSettings {
  marketCapMax: number;
  lpMinimum: number;
  buysPerHour: number;
}

const EnhancedTokenCard: React.FC<{ token: EnhancedToken; isPremium: boolean }> = ({ token, isPremium }) => {
  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-green-400 bg-green-500/20';
    if (score >= 40) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getHypeColor = (score: number) => {
    if (score >= 80) return 'text-purple-400 bg-purple-500/20';
    if (score >= 60) return 'text-blue-400 bg-blue-500/20';
    return 'text-gray-400 bg-gray-500/20';
  };

  return (
    <Card className="glass-card hover-glow border-2 border-purple-500/30 transition-all duration-300 hover:border-purple-500/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">${token.symbol}</h3>
            <p className="text-sm text-gray-400">{token.name}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getRiskColor(token.riskScore)}>
              🧪 {token.riskScore}%
            </Badge>
            <Badge className={getHypeColor(token.hypeScore)}>
              🚀 {token.hypeScore}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price & Chart */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-white">${token.price.toFixed(8)}</div>
            <div className={`text-sm font-medium ${
              token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
            </div>
          </div>
          <div className="w-20 h-10 bg-gray-800/50 rounded flex items-center justify-center">
            <div className="flex items-end gap-1">
              {token.sparklineData.slice(-8).map((point, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-t ${
                    point > 0 ? 'bg-green-400' : 'bg-red-400'
                  }`}
                  style={{ height: `${Math.abs(point) * 20 + 5}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Market Cap:</span>
            <div className="text-white font-medium">${token.marketCap.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-gray-400">Volume 24h:</span>
            <div className="text-white font-medium">${token.volume24h.toLocaleString()}</div>
          </div>
        </div>

        {/* Trading Activity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Buy Pressure (15m)</span>
            <div className="flex items-center gap-2">
              <span className="text-green-400">{token.socialMetrics.buysLast15m} 🟢</span>
              <span className="text-red-400">{token.socialMetrics.sellsLast15m} 🔴</span>
            </div>
          </div>
          <Progress 
            value={(token.socialMetrics.buysLast15m / (token.socialMetrics.buysLast15m + token.socialMetrics.sellsLast15m)) * 100} 
            className="h-2"
          />
        </div>

        {/* Contract Safety */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Safety</span>
          <div className="flex items-center gap-2">
            {token.contractSafety.renounced ? 
              <Lock className="w-4 h-4 text-green-400" /> : 
              <Unlock className="w-4 h-4 text-red-400" />
            }
            {token.contractSafety.lpLocked ? 
              <Shield className="w-4 h-4 text-green-400" /> : 
              <AlertTriangle className="w-4 h-4 text-red-400" />
            }
            <span className="text-gray-300">
              {token.contractSafety.buyTax + token.contractSafety.sellTax}% Tax
            </span>
          </div>
        </div>

        {/* Social Metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <Users className="w-4 h-4 text-blue-400 mx-auto" />
            <div className="text-white">{token.socialMetrics.holderCount}</div>
            <div className="text-gray-400">Holders</div>
          </div>
          <div className="text-center">
            <MessageSquare className="w-4 h-4 text-purple-400 mx-auto" />
            <div className="text-white">{token.socialMetrics.telegramMembers}</div>
            <div className="text-gray-400">TG Members</div>
          </div>
          <div className="text-center">
            <Activity className="w-4 h-4 text-green-400 mx-auto" />
            <div className="text-white">{token.socialMetrics.twitterMentions}</div>
            <div className="text-gray-400">Mentions</div>
          </div>
        </div>

        {/* AI Verdict */}
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Aasakira Verdict:</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {isPremium ? token.aiVerdict : 
              <span className="flex items-center gap-2 text-gray-500">
                <Lock className="w-4 h-4" />
                Unlock full AI analysis with premium
              </span>
            }
          </p>
        </div>

        {/* Action Button */}
        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Eye className="w-4 h-4 mr-2" />
          View on DEX
        </Button>
      </CardContent>
    </Card>
  );
};

const EnhancedMemeCoinScanner: React.FC = () => {
  const [tokens, setTokens] = useState<EnhancedToken[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    marketCapMax: 10000,
    lpMinimum: 1,
    buysPerHour: 20
  });
  const [showAlerts, setShowAlerts] = useState(false);
  const { toast } = useToast();

  // Mock data generator
  const generateMockTokens = (): EnhancedToken[] => {
    const symbols = ['PEPE2', 'FLOKI', 'SHIB2', 'DOGE2', 'MEME', 'WOJAK', 'CHAD', 'GIGACHAD'];
    const names = ['Pepe 2.0', 'Floki Mars', 'Shiba 2.0', 'Doge Universe', 'Meme Protocol', 'Wojak Finance', 'Chad Token', 'Giga Chad'];
    
    return symbols.map((symbol, i) => ({
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      symbol,
      name: names[i],
      price: Math.random() * 0.001,
      marketCap: Math.floor(Math.random() * 50000 + 5000),
      volume24h: Math.floor(Math.random() * 100000 + 10000),
      priceChange24h: (Math.random() - 0.5) * 200,
      riskScore: Math.floor(Math.random() * 100),
      hypeScore: Math.floor(Math.random() * 100),
      trendDirection: ['up', 'down', 'sideways'][Math.floor(Math.random() * 3)] as any,
      contractSafety: {
        renounced: Math.random() > 0.5,
        lpLocked: Math.random() > 0.3,
        maxWallet: Math.floor(Math.random() * 10 + 1),
        buyTax: Math.floor(Math.random() * 10),
        sellTax: Math.floor(Math.random() * 10)
      },
      socialMetrics: {
        telegramMembers: Math.floor(Math.random() * 5000 + 100),
        twitterMentions: Math.floor(Math.random() * 1000 + 10),
        holderCount: Math.floor(Math.random() * 10000 + 50),
        buysLast15m: Math.floor(Math.random() * 50 + 5),
        sellsLast15m: Math.floor(Math.random() * 30 + 2)
      },
      aiVerdict: [
        "Strong LP lock with growing community. Bullish trend forming but watch for high dev control. Entry possible with tight SL.",
        "Stable fundamentals with viral potential. Contract is safe but monitor whale movements. Good risk/reward setup.",
        "High risk but explosive potential. Community building fast. Only for experienced traders with tight risk management.",
        "Decent fundamentals but lacking momentum. Wait for volume spike or better entry point.",
        "Solid project with locked LP and renounced contract. Growing social presence. Conservative entry recommended."
      ][Math.floor(Math.random() * 5)],
      sparklineData: Array.from({length: 20}, () => (Math.random() - 0.5) * 2)
    }));
  };

  const scanForTokens = async () => {
    setIsScanning(true);
    
    // Simulate scanning
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newTokens = generateMockTokens();
    setTokens(newTokens);
    
    toast({
      title: "🚨 NEW GEM FOUND",
      description: `Found ${newTokens.length} potential opportunities matching your criteria`,
    });
    
    setIsScanning(false);
  };

  const filteredTokens = tokens.filter(token => 
    token.marketCap <= alertSettings.marketCapMax &&
    (token.socialMetrics.buysLast15m * 4) >= alertSettings.buysPerHour
  );

  useEffect(() => {
    scanForTokens();
  }, []);

  const averageRisk = tokens.length > 0 ? Math.round(tokens.reduce((acc, t) => acc + t.riskScore, 0) / tokens.length) : 0;
  const averageHype = tokens.length > 0 ? Math.round(tokens.reduce((acc, t) => acc + t.hypeScore, 0) / tokens.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card hover-glow border-gold-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-gold-400" />
              <div>
                <CardTitle className="text-2xl font-bold text-white">SNIPER AI SCANNER</CardTitle>
                <p className="text-gray-400">Real-time meme coin intelligence with AI analysis</p>
              </div>
            </div>
            <Button
              onClick={scanForTokens}
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
                  New Scan
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{tokens.length}</div>
            <div className="text-sm text-gray-400">Total Scanned</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-green-500/20">
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{averageRisk}%</div>
            <div className="text-sm text-gray-400">Avg Safety</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{averageHype}%</div>
            <div className="text-sm text-gray-400">Avg Hype</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-gold-500/20">
          <CardContent className="p-4 text-center">
            <Crown className="w-6 h-6 text-gold-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{filteredTokens.length}</div>
            <div className="text-sm text-gray-400">Alert Matches</div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Settings */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Sniper Alerts (Premium)
            <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 ml-auto">
              PRO
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400">Max Market Cap</label>
              <Input
                type="number"
                value={alertSettings.marketCapMax}
                onChange={(e) => setAlertSettings(prev => ({ ...prev, marketCapMax: Number(e.target.value) }))}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Min LP (ETH)</label>
              <Input
                type="number"
                value={alertSettings.lpMinimum}
                onChange={(e) => setAlertSettings(prev => ({ ...prev, lpMinimum: Number(e.target.value) }))}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Min Buys/Hour</label>
              <Input
                type="number"
                value={alertSettings.buysPerHour}
                onChange={(e) => setAlertSettings(prev => ({ ...prev, buysPerHour: Number(e.target.value) }))}
                className="bg-gray-800/50 border-gray-600 text-white"
              />
            </div>
          </div>
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <Bell className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              <strong>Alert Active:</strong> You'll be notified when tokens match your criteria. {filteredTokens.length} tokens currently match.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tokens Grid */}
      {isScanning ? (
        <Card className="glass-card border-purple-500/20">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Scanning in Progress</h3>
            <p className="text-gray-400">
              Analyzing contract safety, social sentiment, and market dynamics...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => (
            <EnhancedTokenCard 
              key={token.address} 
              token={token} 
              isPremium={false} // This would come from subscription context
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedMemeCoinScanner;