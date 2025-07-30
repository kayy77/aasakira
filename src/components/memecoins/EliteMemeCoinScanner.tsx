
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target,
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Shield,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Brain,
  DollarSign,
  Activity,
  Clock,
  Users
} from 'lucide-react';
import { realTimeMemeCoinService, MemeCoinMetrics, TokenScanResult } from '@/services/realTimeMemeCoinService';
import { useToast } from '@/hooks/use-toast';

const EliteMemeCoinScanner = () => {
  const [scanResults, setScanResults] = useState<TokenScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedRisk, setSelectedRisk] = useState<'lowRisk' | 'mediumRisk' | 'highRisk'>('lowRisk');
  const { toast } = useToast();

  const handleEliteScan = async () => {
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
          return prev + 15;
        });
      }, 500);

      console.log('🔍 Starting Elite Meme Coin Scan...');
      const results = await realTimeMemeCoinService.scanEliteMemCoins();
      
      clearInterval(progressInterval);
      setScanProgress(100);
      
      setScanResults(results);
      
      const totalFound = results.lowRisk.length + results.mediumRisk.length + results.highRisk.length;
      
      toast({
        title: "🔥 Elite Scan Complete!",
        description: `Found ${totalFound} elite opportunities from ${results.totalScanned} tokens scanned`,
      });
      
    } catch (error) {
      console.error('❌ Elite scan failed:', error);
      toast({
        title: "Scan Failed",
        description: "Unable to complete elite scan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  // Auto-refresh every 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isScanning) {
        handleEliteScan();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isScanning]);

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getContractRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Safe': return <Shield className="w-4 h-4 text-green-400" />;
      case 'Medium Risk': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'High Risk': 
      case 'Honeypot': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderTokenCard = (token: MemeCoinMetrics) => (
    <Card key={token.id} className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              {token.symbol.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{token.name}</h3>
              <p className="text-gray-400 text-sm">${token.symbol}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xl font-bold text-white">${formatPrice(token.price)}</div>
            <div className={`flex items-center gap-1 text-sm ${
              token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {token.priceChange24h >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <div className="text-gray-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Market Cap
            </div>
            <div className="text-white font-medium">{formatMarketCap(token.marketCap)}</div>
          </div>
          <div>
            <div className="text-gray-400 flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Liquidity
            </div>
            <div className="text-white font-medium">${token.liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div>
            <div className="text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Age
            </div>
            <div className="text-white font-medium">{token.pairAge.toFixed(1)}h</div>
          </div>
          <div>
            <div className="text-gray-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Transactions
            </div>
            <div className="text-white font-medium">{token.transactions24h}</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={getRiskColor(token.riskLevel)}>
              {token.riskLevel} Risk
            </Badge>
            <div className="flex items-center gap-1">
              {getContractRiskIcon(token.contractRisk)}
              <span className="text-xs text-gray-400">{token.contractRisk}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-400">Score:</div>
            <Badge className={`${
              token.totalScore >= 80 ? 'bg-green-500/20 text-green-400' :
              token.totalScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {token.totalScore}/100
            </Badge>
          </div>
        </div>

        {/* AI Consensus */}
        {token.aiConsensus && (
          <div className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Multi-AI Analysis</span>
              </div>
              <Badge className={`${
                token.aiConsensus.verdict === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                token.aiConsensus.verdict === 'LOW_CONSENSUS' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {token.aiConsensus.confidence_score}/5 AI Votes
              </Badge>
            </div>
            <div className="text-xs text-gray-300">
              {token.aiConsensus.reasoning.slice(0, 2).join(' • ')}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Hype: {token.hypeScore}/100 • Bot Risk: {token.sniperBotPresence}
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-purple-500/30" asChild>
              <a href={token.dexData.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                View
              </a>
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
              <Target className="w-3 h-3 mr-1" />
              Track
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Elite Meme Coin Scanner
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                Multi-AI Powered
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {scanResults && (
                <span>Last scan: {new Date(scanResults.scanTime).toLocaleTimeString()}</span>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-300">
              Scanning Moralis • CoinGecko • DexScreener with AI validation
            </div>
            <Button
              onClick={handleEliteScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Elite Scanning...' : 'Elite Scan'}
            </Button>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Multi-AI analysis in progress...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Category Tabs */}
      {scanResults && (
        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={selectedRisk === 'lowRisk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRisk('lowRisk')}
                className={selectedRisk === 'lowRisk' ? 'bg-green-600' : ''}
              >
                <Shield className="w-4 h-4 mr-1" />
                Low Risk ({scanResults.lowRisk.length})
              </Button>
              <Button
                variant={selectedRisk === 'mediumRisk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRisk('mediumRisk')}
                className={selectedRisk === 'mediumRisk' ? 'bg-yellow-600' : ''}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Medium Risk ({scanResults.mediumRisk.length})
              </Button>
              <Button
                variant={selectedRisk === 'highRisk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRisk('highRisk')}
                className={selectedRisk === 'highRisk' ? 'bg-red-600' : ''}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                High Risk ({scanResults.highRisk.length})
              </Button>
            </div>
            
            <Alert>
              <AlertDescription>
                <strong>Total Scanned:</strong> {scanResults.totalScanned} tokens • 
                <strong> Elite Filtered:</strong> {scanResults.lowRisk.length + scanResults.mediumRisk.length + scanResults.highRisk.length} gems • 
                <strong> AI Analyzed:</strong> Top performers
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {scanResults && (
        <div className="grid gap-4">
          {scanResults[selectedRisk].map(renderTokenCard)}
        </div>
      )}

      {/* Empty State */}
      {!scanResults && !isScanning && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready for Elite Scan</h3>
            <p className="text-gray-400 mb-6">
              Multi-AI powered analysis using Moralis, CoinGecko, and DexScreener APIs
            </p>
            <Button
              onClick={handleEliteScan}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Elite Scan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EliteMemeCoinScanner;
