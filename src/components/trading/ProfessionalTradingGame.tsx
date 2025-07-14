
import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { geminiEducationService } from '@/services/geminiEducationService';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Trophy,
  AlertCircle,
  Brain,
  RefreshCw
} from 'lucide-react';

interface TradeEntry {
  entry: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string;
}

interface GameResult {
  score: number;
  feedback: string;
  won: boolean;
  xpEarned: number;
}

const ProfessionalTradingGame: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [candlestickSeries, setCandlestickSeries] = useState<ISeriesApi<'Candlestick'> | null>(null);
  const [currentPair, setCurrentPair] = useState('EURUSD');
  const [gameData, setGameData] = useState<any[]>([]);
  const [tradeEntry, setTradeEntry] = useState<TradeEntry>({
    entry: 0,
    stopLoss: 0,
    takeProfit: 0,
    reasoning: ''
  });
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (chartContainerRef.current && !chart) {
      const newChart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          textColor: '#d1d5db',
          background: { color: 'transparent' },
        },
        grid: {
          vertLines: { color: '#374151' },
          horzLines: { color: '#374151' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#4b5563',
        },
        timeScale: {
          borderColor: '#4b5563',
          timeVisible: true,
        },
      });

      const series = newChart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
      });

      setChart(newChart);
      setCandlestickSeries(series);

      const handleResize = () => {
        if (chartContainerRef.current) {
          newChart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        newChart.remove();
      };
    }
  }, [chart]);

  const generateGameData = () => {
    const data = [];
    let currentPrice = 1.0850;
    const now = Date.now();
    
    for (let i = 0; i < 100; i++) {
      const time = (now - (100 - i) * 15 * 60 * 1000) / 1000;
      const variation = (Math.random() - 0.5) * 0.002;
      const open = currentPrice;
      const close = open + variation;
      const high = Math.max(open, close) + Math.random() * 0.001;
      const low = Math.min(open, close) - Math.random() * 0.001;
      
      data.push({
        time: time as Time,
        open,
        high,
        low,
        close,
      });
      
      currentPrice = close;
    }
    
    return data;
  };

  const startNewGame = () => {
    setIsLoading(true);
    const data = generateGameData();
    setGameData(data);
    
    if (candlestickSeries) {
      const visibleData = data.slice(0, 80);
      candlestickSeries.setData(visibleData);
      
      const currentPrice = visibleData[visibleData.length - 1].close;
      setTradeEntry(prev => ({ ...prev, entry: currentPrice }));
    }
    
    setGameActive(true);
    setGameResult(null);
    setIsLoading(false);
  };

  const submitTrade = async () => {
    if (!gameData.length || !tradeEntry.entry) return;
    
    setIsSubmitting(true);
    
    try {
      if (candlestickSeries) {
        candlestickSeries.setData(gameData);
      }
      
      const futureCandles = gameData.slice(80);
      let hitSL = false;
      let hitTP = false;
      let finalPrice = tradeEntry.entry;
      
      for (const candle of futureCandles) {
        if (tradeEntry.stopLoss > 0 && candle.low <= tradeEntry.stopLoss) {
          hitSL = true;
          finalPrice = tradeEntry.stopLoss;
          break;
        }
        if (tradeEntry.takeProfit > 0 && candle.high >= tradeEntry.takeProfit) {
          hitTP = true;
          finalPrice = tradeEntry.takeProfit;
          break;
        }
        finalPrice = candle.close;
      }
      
      const prompt = `Analyze this EURUSD trade:
Entry: ${tradeEntry.entry}
Stop Loss: ${tradeEntry.stopLoss}
Take Profit: ${tradeEntry.takeProfit}
Reasoning: "${tradeEntry.reasoning}"
Outcome: ${hitTP ? 'Hit TP' : hitSL ? 'Hit SL' : 'Still running'}
Give a score out of 10 and detailed feedback in 2-3 sentences.`;
      
      const aiResponse = await geminiEducationService.getAIResponse(prompt);
      
      const riskReward = Math.abs(tradeEntry.takeProfit - tradeEntry.entry) / 
                        Math.abs(tradeEntry.entry - tradeEntry.stopLoss);
      let score = 5;
      
      if (hitTP) score += 3;
      if (riskReward >= 2) score += 1;
      if (tradeEntry.reasoning.length > 20) score += 1;
      
      const won = hitTP || (!hitSL && finalPrice > tradeEntry.entry);
      const xpEarned = Math.floor(score * 10) + (won ? 25 : 0);
      
      setGameResult({
        score: Math.min(score, 10),
        feedback: aiResponse,
        won,
        xpEarned
      });
      
      if (won) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
    } catch (error) {
      console.error('Trade submission failed:', error);
      setGameResult({
        score: 5,
        feedback: "Unable to get AI analysis right now, but your trade structure looks reasonable. Keep practicing!",
        won: false,
        xpEarned: 50
      });
    } finally {
      setIsSubmitting(false);
      setGameActive(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Professional Trading Arena
            <Badge className="bg-green-500/20 text-green-400">
              Live Chart Analysis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!gameActive && !gameResult && (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gold-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Trade?</h3>
              <p className="text-gray-400 mb-4">
                Analyze the live chart, place your trade, and get AI feedback on your decision.
              </p>
              <Button
                onClick={startNewGame}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Loading Chart...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Start Trading Challenge
                  </>
                )}
              </Button>
            </div>
          )}
          
          {gameActive && (
            <>
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold">{currentPair} - M15</h4>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    Live Market Data
                  </Badge>
                </div>
                <div ref={chartContainerRef} className="w-full h-96" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Entry Price</label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={tradeEntry.entry}
                    onChange={(e) => setTradeEntry(prev => ({ 
                      ...prev, 
                      entry: parseFloat(e.target.value) || 0 
                    }))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Stop Loss</label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={tradeEntry.stopLoss}
                    onChange={(e) => setTradeEntry(prev => ({ 
                      ...prev, 
                      stopLoss: parseFloat(e.target.value) || 0 
                    }))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Take Profit</label>
                  <Input
                    type="number"
                    step="0.00001"
                    value={tradeEntry.takeProfit}
                    onChange={(e) => setTradeEntry(prev => ({ 
                      ...prev, 
                      takeProfit: parseFloat(e.target.value) || 0 
                    }))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Trade Reasoning</label>
                <Input
                  placeholder="Why are you taking this trade? (SMC, support/resistance, etc.)"
                  value={tradeEntry.reasoning}
                  onChange={(e) => setTradeEntry(prev => ({ 
                    ...prev, 
                    reasoning: e.target.value 
                  }))}
                  className="bg-gray-800 border-gray-600"
                />
              </div>
              
              <Button
                onClick={submitTrade}
                disabled={isSubmitting || !tradeEntry.entry || !tradeEntry.stopLoss || !tradeEntry.takeProfit}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600"
              >
                {isSubmitting ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    AI Analyzing Trade...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Submit Trade & See Results
                  </>
                )}
              </Button>
            </>
          )}
          
          <AnimatePresence>
            {gameResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className={`border-2 ${
                  gameResult.won ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {gameResult.won ? (
                          <TrendingUp className="w-8 h-8 text-green-400" />
                        ) : (
                          <TrendingDown className="w-8 h-8 text-red-400" />
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {gameResult.won ? 'Great Trade!' : 'Learning Opportunity'}
                          </h3>
                          <p className="text-gray-400">
                            Score: {gameResult.score}/10 • +{gameResult.xpEarned} XP
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        AI Analysis
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {gameResult.feedback}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={startNewGame}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Next Challenge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfessionalTradingGame;
