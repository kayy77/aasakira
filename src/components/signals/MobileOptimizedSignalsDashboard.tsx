
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Target, 
  Shield, 
  Zap, 
  RefreshCw,
  Trash2,
  Activity,
  AlertTriangle,
  Crown,
  Loader,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Signal } from '@/types/signalConfig';
import { signalService } from '@/services/signalService';
import { useIsMobile } from '@/hooks/use-mobile';
import EnhancedSignalGenerator from './EnhancedSignalGenerator';

interface MobileOptimizedSignalsDashboardProps {
  // Define props here
}

const MobileOptimizedSignalsDashboard: React.FC<MobileOptimizedSignalsDashboardProps> = ({
  // Destructure props here
}) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [rejectionCount, setRejectionCount] = useState<number>(0);
  const [lastRejectionReason, setLastRejectionReason] = useState<string>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSignalGenerated = (signal: Signal) => {
    setSignals(prev => [signal, ...prev.slice(0, 4)]);
  };

  const handleRemoveSignal = (signalId: string) => {
    setSignals(prev => prev.filter(signal => signal.id !== signalId));
    toast({
      title: "Signal Removed",
      description: `Signal ${signalId} has been removed from the dashboard.`,
    });
  };

  return (
    <div className="space-y-4 p-4">
      {/* Enhanced Signal Generator */}
      <EnhancedSignalGenerator 
        onSignalGenerated={handleSignalGenerated}
        onFeatureUse={() => console.log('Enhanced Signal Generator used')}
      />

      {/* Signals Display */}
      {signals.length > 0 && (
        <Card className="glass-card border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400 flex items-center gap-2 text-lg">
              <Target className="w-5 h-5" />
              Live Signals ({signals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {signals.map((signal) => (
              <div key={signal.id} className="glass-card p-4 border-blue-500/10 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-current`}>
                      {signal.type === 'BUY' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {signal.pair} {signal.type}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                      {signal.confidence}% Confidence
                    </Badge>
                    {signal.signalStrength && (
                      <Badge className={`text-xs ${
                        signal.signalStrength === 'ULTRA' ? 'bg-purple-500/20 text-purple-400' :
                        signal.signalStrength === 'STRONG' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      } border-current`}>
                        {signal.signalStrength}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSignal(signal.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-gray-400">Entry:</span>
                    <div className="text-white font-mono">{signal.entryPrice}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Stop Loss:</span>
                    <div className="text-red-400 font-mono">{signal.stopLoss}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Take Profit:</span>
                    <div className="text-green-400 font-mono">{signal.takeProfit}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-400">R:R {signal.riskReward}:1</span>
                  <span className="text-gray-400">{signal.timeframe}</span>
                  <span className="text-gray-400">{new Date(signal.timestamp).toLocaleTimeString()}</span>
                </div>

                {signal.confluenceScore && (
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-blue-400">Confluence: {signal.confluenceScore}/6</span>
                    {signal.sessionContext && (
                      <span className="text-purple-400">Session: {signal.sessionContext}</span>
                    )}
                  </div>
                )}
                
                {signal.technicalSetup && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded text-xs">
                    <span className="text-blue-400">Setup:</span> {signal.technicalSetup}
                  </div>
                )}

                {signal.entryReason && (
                  <div className="mt-2 p-2 bg-purple-800/20 rounded text-xs">
                    <span className="text-purple-400">AI Reasoning:</span> {signal.entryReason}
                  </div>
                )}

                {signal.warning && (
                  <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs">
                    <span className="text-yellow-400">⚠️ Warning:</span> {signal.warning}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileOptimizedSignalsDashboard;
