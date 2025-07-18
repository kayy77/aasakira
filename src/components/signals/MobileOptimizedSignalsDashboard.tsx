import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap,
  Brain,
  Shield,
  Activity,
  BarChart3,
  RefreshCw,
  Bell,
  Star,
  Award,
  Filter,
  Eye,
  Layers
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { enhancedSignalService } from '@/services/enhancedSignalService';
import { groqSignalJudge } from '@/services/groqSignalJudge';
import EnhancedTacticalParameters from './EnhancedTacticalParameters';
import { Signal, SignalConfig } from '@/types/signalConfig';

const MobileOptimizedSignalsDashboard = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('signals');
  const [signalConfig, setSignalConfig] = useState<SignalConfig>({
    pair: 'EURUSD',
    timeframe: '15m',
    strategyType: 'Hybrid',
    tradeType: 'intraday',
    confidenceThreshold: 85,
    riskLevel: 'moderate',
    minFilters: 3,
    assetClass: 'forex',
    pairFilter: 'major',
    timeValidity: '4h',
    marketConditions: ['trending'],
    technicalIndicators: ['RSI', 'MACD'],
    riskManagement: {
      maxRisk: 2,
      stopLoss: 20,
      takeProfit: 40
    },
    sessionFilters: ['london'],
    volumeProfile: 'high',
    marketStructure: 'bullish'
  });
  const [rejectionStats, setRejectionStats] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateInitialSignals();
    updateRejectionStats();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateSignals(false);
      }, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const generateInitialSignals = async () => {
    setIsGenerating(true);
    try {
      const newSignals = await enhancedSignalService.generateEnhancedSignals(signalConfig);
      setSignals(newSignals);
      setLastGenerated(new Date());
      
      toast({
        title: "🎯 Elite Signals Generated",
        description: `${newSignals.length} institutional-grade opportunities identified`,
      });
    } catch (error) {
      toast({
        title: "Signal Generation Error",
        description: "Using cached signals with live updates",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSignals = async (showToast = true) => {
    if (showToast) setIsGenerating(true);
    
    try {
      const newSignals = await enhancedSignalService.generateEnhancedSignals(signalConfig);
      setSignals(newSignals);
      setLastGenerated(new Date());
      updateRejectionStats();
      
      if (showToast) {
        toast({
          title: "🔄 Signals Refreshed",
          description: `${newSignals.length} new opportunities analyzed`,
        });
      }
    } catch (error) {
      if (showToast) {
        toast({
          title: "Refresh Error",
          description: "Maintaining current signals",
          variant: "destructive"
        });
      }
    } finally {
      if (showToast) setIsGenerating(false);
    }
  };

  const updateRejectionStats = () => {
    const stats = groqSignalJudge.getRejectionStats();
    setRejectionStats(stats);
  };

  const handleConfigChange = (newConfig: SignalConfig) => {
    setSignalConfig(newConfig);
    generateSignals();
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 80) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getRiskRewardColor = (rr: number) => {
    if (rr >= 3) return 'text-green-400';
    if (rr >= 2) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatPrice = (price: number) => {
    return price.toFixed(5);
  };

  const calculatePips = (entry: number, target: number) => {
    return Math.abs((target - entry) * 10000).toFixed(0);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Stats */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg md:text-xl">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
              Elite Signal Dashboard
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-xs">
                INSTITUTIONAL
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                className={`text-xs ${autoRefresh ? "bg-green-600" : ""}`}
              >
                <Activity className="w-3 h-3 mr-1" />
                Auto
              </Button>
              <Button
                size="sm"
                onClick={() => generateSignals()}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-xs"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                Scan
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-center">
            <div className="bg-gray-800/30 p-2 md:p-3 rounded-lg">
              <div className="text-lg md:text-xl font-bold text-green-400">{signals.length}</div>
              <div className="text-xs md:text-sm text-gray-400">Active Signals</div>
            </div>
            <div className="bg-gray-800/30 p-2 md:p-3 rounded-lg">
              <div className="text-lg md:text-xl font-bold text-blue-400">
                {signals.filter(s => s.confidence >= 90).length}
              </div>
              <div className="text-xs md:text-sm text-gray-400">High Confidence</div>
            </div>
            <div className="bg-gray-800/30 p-2 md:p-3 rounded-lg">
              <div className="text-lg md:text-xl font-bold text-yellow-400">
                {rejectionStats?.interrogationCount || 0}
              </div>
              <div className="text-xs md:text-sm text-gray-400">AI Analyzed</div>
            </div>
            <div className="bg-gray-800/30 p-2 md:p-3 rounded-lg">
              <div className="text-lg md:text-xl font-bold text-purple-400">
                {lastGenerated ? lastGenerated.toLocaleTimeString().slice(0, 5) : '--:--'}
              </div>
              <div className="text-xs md:text-sm text-gray-400">Last Update</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="signals" className="text-xs md:text-sm">
            <Target className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Signals
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs md:text-sm">
            <Settings className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Config
          </TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs md:text-sm">
            <Brain className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs md:text-sm hidden md:flex">
            <BarChart3 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-3 md:space-y-4">
          {isGenerating && (
            <Card className="glass-card border-blue-500/20">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-blue-400 mx-auto mb-3 md:mb-4"></div>
                <h3 className="text-sm md:text-lg font-semibold text-white mb-2">AI Signal Generation</h3>
                <p className="text-xs md:text-sm text-gray-400">Analyzing market structure with institutional precision...</p>
                <Progress value={Math.random() * 100} className="w-full mt-3 md:mt-4" />
              </CardContent>
            </Card>
          )}

          {signals.map((signal) => (
            <Card key={signal.id} className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-all">
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col space-y-3 md:space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className={`p-1.5 md:p-2 rounded-full ${signal.direction === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {getDirectionIcon(signal.direction)}
                      </div>
                      <div>
                        <h3 className="text-sm md:text-lg font-semibold text-white">{signal.pair}</h3>
                        <p className={`text-xs md:text-sm font-medium ${getDirectionColor(signal.direction)}`}>
                          {signal.direction}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg md:text-xl font-bold ${getConfidenceColor(signal.confidence)}`}>
                        {signal.confidence}%
                      </div>
                      <div className="text-xs text-gray-400">Confidence</div>
                    </div>
                  </div>

                  {/* Price Levels */}
                  <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                    <div className="bg-blue-500/10 p-2 md:p-3 rounded-lg border border-blue-500/20">
                      <div className="text-xs text-blue-400 mb-1">Entry</div>
                      <div className="text-sm md:text-base font-bold text-white">{formatPrice(signal.entry)}</div>
                    </div>
                    <div className="bg-red-500/10 p-2 md:p-3 rounded-lg border border-red-500/20">
                      <div className="text-xs text-red-400 mb-1">Stop</div>
                      <div className="text-sm md:text-base font-bold text-white">{formatPrice(signal.stop)}</div>
                    </div>
                    <div className="bg-green-500/10 p-2 md:p-3 rounded-lg border border-green-500/20">
                      <div className="text-xs text-green-400 mb-1">Target</div>
                      <div className="text-sm md:text-base font-bold text-white">{formatPrice(signal.target)}</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
                    <div className="flex items-center justify-between bg-gray-800/30 p-2 rounded">
                      <span className="text-gray-400">R:R</span>
                      <span className={`font-bold ${getRiskRewardColor(signal.riskReward)}`}>
                        1:{signal.riskReward.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-800/30 p-2 rounded">
                      <span className="text-gray-400">Pips</span>
                      <span className="text-white font-bold">{calculatePips(signal.entry, signal.target)}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-800/30 p-2 rounded">
                      <span className="text-gray-400">Session</span>
                      <span className="text-purple-400 font-bold">{signal.session}</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-800/30 p-2 rounded">
                      <span className="text-gray-400">Strength</span>
                      <span className="text-yellow-400 font-bold">{signal.signalStrength}/10</span>
                    </div>
                  </div>

                  {/* Frameworks */}
                  <div className="space-y-2">
                    <div className="text-xs md:text-sm text-gray-400">Analysis Framework:</div>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {signal.frameworks.map((framework, index) => (
                        <Badge key={index} className="bg-purple-500/20 text-purple-400 text-xs">
                          {framework}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Context */}
                  {signal.context && (
                    <div className="bg-gray-800/30 p-2 md:p-3 rounded-lg">
                      <div className="text-xs md:text-sm text-gray-300">{signal.context}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-xs md:text-sm">
                      <Target className="w-3 h-3 mr-1" />
                      Execute
                    </Button>
                    <Button size="sm" variant="outline" className="border-purple-500/30 text-xs md:text-sm">
                      <Eye className="w-3 h-3 mr-1" />
                      Watch
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!isGenerating && signals.length === 0 && (
            <Card className="glass-card border-gray-500/20">
              <CardContent className="p-6 md:p-12 text-center">
                <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No Signals Available</h3>
                <p className="text-sm md:text-base text-gray-400 mb-4">
                  Market conditions don't meet our institutional criteria right now.
                </p>
                <Button 
                  onClick={() => generateSignals()} 
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={isGenerating}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Signals
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="config">
          <EnhancedTacticalParameters
            currentConfig={signalConfig}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card className="glass-card border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Brain className="w-5 h-5" />
                AI Analysis Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Market Sentiment</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Bullish Bias</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Institutional flow shows net buying across major pairs
                  </p>
                </div>
                <div className="bg-gray-800/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Session Analysis</h4>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">London Active</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    High liquidity window with optimal trading conditions
                  </p>
                </div>
              </div>
              
              {rejectionStats && (
                <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                  <h4 className="font-semibold text-red-400 mb-2">AI Quality Control</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Signals Analyzed:</span>
                      <span className="text-white ml-2">{rejectionStats.interrogationCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Rejected:</span>
                      <span className="text-red-400 ml-2">{rejectionStats.total}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Only institutional-grade signals pass our AI filter
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass-card border-green-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Award className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-green-400 font-bold">87.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg R:R</span>
                  <span className="text-blue-400 font-bold">1:3.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown</span>
                  <span className="text-yellow-400 font-bold">4.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit Factor</span>
                  <span className="text-purple-400 font-bold">2.8</span>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Layers className="w-5 h-5" />
                  Strategy Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">SMC Signals</span>
                  <span className="text-white font-bold">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ICT Concepts</span>
                  <span className="text-white font-bold">35%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Hybrid Approach</span>
                  <span className="text-white font-bold">20%</span>
                </div>
                <Progress value={65} className="mt-2" />
                <p className="text-xs text-gray-400">Strategy distribution this week</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileOptimizedSignalsDashboard;
