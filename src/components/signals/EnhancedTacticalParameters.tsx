
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Target, Shield, Zap, Clock } from 'lucide-react';
import { SignalConfig, defaultSignalConfig } from '@/types/signalConfig';

interface EnhancedTacticalParametersProps {
  onConfigChange: (config: SignalConfig) => void;
  initialConfig?: Partial<SignalConfig>;
}

const EnhancedTacticalParameters: React.FC<EnhancedTacticalParametersProps> = ({
  onConfigChange,
  initialConfig = {}
}) => {
  const [config, setConfig] = useState<SignalConfig>({
    ...defaultSignalConfig,
    ...initialConfig
  });

  const updateConfig = (updates: Partial<SignalConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const presets = {
    Conservative: {
      confidenceThreshold: 85,
      riskLevel: 'conservative' as const,
      maxSignalsPerDay: 2,
      riskRewardRatio: 3.0
    },
    Balanced: {
      confidenceThreshold: 75,
      riskLevel: 'moderate' as const,
      maxSignalsPerDay: 5,
      riskRewardRatio: 2.0
    },
    Aggressive: {
      confidenceThreshold: 65,
      riskLevel: 'aggressive' as const,
      maxSignalsPerDay: 10,
      riskRewardRatio: 1.5
    }
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    updateConfig(preset);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-400">
            <Settings className="w-5 h-5 mr-2" />
            Tactical Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(presets).map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset as keyof typeof presets)}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                {preset}
              </Button>
            ))}
          </div>
          
          <div className="text-sm text-gray-400">
            Quick presets for different risk profiles and trading styles.
          </div>
        </CardContent>
      </Card>

      {/* Core Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signal Strength */}
        <Card className="glass-card border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-400">
              <Target className="w-5 h-5 mr-2" />
              Signal Strength
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-300">
                Confidence Threshold: {config.confidenceThreshold}%
              </Label>
              <Slider
                value={[config.confidenceThreshold]}
                onValueChange={([value]) => updateConfig({ confidenceThreshold: value })}
                max={100}
                min={50}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Minimum Filters</Label>
              <Select 
                value={config.minFilters.toString()} 
                onValueChange={(value) => updateConfig({ minFilters: parseInt(value) })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Filters</SelectItem>
                  <SelectItem value="3">3 Filters</SelectItem>
                  <SelectItem value="4">4 Filters</SelectItem>
                  <SelectItem value="5">5 Filters</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Strategy Type</Label>
              <Select 
                value={config.strategyType} 
                onValueChange={(value: 'SMC' | 'Classic' | 'Hybrid') => updateConfig({ strategyType: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMC">Smart Money Concepts</SelectItem>
                  <SelectItem value="Classic">Classic Technical</SelectItem>
                  <SelectItem value="Hybrid">Hybrid Approach</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Risk Management */}
        <Card className="glass-card border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center text-red-400">
              <Shield className="w-5 h-5 mr-2" />
              Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-300">Risk Level</Label>
              <Select 
                value={config.riskLevel} 
                onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => updateConfig({ riskLevel: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">
                Risk:Reward Ratio: 1:{config.riskRewardRatio}
              </Label>
              <Slider
                value={[config.riskRewardRatio]}
                onValueChange={([value]) => updateConfig({ riskRewardRatio: value })}
                max={5}
                min={1}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">
                Max Signals Per Day: {config.maxSignalsPerDay}
              </Label>
              <Slider
                value={[config.maxSignalsPerDay]}
                onValueChange={([value]) => updateConfig({ maxSignalsPerDay: value })}
                max={20}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Filters */}
      <Card className="glass-card border-yellow-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-400">
            <Zap className="w-5 h-5 mr-2" />
            Market Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-300">Volume Filter</Label>
                <Switch
                  checked={config.volumeFilter}
                  onCheckedChange={(checked) => updateConfig({ volumeFilter: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-300">News Filter</Label>
                <Switch
                  checked={config.newsFilter}
                  onCheckedChange={(checked) => updateConfig({ newsFilter: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-300">Correlation Filter</Label>
                <Switch
                  checked={config.correlationFilter}
                  onCheckedChange={(checked) => updateConfig({ correlationFilter: checked })}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Asset Class</Label>
              <Select 
                value={config.assetClass} 
                onValueChange={(value: 'forex' | 'crypto' | 'stocks') => updateConfig({ assetClass: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Trade Type</Label>
              <Select 
                value={config.tradeType} 
                onValueChange={(value: 'swing' | 'intraday' | 'scalping') => updateConfig({ tradeType: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="swing">Swing Trading</SelectItem>
                  <SelectItem value="intraday">Intraday</SelectItem>
                  <SelectItem value="scalping">Scalping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Filters */}
      <Card className="glass-card border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center text-green-400">
            <Clock className="w-5 h-5 mr-2" />
            Time & Session Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-300">Timeframe</Label>
              <Select 
                value={config.timeframe} 
                onValueChange={(value) => updateConfig({ timeframe: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5M">5 Minutes</SelectItem>
                  <SelectItem value="15M">15 Minutes</SelectItem>
                  <SelectItem value="1H">1 Hour</SelectItem>
                  <SelectItem value="4H">4 Hours</SelectItem>
                  <SelectItem value="1D">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300">Time Validity</Label>
              <Select 
                value={config.timeValidity} 
                onValueChange={(value) => updateConfig({ timeValidity: value })}
              >
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="3d">3 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Label className="text-sm font-medium text-gray-300 mb-2 block">
              Active Sessions
            </Label>
            <div className="flex flex-wrap gap-2">
              {['London', 'New York', 'Tokyo', 'Sydney'].map((session) => (
                <Badge
                  key={session}
                  variant={config.sessionFilters.includes(session) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    config.sessionFilters.includes(session)
                      ? 'bg-green-600 text-white'
                      : 'border-green-500/30 text-green-400 hover:bg-green-500/20'
                  }`}
                  onClick={() => {
                    const sessions = config.sessionFilters.includes(session)
                      ? config.sessionFilters.filter(s => s !== session)
                      : [...config.sessionFilters, session];
                    updateConfig({ sessionFilters: sessions });
                  }}
                >
                  {session}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTacticalParameters;
