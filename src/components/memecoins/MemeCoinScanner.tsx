
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
  Crown
} from 'lucide-react';
import { TokenCard } from './TokenCard';
import { RiskProfileCard } from './RiskProfileCard';
import { useToast } from '@/hooks/use-toast';
import { memeCoinsService, TokenMetrics, RiskProfile } from '@/services/memeCoinsService';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PremiumUpgrade from '@/components/PremiumUpgrade';

export const MemeCoinScanner: React.FC = () => {
  const [categorizedTokens, setCategorizedTokens] = useState<{ [key: string]: TokenMetrics[] }>({});
  const [selectedRiskProfile, setSelectedRiskProfile] = useState<string>('Medium Risk');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { toast } = useToast();
  const { canUseFeature } = useSubscription();

  useEffect(() => {
    const fetchTokens = async () => {
      if (!canUseFeature('memeCoins')) {
        setShowUpgrade(true);
        return;
      }
      setIsLoading(true);
      try {
        const tokens = await memeCoinsService.scanMemeCoins();
        setCategorizedTokens(tokens);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch meme coins.');
        toast({
          title: "API Error",
          description: "Failed to connect to the MemeCoin API. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [canUseFeature, toast]);

  if (showUpgrade) {
    return <PremiumUpgrade open={true} onOpenChange={setShowUpgrade} />;
  }

  const riskProfiles = memeCoinsService.getRiskProfiles();
  const currentTokens = categorizedTokens[selectedRiskProfile] || [];

  return (
    <div className="container mx-auto py-12 space-y-8">
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
      <Card className="glass-card hover-glow">
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
            <Alert className="w-full">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Scanning for meme coin opportunities...
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : currentTokens.length === 0 ? (
            <Alert className="w-full">
              <Target className="h-4 w-4" />
              <AlertDescription>
                No tokens found matching {selectedRiskProfile.toLowerCase()} criteria. Try refreshing or selecting a different risk profile.
              </AlertDescription>
            </Alert>
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
    </div>
  );
};

export default MemeCoinScanner;
