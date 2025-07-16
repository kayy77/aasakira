
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  DropletIcon as Droplet,
  Volume2,
  Clock,
  Activity,
  Target,
  Shield
} from 'lucide-react';
import { StrategyBreakdown } from '@/types/signalConfig';

interface StrategyBreakdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  breakdown: StrategyBreakdown;
  confidence: number;
}

const frameworkDetails = {
  smc: {
    name: 'Smart Money Concepts',
    icon: TrendingUp,
    description: 'Market structure analysis, BOS, CHoCH patterns',
    color: 'text-green-400'
  },
  liquidity: {
    name: 'Liquidity Sweep',
    icon: Droplet,
    description: 'Hunt and react to liquidity grabs',
    color: 'text-blue-400'
  },
  fvg: {
    name: 'Fair Value Gap',
    icon: Target,
    description: 'Imbalance zones and gap fills',
    color: 'text-yellow-400'
  },
  volume: {
    name: 'Volume Analysis',
    icon: Volume2,
    description: 'Institutional flow and volume spikes',
    color: 'text-purple-400'
  },
  session: {
    name: 'Session Filter',
    icon: Clock,
    description: 'London/NY session timing',
    color: 'text-orange-400'
  },
  rsiEma: {
    name: 'RSI/EMA Confluence',
    icon: Activity,
    description: 'Technical momentum confirmation',
    color: 'text-pink-400'
  }
};

export const StrategyBreakdownModal: React.FC<StrategyBreakdownModalProps> = ({
  open,
  onOpenChange,
  breakdown,
  confidence
}) => {
  const passedFrameworks = Object.entries(breakdown).filter(([_, passed]) => passed);
  const passedCount = passedFrameworks.length;
  const totalFrameworks = Object.keys(breakdown).length;
  
  const getGradeLevel = () => {
    if (passedCount === 6) return { level: 'INSTITUTIONAL GRADE', color: 'text-gold-400', bg: 'bg-gold-500/20' };
    if (passedCount === 5) return { level: 'PROFESSIONAL', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (passedCount === 4) return { level: 'QUALIFIED', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (passedCount === 3) return { level: 'BASIC', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'REJECTED', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const grade = getGradeLevel();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-950 border-purple-500/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            Strategy Framework Analysis
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            AI Council evaluation breakdown showing which frameworks validated this signal opportunity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Grade */}
          <div className={`p-4 rounded-lg border ${grade.bg} border-gray-600/30`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-bold ${grade.color}`}>{grade.level}</h3>
              <Badge className={`${grade.bg} ${grade.color} border-0`}>
                {passedCount}/{totalFrameworks} Frameworks
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress 
                  value={(passedCount / totalFrameworks) * 100} 
                  className="h-2"
                />
              </div>
              <span className="text-white font-bold">{confidence}% Confidence</span>
            </div>
          </div>

          {/* Framework Details */}
          <div className="grid gap-3">
            {Object.entries(breakdown).map(([key, passed]) => {
              const framework = frameworkDetails[key as keyof StrategyBreakdown];
              const Icon = framework.icon;
              
              return (
                <div 
                  key={key}
                  className={`p-3 rounded-lg border transition-all ${
                    passed 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      <Icon className={`w-4 h-4 ${framework.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold">{framework.name}</h4>
                        {passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{framework.description}</p>
                    </div>
                    <Badge 
                      className={`${
                        passed 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      } border-0`}
                    >
                      {passed ? 'PASS ✓' : 'FAIL ✗'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signal Quality Assessment */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Signal Quality Assessment:</h4>
            <div className="space-y-2 text-sm">
              {passedCount >= 5 && (
                <p className="text-green-400">✓ Institutional-grade confluence detected</p>
              )}
              {passedCount >= 4 && (
                <p className="text-blue-400">✓ Multiple framework validation achieved</p>
              )}
              {passedCount >= 3 && (
                <p className="text-yellow-400">✓ Basic signal criteria met</p>
              )}
              {confidence >= 80 && (
                <p className="text-purple-400">✓ High confidence threshold exceeded</p>
              )}
              {confidence >= 90 && (
                <p className="text-gold-400">✓ Elite confidence level achieved</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrategyBreakdownModal;
