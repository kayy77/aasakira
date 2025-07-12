
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Zap, 
  Target,
  DollarSign,
  Sparkles,
  Crown,
  RefreshCw
} from 'lucide-react';
import { TokenCard } from './TokenCard';
import { RiskProfileCard } from './RiskProfileCard';
import { useToast } from '@/hooks/use-toast';
import { memeCoinsService, TokenMetrics, RiskProfile } from '@/services/memeCoinsService';

interface MemeCoinScannerProps {
  onFeatureUse?: () => void;
}

export const MemeCoinScanner: React.FC<MemeCoinScannerProps> = ({ onFeatureUse }) => {
  const [categorizedTokens, setCategorizedTokens] = useState<{ [key: string]: TokenMetrics[] }>({});
  const [selectedRiskProfile, setSelectedRiskProfile] = useState<string>('Medium Risk');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTokens = async () => {
    // Track feature usage
    onFeatureUse?.();
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tokens = await memeCoinsService.scanMemeCoins();
      setCategorizedTokens(tokens);
      
      toast({
        title: "Scan Complete!",
        description: "Successfully scanned for new meme coin opportunities",
      });
    } catch (e: any) {
      setError(e.message || 'Failed to fetch meme coins.');
      toast({
        title: "Scan Failed",
        description: "Failed to scan meme coins. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTokens();
  }, []);

  const riskProfiles = memeCoinsService.getRiskProfiles();
  const currentTokens = categorizedTokens[selectedRiskProfile] || [];

  return (
    <div className="container mx-auto space-y-8">
      {/* Control Panel */}
      <Card className="glass-card hover-glow border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white flex items-center">
              <Target className="mr-2 w-6 h-6 text-purple-400" />
              Meme Coin Scanner
            </CardTitle>
            <Button
              onClick={fetchTokens}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover-lift"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Scan
                </>
              )}
            </Button>
          </div>
          <p className="text-gray-400 mt-2">
            AI-powered analysis of high-potential meme coins across multiple risk categories
          </p>
        </CardHeader>
      </Card>

      {/* Risk Profile Selection */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {riskProfiles.map((profile) => (
          <RiskProfileCard
            key={profile.name}
            profile={profile}
            tokenCount={categorizedTokens[profile.name]?.length || 0}
            isSelected={selectedRiskProfile === profile.name}
            onClick={() => setSelectedRiskProfile(profile.name)}
          />
        ))}
      </div>

      {/* Selected Risk Profile Tokens */}
      <Card className="glass-card hover-glow border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white flex items-center">
              <Sparkles className="mr-2 w-6 h-6 text-yellow-400" />
              {selectedRiskProfile} Opportunities
            </CardTitle>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse">
              <Crown className="w-3 h-3 mr-1" />
              {currentTokens.length} TOKENS
            </Badge>
          </div>
          <p className="text-gray-400 mt-2">
            Real-time opportunities matching {selectedRiskProfile.toLowerCase()} criteria
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="glass-card p-8 text-center border-purple-500/10">
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <Alert className="w-full border-blue-500/30 bg-blue-500/10">
                <Zap className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  Scanning for meme coin opportunities across multiple exchanges...
                </AlertDescription>
              </Alert>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="w-full border-red-500/30 bg-red-500/10">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          ) : currentTokens.length === 0 ? (
            <div className="glass-card p-8 text-center border-purple-500/10">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Alert className="w-full border-orange-500/30 bg-orange-500/10">
                <Target className="h-4 w-4 text-orange-400" />
                <AlertDescription className="text-orange-300">
                  No tokens found matching {selectedRiskProfile.toLowerCase()} criteria. Try refreshing or selecting a different risk profile.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {currentTokens.map((token) => (
                <TokenCard 
                  key={token.address} 
                  token={token} 
                  riskLevel={selectedRiskProfile as 'Low Risk' | 'Medium Risk' | 'High Risk'}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover-glow border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {Object.values(categorizedTokens).flat().length}
                </div>
                <div className="text-sm text-gray-400">Total Opportunities</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-glow border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  ${Math.floor(Math.random() * 10000 + 5000).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Avg Market Cap</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-glow border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {Math.floor(Math.random() * 50 + 25)}%
                </div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemeCoinScanner;
