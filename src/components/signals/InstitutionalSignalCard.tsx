
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Clock, 
  BarChart3, 
  Activity, 
  Zap,
  Crown,
  Brain,
  CheckCircle2,
  Building2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Wifi,
  RefreshCw
} from 'lucide-react';
import type { InstitutionalSignal } from '@/services/institutionalSignalService';
import { institutionalSignalService } from '@/services/institutionalSignalService';

interface InstitutionalSignalCardProps {
  signal: InstitutionalSignal;
  onAnalyze?: (signal: InstitutionalSignal) => void;
  onPriceUpdate?: (newPrice: number, source: string) => void;
}

const InstitutionalSignalCard: React.FC<InstitutionalSignalCardProps> = ({ signal, onAnalyze, onPriceUpdate }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [localSignal, setLocalSignal] = useState(signal);

  // Update local signal when prop changes
  useEffect(() => {
    setLocalSignal(signal);
  }, [signal]);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'INSTITUTIONAL': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30';
      case 'HIGH': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MEDIUM': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'buy' 
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'INSTITUTIONAL': return <Crown className="w-4 h-4" />;
      case 'HIGH': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleAnalyze = () => {
    setShowAnalysis(true);
    onAnalyze?.(localSignal);
  };

  const updateLivePrice = async () => {
    setIsUpdatingPrice(true);
    try {
      console.log(`🔄 Manually refreshing price for ${localSignal.pair}...`);
      
      const success = await institutionalSignalService.updateSignalPrice(localSignal.id);
      
      if (success) {
        // Get the updated signal
        const updatedSignals = institutionalSignalService.getLatestSignals();
        const updatedSignal = updatedSignals.find(s => s.id === localSignal.id);
        
        if (updatedSignal && updatedSignal.livePrice) {
          setLocalSignal(updatedSignal);
          onPriceUpdate?.(updatedSignal.livePrice, updatedSignal.priceSource);
          console.log(`✅ Price updated for ${localSignal.pair}: ${updatedSignal.livePrice}`);
        }
      }
    } catch (error) {
      console.error('Failed to update live price:', error);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Get the current live price to display
  const displayPrice = localSignal.livePrice || parseFloat(localSignal.entry);
  const priceAge = localSignal.lastPriceUpdate 
    ? Math.floor((Date.now() - localSignal.lastPriceUpdate.getTime()) / 1000)
    : null;

  return (
    <>
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 relative overflow-hidden">
        {/* Institutional Badge */}
        {localSignal.confidence === 'INSTITUTIONAL' && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30">
              <Crown className="w-3 h-3 mr-1" />
              INSTITUTIONAL
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              {localSignal.direction === 'buy' ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              {localSignal.pair}
              <Building2 className="w-4 h-4 text-yellow-400" />
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={getDirectionColor(localSignal.direction)}>
                {localSignal.direction.toUpperCase()}
              </Badge>
              <Badge className={getConfidenceColor(localSignal.confidence)}>
                {getConfidenceIcon(localSignal.confidence)}
                {localSignal.confidence}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* LIVE PRICE DISPLAY - Main Feature */}
          <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-blue-400" />
                <span className="text-lg font-bold text-blue-400">LIVE PRICE</span>
              </div>
              <Button
                onClick={updateLivePrice}
                disabled={isUpdatingPrice}
                variant="outline"
                size="sm"
                className="border-blue-500/30 hover:bg-blue-500/20"
              >
                {isUpdatingPrice ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-white mb-1">
                {displayPrice.toFixed(localSignal.pair.includes('JPY') ? 3 : 5)}
              </div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-blue-400">Source: {localSignal.priceSource}</span>
                <div className="flex items-center gap-1">
                  {localSignal.priceAccuracy === 'VERIFIED' && <CheckCircle className="w-3 h-3 text-green-400" />}
                  {localSignal.priceAccuracy === 'WARNING' && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                  {localSignal.priceAccuracy === 'FALLBACK' && <XCircle className="w-3 h-3 text-red-400" />}
                  <Badge variant={
                    localSignal.priceAccuracy === 'VERIFIED' ? 'default' : 
                    localSignal.priceAccuracy === 'WARNING' ? 'secondary' : 'destructive'
                  } className="text-xs">
                    {localSignal.priceAccuracy}
                  </Badge>
                </div>
              </div>
              {priceAge !== null && (
                <div className="text-xs text-gray-400 mt-1">
                  Updated {priceAge}s ago
                </div>
              )}
            </div>
          </div>

          {/* Filters Passed */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Smart Money Filters</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                {localSignal.filters_passed.length}/6 PASSED
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {localSignal.filters_passed.map((filter, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                  <span className="text-white text-xs font-medium">{filter}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Session & Timeframe */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700/30 rounded-lg p-2 text-center">
              <p className="text-gray-400 text-xs mb-1">Session</p>
              <p className="text-blue-400 font-bold text-sm">{localSignal.session}</p>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-2 text-center">
              <p className="text-gray-400 text-xs mb-1">Timeframe</p>
              <p className="text-purple-400 font-bold text-sm">{localSignal.timeframe}</p>
            </div>
          </div>

          {/* Price Levels */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center bg-gray-700/30 rounded-lg p-3">
              <p className="text-gray-400 mb-1 text-xs">Entry</p>
              <p className="text-white font-mono font-bold">{localSignal.entry}</p>
            </div>
            <div className="text-center bg-red-500/10 rounded-lg p-3">
              <p className="text-gray-400 mb-1 text-xs">Stop Loss</p>
              <p className="text-red-400 font-mono font-bold">{localSignal.stop_loss}</p>
            </div>
            <div className="text-center bg-green-500/10 rounded-lg p-3">
              <p className="text-gray-400 mb-1 text-xs">Take Profit</p>
              <p className="text-green-400 font-mono font-bold">{localSignal.take_profit}</p>
            </div>
          </div>

          {/* Risk Reward */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Risk:Reward Ratio</span>
            </div>
            <p className="text-green-400 font-bold text-lg">{localSignal.risk_reward}</p>
          </div>

          {/* Analysis Button */}
          <Button 
            onClick={handleAnalyze}
            variant="outline"
            size="sm"
            className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Brain className="w-4 h-4 mr-2" />
            View Smart Money Analysis
          </Button>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{localSignal.timestamp.toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Modal */}
      <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
        <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-yellow-400" />
              🧠 Institutional Signal Analysis
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center border-b border-gray-700 pb-4">
              <h3 className="text-lg font-bold text-white">
                {localSignal.direction.toUpperCase()} - {localSignal.pair}
              </h3>
              <p className="text-gray-400 text-sm">
                {localSignal.confidence} Grade • {localSignal.session} Session
              </p>
            </div>

            {/* Smart Money Reasoning */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Smart Money Concepts Analysis
              </h4>
              <div className="space-y-3">
                {Object.entries(localSignal.reasoning).map(([filter, reason], index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium text-sm">{filter}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Price Information */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Live Price Data
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Price:</span>
                    <span className="text-blue-400 font-mono font-bold">
                      {displayPrice.toFixed(localSignal.pair.includes('JPY') ? 3 : 5)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Source:</span>
                    <span className="text-blue-400 font-medium">{localSignal.priceSource}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Accuracy:</span>
                    <div className="flex items-center gap-1">
                      {localSignal.priceAccuracy === 'VERIFIED' && <CheckCircle className="w-3 h-3 text-green-400" />}
                      {localSignal.priceAccuracy === 'WARNING' && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                      {localSignal.priceAccuracy === 'FALLBACK' && <XCircle className="w-3 h-3 text-red-400" />}
                      <span className={
                        localSignal.priceAccuracy === 'VERIFIED' ? 'text-green-400' :
                        localSignal.priceAccuracy === 'WARNING' ? 'text-yellow-400' : 'text-red-400'
                      }>
                        {localSignal.priceAccuracy}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Entry:</span>
                    <span className="text-white font-mono font-bold">{localSignal.entry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-red-400 font-mono font-bold">{localSignal.stop_loss}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="text-green-400 font-mono font-bold">{localSignal.take_profit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade Setup */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <h5 className="text-gray-400 text-sm mb-2">Entry Setup</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Direction:</span>
                    <span className={localSignal.direction === 'buy' ? 'text-green-400' : 'text-red-400'}>
                      {localSignal.direction.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Session:</span>
                    <span className="text-blue-400">{localSignal.session}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3">
                <h5 className="text-gray-400 text-sm mb-2">Risk Management</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">R:R:</span>
                    <span className="text-green-400 font-bold">{localSignal.risk_reward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Filters:</span>
                    <span className="text-yellow-400">{localSignal.filters_passed.length}/6</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional Notes */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4">
              <h4 className="text-purple-400 font-medium mb-2">⚠️ Institutional Trading Notes</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• This signal follows institutional smart money concepts</p>
                <p>• Risk-to-reward minimum of 1:2 maintained</p>
                <p>• Entry based on {localSignal.filters_passed.length}/6 confluence factors</p>
                <p>• Quality over quantity - only high-probability setups</p>
                <p>• Live price validation ensures accuracy</p>
              </div>
            </div>

            <div className="text-center">
              <Badge className={getConfidenceColor(localSignal.confidence)}>
                ✅ {localSignal.confidence} GRADE SIGNAL
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstitutionalSignalCard;
