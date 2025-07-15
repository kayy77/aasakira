
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface ConflictingOutlookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contradictions: string[];
  symbol: string;
}

const ConflictingOutlookModal: React.FC<ConflictingOutlookModalProps> = ({
  open,
  onOpenChange,
  contradictions,
  symbol
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border border-orange-500/30 max-w-2xl">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="text-white flex items-center gap-2 font-serif">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            CONFLICTING OUTLOOK DETECTED
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* Contradiction Details */}
          <div className="space-y-4">
            {contradictions.map((contradiction, index) => (
              <div key={index} className="bg-orange-500/10 border border-orange-500/30 rounded p-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-gray-300 leading-relaxed">{contradiction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Signal Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-red-400 font-medium">Previous Signal</span>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">Pair:</span> <span className="text-white ml-2">{symbol} Sell</span></div>
                <div><span className="text-gray-400">Framework:</span> <span className="text-white ml-2">SMC (4H)</span></div>
                <div><span className="text-gray-400">Structure:</span> <span className="text-white ml-2">Bearish BOS</span></div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Current Signal</span>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">Pair:</span> <span className="text-white ml-2">{symbol} Buy</span></div>
                <div><span className="text-gray-400">Framework:</span> <span className="text-white ml-2">Institutional (5M)</span></div>
                <div><span className="text-gray-400">Structure:</span> <span className="text-white ml-2">Liquidity Reversal</span></div>
              </div>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-4">
            <h4 className="text-blue-300 font-medium mb-3">RECOMMENDED ACTION:</h4>
            <p className="text-gray-300 leading-relaxed">
              Multiple timeframes showing conflict. Consider reducing position size or waiting for clearer confluence. 
              Both signals may be valid on their respective timeframes - institutional liquidity sweeps can occur 
              within larger bearish structures.
            </p>
          </div>

          {/* Risk Management Note */}
          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-sm italic">
              Strategic Note: Conflicting timeframes are common in professional trading. 
              The key is understanding which timeframe aligns with your trading strategy and risk tolerance.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConflictingOutlookModal;
