import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Settings, 
  SlidersHorizontal, 
  BarChart, 
  Loader2, 
  AlertTriangle,
  Copy,
  Save,
  Download,
  Upload,
  HelpCircle,
  Lightbulb,
  Brain
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { SignalConfig, Signal, SavedPreset } from '@/types/signalConfig';
import { EnhancedTacticalParameters } from './EnhancedTacticalParameters';

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
    entryType: 'market' as const,
    strategyType: 'SMC',
    tradeType: 'SWING',
    confidenceThreshold: 80,
    riskLevel: 'LOW',
    minFilters: 3,
    assetClass: 'FOREX',
    pairFilter: 'major',
    entryLogic: 'Price action confirmation',
    exitLogic: 'Target profit or stop loss hit',
    stopLossLogic: 'ATR multiple',
    takeProfitLogic: 'Fixed R:R ratio',
    timeValidity: '24h',
  });
  const [generatedSignal, setGeneratedSignal] = useState<Signal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = () => {
    // Mock loading presets from local storage
    const storedPresets = localStorage.getItem('signalPresets');
    if (storedPresets) {
      setPresets(JSON.parse(storedPresets));
    }
  };

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

      setGeneratedSignal(newSignal);
      onSignalGenerated?.(newSignal);

      toast({
        title: "Signal Generated",
        description: `New ${newSignal.type} signal for ${newSignal.pair} created`,
      });
    } catch (error) {
      console.error('Error generating signal:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate signal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copySignal = () => {
    if (generatedSignal) {
      const signalText = JSON.stringify(generatedSignal, null, 2);
      navigator.clipboard.writeText(signalText)
        .then(() => {
          toast({
            title: "Signal Copied",
            description: "Signal details copied to clipboard",
          });
        })
        .catch(err => {
          console.error("Failed to copy signal: ", err);
          toast({
            title: "Copy Failed",
            description: "Could not copy signal to clipboard",
            variant: "destructive"
          });
        });
    }
  };

  const savePreset = async () => {
    if (!presetName.trim()) {
      toast({
        title: "Preset Name Required",
        description: "Please enter a name for your preset",
        variant: "destructive"
      });
      return;
    }

    const preset: SavedPreset = {
      id: `preset_${Date.now()}`,
      name: presetName,
      config: { ...config },
      description: presetDescription,
      createdAt: new Date().toISOString(),
    };

    const updatedPresets = [...presets, preset];
    setPresets(updatedPresets);
    localStorage.setItem('signalPresets', JSON.stringify(updatedPresets));

    toast({
      title: "Preset Saved",
      description: `Configuration saved as "${presetName}"`,
    });
  };

  const loadPreset = (preset: SavedPreset) => {
    const fullConfig: SignalConfig = {
      pair: config.pair,
      timeframe: config.timeframe,
      marketConditions: config.marketConditions,
      technicalIndicators: config.technicalIndicators,
      riskReward: config.riskReward,
      pairFilters: config.pairFilters,
      minConfidence: config.minConfidence,
      maxSignalsPerHour: config.maxSignalsPerHour,
      enabled: config.enabled,
      stopLoss: config.stopLoss,
      takeProfit: config.takeProfit,
      entryType: config.entryType,
      ...preset.config,
    };
    onConfigUpdate(fullConfig);

    toast({
      title: "Preset Loaded",
      description: `Applied "${preset.name}" configuration`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Signal Generator</h2>
                <p className="text-sm text-gray-400">Configure parameters to generate trading signals</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-500/20"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pair" className="text-sm text-gray-400">Currency Pair</Label>
              <Input
                id="pair"
                value={config.pair}
                onChange={(e) => setConfig({ ...config, pair: e.target.value })}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="timeframe" className="text-sm text-gray-400">Timeframe</Label>
              <Select onValueChange={(value) => setConfig({ ...config, timeframe: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select Timeframe" defaultValue={config.timeframe} />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 text-white">
                  <SelectItem value="1M">1 Minute</SelectItem>
                  <SelectItem value="5M">5 Minutes</SelectItem>
                  <SelectItem value="15M">15 Minutes</SelectItem>
                  <SelectItem value="30M">30 Minutes</SelectItem>
                  <SelectItem value="1H">1 Hour</SelectItem>
                  <SelectItem value="4H">4 Hours</SelectItem>
                  <SelectItem value="1D">1 Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Market Conditions */}
          <div>
            <Label className="text-sm text-gray-400">Market Conditions</Label>
            <div className="flex gap-2">
              {['trending', 'ranging', 'volatile', 'sideways'].map(condition => (
                <Badge
                  key={condition}
                  variant={config.marketConditions.includes(condition) ? "default" : "outline"}
                  onClick={() => {
                    const newConditions = config.marketConditions.includes(condition)
                      ? config.marketConditions.filter(c => c !== condition)
                      : [...config.marketConditions, condition];
                    setConfig({ ...config, marketConditions: newConditions });
                  }}
                  className={config.marketConditions.includes(condition) ? "bg-purple-600" : "border-gray-600"}
                >
                  {condition}
                </Badge>
              ))}
            </div>
          </div>

          {/* Technical Indicators */}
          <div>
            <Label className="text-sm text-gray-400">Technical Indicators</Label>
            <div className="flex gap-2">
              {['RSI', 'MACD', 'EMA', 'SMA', 'Fibonacci'].map(indicator => (
                <Badge
                  key={indicator}
                  variant={config.technicalIndicators.includes(indicator) ? "default" : "outline"}
                  onClick={() => {
                    const newIndicators = config.technicalIndicators.includes(indicator)
                      ? config.technicalIndicators.filter(i => i !== indicator)
                      : [...config.technicalIndicators, indicator];
                    setConfig({ ...config, technicalIndicators: newIndicators });
                  }}
                  className={config.technicalIndicators.includes(indicator) ? "bg-blue-600" : "border-gray-600"}
                >
                  {indicator}
                </Badge>
              ))}
            </div>
          </div>

          {/* Risk Reward Ratio */}
          <div>
            <Label htmlFor="riskReward" className="text-sm text-gray-400">Risk Reward Ratio ({config.riskReward})</Label>
            <Slider
              id="riskReward"
              defaultValue={[config.riskReward]}
              min={1}
              max={5}
              step={0.1}
              onValueChange={(value) => setConfig({ ...config, riskReward: value[0] })}
              className="bg-gray-700"
            />
          </div>

          {/* Advanced Tactical Parameters */}
          {showAdvanced && (
            <EnhancedTacticalParameters
              config={config}
              onConfigUpdate={handleConfigUpdate}
              onGenerate={generateSignal}
              isGenerating={isGenerating}
            />
          )}

          {/* Generate Signal Button */}
          <Button
            onClick={generateSignal}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Signal...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Signal
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Signal Display */}
      {generatedSignal && (
        <Card className="glass-card border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <BarChart className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Generated Signal</h2>
                  <p className="text-sm text-gray-400">Details for the generated trading signal</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={copySignal}
                  variant="outline"
                  className="border-blue-500/30 hover:bg-blue-500/20"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-500/10 border-green-500/30">
              <BarChart className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                New {generatedSignal.type} signal for {generatedSignal.pair}
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-400">Pair</Label>
                <p className="text-white">{generatedSignal.pair}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-400">Type</Label>
                <p className="text-white">{generatedSignal.type}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-400">Entry Price</Label>
                <p className="text-white">{generatedSignal.entryPrice}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-400">Stop Loss</Label>
                <p className="text-white">{generatedSignal.stopLoss}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-400">Take Profit</Label>
                <p className="text-white">{generatedSignal.takeProfit}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-400">Confidence</Label>
                <p className="text-white">{generatedSignal.confidence}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-400">Analysis</Label>
              <Textarea
                readOnly
                value={generatedSignal.analysis}
                className="bg-gray-800 border-gray-600 text-white resize-none"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preset Management */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Preset Management</h2>
                <p className="text-sm text-gray-400">Save and load signal configurations</p>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="presetName" className="text-sm text-gray-400">Preset Name</Label>
              <Input
                id="presetName"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="presetDescription" className="text-sm text-gray-400">Description</Label>
              <Input
                id="presetDescription"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
          </div>
          <Button onClick={savePreset} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            Save Preset
          </Button>

          {/* Load Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Load Preset</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map(preset => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    onClick={() => loadPreset(preset)}
                    className="border-blue-500/30 hover:bg-blue-500/20"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
