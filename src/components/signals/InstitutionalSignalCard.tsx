import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  AlertTriangle,
  Activity,
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { InstitutionalSignal } from '@/services/institutionalSignalEngine';

interface InstitutionalSignalCardProps {
  signal: InstitutionalSignal;
}

const InstitutionalSignalCard: React.FC<InstitutionalSignalCardProps> = ({ signal }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white';
      case 'A': return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white';
      case 'B+': return 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white';
      case 'B': return 'bg-gradient-to-r from-yellow-600 to-emerald-600 text-white';
      default: return 'bg-gray-600 text-gray-300';
    }
  };

  const formatPrice = (price: number) => {
    return signal.pair.includes('JPY') ? price.toFixed(3) : price.toFixed(5);
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${signal.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {signal.type === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-bold">{signal.type}</span>
              </div>
              <span className="text-xl font-bold text-white">{signal.pair}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getGradeColor(signal.institutionalGrade)}>
                {signal.institutionalGrade}
              </Badge>
              <Badge variant="outline">
                {signal.signalStrength}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Confidence</div>
            <div className="text-2xl font-bold text-purple-400">{signal.confidence}%</div>
            <Progress value={signal.confidence} className="h-2 mt-1" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Confluence</div>
            <div className="text-2xl font-bold text-blue-400">{signal.confluenceScore}/10</div>
            <Progress value={(signal.confluenceScore / 10) * 100} className="h-2 mt-1" />
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-2xl font-bold text-emerald-400">{signal.expectedWinRate}%</div>
            <Progress value={signal.expectedWinRate} className="h-2 mt-1" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            Trading Levels
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">Entry</div>
              <div className="text-white font-mono text-lg">{formatPrice(signal.riskReward.entry)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Risk:Reward</div>
              <div className="text-emerald-400 font-bold text-lg">1:{signal.riskReward.riskRewardRatio}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Stop Loss</div>
              <div className="text-red-400 font-mono">{formatPrice(signal.riskReward.stopLoss)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Take Profit</div>
              <div className="text-emerald-400 font-mono">{formatPrice(signal.riskReward.takeProfit1)}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">
              {signal.sessionContext.currentSession.toUpperCase()} Session
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Vol: {signal.sessionContext.volatilityScore}%
          </div>
        </div>

        {signal.warnings.length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Warnings
            </div>
            <ul className="text-sm text-yellow-300 space-y-1">
              {signal.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
            <Brain className="w-4 h-4" />
            Institutional Analysis
          </div>
          <p className="text-sm text-blue-200 leading-relaxed">{signal.justification}</p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show Order Flow Analysis
            </>
          )}
        </Button>

        {showDetails && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h5 className="text-white font-semibold flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-purple-400" />
              Order Flow & Smart Money
            </h5>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Smart Money Flow</div>
                <div className="text-emerald-400 font-medium">
                  {signal.orderFlow.footprintAnalysis.smartMoneyFlow.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-gray-400">Whale Activity</div>
                <div className="text-white font-medium">{signal.orderFlow.institutionalFootprint.whaleActivity}%</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InstitutionalSignalCard;