import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProfessionalSignal } from '@/services/professionalTradingEngine';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Brain,
  X,
  Clock,
  Crown,
  Building,
  AlertTriangle
} from 'lucide-react';

interface ProfessionalSignalCardProps {
  signal: ProfessionalSignal;
  onRemove: (id: string) => void;
}

const ProfessionalSignalCard: React.FC<ProfessionalSignalCardProps> = ({ 
  signal, 
  onRemove 
}) => {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'ELITE': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'PROFESSIONAL': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'INSTITUTIONAL': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'STANDARD': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'ELITE': return <Crown className="w-4 h-4" />;
      case 'PROFESSIONAL': return <Building className="w-4 h-4" />;
      case 'INSTITUTIONAL': return <Shield className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="glass-card border-purple-500/20 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${
        signal.quality === 'ELITE' ? 'bg-purple-500' : 
        signal.quality === 'PROFESSIONAL' ? 'bg-blue-500' :
        signal.quality === 'INSTITUTIONAL' ? 'bg-green-500' : 'bg-yellow-500'
      }`} />
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {signal.direction === 'BUY' ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white font-bold">{signal.symbol}</span>
            <Badge className={getQualityColor(signal.quality)}>
              <div className="flex items-center gap-1">
                {getQualityIcon(signal.quality)}
                {signal.quality}
              </div>
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-800 text-gray-300 text-xs">
              {signal.institutionalGrade}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(signal.id)}
              className="text-gray-400 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-400">Entry</div>
            <div className="text-lg font-bold text-white">{signal.entry.toFixed(5)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Confidence</div>
            <div className="text-lg font-bold text-green-400">{signal.confidence}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400">Expected Value</div>
            <div className="text-lg font-bold text-purple-400">{signal.expectedValue.toFixed(2)}</div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Risk Management</span>
            <Badge className={`text-xs ${getRiskColor(signal.riskAnalysis.riskLevel)}`}>
              {signal.riskAnalysis.riskLevel} RISK
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-gray-400">Stop Loss</div>
              <div className="text-red-400 font-medium">{signal.stopLoss.toFixed(5)}</div>
            </div>
            <div>
              <div className="text-gray-400">TP1</div>
              <div className="text-green-400 font-medium">{signal.takeProfit1.toFixed(5)}</div>
            </div>
            <div>
              <div className="text-gray-400">TP2</div>
              <div className="text-green-400 font-medium">{signal.takeProfit2.toFixed(5)}</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            <strong>R:R:</strong> {signal.riskReward} | <strong>Max Risk:</strong> {signal.riskAnalysis.maxRisk}%
          </div>
        </div>

        {/* Professional Analysis */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Professional Analysis</span>
          </div>
          <div className="text-sm text-gray-400">
            <div><strong>Setup:</strong> {signal.setupType}</div>
            <div><strong>Strategy:</strong> {signal.strategy}</div>
            <div><strong>Conviction:</strong> {signal.convictionScore}%</div>
          </div>
        </div>

        {/* Smart Money Concepts */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Smart Money Analysis</div>
          <div className="text-xs text-gray-400 space-y-1">
            {signal.smcAnalysis?.orderBlocks?.map((ob, idx) => (
              <div key={idx}>• {ob}</div>
            ))}
            {signal.smcAnalysis?.fairValueGaps?.map((fvg, idx) => (
              <div key={idx}>• {fvg}</div>
            ))}
            {signal.smcAnalysis?.liquiditySweeps?.map((sweep, idx) => (
              <div key={idx}>• {sweep}</div>
            ))}
            {signal.smcAnalysis?.changeOfCharacter && (
              <div className="text-yellow-400">• Change of Character Confirmed</div>
            )}
            {signal.smcAnalysis?.breakOfStructure && (
              <div className="text-green-400">• {signal.smcAnalysis.breakOfStructure}</div>
            )}
          </div>
        </div>

        {/* IFVG Analysis Section */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-purple-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Institutional Fair Value Gaps (IFVG)
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div className="text-purple-400 font-medium">
              Proximity Score: {signal.smcAnalysis?.institutionalFVG?.proximityScore || 'N/A'}/100
            </div>
            <div className="text-xs text-gray-500 mb-2">
              {signal.smcAnalysis?.institutionalFVG?.layeredAnalysis || 'Multi-timeframe IFVG analysis'}
            </div>
            
            {/* 1H IFVGs */}
            {signal.smcAnalysis?.institutionalFVG?.ifvg1H?.map((ifvg, idx) => (
              <div key={idx} className="text-blue-400">• {ifvg}</div>
            ))}
            
            {/* 4H IFVGs */}
            {signal.smcAnalysis?.institutionalFVG?.ifvg4H?.map((ifvg, idx) => (
              <div key={idx} className="text-orange-400">• {ifvg}</div>
            ))}
            
            {/* Daily IFVGs */}
            {signal.smcAnalysis?.institutionalFVG?.ifvgDaily?.map((ifvg, idx) => (
              <div key={idx} className="text-red-400">• {ifvg}</div>
            ))}
            
            {signal.smcAnalysis?.institutionalFVG?.unfilleTd && (
              <div className="text-purple-400 font-medium">• Unfilled IFVG Zones Present</div>
            )}
          </div>
        </div>

        {/* MACD Momentum Analysis Section */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            MACD & Momentum Confluence
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div className="grid grid-cols-2 gap-3">
              {/* 15m MACD */}
              <div className="space-y-1">
                <div className="text-blue-400 font-medium">15M MACD</div>
                <div className={`text-xs ${
                  signal.smcAnalysis?.macdMomentum?.macd15m?.signal === 'BULLISH' ? 'text-green-400' :
                  signal.smcAnalysis?.macdMomentum?.macd15m?.signal === 'BEARISH' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  Signal: {signal.smcAnalysis?.macdMomentum?.macd15m?.signal}
                </div>
                <div className={`text-xs ${signal.smcAnalysis?.macdMomentum?.macd15m?.crossover ? 'text-green-400' : 'text-gray-500'}`}>
                  {signal.smcAnalysis?.macdMomentum?.macd15m?.crossover ? '✓ Crossover' : '✗ No Cross'}
                </div>
                <div className={`text-xs ${
                  signal.smcAnalysis?.macdMomentum?.macd15m?.histogram === 'RISING' ? 'text-green-400' :
                  signal.smcAnalysis?.macdMomentum?.macd15m?.histogram === 'FALLING' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  Histogram: {signal.smcAnalysis?.macdMomentum?.macd15m?.histogram}
                </div>
              </div>
              
              {/* 1H MACD */}
              <div className="space-y-1">
                <div className="text-orange-400 font-medium">1H MACD</div>
                <div className={`text-xs ${
                  signal.smcAnalysis?.macdMomentum?.macd1h?.signal === 'BULLISH' ? 'text-green-400' :
                  signal.smcAnalysis?.macdMomentum?.macd1h?.signal === 'BEARISH' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  Signal: {signal.smcAnalysis?.macdMomentum?.macd1h?.signal}
                </div>
                <div className={`text-xs ${signal.smcAnalysis?.macdMomentum?.macd1h?.crossover ? 'text-green-400' : 'text-gray-500'}`}>
                  {signal.smcAnalysis?.macdMomentum?.macd1h?.crossover ? '✓ Crossover' : '✗ No Cross'}
                </div>
                <div className={`text-xs ${signal.smcAnalysis?.macdMomentum?.macd1h?.divergence ? 'text-purple-400' : 'text-gray-500'}`}>
                  {signal.smcAnalysis?.macdMomentum?.macd1h?.divergence ? '⚡ Divergence' : 'No Divergence'}
                </div>
              </div>
            </div>
            
            {/* Momentum Summary */}
            <div className="pt-2 border-t border-gray-700/50">
              <div className="flex justify-between items-center">
                <span className="text-purple-400 font-medium">
                  Confluence Score: {signal.smcAnalysis?.macdMomentum?.confluenceScore || 0}/100
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  signal.smcAnalysis?.macdMomentum?.momentumStrength === 'STRONG' ? 'bg-green-500/20 text-green-400' :
                  signal.smcAnalysis?.macdMomentum?.momentumStrength === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {signal.smcAnalysis?.macdMomentum?.momentumStrength} Momentum
                </span>
              </div>
              {signal.smcAnalysis?.macdMomentum?.multiTimeframeAlignment && (
                <div className="text-cyan-400 text-xs mt-1">🎯 Multi-Timeframe Alignment Confirmed</div>
              )}
            </div>
          </div>
        </div>

        {/* Market Context */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Market Context</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Session:</span>
              <span className="text-blue-400 ml-1">{signal.marketContext.session}</span>
            </div>
            <div>
              <span className="text-gray-400">Trend:</span>
              <span className="text-green-400 ml-1">{signal.marketContext.trend}</span>
            </div>
            <div>
              <span className="text-gray-400">Volatility:</span>
              <span className="text-orange-400 ml-1">{signal.marketContext.volatility}</span>
            </div>
            <div>
              <span className="text-gray-400">Momentum:</span>
              <span className="text-purple-400 ml-1">{signal.marketContext.momentum}</span>
            </div>
          </div>
        </div>

        {/* Confluence Factors */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Confluence Factors</div>
          <div className="flex flex-wrap gap-1">
            {signal.confluenceFactors.map((factor, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs border-blue-500/30 text-blue-400"
              >
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        {/* Execution Notes */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Professional Execution</div>
          <div className="text-xs text-gray-400 bg-gray-800/50 p-2 rounded">
            {signal.executionNotes}
          </div>
          <div className="text-xs text-orange-400 bg-orange-500/10 p-2 rounded border border-orange-500/20">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            Position Size: {signal.positionSizeRec} | Success Rate: {signal.riskAnalysis.probabilityOfSuccess}%
          </div>
        </div>

        {/* Professional Reasoning */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-300">Professional Reasoning</div>
          <div className="text-xs text-gray-400 italic">
            "{signal.reasoning}"
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(signal.timestamp).toLocaleTimeString()}
          </div>
          <div>{signal.sessionBias}</div>
          <div className="text-right">
            <div>TF: {signal.timeframe}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfessionalSignalCard;