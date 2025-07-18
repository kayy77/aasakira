
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  Target, 
  TrendingUp, 
  Shield, 
  Clock,
  Zap,
  Filter,
  BarChart3
} from 'lucide-react';
import { SignalConfig } from '@/types/signalConfig';

interface EnhancedTacticalParametersProps {
  onConfigChange: (config: SignalConfig) => void;
  currentConfig: SignalConfig;
}

const EnhancedTacticalParameters: React.FC<EnhancedTacticalParametersProps> = ({
  onConfigChange,
  currentConfig
}) => {
  const [config, setConfig] = useState<SignalConfig>(currentConfig);

  const updateConfig = (updates: Partial<SignalConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const forexPairs = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'EURJPY', 'EURGBP', 'GBPJPY', 'CHFJPY', 'AUDJPY', 'CADJPY', 'NZDJPY'
  ];

  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const getTimeFromNow = (hours: number) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-400">
            <Settings className="w-5 h-5 mr-2" />
            Elite Signal Parameters
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500">
              TACTICAL
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Trading Pair & Timeframe */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Asset Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pair" className="text-gray-300">Currency Pair</Label>
              <Select value={config.pair} onValueChange={(value) => updateConfig({ pair: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select pair" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {forexPairs.map(pair => (
                    <SelectItem key={pair} value={pair} className="text-white hover:bg-gray-700">
                      {pair}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timeframe" className="text-gray-300">Timeframe</Label>
              <Select value={config.timeframe} onValueChange={(value) => updateConfig({ timeframe: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {timeframes.map(tf => (
                    <SelectItem key={tf} value={tf} className="text-white hover:bg-gray-700">
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Configuration */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Strategy & Risk
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Strategy Type</Label>
              <Select value={config.strategyType} onValueChange={(value: any) => updateConfig({ strategyType: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="Conservative" className="text-white">Conservative</SelectItem>
                  <SelectItem value="Balanced" className="text-white">Balanced</SelectItem>
                  <SelectItem value="Aggressive" className="text-white">Aggressive</SelectItem>
                  <SelectItem value="Hybrid" className="text-white">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-gray-300">Trade Type</Label>
              <Select value={config.tradeType} onValueChange={(value: any) => updateConfig({ tradeType: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="scalp" className="text-white">Scalping</SelectItem>
                  <SelectItem value="intraday" className="text-white">Intraday</SelectItem>
                  <SelectItem value="swing" className="text-white">Swing</SelectItem>
                  <SelectItem value="position" className="text-white">Position</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">
              Confidence Threshold: {config.confidenceThreshold}%
            </Label>
            <Slider
              value={[config.confidenceThreshold]}
              onValueChange={([value]) => updateConfig({ confidenceThreshold: value })}
              min={60}
              max={95}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Conservative (60%)</span>
              <span>Elite (95%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Volume Filter</Label>
              <Switch
                checked={config.volumeFilter}
                onCheckedChange={(checked) => updateConfig({ volumeFilter: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">News Filter</Label>
              <Switch
                checked={config.newsFilter}
                onCheckedChange={(checked) => updateConfig({ newsFilter: checked })}
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Signal Validity Period</Label>
            <Select value={config.timeValidity} onValueChange={(value) => updateConfig({ timeValidity: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="1h" className="text-white">1 Hour</SelectItem>
                <SelectItem value="4h" className="text-white">4 Hours</SelectItem>
                <SelectItem value="8h" className="text-white">8 Hours</SelectItem>
                <SelectItem value="24h" className="text-white">24 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button 
        onClick={() => onConfigChange(config)}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3"
      >
        <Zap className="w-4 h-4 mr-2" />
        Generate Elite Signals
      </Button>
    </div>
  );
};

export default EnhancedTacticalParameters;
