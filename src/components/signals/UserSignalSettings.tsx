
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Brain, 
  Target, 
  AlertTriangle, 
  RotateCcw,
  CheckCircle,
  Shield
} from 'lucide-react';
import { UserSignalSettings } from '@/types/signalConfig';

interface UserSignalSettingsProps {
  settings: UserSignalSettings;
  onSettingsChange: (settings: UserSignalSettings) => void;
}

export const UserSignalSettingsComponent: React.FC<UserSignalSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSettingChange = (key: keyof UserSignalSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleFilterChange = (filterKey: keyof UserSignalSettings['selectedFilters'], value: boolean) => {
    onSettingsChange({
      ...settings,
      selectedFilters: {
        ...settings.selectedFilters,
        [filterKey]: value
      }
    });
  };

  const resetToRecommended = () => {
    onSettingsChange({
      minConfidence: 65,
      requiredFilters: 3,
      selectedFilters: {
        structureBreak: true,
        liquiditySweep: true,
        fairValueGap: true,
        volumeSpike: true,
        rsiDivergence: false,
        sessionFilter: true
      },
      fallbackMode: false,
      sessionAdaptive: true,
      emergencyOverride: false
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(settings.selectedFilters).filter(Boolean).length;
  };

  const getRiskLevel = () => {
    const activeFilters = getActiveFiltersCount();
    if (settings.minConfidence >= 80 && activeFilters >= 5) return { level: 'Conservative', color: 'bg-green-500/20 text-green-400' };
    if (settings.minConfidence >= 65 && activeFilters >= 3) return { level: 'Moderate', color: 'bg-yellow-500/20 text-yellow-400' };
    if (settings.minConfidence >= 50 && activeFilters >= 2) return { level: 'Aggressive', color: 'bg-orange-500/20 text-orange-400' };
    return { level: 'Very High Risk', color: 'bg-red-500/20 text-red-400' };
  };

  const risk = getRiskLevel();

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">🧠 AI Signal Preferences</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={risk.color}>
              <Shield className="w-3 h-3 mr-1" />
              {risk.level}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToRecommended}
              className="border-purple-500/30 hover:bg-purple-500/10"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset to Recommended
            </Button>
          </div>
        </div>
        <CardDescription>
          Customize your signal quality requirements and filter preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Brain className="w-4 h-4 mr-2 text-purple-400" />
              Minimum AI Confidence
            </Label>
            <Select 
              value={settings.minConfidence.toString()} 
              onValueChange={(value) => handleSettingChange('minConfidence', parseInt(value))}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="50">50% - Very Aggressive</SelectItem>
                <SelectItem value="60">60% - Aggressive</SelectItem>
                <SelectItem value="65">65% - Recommended</SelectItem>
                <SelectItem value="70">70% - Conservative</SelectItem>
                <SelectItem value="75">75% - Strict</SelectItem>
                <SelectItem value="80">80% - Very Strict</SelectItem>
                <SelectItem value="85">85% - Elite</SelectItem>
                <SelectItem value="90">90% - Perfect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2 text-blue-400" />
              Required Filters to Trigger
            </Label>
            <Select 
              value={settings.requiredFilters.toString()} 
              onValueChange={(value) => handleSettingChange('requiredFilters', parseInt(value))}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="1">1 / 6 - Ultra Aggressive</SelectItem>
                <SelectItem value="2">2 / 6 - Very Aggressive</SelectItem>
                <SelectItem value="3">3 / 6 - Recommended</SelectItem>
                <SelectItem value="4">4 / 6 - Conservative</SelectItem>
                <SelectItem value="5">5 / 6 - Strict</SelectItem>
                <SelectItem value="6">6 / 6 - Perfect</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Selection */}
        <div>
          <Label className="text-base font-medium text-white mb-3 block">
            🧪 Active Filters ({getActiveFiltersCount()}/6)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'structureBreak', label: 'Structure Break', icon: '🏗️' },
              { key: 'liquiditySweep', label: 'Liquidity Sweep', icon: '🌊' },
              { key: 'fairValueGap', label: 'Fair Value Gap', icon: '📊' },
              { key: 'volumeSpike', label: 'Volume Spike', icon: '📈' },
              { key: 'rsiDivergence', label: 'RSI Divergence', icon: '📉' },
              { key: 'sessionFilter', label: 'Session Filter', icon: '🕐' }
            ].map((filter) => (
              <div key={filter.key} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-800/30">
                <Switch
                  id={filter.key}
                  checked={settings.selectedFilters[filter.key as keyof UserSignalSettings['selectedFilters']]}
                  onCheckedChange={(checked) => handleFilterChange(filter.key as keyof UserSignalSettings['selectedFilters'], checked)}
                />
                <Label htmlFor={filter.key} className="text-sm text-gray-300 cursor-pointer">
                  {filter.icon} {filter.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-purple-400 hover:bg-purple-500/10 p-0"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options
          </Button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-3 p-4 bg-gray-800/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-300">Fallback Mode</Label>
                  <p className="text-xs text-gray-400">Allow RSI + Volume signals if no SMC setup found</p>
                </div>
                <Switch
                  checked={settings.fallbackMode}
                  onCheckedChange={(checked) => handleSettingChange('fallbackMode', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-300">Session-Adaptive</Label>
                  <p className="text-xs text-gray-400">Relax requirements during Asian session</p>
                </div>
                <Switch
                  checked={settings.sessionAdaptive}
                  onCheckedChange={(checked) => handleSettingChange('sessionAdaptive', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-gray-300">Emergency Override</Label>
                  <p className="text-xs text-gray-400">Force signals with any 2 key factors</p>
                </div>
                <Switch
                  checked={settings.emergencyOverride}
                  onCheckedChange={(checked) => handleSettingChange('emergencyOverride', checked)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Warning for strict settings */}
        {(settings.minConfidence >= 85 || settings.requiredFilters >= 5) && (
          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200">
              <strong>Strict Settings Warning:</strong> These settings may result in very few signals. 
              Consider lowering requirements if no signals are generated for extended periods.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Settings Summary */}
        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-300 font-semibold">Current Configuration:</span>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              {risk.level}
            </Badge>
          </div>
          <div className="text-sm text-purple-200 space-y-1">
            <p>• AI Confidence: {settings.minConfidence}%+ required</p>
            <p>• Filter Confluence: {settings.requiredFilters}/{getActiveFiltersCount()} required</p>
            <p>• Active Filters: {Object.entries(settings.selectedFilters)
              .filter(([_, active]) => active)
              .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
              .join(', ')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSignalSettingsComponent;
