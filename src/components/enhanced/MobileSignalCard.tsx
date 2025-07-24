
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  HelpCircle,
  Play,
  Lock,
  Activity,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Signal } from '@/types/signalConfig';

interface MobileSignalCardProps {
  signal: Signal;
  isPremium: boolean;
  onExplain: (signal: Signal) => void;
  onReplay: (signal: Signal) => void;
}

const MobileSignalCard: React.FC<MobileSignalCardProps> = ({ 
  signal, 
  isPremium, 
  onExplain, 
  onReplay 
}) => {
  const isHighQuality = signal.confidence >= 75 && ['Smart_Money', 'Multi_Confluence'].includes(signal.strategy);
  const timeAgo = new Date(signal.timestamp).toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <Card className={`glass-card hover-glow border-2 transition-all duration-300 ${
      isHighQuality ? 'border-gold-500/50 shadow-gold-500/20' : 'border-purple-500/30'
    }`}>
      <CardHeader className="pb-3 px-4 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              signal.type === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {signal.type === 'BUY' ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs px-2 py-1 font-bold ${
                  signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                } border-0`}>
                  {signal.type}
                </Badge>
                <span className="font-bold text-white text-sm">{signal.pair}</span>
              </div>
              {isHighQuality && (
                <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 text-xs px-2 py-0.5 mt-1">
                  <Crown className="w-2 h-2 mr-1" />
                  PRO
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge className={`border-0 text-xs px-2 py-1 ${
              signal.confidence >= 80 ? 'bg-green-500/20 text-green-400' :
              signal.confidence >= 65 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {signal.confidence}%
            </Badge>
          </div>
        </div>
        
        {/* Live Price Info */}
        <div className="flex items-center justify-between text-xs bg-gray-800/40 rounded-lg p-2 mt-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-green-400" />
            <span className="text-gray-400">Live:</span>
            <span className="text-white font-mono text-xs">{signal.livePrice || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="text-blue-300 text-xs">{timeAgo} UTC</span>
          </div>
        </div>

        {/* Spread Warning */}
        {signal.spreadToMarket && signal.spreadToMarket > 1 && (
          <div className="text-xs text-yellow-300 bg-yellow-500/10 rounded p-2 mt-2">
            ⚠️ Spread to market: {signal.spreadToMarket}%
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 px-4 pb-4">
        {/* Mobile-Optimized Entry Details */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-800/30 rounded p-2 text-center">
              <div className="text-gray-400 mb-1 text-xs">Entry</div>
              <div className="text-white font-bold font-mono text-sm">
                {typeof signal.entry === 'number' ? 
                  signal.entry.toFixed(signal.pair.includes('JPY') ? 3 : signal.pair.includes('USD') && (signal.pair.includes('BTC') || signal.pair.includes('ETH')) ? 2 : 5) :
                  signal.entry
                }
              </div>
            </div>
            <div className="bg-red-500/10 rounded p-2 text-center">
              <div className="text-gray-400 mb-1 text-xs">Stop</div>
              <div className="text-red-400 font-bold font-mono text-sm">
                {typeof signal.stopLoss === 'number' ? 
                  signal.stopLoss.toFixed(signal.pair.includes('JPY') ? 3 : signal.pair.includes('USD') && (signal.pair.includes('BTC') || signal.pair.includes('ETH')) ? 2 : 5) :
                  signal.stopLoss
                }
              </div>
            </div>
            <div className="bg-green-500/10 rounded p-2 text-center">
              <div className="text-gray-400 mb-1 text-xs">Target</div>
              <div className="text-green-400 font-bold font-mono text-sm">
                {typeof signal.takeProfit === 'number' ? 
                  signal.takeProfit.toFixed(signal.pair.includes('JPY') ? 3 : signal.pair.includes('USD') && (signal.pair.includes('BTC') || signal.pair.includes('ETH')) ? 2 : 5) :
                  signal.takeProfit
                }
              </div>
            </div>
          </div>
        </div>

        {/* Strategy & Risk - Mobile Layout */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs px-2 py-1 flex-1 text-center">
            {signal.strategy.replace('_', ' ')}
          </Badge>
          <Badge variant="outline" className={`border-0 text-xs px-2 py-1 flex-1 text-center ${
            signal.risk === 'Low' ? 'bg-green-500/20 text-green-400' :
            signal.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {signal.risk} Risk
          </Badge>
        </div>

        {/* Analysis - Mobile Optimized */}
        <div className="bg-gray-800/20 rounded p-3">
          <div className="text-gray-300 text-xs leading-relaxed">
            {isPremium || !isHighQuality ? signal.analysis : 
              <div className="flex items-center gap-2 text-gray-500">
                <Lock className="w-3 h-3" />
                <span className="text-xs">Upgrade for full AI analysis & live tracking</span>
              </div>
            }
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onExplain(signal)}
            variant="outline"
            size="sm"
            className="border-purple-500/30 hover:bg-purple-500/20 text-xs h-9"
            disabled={!isPremium && isHighQuality}
          >
            <HelpCircle className="w-3 h-3 mr-1" />
            Analysis
          </Button>
          <Button
            onClick={() => onReplay(signal)}
            variant="outline" 
            size="sm"
            className="border-blue-500/30 hover:bg-blue-500/20 text-xs h-9"
            disabled={!isPremium && isHighQuality}
          >
            <Play className="w-3 h-3 mr-1" />
            Backtest
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileSignalCard;
