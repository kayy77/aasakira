
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Star, 
  Eye, 
  Save,
  Clock,
  Shield,
  TrendingUp,
  Coins,
  BarChart3,
  Zap
} from 'lucide-react';
import { SignalConfig, SavedPreset, TradeType, RiskLevel, AssetClass, StrategyType } from '@/types/signalConfig';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface EnhancedTacticalParametersProps {
  config: SignalConfig;
  onConfigChange: (config: SignalConfig) => void;
  onShowBreakdown: () => void;
  onGenerateSignal: () => void;
  isGenerating: boolean;
}

const tradeTypeIcons = {
  scalp: Clock,
  intraday: Zap,
  swing: TrendingUp,
  position: BarChart3
};

const riskLevelColors = {
  conservative: 'bg-green-500/20 text-green-400 border-green-500/30',
  moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  aggressive: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const assetClassIcons = {
  forex: Coins,
  crypto: TrendingUp,
  commodities: BarChart3,
  indices: Shield
};

export const EnhancedTacticalParameters: React.FC<EnhancedTacticalParametersProps> = ({
  config,
  onConfigChange,
  onShowBreakdown,
  onGenerateSignal,
  isGenerating
}) => {
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const updateConfig = (updates: Partial<SignalConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your preset",
        variant: "destructive"
      });
      return;
    }

    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      config: { ...config },
      createdAt: new Date()
    };

    setSavedPresets(prev => [newPreset, ...prev]);
    setPresetName('');
    setShowSaveForm(false);
    
    toast({
      title: "Preset Saved",
      description: `"${newPreset.name}" loadout saved successfully`,
    });
  };

  const loadPreset = (preset: SavedPreset) => {
    onConfigChange(preset.config);
    toast({
      title: "Preset Loaded",
      description: `"${preset.name}" configuration applied`,
    });
  };

  const getTradeTypeDescription = (type: TradeType) => {
    const descriptions = {
      scalp: 'Quick 5-15min trades',
      intraday: '1-4 hour trades',
      swing: '1-5 day holds',
      position: 'Weekly+ positions'
    };
    return descriptions[type];
  };

  const getRiskDescription = (risk: RiskLevel) => {
    const descriptions = {
      conservative: 'Safe zones, tight stops',
      moderate: 'Balanced setup',
      aggressive: 'High risk/reward'
    };
    return descriptions[risk];
  };

  const getAssetDescription = (asset: AssetClass) => {
    const descriptions = {
      forex: 'Currency pairs',
      crypto: 'Digital assets',
      commodities: 'Gold, Oil, etc.',
      indices: 'Stock indices'
    };
    return descriptions[asset];
  };

  return (
    <Card className="bg-gray-950/50 border-gray-600/30 glow-soft animate-section-load">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 font-zen-maru text-lg md:text-xl">
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
          ENHANCED TACTICAL PARAMETERS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        {/* Main Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Strategy Type */}
          <div>
            <label className="text-xs md:text-sm text-gray-400 mb-1 block font-zen-maru">Strategy Type</label>
            <Select value={config.strategyType} onValueChange={(value) => updateConfig({ strategyType: value as StrategyType })}>
              <SelectTrigger className="w-full bg-gray-800 border border-gray-600 text-white text-xs md:text-sm font-noto glow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="Hybrid">⚡ Hybrid</SelectItem>
                <SelectItem value="Institutional">⛩️ Institutional</SelectItem>
                <SelectItem value="SMC">🥋 SMC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trade Type */}
          <div>
            <label className="text-xs md:text-sm text-gray-400 mb-1 block font-zen-maru">Trade Type</label>
            <Select value={config.tradeType} onValueChange={(value) => updateConfig({ tradeType: value as TradeType })}>
              <SelectTrigger className="w-full bg-gray-800 border border-gray-600 text-white text-xs md:text-sm font-noto glow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="scalp">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Scalp
                  </div>
                </SelectItem>
                <SelectItem value="intraday">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Intraday
                  </div>
                </SelectItem>
                <SelectItem value="swing">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Swing
                  </div>
                </SelectItem>
                <SelectItem value="position">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3 h-3" />
                    Position
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">{getTradeTypeDescription(config.tradeType)}</p>
          </div>

          {/* Min Confidence */}
          <div>
            <label className="text-xs md:text-sm text-gray-400 mb-1 block font-zen-maru">Min Confidence</label>
            <Select value={config.confidenceThreshold.toString()} onValueChange={(value) => updateConfig({ confidenceThreshold: parseInt(value) })}>
              <SelectTrigger className="w-full bg-gray-800 border border-gray-600 text-white text-xs md:text-sm font-noto glow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="70">70%+</SelectItem>
                <SelectItem value="80">80%+</SelectItem>
                <SelectItem value="90">90%+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Risk Level */}
          <div>
            <label className="text-xs md:text-sm text-gray-400 mb-1 block font-zen-maru">Risk Level</label>
            <Select value={config.riskLevel} onValueChange={(value) => updateConfig({ riskLevel: value as RiskLevel })}>
              <SelectTrigger className="w-full bg-gray-800 border border-gray-600 text-white text-xs md:text-sm font-noto glow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="conservative">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-green-400" />
                    Conservative
                  </div>
                </SelectItem>
                <SelectItem value="moderate">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-yellow-400" />
                    Moderate
                  </div>
                </SelectItem>
                <SelectItem value="aggressive">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-red-400" />
                    Aggressive
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">{getRiskDescription(config.riskLevel)}</p>
          </div>
        </div>

        {/* Secondary Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Min Confluence */}
          <div>
            <label className="text-xs md:text-sm text-gray-400 mb-1 block font-zen-maru">Min Confluence</label>
            <Select value={config.minFilters.toString()} onValueChange={(value) => updateConfig({ minFilters: parseInt(value) })}>
              <SelectTrigger className="w-full bg-gray-800 border border-gray-600 text-white text-xs md:text-sm font-noto glow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="3">3/6 Frameworks</SelectItem>
                <SelectItem value="4">4/6 Frameworks</SelectItem>
                <SelectItem value="5">5/6 Frameworks</SelectItem>
                <SelectItem value="6">6/6 Frameworks (Elite)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Asset Class */}
          <div>
            <label className="text-xs md:text-sm text-gray-400 mb-1 block font-zen-maru">Asset Class</label>
            <Select value={config.assetClass} onValueChange={(value) => updateConfig({ assetClass: value as AssetClass })}>
              <SelectTrigger className="w-full bg-gray-800 border border-gray-600 text-white text-xs md:text-sm font-noto glow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="forex">
                  <div className="flex items-center gap-2">
                    <Coins className="w-3 h-3" />
                    Forex
                  </div>
                </SelectItem>
                <SelectItem value="crypto">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Crypto
                  </div>
                </SelectItem>
                <SelectItem value="commodities">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3 h-3" />
                    Commodities
                  </div>
                </SelectItem>
                <SelectItem value="indices">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3" />
                    Indices
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">{getAssetDescription(config.assetClass)}</p>
          </div>

          {/* Pair Filter */}
          <div>
            <label className="text-xs md:text-sm text-gray-400 mb-1 block font-zen-maru">Pair Filter</label>
            <Select value={config.pairFilter} onValueChange={(value) => updateConfig({ pairFilter: value as any })}>
              <SelectTrigger className="w-full bg-gray-800 border border-gray-600 text-white text-xs md:text-sm font-noto glow-soft">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-600">
                <SelectItem value="majors">Major Pairs</SelectItem>
                <SelectItem value="eurusd">EUR/USD Only</SelectItem>
                <SelectItem value="all">All Pairs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Save Preset */}
          <div>
            <label className="text-xs md:text-sm text-gray-400 mb-1 block font-zen-maru">Save Loadout</label>
            {!showSaveForm ? (
              <Button
                onClick={() => setShowSaveForm(true)}
                variant="outline"
                size="sm"
                className="w-full border-purple-500/30 hover:bg-purple-500/20 text-purple-400 font-zen-maru glow-soft"
              >
                <Star className="w-3 h-3 mr-2" />
                Save Preset
              </Button>
            ) : (
              <div className="flex gap-1">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Preset name..."
                  className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && savePreset()}
                />
                <Button onClick={savePreset} size="sm" className="px-2">
                  <Save className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Current Configuration Display */}
        <div className="bg-gray-800/30 rounded-lg p-3 md:p-4">
          <h4 className="text-sm font-semibold text-white mb-2 font-zen-maru">Current Configuration:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge className={riskLevelColors[config.riskLevel]}>
              {config.riskLevel.toUpperCase()}
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {config.tradeType.toUpperCase()}
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {config.assetClass.toUpperCase()}
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {config.confidenceThreshold}%+ CONFIDENCE
            </Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {config.minFilters}/6 FILTERS
            </Badge>
          </div>
          {config.confidenceThreshold >= 90 && config.minFilters >= 5 && (
            <div className="mt-2 p-2 bg-gold-500/10 border border-gold-500/30 rounded">
              <p className="text-gold-400 text-xs font-semibold">🏆 INSTITUTIONAL GRADE CONFIGURATION DETECTED</p>
            </div>
          )}
        </div>

        {/* Saved Presets */}
        {savedPresets.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2 font-zen-maru">Saved Presets:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {savedPresets.map((preset) => (
                <Button
                  key={preset.id}
                  onClick={() => loadPreset(preset)}
                  variant="outline"
                  size="sm"
                  className="justify-start border-gray-600 hover:bg-gray-700/50 text-left"
                >
                  <Star className="w-3 h-3 mr-2 text-yellow-400" />
                  <span className="truncate">{preset.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <Button
            onClick={onShowBreakdown}
            variant="outline"
            className="flex-1 border-blue-500/30 hover:bg-blue-500/20 text-blue-400 font-zen-maru glow-soft"
          >
            <Eye className="w-4 h-4 mr-2" />
            Show Strategy Breakdown
          </Button>
          
          <Button
            onClick={onGenerateSignal}
            disabled={isGenerating}
            className="flex-1 bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/50 hover:bg-pink-500/30 font-zen-maru font-bold glow-intense"
          >
            {isGenerating ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                AI COUNCIL VOTING...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                GENERATE SIGNAL ⚔️
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedTacticalParameters;
