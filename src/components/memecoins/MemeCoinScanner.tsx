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
import { memeCoinsService } from '@/services/memeCoinsService';
import { useSubscription } from '@/contexts/SubscriptionContext';
import PremiumUpgrade from '@/components/PremiumUpgrade';

export const MemeCoinScanner: React.FC = () => {
  const [topCoins, setTopCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { toast } = useToast();
  const { canUseFeature } = useSubscription();

  useEffect(() => {
    const fetchTopCoins = async () => {
      if (!canUseFeature('memecoins')) {
        setShowUpgrade(true);
        return;
      }
      setIsLoading(true);
      try {
        const coins = await memeCoinsService.getTopMemeCoins();
        setTopCoins(coins);
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

    fetchTopCoins();
  }, [canUseFeature, toast]);

  if (showUpgrade) {
    return <PremiumUpgrade open={true} onOpenChange={setShowUpgrade} />;
  }

  return (
    <div className="container mx-auto py-12">
      <Card className="glass-card hover-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white flex items-center">
              <Sparkles className="mr-2 w-6 h-6 text-yellow-400" />
              Top Trending Meme Coins
            </CardTitle>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse">
              <Crown className="w-3 h-3 mr-1" />
              LIVE UPDATES
            </Badge>
          </div>
          <p className="text-gray-400 mt-2">Real-time data on the most popular meme coins</p>
        </CardHeader>
        <CardContent className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <Alert className="w-full">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Loading top meme coins...
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {topCoins.map((coin) => (
                <TokenCard key={coin.id} coin={coin} />
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <RiskProfileCard />
    </div>
  );
};
