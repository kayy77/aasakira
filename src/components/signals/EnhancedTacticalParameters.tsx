import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from "@/components/ui/textarea"
import { toast } from '@/hooks/use-toast';
import { 
  SlidersHorizontal, 
  Dice, 
  Save, 
  Load, 
  Wand2,
  HelpCircle
} from 'lucide-react';
import { 
  SignalConfig,
  SavedPreset
} from '@/types/signalConfig';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EnhancedTacticalParametersProps {
  config: SignalConfig;
  onConfigUpdate: (config: SignalConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const EnhancedTacticalParameters: React.FC<EnhancedTacticalParametersProps> = ({
  config,
  onConfigUpdate,
  onGenerate,
  isGenerating
}) => {
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);

  const handleInputChange = (key: keyof SignalConfig, value: any) => {
    onConfigUpdate({ ...config, [key]: value });
  };

  const handleNumberChange = (key: keyof SignalConfig, value: number) => {
    if (typeof value === 'number') {
      onConfigUpdate({ ...config, [key]: value });
    }
  };

  const handleToggleChange = (key: keyof SignalConfig, checked: boolean) => {
    onConfigUpdate({ ...config, [key]: checked });
  };

  const randomizeParameters = () => {
    const randomConfig: SignalConfig = {
      pair: config.pair,
      timeframe: config.timeframe,
      marketConditions: [
        Math.random() > 0.5 ? 'trending' : 'ranging',
        Math.random() > 0.5 ? 'volatile' : 'stable',
      ],
      technicalIndicators: [
        Math.random() > 0.5 ? 'RSI' : 'MACD',
        Math.random() > 0.5 ? 'EMA' : 'SMA',
      ],
      riskReward: Math.random() * 3 + 1,
      pairFilters: [Math.random() > 0.5 ? 'major' : 'minor'],
      minConfidence: Math.floor(Math.random() * 50) + 50,
      maxSignalsPerHour: Math.floor(Math.random() * 5) + 1,
      enabled: config.enabled,
      stopLoss: Math.floor(Math.random() * 100),
      takeProfit: Math.floor(Math.random() * 200) + 100,
      entryType: Math.random() > 0.5 ? 'market' : 'limit',
      strategyType: Math.random() > 0.5 ? 'SMC' : 'ICT',
      tradeType: Math.random() > 0.5 ? 'SWING' : 'SCALP',
      confidenceThreshold: Math.floor(Math.random() * 40) + 60,
      riskLevel: Math.random() > 0.5 ? 'LOW' : 'MEDIUM',
      minFilters: Math.floor(Math.random() * 4) + 1,
      assetClass: Math.random() > 0.5 ? 'FOREX' : 'CRYPTO',
      pairFilter: Math.random() > 0.5 ? 'major' : 'minor',
      timeValidity: Math.random() > 0.5 ? '12h' : '24h',
      entryLogic: 'Random entry logic',
      exitLogic: 'Random exit logic',
      stopLossLogic: 'Random stop loss logic',
      takeProfitLogic: 'Random take profit logic',
    };
    onConfigUpdate(randomConfig);

    toast({
      title: "Parameters Randomized",
      description: "New tactical parameters generated",
    });
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

    setSavedPresets(prev => [...prev, preset]);
    setPresetName('');
    setPresetDescription('');

    toast({
      title: "Preset Saved",
      description: `Configuration saved as "${preset.name}"`,
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
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-purple-400" />
            Tactical Parameters
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onClick={randomizeParameters}
                    variant="outline"
                    size="icon"
                    className="border-purple-500/30 hover:bg-purple-500/20"
                  >
                    <Dice className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Randomize Parameters
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {isGenerating ? (
                      <>
                        <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Signal
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Generate Signal
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pair and Timeframe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pair">Pair</Label>
            <Input
              type="text"
              id="pair"
              value={config.pair}
              onChange={(e) => handleInputChange('pair', e.target.value)}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="timeframe">Timeframe</Label>
            <Input
              type="text"
              id="timeframe"
              value={config.timeframe}
              onChange={(e) => handleInputChange('timeframe', e.target.value)}
              className="bg-gray-800 border-gray-600"
            />
          </div>
        </div>

        {/* Market Conditions and Technical Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="marketConditions">Market Conditions</Label>
            <Input
              type="text"
              id="marketConditions"
              value={config.marketConditions.join(', ')}
              onChange={(e) => handleInputChange('marketConditions', e.target.value.split(', '))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="technicalIndicators">Technical Indicators</Label>
            <Input
              type="text"
              id="technicalIndicators"
              value={config.technicalIndicators.join(', ')}
              onChange={(e) => handleInputChange('technicalIndicators', e.target.value.split(', '))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
        </div>

        {/* Risk Reward Ratio */}
        <div>
          <Label htmlFor="riskReward">Risk Reward Ratio</Label>
          <Slider
            id="riskReward"
            defaultValue={[config.riskReward]}
            min={1}
            max={5}
            step={0.1}
            onValueChange={(value) => handleNumberChange('riskReward', value[0])}
            className="bg-gray-700"
          />
          <div className="text-sm text-gray-400 mt-1">{config.riskReward.toFixed(1)}</div>
        </div>

        {/* Pair Filters */}
        <div>
          <Label htmlFor="pairFilters">Pair Filters</Label>
          <Input
            type="text"
            id="pairFilters"
            value={config.pairFilters.join(', ')}
            onChange={(e) => handleInputChange('pairFilters', e.target.value.split(', '))}
            className="bg-gray-800 border-gray-600"
          />
        </div>

        {/* Confidence and Signals Per Hour */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minConfidence">Min Confidence</Label>
            <Input
              type="number"
              id="minConfidence"
              value={config.minConfidence}
              onChange={(e) => handleNumberChange('minConfidence', Number(e.target.value))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="maxSignalsPerHour">Max Signals Per Hour</Label>
            <Input
              type="number"
              id="maxSignalsPerHour"
              value={config.maxSignalsPerHour}
              onChange={(e) => handleNumberChange('maxSignalsPerHour', Number(e.target.value))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
        </div>

        {/* Stop Loss and Take Profit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stopLoss">Stop Loss</Label>
            <Input
              type="number"
              id="stopLoss"
              value={config.stopLoss}
              onChange={(e) => handleNumberChange('stopLoss', Number(e.target.value))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="takeProfit">Take Profit</Label>
            <Input
              type="number"
              id="takeProfit"
              value={config.takeProfit}
              onChange={(e) => handleNumberChange('takeProfit', Number(e.target.value))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
        </div>

        {/* Entry Type */}
        <div>
          <Label htmlFor="entryType">Entry Type</Label>
          <Select onValueChange={(value) => handleInputChange('entryType', value)}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder={config.entryType} />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-500 text-white">
              <SelectItem value="market">Market</SelectItem>
              <SelectItem value="limit">Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Strategy, Trade Type, and Risk Level */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="strategyType">Strategy Type</Label>
            <Select onValueChange={(value) => handleInputChange('strategyType', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder={config.strategyType} />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-500 text-white">
                <SelectItem value="SMC">SMC</SelectItem>
                <SelectItem value="ICT">ICT</SelectItem>
                <SelectItem value="BREAK_RETEST">Break & Retest</SelectItem>
                <SelectItem value="LIQUIDITY_SWEEP">Liquidity Sweep</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="tradeType">Trade Type</Label>
            <Select onValueChange={(value) => handleInputChange('tradeType', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder={config.tradeType} />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-500 text-white">
                <SelectItem value="SWING">Swing</SelectItem>
                <SelectItem value="SCALP">Scalp</SelectItem>
                <SelectItem value="POSITION">Position</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="riskLevel">Risk Level</Label>
            <Select onValueChange={(value) => handleInputChange('riskLevel', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder={config.riskLevel} />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-500 text-white">
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Confidence Threshold and Min Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="confidenceThreshold">Confidence Threshold</Label>
            <Input
              type="number"
              id="confidenceThreshold"
              value={config.confidenceThreshold}
              onChange={(e) => handleNumberChange('confidenceThreshold', Number(e.target.value))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
          <div>
            <Label htmlFor="minFilters">Min Filters</Label>
            <Input
              type="number"
              id="minFilters"
              value={config.minFilters}
              onChange={(e) => handleNumberChange('minFilters', Number(e.target.value))}
              className="bg-gray-800 border-gray-600"
            />
          </div>
        </div>

        {/* Asset Class and Pair Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assetClass">Asset Class</Label>
            <Select onValueChange={(value) => handleInputChange('assetClass', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder={config.assetClass} />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-500 text-white">
                <SelectItem value="FOREX">Forex</SelectItem>
                <SelectItem value="CRYPTO">Crypto</SelectItem>
                <SelectItem value="STOCKS">Stocks</SelectItem>
                <SelectItem value="COMMODITIES">Commodities</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pairFilter">Pair Filter</Label>
            <Input
              type="text"
              id="pairFilter"
              value={config.pairFilter}
              onChange={(e) => handleInputChange('pairFilter', e.target.value)}
              className="bg-gray-800 border-gray-600"
            />
          </div>
        </div>

        {/* Time Validity */}
        <div>
          <Label htmlFor="timeValidity">Time Validity</Label>
          <Input
            type="text"
            id="timeValidity"
            value={config.timeValidity}
            onChange={(e) => handleInputChange('timeValidity', e.target.value)}
            className="bg-gray-800 border-gray-600"
          />
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => handleToggleChange('enabled', checked)}
          />
          <Label htmlFor="enabled">Enable Signal Generation</Label>
        </div>

        {/* Preset Management */}
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Preset Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="presetName">Preset Name</Label>
              <Input
                type="text"
                id="presetName"
                placeholder="Enter preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="presetDescription">Preset Description</Label>
              <Input
                type="text"
                id="presetDescription"
                placeholder="Describe this preset"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <Button onClick={savePreset} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
          </div>
        </div>

        {/* Load Presets */}
        {savedPresets.length > 0 && (
          <div className="border-t border-gray-700 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Load Preset</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPresets.map((preset) => (
                <Card key={preset.id} className="glass-card hover-glow cursor-pointer" onClick={() => loadPreset(preset)}>
                  <CardContent className="p-3">
                    <h5 className="text-sm font-semibold text-white">{preset.name}</h5>
                    <p className="text-xs text-gray-400">{preset.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
