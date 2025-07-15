import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Zap, 
  Activity, 
  BarChart3, 
  Brain,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import EnhancedSignalCard from './EnhancedSignalCard';
import MilitaryGradeSignalCard from './MilitaryGradeSignalCard';
import { multiIntelligenceCore, SignalDNA } from '@/services/multiIntelligenceCore';
import { enhancedSignalAnalyzer, EnhancedSignal } from '@/services/enhancedSignalAnalyzer';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface LiveSignalsDashboardProps {
  onAskAasakira: (signal: any) => void;
}

const LiveSignalsDashboard: React.FC<LiveSignalsDashboardProps> = ({ onAskAasakira }) => {
  const [signals, setSignals] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSignal = async () => {
    setIsGenerating(true);
    try {
      const enhancedSignal = await enhancedSignalAnalyzer.generateSignal();
      const militaryGradeSignal = await multiIntelligenceCore.generateSignalDNA();

      if (enhancedSignal) {
        enhancedSignal.type = 'enhanced';
        setSignals(prev => [enhancedSignal, ...prev.slice(0, 4)]);
      }

      if (militaryGradeSignal) {
        militaryGradeSignal.type = 'military';
        setSignals(prev => [militaryGradeSignal, ...prev.slice(0, 4)]);
      }

      if (!enhancedSignal && !militaryGradeSignal) {
        toast({
          title: "No Opportunities Found",
          description: "Markets may be ranging. Try again in a few minutes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Signal Generation Failed",
        description: "Failed to generate signal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const removeSignal = (signalId: string) => {
    setSignals(signals.filter(signal => signal.symbol !== signalId));
  };

  const handleRefresh = async (symbol: string) => {
    setIsGenerating(true);
    try {
      const updatedSignal = await multiIntelligenceCore.refreshSignal(symbol);
      setSignals(prevSignals =>
        prevSignals.map(signal =>
          signal.symbol === symbol ? { ...signal, ...updatedSignal } : signal
        )
      );
    } catch (error) {
      toast({
        title: "Signal Refresh Failed",
        description: "Failed to refresh signal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBacktest = (signal: any) => {
    toast({
      title: "Backtesting Signal",
      description: "Analyzing historical performance and similar setups...",
    });
  };

  const handleCopySignal = (signal: any) => {
    navigator.clipboard.writeText(JSON.stringify(signal));
    toast({
      title: "Signal Copied",
      description: "Signal details copied to clipboard!",
    });
  };

  const handleAskMentor = (signal: any) => {
    toast({
      title: "Asking Mentor",
      description: "Routing to AI Mentor for strategic insights...",
    });
  };

  useEffect(() => {
    generateSignal();

    const intervalId = setInterval(() => {
      generateSignal();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const totalSignals = signals.length;
  const bullishSignals = signals.filter(signal => signal.type === 'BUY').length;
  const bearishSignals = totalSignals - bullishSignals;

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card hover-glow border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Bullish Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{bullishSignals}</div>
            <p className="text-sm text-gray-400">Number of BUY signals</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-glow border-red-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Bearish Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{bearishSignals}</div>
            <p className="text-sm text-gray-400">Number of SELL signals</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover-glow border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Total Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{totalSignals}</div>
            <p className="text-sm text-gray-400">Total active signals</p>
          </CardContent>
        </Card>
      </div>

      {/* Generate Signals Section */}
      <Card className="glass-card border-purple-500/30">
        <CardContent className="py-8 flex items-center justify-center">
          <Button
            onClick={generateSignal}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                Scanning Live Markets...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Generate New Signals
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Live Signals Display */}
      <AnimatePresence>
        {signals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                🔴 LIVE SIGNALS
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  {signals.length} Active
                </Badge>
              </h2>
              
              <Button
                onClick={generateSignal}
                disabled={isGenerating}
                size="sm"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Refresh All
              </Button>
            </div>

            <div className="grid gap-6">
              {signals.map((signal) => (
                <div key={signal.id} className="relative">
                  {signal.type === 'enhanced' ? (
                    <EnhancedSignalCard
                      signal={signal}
                      onBacktest={() => handleBacktest(signal)}
                      onCopySignal={() => handleCopySignal(signal)}
                      onAskAasakira={() => onAskAasakira(signal)}
                    />
                  ) : (
                    <MilitaryGradeSignalCard
                      signalDNA={signal}
                      livePrice={signal.livePrice || 1.0950}
                      onRemove={removeSignal}
                      onRefresh={() => handleRefresh(signal.symbol)}
                      onBacktest={() => handleBacktest(signal)}
                      onAskMentor={() => handleAskMentor(signal)}
                      onAskAasakira={() => onAskAasakira(signal)}
                      isUpdating={isGenerating}
                    />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Signals State */}
      {signals.length === 0 && !isGenerating && (
        <Card className="glass-card border-purple-500/20">
          <CardContent className="text-center py-12">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Signals</h3>
            <p className="text-gray-400 mb-4">
              AI is scanning live markets for high-probability setups
            </p>
            <Button
              onClick={generateSignal}
              variant="outline"
              className="border-purple-500/30 hover:bg-purple-500/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate New Signals
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Performance Analytics */}
      <Card className="glass-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white">Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">
            Here, we'll display performance analytics for the generated signals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSignalsDashboard;
