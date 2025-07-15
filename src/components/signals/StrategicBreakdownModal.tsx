
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SignalDNA } from '@/services/multiIntelligenceCore';

interface StrategicBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signalDNA: SignalDNA;
}

const StrategicBreakdownModal: React.FC<StrategicBreakdownModalProps> = ({
  open,
  onOpenChange,
  signalDNA
}) => {
  const approvedModules = Object.entries(signalDNA.origin).filter(([_, approved]) => approved);
  const rejectedModules = Object.entries(signalDNA.origin).filter(([_, approved]) => !approved);

  const getModuleDetails = (key: string, approved: boolean) => {
    const isLong = parseFloat(signalDNA.structure.takeProfit) > parseFloat(signalDNA.structure.entry);
    
    const moduleInfo = {
      institutional: {
        name: 'Institutional Engine',
        analysis: approved 
          ? `Detected ${isLong ? 'bullish' : 'bearish'} imbalance at ${signalDNA.structure.entry} with large-volume reclaim of prior zone.`
          : 'Insufficient institutional footprint detected at current levels.'
      },
      smc: {
        name: 'SMC Engine',
        analysis: approved 
          ? `Break of structure on ${signalDNA.timeframe}. Discount OB entry + FVG. ${signalDNA.filters.length}/6 filters passed.`
          : 'Structure requirements not met for SMC validation.'
      },
      quant: {
        name: 'Quant Engine',
        analysis: approved 
          ? `Backtest winrate on this structure: ${Math.round(signalDNA.backtest.winRate)}%. Average R:R reached: ${signalDNA.backtest.avgRR.toFixed(1)}.`
          : 'Historical performance below acceptable threshold.'
      },
      volatility: {
        name: 'Volatility Engine',
        analysis: approved 
          ? `Session volatility optimal for execution. Spread within acceptable range.`
          : 'Current volatility conditions unfavorable for this setup.'
      },
      visual: {
        name: 'Visual Engine',
        analysis: approved 
          ? 'Pattern match with historical sniper entry from database archive.'
          : 'No significant pattern correlation identified.'
      },
      mentor: {
        name: 'Mentor Review',
        analysis: approved 
          ? 'This setup is clean. Clear structure, solid confirmation, optimal timing.'
          : 'Setup lacks the precision required for recommendation.'
      }
    };

    return moduleInfo[key as keyof typeof moduleInfo] || { name: key, analysis: 'Analysis pending' };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border border-gray-800 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <DialogTitle className="text-white text-xl font-medium">
            Strategic Breakdown – {signalDNA.symbol} {signalDNA.type.toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-6">
          {/* Approved Engines */}
          <div className="space-y-4">
            {approvedModules.map(([key, _]) => {
              const details = getModuleDetails(key, true);
              return (
                <div key={key} className="border-l-2 border-green-400 pl-4 bg-gray-900/30 p-3 rounded-r">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-green-300 font-medium">{details.name}:</span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed ml-4">
                    {details.analysis}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Rejected Engines */}
          {rejectedModules.length > 0 && (
            <div className="border-t border-gray-800 pt-4">
              <h4 className="text-gray-400 font-medium mb-3">Non-Validated Frameworks:</h4>
              <div className="space-y-2">
                {rejectedModules.map(([key, _]) => {
                  const details = getModuleDetails(key, false);
                  return (
                    <div key={key} className="border-l-2 border-gray-600 pl-4 bg-gray-900/20 p-2 rounded-r">
                      <span className="text-gray-500 text-sm">{details.name}: {details.analysis}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confluence Score */}
          <div className="bg-green-500/5 border border-green-500/20 rounded p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-300 font-medium">Confluence Score</span>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                {approvedModules.length}/6 Validated
              </Badge>
            </div>
            <Progress value={(approvedModules.length / 6) * 100} className="h-2" />
            <p className="text-gray-400 text-xs mt-2">
              Minimum 4/6 frameworks required for signal validation
            </p>
          </div>

          {/* Backtest Data */}
          <div className="bg-gray-900/40 border border-gray-700 rounded p-4">
            <h4 className="text-white font-medium mb-3">
              Backtest Results
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Structure:</span>
                <span className="text-white ml-2">{signalDNA.filters.slice(0, 3).join(' + ')}</span>
              </div>
              <div>
                <span className="text-gray-400">Winrate:</span>
                <span className="text-green-400 ml-2">{Math.round(signalDNA.backtest.winRate)}%</span>
              </div>
              <div>
                <span className="text-gray-400">Avg RR Hit:</span>
                <span className="text-blue-400 ml-2">{signalDNA.backtest.avgRR.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-gray-400">Historical Examples:</span>
                <span className="text-white ml-2">{signalDNA.backtest.totalTrades}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700/50 text-sm">
              <div className="flex justify-between">
                <span className="text-green-400">TP Hit: {Math.round(signalDNA.backtest.totalTrades * signalDNA.backtest.winRate / 100)}</span>
                <span className="text-red-400">SL Hit: {signalDNA.backtest.totalTrades - Math.round(signalDNA.backtest.totalTrades * signalDNA.backtest.winRate / 100)}</span>
              </div>
            </div>
          </div>

          {/* Mentor Summary */}
          <div className="border-t border-gray-800 pt-4">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded p-4">
              <h4 className="text-yellow-300 font-medium mb-2">Mentor Review:</h4>
              <p className="text-gray-300 italic leading-relaxed">
                "{signalDNA.aiThought}"
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrategicBreakdownModal;
