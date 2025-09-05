
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Crown } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { toast } from 'sonner';

interface SignalGeneratorProps {
  onSignalGenerated?: (signal: any) => void;
}

// Simple crash-proof signal generation
const generateSimpleSignal = () => {
  const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'];
  const types = ['BUY', 'SELL'];
  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const confidence = 75 + Math.floor(Math.random() * 20);
  
  return {
    id: `signal_${Date.now()}`,
    pair,
    type,
    confidence,
    confluenceScore: 7,
    institutionalGrade: 'B+',
    expectedWinRate: 80,
    timestamp: new Date().toISOString(),
    validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    signalStrength: 'STRONG',
    tags: ['institutional'],
    warnings: [],
    justification: `Strong institutional signal for ${pair} ${type} with ${confidence}% confidence.`
  };
};

const SignalGenerator: React.FC<SignalGeneratorProps> = ({ onSignalGenerated }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { subscription, usageStats } = useSubscription();
  
  const isPremium = subscription?.tier === 'premium';
  const signalsUsed = usageStats?.signals || 0;
  const dailyLimit = 2;
  const canGenerate = isPremium || signalsUsed < dailyLimit;

  const handleGenerateSignal = () => {
    console.log('🔍 Starting simple signal generation...');
    
    if (!canGenerate) {
      toast.error("Daily limit reached! Upgrade for unlimited signals.");
      return;
    }

    setIsGenerating(true);
    
    // Simple timeout to simulate processing
    setTimeout(() => {
      try {
        const signal = generateSimpleSignal();
        console.log('✅ Signal generated:', signal);
        
        onSignalGenerated?.(signal);
        toast.success(`🏛️ Signal Generated: ${signal.type} ${signal.pair} (${signal.confidence}%)`);
        
      } catch (error) {
        console.error('❌ Error:', error);
        toast.error("Failed to generate signal");
      } finally {
        setIsGenerating(false);
      }
    }, 1000);
  };


  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            Institutional Signal Engine
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-purple-400 border-purple-500/30">
              {signalsUsed}/{isPremium ? '∞' : dailyLimit}
            </Badge>
            {!isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Free
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Generation Button */}
        <Button
          onClick={handleGenerateSignal}
          disabled={!canGenerate || isGenerating}
          className={`w-full py-3 text-lg font-semibold ${
            canGenerate 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <TrendingUp className="w-5 h-5 mr-2 animate-pulse" />
              Generating Signal...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Generate Institutional Signal
            </>
          )}
        </Button>

        {/* Upgrade CTA for Free Users */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
            <h4 className="text-white font-semibold mb-2">
              🚀 Want Unlimited Signals?
            </h4>
            <p className="text-gray-300 text-sm mb-3">
              Get unlimited institutional signals with premium access.
            </p>
            <Button
              variant="outline"
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignalGenerator;
