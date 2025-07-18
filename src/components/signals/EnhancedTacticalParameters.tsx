import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Target, 
  Shield, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Zap,
  Activity,
  BarChart3,
  Filter,
  Globe,
  Timer
} from 'lucide-react';
import { SignalConfig, defaultSignalConfig } from '@/types/signalConfig';

interface EnhancedTacticalParametersProps {
  onConfigChange: (config: SignalConfig) => void;
  currentConfig: SignalConfig;
}

const EnhancedTacticalParameters: React.FC<EnhancedTacticalParametersProps> = ({
  onConfigChange,
  currentConfig
}) => {
  const [config, setConfig] = useState<SignalConfig>(currentConfig || defaultSignalConfig);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  const updateConfig = (updates: Partial<SignalConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    setLastUpdate(new Date().toISOString());
    onConfigChange(newConfig);
  };

  const assetClasses = [
    { value: 'forex', label: 'Forex', icon: <Globe className="w-4 h-4" /> },
    { value: 'crypto', label: 'Crypto', icon: <Activity className="w-4 h-4" /> },
    { value: 'stocks', label: 'Stocks', icon: <BarChart3 className="w-4 h-4" /> }
  ];

  const strategyTypes = [
    { value: 'SMC', label: 'Smart Money Concepts' },
    { value: 'ICT', label: 'Inner Circle Trader' },
    { value: 'Hybrid', label: 'Hybrid Strategy' }
  ];

  const tradeTypes = [
    { value: 'scalp', label: 'Scalping', duration: '1-15 min' },
    { value: 'intraday', label: 'Intraday', duration: '15min-4h' },
    { value: 'swing', label: 'Swing', duration: '4h-1D' }
  ];

  const riskLevels = [
    { value: 'conservative', label: 'Conservative', color: 'text-green-400' },
    { value: 'moderate', label: 'Moderate', color: 'text-yellow-400' },
    { value: 'aggressive', label: 'Aggressive', color: 'text-red-400' }
  ];

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'];
  const sessions = ['london', 'newyork', 'tokyo', 'sydney'];
  const marketConditions = ['trending', 'ranging', 'volatile', 'quiet'];
  const technicalIndicators = ['RSI', 'MACD', 'OrderBlocks', 'FVG', 'Liquidity'];

  return (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Settings className="w-5 h-5" />
            Enhanced Tactical Parameters
            <Badge className="bg-green-500/20 text-green-400">
              Live Configuration
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Asset Class Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              Asset Class
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {assetClasses.map((asset) => (
                <Button
                  key={asset.value}
                  variant={config.assetClass === asset.value ? "default" : "outline"}
                  onClick={() => updateConfig({ assetClass: asset.value as any })}
                  className={`flex items-center gap-2 ${
                    config.assetClass === asset.value 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'border-gray-600 hover:border-purple-500'
                  }`}
                >
                  {asset.icon}
                  {asset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Strategy Configuration */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Strategy Type
              </h3>
              <div className="space-y-2">
                {strategyTypes.map((strategy) => (
                  <Button
                    key={strategy.value}
                    variant={config.strategyType === strategy.value ? "default" : "outline"}
                    onClick={() => updateConfig({ strategyType: strategy.value as any })}
                    className={`w-full justify-start ${
                      config.strategyType === strategy.value 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'border-gray-600 hover:border-green-500'
                    }`}
                  >
                    {strategy.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Timer className="w-5 h-5 text-yellow-400" />
                Trade Type
              </h3>
              <div className="space-y-2">
                {tradeTypes.map((trade) => (
                  <Button
                    key={trade.value}
                    variant={config.tradeType === trade.value ? "default" : "outline"}
                    onClick={() => updateConfig({ tradeType: trade.value as any })}
                    className={`w-full justify-between ${
                      config.tradeType === trade.value 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'border-gray-600 hover:border-yellow-500'
                    }`}
                  >
                    <span>{trade.label}</span>
                    <span className="text-xs text-gray-400">{trade.duration}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Risk Management
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Risk Level</label>
                <div className="space-y-2">
                  {riskLevels.map((risk) => (
                    <Button
                      key={risk.value}
                      variant={config.riskLevel === risk.value ? "default" : "outline"}
                      onClick={() => updateConfig({ riskLevel: risk.value as any })}
                      className={`w-full justify-start ${
                        config.riskLevel === risk.value 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'border-gray-600 hover:border-red-500'
                      }`}
                    >
                      <span className={risk.color}>{risk.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Max Risk per Trade (%)</label>
                <div className="px-3 py-2 bg-gray-800 rounded border border-gray-600">
                  <Slider
                    value={[config.riskManagement.maxRisk]}
                    onValueChange={(value) => updateConfig({
                      riskManagement: { ...config.riskManagement, maxRisk: value[0] }
                    })}
                    max={5}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-center text-white font-medium mt-2">
                    {config.riskManagement.maxRisk}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Confidence Threshold (%)</label>
                <div className="px-3 py-2 bg-gray-800 rounded border border-gray-600">
                  <Slider
                    value={[config.confidenceThreshold]}
                    onValueChange={(value) => updateConfig({ confidenceThreshold: value[0] })}
                    max={95}
                    min={60}
                    step={5}
                    className="w-full"
                  />
                  <div className="text-center text-white font-medium mt-2">
                    {config.confidenceThreshold}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeframe and Sessions */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Timeframe
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {timeframes.map((tf) => (
                  <Button
                    key={tf}
                    variant={config.timeframe === tf ? "default" : "outline"}
                    onClick={() => updateConfig({ timeframe: tf })}
                    size="sm"
                    className={`${
                      config.timeframe === tf 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-gray-600 hover:border-blue-500'
                    }`}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Trading Sessions
              </h3>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session} className="flex items-center justify-between">
                    <label className="text-white capitalize">{session}</label>
                    <Switch
                      checked={config.sessionFilters.includes(session)}
                      onCheckedChange={(checked) => {
                        const newSessions = checked
                          ? [...config.sessionFilters, session]
                          : config.sessionFilters.filter(s => s !== session);
                        updateConfig({ sessionFilters: newSessions });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Conditions and Indicators */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Market Conditions
              </h3>
              <div className="space-y-2">
                {marketConditions.map((condition) => (
                  <div key={condition} className="flex items-center justify-between">
                    <label className="text-white capitalize">{condition}</label>
                    <Switch
                      checked={config.marketConditions.includes(condition)}
                      onCheckedChange={(checked) => {
                        const newConditions = checked
                          ? [...config.marketConditions, condition]
                          : config.marketConditions.filter(c => c !== condition);
                        updateConfig({ marketConditions: newConditions });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
                Technical Indicators
              </h3>
              <div className="space-y-2">
                {technicalIndicators.map((indicator) => (
                  <div key={indicator} className="flex items-center justify-between">
                    <label className="text-white">{indicator}</label>
                    <Switch
                      checked={config.technicalIndicators.includes(indicator)}
                      onCheckedChange={(checked) => {
                        const newIndicators = checked
                          ? [...config.technicalIndicators, indicator]
                          : config.technicalIndicators.filter(i => i !== indicator);
                        updateConfig({ technicalIndicators: newIndicators });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-400" />
              Advanced Filters
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Minimum Filters Required</label>
                <div className="px-3 py-2 bg-gray-800 rounded border border-gray-600">
                  <Slider
                    value={[config.minFilters]}
                    onValueChange={(value) => updateConfig({ minFilters: value[0] })}
                    max={6}
                    min={2}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center text-white font-medium mt-2">
                    {config.minFilters} filters
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Pair Filter</label>
                <select
                  value={config.pairFilter}
                  onChange={(e) => updateConfig({ pairFilter: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                >
                  <option value="major">Major Pairs</option>
                  <option value="minor">Minor Pairs</option>
                  <option value="exotic">Exotic Pairs</option>
                  <option value="all">All Pairs</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Volume Profile</label>
                <select
                  value={config.volumeProfile}
                  onChange={(e) => updateConfig({ volumeProfile: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                >
                  <option value="high">High Volume</option>
                  <option value="medium">Medium Volume</option>
                  <option value="low">Low Volume</option>
                  <option value="any">Any Volume</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-600">
            <h4 className="font-semibold text-white mb-3">Configuration Summary</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Asset:</span> 
                <span className="text-white ml-2 capitalize">{config.assetClass}</span>
              </div>
              <div>
                <span className="text-gray-400">Strategy:</span> 
                <span className="text-white ml-2">{config.strategyType}</span>
              </div>
              <div>
                <span className="text-gray-400">Risk Level:</span> 
                <span className="text-white ml-2 capitalize">{config.riskLevel}</span>
              </div>
              <div>
                <span className="text-gray-400">Timeframe:</span> 
                <span className="text-white ml-2">{config.timeframe}</span>
              </div>
              <div>
                <span className="text-gray-400">Sessions:</span> 
                <span className="text-white ml-2">{config.sessionFilters.join(', ')}</span>
              </div>
              <div>
                <span className="text-gray-400">Last Updated:</span> 
                <span className="text-white ml-2">{new Date(lastUpdate).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={() => updateConfig({})}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Apply Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTacticalParameters;
