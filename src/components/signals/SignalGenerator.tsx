import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { SignalConfig, Signal } from '@/types/signalConfig';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Zap, 
  Settings, 
  Save, 
  Upload, 
  Download, 
  RotateCw, 
  AlertTriangle,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface SignalGeneratorProps {
  onSignalGenerated?: (signal: Signal) => void;
}

export const SignalGenerator: React.FC<SignalGeneratorProps> = ({ onSignalGenerated }) => {
  const [config, setConfig] = useState<SignalConfig>({
    pair: 'EURUSD',
    timeframe: '1H',
    marketConditions: ['trending', 'volatile'],
    technicalIndicators: ['RSI', 'MACD', 'EMA'],
    riskReward: 2.0,
    pairFilters: ['major'],
    minConfidence: 75,
    maxSignalsPerHour: 3,
    enabled: true,
    stopLoss: 50,
    takeProfit: 100,
    entryType: 'market',
    strategyType: 'SMC',
    tradeType: 'SWING',
    confidenceThreshold: 80,
    riskLevel: 'LOW',
    minFilters: 3,
    assetClass: 'FOREX',
    pairFilter: 'major',
    entryLogic: 'Price action confirmation',
    exitLogic: 'Trailing stop loss',
    stopLossLogic: 'ATR multiple',
    takeProfitLogic: 'Fixed R:R ratio',
    timeValidity: '24h',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleConfigUpdate = (newConfig: SignalConfig) => {
    setConfig(newConfig);
  };

  const generateSignal = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate signals",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate signal generation logic
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newSignal: Signal = {
        id: `signal_${Date.now()}`,
        pair: config.pair,
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        entryPrice: Math.random() * 100 + 1000,
        stopLoss: Math.random() * 50 + 950,
        takeProfit: Math.random() * 150 + 1100,
        confidence: Math.floor(Math.random() * 30) + 70,
        riskReward: config.riskReward,
        analysis: 'Generated signal based on current market conditions',
        timestamp: new Date().toISOString(),
        timeframe: config.timeframe,
        strategy: 'AI Enhanced',
        marketCondition: config.marketConditions[0] || 'trending',
        technicalSetup: config.technicalIndicators.join(', '),
        entryReason: 'Strong technical confluence detected',
        riskManagement: 'Proper R:R ratio maintained',
        sessionContext: `Generated with ${config.technicalIndicators.length} indicators`,
        signalStrength: Math.floor(Math.random() * 30) + 70,
        filtersPassed: config.technicalIndicators
      };

      toast({
        title: "✨ Signal Generated",
        description: `New ${newSignal.type} signal for ${newSignal.pair} created`,
      });

      onSignalGenerated?.(newSignal);
    } catch (error) {
      toast({
        title: "Signal Generation Failed",
        description: "An error occurred while generating the signal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-yellow-400" />
            Signal Configuration
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={generateSignal}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Signal
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pair and Timeframe */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pair">Pair</Label>
            <Input
              id="pair"
              value={config.pair}
              onChange={(e) => setConfig({ ...config, pair: e.target.value })}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select value={config.timeframe} onValueChange={(value) => setConfig({ ...config, timeframe: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white">
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="1W">1W</SelectItem>
                <SelectItem value="1D">1D</SelectItem>
                <SelectItem value="4H">4H</SelectItem>
                <SelectItem value="1H">1H</SelectItem>
                <SelectItem value="15M">15M</SelectItem>
                <SelectItem value="5M">5M</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Market Conditions */}
        <div>
          <Label>Market Conditions</Label>
          <div className="flex gap-2">
            <Badge
              className={`cursor-pointer ${config.marketConditions.includes('trending') ? 'bg-purple-500' : 'bg-gray-700'}`}
              onClick={() =>
                setConfig({
                  ...config,
                  marketConditions: config.marketConditions.includes('trending')
                    ? config.marketConditions.filter((item) => item !== 'trending')
                    : [...config.marketConditions, 'trending'],
                })
              }
            >
              Trending
            </Badge>
            <Badge
              className={`cursor-pointer ${config.marketConditions.includes('volatile') ? 'bg-purple-500' : 'bg-gray-700'}`}
              onClick={() =>
                setConfig({
                  ...config,
                  marketConditions: config.marketConditions.includes('volatile')
                    ? config.marketConditions.filter((item) => item !== 'volatile')
                    : [...config.marketConditions, 'volatile'],
                })
              }
            >
              Volatile
            </Badge>
            <Badge
              className={`cursor-pointer ${config.marketConditions.includes('ranging') ? 'bg-purple-500' : 'bg-gray-700'}`}
              onClick={() =>
                setConfig({
                  ...config,
                  marketConditions: config.marketConditions.includes('ranging')
                    ? config.marketConditions.filter((item) => item !== 'ranging')
                    : [...config.marketConditions, 'ranging'],
                })
              }
            >
              Ranging
            </Badge>
          </div>
        </div>

        {/* Technical Indicators */}
        <div>
          <Label>Technical Indicators</Label>
          <div className="flex gap-2">
            <Badge
              className={`cursor-pointer ${config.technicalIndicators.includes('RSI') ? 'bg-purple-500' : 'bg-gray-700'}`}
              onClick={() =>
                setConfig({
                  ...config,
                  technicalIndicators: config.technicalIndicators.includes('RSI')
                    ? config.technicalIndicators.filter((item) => item !== 'RSI')
                    : [...config.technicalIndicators, 'RSI'],
                })
              }
            >
              RSI
            </Badge>
            <Badge
              className={`cursor-pointer ${config.technicalIndicators.includes('MACD') ? 'bg-purple-500' : 'bg-gray-700'}`}
              onClick={() =>
                setConfig({
                  ...config,
                  technicalIndicators: config.technicalIndicators.includes('MACD')
                    ? config.technicalIndicators.filter((item) => item !== 'MACD')
                    : [...config.technicalIndicators, 'MACD'],
                })
              }
            >
              MACD
            </Badge>
            <Badge
              className={`cursor-pointer ${config.technicalIndicators.includes('EMA') ? 'bg-purple-500' : 'bg-gray-700'}`}
              onClick={() =>
                setConfig({
                  ...config,
                  technicalIndicators: config.technicalIndicators.includes('EMA')
                    ? config.technicalIndicators.filter((item) => item !== 'EMA')
                    : [...config.technicalIndicators, 'EMA'],
                })
              }
            >
              EMA
            </Badge>
          </div>
        </div>

        {/* Risk Reward Ratio */}
        <div>
          <Label htmlFor="riskReward">Risk Reward Ratio ({config.riskReward})</Label>
          <Slider
            id="riskReward"
            defaultValue={[config.riskReward]}
            max={5}
            step={0.1}
            onValueChange={(value) => setConfig({ ...config, riskReward: value[0] })}
          />
        </div>

        {/* Pair Filters */}
        <div>
          <Label>Pair Filters</Label>
          <div className="flex gap-2">
            <Badge
              className={`cursor-pointer ${config.pairFilters.includes('major') ? 'bg-purple-500' : 'bg-gray-700'}`}
              onClick={() =>
                setConfig({
                  ...config,
                  pairFilters: config.pairFilters.includes('major')
                    ? config.pairFilters.filter((item) => item !== 'major')
                    : [...config.pairFilters, 'major'],
                })
              }
            >
              Major
            </Badge>
            <Badge
              className={`cursor-pointer ${config.pairFilters.includes('minor') ? 'bg-purple-500' : 'bg-gray-700'}`}
              onClick={() =>
                setConfig({
                  ...config,
                  pairFilters: config.pairFilters.includes('minor')
                    ? config.pairFilters.filter((item) => item !== 'minor')
                    : [...config.pairFilters, 'minor'],
                })
              }
            >
              Minor
            </Badge>
            <Badge
              className={`cursor-pointer ${config.pairFilters.includes('exotic') ? 'bg-purple-500' : 'bg-gray-700'}`}
              onClick={() =>
                setConfig({
                  ...config,
                  pairFilters: config.pairFilters.includes('exotic')
                    ? config.pairFilters.filter((item) => item !== 'exotic')
                    : [...config.pairFilters, 'exotic'],
                })
              }
            >
              Exotic
            </Badge>
          </div>
        </div>

        {/* Confidence and Max Signals */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minConfidence">Min Confidence ({config.minConfidence}%)</Label>
            <Slider
              id="minConfidence"
              defaultValue={[config.minConfidence]}
              max={100}
              step={1}
              onValueChange={(value) => setConfig({ ...config, minConfidence: value[0] })}
            />
          </div>
          <div>
            <Label htmlFor="maxSignalsPerHour">Max Signals/Hour ({config.maxSignalsPerHour})</Label>
            <Input
              type="number"
              id="maxSignalsPerHour"
              value={config.maxSignalsPerHour.toString()}
              onChange={(e) => setConfig({ ...config, maxSignalsPerHour: parseInt(e.target.value) })}
              className="bg-gray-800 border-gray-600"
            />
          </div>
        </div>

        {/* Enable/Disable */}
        <div className="flex items-center space-x-2">
          <Switch id="enabled" checked={config.enabled} onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })} />
          <Label htmlFor="enabled">Enable Signals</Label>
        </div>
      </CardContent>
    </Card>
  );
};
