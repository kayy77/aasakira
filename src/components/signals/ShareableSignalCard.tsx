
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { SignalDNA } from '@/services/multiIntelligenceCore';
import { EnhancedSignal } from '@/services/enhancedSignalAnalyzer';

interface ShareableSignalCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signal: SignalDNA | EnhancedSignal | null;
}

const ShareableSignalCard: React.FC<ShareableSignalCardProps> = ({ 
  open, 
  onOpenChange, 
  signal 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!signal) return null;

  const generateShareableCard = async () => {
    setIsGenerating(true);
    try {
      const cardElement = document.getElementById('shareable-signal-card');
      if (cardElement) {
        const canvas = await html2canvas(cardElement, {
          backgroundColor: '#0f172a',
          scale: 2,
          useCORS: true,
        });
        
        // Create download link
        const link = document.createElement('a');
        const symbolOrPair = 'symbol' in signal ? signal.symbol : signal.pair;
        link.download = `aasakira-signal-${symbolOrPair}-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error('Failed to generate shareable card:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Check signal type and get appropriate values
  const isSignalDNA = 'symbol' in signal;
  const symbolOrPair = isSignalDNA ? signal.symbol : signal.pair;
  const tradeDirection = isSignalDNA ? signal.type : signal.type;

  // Get trading levels based on signal type
  const getEntry = () => {
    if (isSignalDNA) {
      return Number(signal.structure.entry).toFixed(5);
    }
    return Number(signal.entry).toFixed(5);
  };

  const getStopLoss = () => {
    if (isSignalDNA) {
      return Number(signal.structure.stopLoss).toFixed(5);
    }
    return Number(signal.stopLoss).toFixed(5);
  };

  const getTakeProfit = () => {
    if (isSignalDNA) {
      return Number(signal.structure.takeProfit).toFixed(5);
    }
    return Number(signal.takeProfit).toFixed(5);
  };

  const getStrategy = () => {
    if (isSignalDNA) {
      return 'AI Multi-Intelligence';
    }
    return signal.strategy || 'Enhanced Multi-Filter';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Share Signal</DialogTitle>
          <DialogDescription className="text-gray-400">
            Generate a shareable image of your signal
          </DialogDescription>
        </DialogHeader>

        <div 
          id="shareable-signal-card"
          className="bg-gradient-to-br from-gray-900 to-slate-900 p-6 rounded-lg border border-purple-500/30"
        >
          {/* Signal Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-white">⛩️ Aasakira AI Signal</h2>
            <p className="text-gray-400 text-sm">Institutional Trading Intelligence</p>
          </div>

          {/* Signal Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Pair:</span>
              <span className="text-white font-bold text-xl">
                {symbolOrPair}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Direction:</span>
              <Badge className={`${
                tradeDirection === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              } border-0 font-bold text-lg`}>
                {tradeDirection}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Confidence:</span>
              <span className="text-blue-400 font-bold">{signal.confidence}%</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <div className="text-gray-400">Entry</div>
                <div className="text-white font-mono">
                  {getEntry()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">SL</div>
                <div className="text-red-400 font-mono">
                  {getStopLoss()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">TP</div>
                <div className="text-green-400 font-mono">
                  {getTakeProfit()}
                </div>
              </div>
            </div>

            {/* Strategy Type */}
            <div className="text-center pt-2 border-t border-gray-700">
              <span className="text-purple-400 text-sm">
                {getStrategy()}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={generateShareableCard}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareableSignalCard;
