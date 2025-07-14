import React, { useState } from 'react';
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
  Wifi
} from 'lucide-react';
import type { InstitutionalSignal } from '@/services/institutionalSignalService';

interface InstitutionalSignalCardProps {
  signal: InstitutionalSignal;
  onAnalyze?: (signal: InstitutionalSignal) => void;
}

const InstitutionalSignalCard: React.FC<InstitutionalSignalCardProps> = ({ signal, onAnalyze }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

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
    onAnalyze?.(signal);
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 relative overflow-hidden">
        {/* Institutional Badge */}
        {signal.confidence === 'INSTITUTIONAL' && (
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
              {signal.direction === 'buy' ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              {signal.pair}
              <Building2 className="w-4 h-4 text-yellow-400" />
            </CardTitle>
            <div className="flex gap-2">
              <Badge className={getDirectionColor(signal.direction)}>
                {signal.direction.toUpperCase()}
              </Badge>
              <Badge className={getConfidenceColor(signal.confidence)}>
                {getConfidenceIcon(signal.confidence)}
                {signal.confidence}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Live Price Source Display */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-blue-400">
                  Live Price: {signal.priceSource}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(signal.priceTimestamp).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {signal.priceAccuracy === 'VERIFIED' && <CheckCircle className="w-4 h-4 text-green-400" />}
              {signal.priceAccuracy === 'WARNING' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
              {signal.priceAccuracy === 'FALLBACK' && <XCircle className="w-4 h-4 text-red-400" />}
              <Badge variant={
                signal.priceAccuracy === 'VERIFIED' ? 'default' : 
                signal.priceAccuracy === 'WARNING' ? 'secondary' : 'destructive'
              } className="text-xs">
                {signal.priceAccuracy}
              </Badge>
            </div>
          </div>

          {/* Filters Passed */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Smart Money Filters</span>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                {signal.filters_passed.length}/6 PASSED
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {signal.filters_passed.map((filter, index) => (
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
              <p className="text-blue-400 font-bold text-sm">{signal.session}</p>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-2 text-center">
              <p className="text-gray-400 text-xs mb-1">Timeframe</p>
              <p className="text-purple-400 font-bold text-sm">{signal.timeframe}</p>
            </div>
          </div>

          {/* Price Levels */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center bg-gray-700/30 rounded-lg p-3">
              <p className="text-gray-400 mb-1 text-xs">Entry</p>
              <p className="text-white font-mono font-bold">{signal.entry}</p>
            </div>
            <div className="text-center bg-red-500/10 rounded-lg p-3">
              <p className="text-gray-400 mb-1 text-xs">Stop Loss</p>
              <p className="text-red-400 font-mono font-bold">{signal.stop_loss}</p>
            </div>
            <div className="text-center bg-green-500/10 rounded-lg p-3">
              <p className="text-gray-400 mb-1 text-xs">Take Profit</p>
              <p className="text-green-400 font-mono font-bold">{signal.take_profit}</p>
            </div>
          </div>

          {/* Risk Reward */}
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Risk:Reward Ratio</span>
            </div>
            <p className="text-green-400 font-bold text-lg">{signal.risk_reward}</p>
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
            <span>{signal.timestamp.toLocaleTimeString()}</span>
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
                {signal.direction.toUpperCase()} - {signal.pair}
              </h3>
              <p className="text-gray-400 text-sm">
                {signal.confidence} Grade • {signal.session} Session
              </p>
            </div>

            {/* Smart Money Reasoning */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h4 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Smart Money Concepts Analysis
              </h4>
              <div className="space-y-3">
                {Object.entries(signal.reasoning).map(([filter, reason], index) => (
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

            {/* Price Source Info */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Live Price Data
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Source:</span>
                    <span className="text-blue-400 font-medium">{signal.priceSource}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Accuracy:</span>
                    <div className="flex items-center gap-1">
                      {signal.priceAccuracy === 'VERIFIED' && <CheckCircle className="w-3 h-3 text-green-400" />}
                      {signal.priceAccuracy === 'WARNING' && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                      {signal.priceAccuracy === 'FALLBACK' && <XCircle className="w-3 h-3 text-red-400" />}
                      <span className={
                        signal.priceAccuracy === 'VERIFIED' ? 'text-green-400' :
                        signal.priceAccuracy === 'WARNING' ? 'text-yellow-400' : 'text-red-400'
                      }>
                        {signal.priceAccuracy}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fetched:</span>
                    <span className="text-gray-300 text-xs">
                      {new Date(signal.priceTimestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Entry:</span>
                    <span className="text-white font-mono font-bold">{signal.entry}</span>
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
                    <span className="text-gray-400">Entry:</span>
                    <span className="text-white font-mono">{signal.entry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Direction:</span>
                    <span className={signal.direction === 'buy' ? 'text-green-400' : 'text-red-400'}>
                      {signal.direction.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3">
                <h5 className="text-gray-400 text-sm mb-2">Risk Management</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">R:R:</span>
                    <span className="text-green-400 font-bold">{signal.risk_reward}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-red-400 font-mono">{signal.stop_loss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="text-green-400 font-mono">{signal.take_profit}</span>
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
                <p>• Entry based on {signal.filters_passed.length}/6 confluence factors</p>
                <p>• Quality over quantity - only high-probability setups</p>
                <p>• Suitable for traders with institutional mindset</p>
              </div>
            </div>

            <div className="text-center">
              <Badge className={getConfidenceColor(signal.confidence)}>
                ✅ {signal.confidence} GRADE SIGNAL
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstitutionalSignalCard;