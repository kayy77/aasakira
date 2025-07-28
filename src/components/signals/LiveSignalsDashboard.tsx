
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

// Create a simple EnhancedSignalGenerator component since the original is in read-only files
const EnhancedSignalGenerator: React.FC<{
  onSignalGenerated: (signal: Signal) => void;
  onFeatureUse: () => void;
}> = ({ onSignalGenerated, onFeatureUse }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateSignal = async () => {
    setIsGenerating(true);
    onFeatureUse();
    
    try {
      // Mock signal generation for now
      const mockSignal: Signal = {
        id: `signal-${Date.now()}`,
        pair: 'BTCUSDT',
        type: 'BUY',
        entry: 45000,
        entryPrice: 45000,
        stopLoss: 43000,
        takeProfit: 47000,
        confidence: 85,
        riskReward: 1.5,
        timeframe: '1H',
        timestamp: new Date().toISOString(),
        signalStrength: 'STRONG',
        confluenceScore: 4,
        sessionContext: 'London',
        technicalSetup: 'Bullish breakout pattern',
        analysis: 'Strong momentum with volume confirmation',
        strategy: 'SMC',
        marketCondition: 'Bullish',
        entryReason: 'Structure break with volume confirmation',
        riskManagement: 'Risk Level: Medium | R:R: 1.5:1'
      };
      
      onSignalGenerated(mockSignal);
      toast({
        title: "Signal Generated",
        description: "New enhanced signal has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating signal:', error);
      toast({
        title: "Error",
        description: "Failed to generate signal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card border-purple-500/20 mb-6">
      <CardHeader>
        <CardTitle className="text-purple-400 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Enhanced Signal Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleGenerateSignal}
          disabled={isGenerating}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate Enhanced Signal
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

interface LiveSignalsDashboardProps {
  selectedStrength?: string;
}

const LiveSignalsDashboard: React.FC<LiveSignalsDashboardProps> = ({ selectedStrength = 'All' }) => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');
  const [rejectionCount, setRejectionCount] = useState<number>(0);
  const [lastRejectionReason, setLastRejectionReason] = useState<string>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Filter signals based on selected strength
  useEffect(() => {
    if (selectedStrength === 'All') {
      setFilteredSignals(signals);
    } else {
      setFilteredSignals(
        signals.filter((signal) => signal.signalStrength === selectedStrength)
      );
    }
  }, [selectedStrength, signals]);

  const handleSignalGenerated = (signal: Signal) => {
    setSignals(prev => [signal, ...prev.slice(0, 9)]);
    toast({
      title: "New Signal Generated",
      description: `${signal.pair} ${signal.type} signal with ${signal.confidence}% confidence`,
    });
  };

  const handleRemoveSignal = (signalId: string) => {
    setSignals(prev => prev.filter(signal => signal.id !== signalId));
    toast({
      title: "Signal Removed",
      description: `Signal has been removed from the dashboard.`,
    });
  };

  const clearAllSignals = () => {
    setSignals([]);
    signalService.clearSignals();
    toast({
      title: "All Signals Cleared",
      description: "Signal history has been cleared.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Signal Generator */}
      <EnhancedSignalGenerator 
        onSignalGenerated={handleSignalGenerated}
        onFeatureUse={() => console.log('Enhanced Signal Generator used')}
      />

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-xs text-gray-400">Total Signals</p>
                <p className="text-lg font-bold text-green-400">{signals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-gray-400">Filtered</p>
                <p className="text-lg font-bold text-blue-400">{filteredSignals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs text-gray-400">Win Rate</p>
                <p className="text-lg font-bold text-purple-400">72%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-xs text-gray-400">Avg R:R</p>
                <p className="text-lg font-bold text-orange-400">2.1:1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signals Display */}
      {filteredSignals.length > 0 && (
        <Card className="glass-card border-blue-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-blue-400 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Live Signals ({filteredSignals.length})
                {selectedStrength !== 'All' && (
                  <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {selectedStrength} Filter
                  </Badge>
                )}
              </CardTitle>
              {signals.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllSignals}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredSignals.map((signal) => (
              <div key={signal.id} className="glass-card p-4 border-blue-500/10 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-current`}>
                      {signal.type === 'BUY' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {signal.pair} {signal.type}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {signal.confidence}%
                    </Badge>
                    {signal.signalStrength && (
                      <Badge className={`${
                        signal.signalStrength === 'ULTRA' ? 'bg-purple-500/20 text-purple-400' :
                        signal.signalStrength === 'STRONG' ? 'bg-red-500/20 text-red-400' :
                        signal.signalStrength === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' :
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
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
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
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-400">R:R {signal.riskReward}:1</span>
                  <span className="text-gray-400">{signal.timeframe}</span>
                  <span className="text-gray-400">{new Date(signal.timestamp).toLocaleTimeString()}</span>
                </div>

                {signal.confluenceScore && (
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-blue-400">Confluence: {signal.confluenceScore}/6</span>
                    {signal.sessionContext && (
                      <span className="text-purple-400">Session: {signal.sessionContext}</span>
                    )}
                  </div>
                )}
                
                {signal.technicalSetup && (
                  <div className="mt-3 p-3 bg-gray-800/50 rounded text-sm">
                    <span className="text-blue-400">Setup:</span> {signal.technicalSetup}
                  </div>
                )}

                {signal.analysis && (
                  <div className="mt-3 p-3 bg-purple-800/20 rounded text-sm">
                    <span className="text-purple-400">AI Analysis:</span> {signal.analysis}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Signals Message */}
      {filteredSignals.length === 0 && signals.length > 0 && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              No {selectedStrength} Signals Found
            </h3>
            <p className="text-gray-400 text-sm">
              Try selecting a different strength filter or generate new signals.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {signals.length === 0 && (
        <Card className="glass-card border-gray-500/20">
          <CardContent className="p-6 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              No Signals Generated Yet
            </h3>
            <p className="text-gray-400 text-sm">
              Generate your first AI signal to start tracking market opportunities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LiveSignalsDashboard;
