import React, { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Save, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import { SavedPreset } from '@/types/signalConfig';

interface EnhancedTacticalParametersProps {
  onPresetSaved: (preset: SavedPreset) => void;
}

const EnhancedTacticalParameters: React.FC<EnhancedTacticalParametersProps> = ({ onPresetSaved }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'SMC' | 'ICT' | 'BREAK_RETEST' | 'LIQUIDITY_SWEEP'>('SMC');
  const [selectedTradeType, setSelectedTradeType] = useState<string>('swing');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(75);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [minFilters, setMinFilters] = useState<number>(3);
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('forex');
  const [selectedPair, setSelectedPair] = useState<string>('EURUSD');
  const [presetName, setPresetName] = useState<string>('');
  const { toast } = useToast()

  const handleSavePreset = () => {
    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      name: presetName,
      description: `${selectedStrategy} strategy with ${selectedRiskLevel} risk`,
      createdAt: new Date().toISOString(),
      config: {
        strategyType: selectedStrategy,
        confidenceThreshold: confidenceThreshold,
        riskLevel: selectedRiskLevel,
        minFilters: minFilters,
        assetClass: selectedAssetClass.toUpperCase() as 'FOREX' | 'CRYPTO' | 'STOCKS' | 'COMMODITIES',
        pairFilter: selectedPair,
        // Add required fields with defaults
        pair: selectedPair || 'EURUSD',
        timeframe: '15m',
        marketConditions: [],
        technicalIndicators: [],
        riskParameters: {
          maxRisk: 0.02,
          riskRewardRatio: 2.0
        },
        riskReward: 2.0,
        pairFilters: [],
        minConfidence: confidenceThreshold,
        maxSignalsPerHour: 3,
        enabled: true,
        stopLoss: 0.001,
        takeProfit: 0.002,
        entryType: 'market' as const,
        tradeType: selectedTradeType === 'intraday' ? 'SCALP' : 'SWING'
      }
    };

    onPresetSaved(newPreset);
    toast({
      title: "Preset Saved",
      description: "Your enhanced tactical parameters have been saved.",
    })
  };

  return (
    <div className="glass-card p-8 mb-8 hover-glow border-yellow-500/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-yellow-500/30">
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">✨ Enhanced Tactical Parameters</h2>
            <p className="text-gray-400">Customize your signal generation</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Type */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Strategy Type</label>
          <Select onValueChange={(value) => setSelectedStrategy(value as 'SMC' | 'ICT' | 'BREAK_RETEST' | 'LIQUIDITY_SWEEP')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMC">Smart Money Concepts</SelectItem>
              <SelectItem value="ICT">Inner Circle Trader</SelectItem>
              <SelectItem value="BREAK_RETEST">Break and Retest</SelectItem>
              <SelectItem value="LIQUIDITY_SWEEP">Liquidity Sweep</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Trade Type */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Trade Type</label>
          <Select onValueChange={setSelectedTradeType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select trade type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="swing">Swing Trade</SelectItem>
              <SelectItem value="intraday">Intraday Scalp</SelectItem>
              <SelectItem value="position">Position Trade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Confidence Threshold */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Confidence Threshold</label>
          <Slider
            defaultValue={[confidenceThreshold]}
            max={100}
            step={1}
            onValueChange={(value) => setConfidenceThreshold(value[0])}
          />
          <p className="text-gray-400 text-sm mt-1">Current: {confidenceThreshold}%</p>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Risk Level</label>
          <Select onValueChange={(value) => setSelectedRiskLevel(value as 'LOW' | 'MEDIUM' | 'HIGH')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Filters */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Minimum Filters</label>
          <Slider
            defaultValue={[minFilters]}
            max={5}
            step={1}
            onValueChange={(value) => setMinFilters(value[0])}
          />
          <p className="text-gray-400 text-sm mt-1">Current: {minFilters}</p>
        </div>

        {/* Asset Class */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Asset Class</label>
          <Select onValueChange={setSelectedAssetClass}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select asset class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="forex">Forex</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="stocks">Stocks</SelectItem>
              <SelectItem value="commodities">Commodities</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pair Filter */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Pair Filter</label>
          <Input
            type="text"
            placeholder="Enter pair (e.g., EURUSD)"
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
          />
        </div>

        {/* Preset Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Preset Name</label>
          <Input
            type="text"
            placeholder="Enter preset name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
        </div>
      </div>

      <Button className="w-full mt-8 bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 text-white font-bold" onClick={handleSavePreset}>
        <Save className="w-4 h-4 mr-2" />
        Save Enhanced Preset
      </Button>
    </div>
  );
};

export default EnhancedTacticalParameters;
