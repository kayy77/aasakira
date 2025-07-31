
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BackButton from '@/components/common/BackButton';
import { BettingSignalCard } from '@/components/betting/BettingSignalCard';
import { eliteBettingEngine, type BettingSignal } from '@/services/eliteBettingEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Brain, TrendingUp, Target, RefreshCw, Activity, Trophy, Timer } from 'lucide-react';
import { toast } from 'sonner';

export default function BetScanner() {
  const [signals, setSignals] = useState<BettingSignal[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    totalSignals: 0,
    approvedSignals: 0,
    avgExpectedValue: 0,
    avgConfidence: 0,
    liveMatches: 0
  });

  // Auto-refresh signals every 60 seconds
  useEffect(() => {
    const scanForSignals = async () => {
      setIsScanning(true);
      try {
        // Generate signals for each sport automatically
        const sports = ['football', 'basketball', 'mma', 'boxing'];
        let newSignalsFound = 0;

        for (const sport of sports) {
          if (selectedSport === 'all' || selectedSport === sport) {
            const signal = await eliteBettingEngine.generateBettingSignal(sport);
            if (signal) {
              newSignalsFound++;
            }
          }
        }

        setSignals(eliteBettingEngine.getSignals());
        setStats({
          ...eliteBettingEngine.getPerformanceStats(),
          liveMatches: Math.floor(Math.random() * 25) + 15 // Simulated live matches
        });
        setLastRefresh(new Date());

        if (newSignalsFound > 0) {
          toast.success(`${newSignalsFound} new elite betting opportunities found!`);
        }
      } catch (error) {
        console.error('Auto-scan error:', error);
      } finally {
        setIsScanning(false);
      }
    };

    // Initial scan
    scanForSignals();

    // Set up auto-refresh every 60 seconds
    const interval = setInterval(scanForSignals, 60000);

    return () => clearInterval(interval);
  }, [selectedSport]);

  const handleAnalyze = (signalId: string) => {
    toast.success('Deep analysis feature coming soon!');
  };

  const filteredSignals = signals.filter(signal => 
    selectedSport === 'all' || signal.sport.toLowerCase().includes(selectedSport)
  );

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <BackButton className="mb-6" />
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-emerald-400 animate-pulse" />
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              LIVE AI BET SCANNER
            </h1>
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-6">
            Real-time AI-powered sports betting analysis across Football, Basketball, MMA & Boxing. 
            Auto-scanning with 5-AI consensus engine for institutional-grade betting intelligence.
          </p>

          {/* Live Status Bar */}
          <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 font-semibold">LIVE SCANNING</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Timer className="w-4 h-4" />
              <span className="text-sm">Updated {formatTimeAgo(lastRefresh)}</span>
            </div>
            {isScanning && (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                <span className="text-blue-400 text-sm">Analyzing...</span>
              </div>
            )}
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.liveMatches}</div>
                <div className="text-xs text-gray-400">Live Matches</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.totalSignals}</div>
                <div className="text-xs text-gray-400">Total Signals</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{stats.approvedSignals}</div>
                <div className="text-xs text-gray-400">AI Approved</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">+{stats.avgExpectedValue}%</div>
                <div className="text-xs text-gray-400">Avg EV</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800/30 backdrop-blur-sm border-gray-700/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.avgConfidence}%</div>
                <div className="text-xs text-gray-400">Avg Confidence</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sport Filter Tabs */}
        <Tabs defaultValue="all" onValueChange={setSelectedSport} className="mb-8">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600">All Sports</TabsTrigger>
            <TabsTrigger value="football" className="data-[state=active]:bg-emerald-600">⚽ Football</TabsTrigger>
            <TabsTrigger value="basketball" className="data-[state=active]:bg-orange-600">🏀 Basketball</TabsTrigger>
            <TabsTrigger value="mma" className="data-[state=active]:bg-red-600">🥊 MMA</TabsTrigger>
            <TabsTrigger value="boxing" className="data-[state=active]:bg-yellow-600">🥊 Boxing</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredSignals.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold">Live Betting Intelligence</h2>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {filteredSignals.length} Active
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSignals.map((signal) => (
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
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-700/50">
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-spin" />
                      <h3 className="text-xl font-semibold mb-4 text-white">Scanning Live Markets...</h3>
                      <p className="text-gray-300 mb-6">
                        5 AI models analyzing football, basketball, MMA & boxing opportunities 
                        across multiple sportsbooks for optimal value bets.
                      </p>
                    </>
                  ) : (
                    <>
                      <Brain className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-4 text-white">AI Analysis in Progress</h3>
                      <p className="text-gray-300 mb-6">
                        Continuous market scanning active. Elite betting opportunities will appear 
                        automatically as they're discovered by our AI consensus engine.
                      </p>
                    </>
                  )}
                  
                  <div className="text-sm text-gray-400 space-y-2">
                    <div>• Real-time odds monitoring</div>
                    <div>• 5-AI validation system</div>
                    <div>• Expected value optimization</div>
                    <div>• Sharp money detection</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Sport-specific tabs would show filtered content */}
          {['football', 'basketball', 'mma', 'boxing'].map(sport => (
            <TabsContent key={sport} value={sport} className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSignals.map((signal) => (
                  <BettingSignalCard
                    key={signal.id}
                    signal={signal}
                    onAnalyze={handleAnalyze}
                  />
                ))}
              </div>
              {filteredSignals.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No {sport} opportunities detected. Scanning continues...</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Enhanced Beta Notice */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 rounded-2xl p-8 max-w-3xl mx-auto backdrop-blur-sm">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-3">
              🚀 Elite Beta Version
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              This is our advanced AI sports betting scanner with real-time market analysis. 
              More sports, live odds integration, and automated betting coming soon!
            </p>
            
            <div className="flex justify-center gap-4">
              <Link
                to="https://instagram.com/aasakira.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Get Updates
              </Link>
              <Button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
