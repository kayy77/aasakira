
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '@/components/common/BackButton';
import { BettingSignalCard } from '@/components/betting/BettingSignalCard';
import { eliteBettingEngine, type BettingSignal } from '@/services/eliteBettingEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, TrendingUp, Target, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function BetScanner() {
  const [signals, setSignals] = useState<BettingSignal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stats, setStats] = useState({
    totalSignals: 0,
    approvedSignals: 0,
    avgExpectedValue: 0,
    avgConfidence: 0
  });

  const generateSignal = async () => {
    setIsGenerating(true);
    try {
      const signal = await eliteBettingEngine.generateBettingSignal();
      if (signal) {
        setSignals(eliteBettingEngine.getSignals());
        setStats(eliteBettingEngine.getPerformanceStats());
        toast.success('Elite betting signal generated!');
      } else {
        toast.warning('No qualifying betting opportunities found');
      }
    } catch (error) {
      console.error('Signal generation error:', error);
      toast.error('Failed to generate betting signal');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = (signalId: string) => {
    toast.success('Deep analysis feature coming soon!');
  };

  useEffect(() => {
    setSignals(eliteBettingEngine.getSignals());
    setStats(eliteBettingEngine.getPerformanceStats());
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">AI Bet Scanner</h1>
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            Advanced multi-AI consensus engine analyzing sports betting opportunities with 
            institutional-grade precision and real-time market intelligence.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.totalSignals}</div>
                <div className="text-sm text-gray-400">Total Signals</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.approvedSignals}</div>
                <div className="text-sm text-gray-400">AI Approved</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">+{stats.avgExpectedValue}%</div>
                <div className="text-sm text-gray-400">Avg EV</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.avgConfidence}%</div>
                <div className="text-sm text-gray-400">Avg Confidence</div>
              </CardContent>
            </Card>
          </div>

          {/* Generate Signal Button */}
          <Button
            onClick={generateSignal}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 text-lg transition-all duration-200 transform hover:scale-105"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="w-5 h-5 mr-2" />
                Generate Elite Signal
              </>
            )}
          </Button>
        </div>

        {/* Signals Grid */}
        {signals.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold">Live Betting Signals</h2>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {signals.length} Active
              </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {signals.map((signal) => (
                <BettingSignalCard
                  key={signal.id}
                  signal={signal}
                  onAnalyze={handleAnalyze}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-700">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4 text-white">AI Analysis Ready</h3>
              <p className="text-gray-300 mb-6">
                Generate your first elite betting signal using advanced AI consensus analysis 
                across multiple sports and markets.
              </p>
              
              <div className="text-sm text-gray-400 space-y-2">
                <div>• Multi-AI validation system</div>
                <div>• Real-time injury & news analysis</div>
                <div>• Expected value calculations</div>
                <div>• Sharp money detection</div>
              </div>
            </div>
          </div>
        )}

        {/* Beta Notice */}
        <div className="mt-12 text-center">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">🚀 Beta Version</h3>
            <p className="text-gray-300 text-sm">
              This is an advanced preview of our AI betting scanner. Live sports data integration 
              and additional markets coming soon. Follow us for updates!
            </p>
            
            <Link
              to="https://instagram.com/aasakira.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200"
            >
              Get Updates
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
