import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  Target,
  Brain,
  Zap,
  Trophy
} from 'lucide-react';
import { createChart, ColorType } from 'lightweight-charts';
import { useToast } from '@/hooks/use-toast';

interface TradeEntry {
  id: string;
  pair: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  entryTime: Date;
  exitTime?: Date;
  pnl?: number;
  status: 'open' | 'closed';
  confidence: number;
  reasoning: string;
}

interface MarketData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

const ProfessionalTradingGame = () => {
  const { toast } = useToast();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [currentPrice, setCurrentPrice] = useState(1.0850);
  const [balance, setBalance] = useState(10000);
  const [equity, setEquity] = useState(10000);
  const [openTrades, setOpenTrades] = useState<TradeEntry[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPair] = useState('EURUSD');
  const [timeframe] = useState('1H');
  const [chartData, setChartData] = useState<MarketData[]>([]);

  // Generate realistic market data
  const generateMarketData = (): MarketData[] => {
    const data: MarketData[] = [];
    const startTime = Date.now() - (100 * 60 * 60 * 1000); // 100 hours ago
    let price = 1.0850;
    
    for (let i = 0; i < 100; i++) {
      const time = startTime + (i * 60 * 60 * 1000); // 1 hour intervals
      const volatility = 0.002;
      const change = (Math.random() - 0.5) * volatility;
      
      const open = price;
      const high = price + Math.abs(change) + (Math.random() * volatility);
      const low = price - Math.abs(change) - (Math.random() * volatility);
      const close = price + change;
      
      data.push({
        time: Math.floor(time / 1000),
        open: Math.round(open * 100000) / 100000,
        high: Math.round(high * 100000) / 100000,
        low: Math.round(low * 100000) / 100000,
        close: Math.round(close * 100000) / 100000,
        volume: Math.floor(Math.random() * 1000000)
      });
      
      price = close;
    }
    
    return data;
  };

  useEffect(() => {
    const data = generateMarketData();
    setChartData(data);
    setCurrentPrice(data[data.length - 1].close);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Use the correct API method for adding candlestick series
    const candlestickSeries = chart.addSeries('Candlestick', {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candlestickSeries.setData(chartData);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartData]);

  const analyzeMarket = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isUptrend = Math.random() > 0.5;
    const confidence = Math.floor(Math.random() * 40) + 60; // 60-100%
    
    const analysis = {
      direction: isUptrend ? 'buy' : 'sell',
      confidence,
      reasoning: isUptrend 
        ? "Strong bullish momentum detected. Price above key moving averages with increasing volume."
        : "Bearish pressure building. Price rejected at resistance with divergence signals."
    };
    
    toast({
      title: "AI Analysis Complete",
      description: `${analysis.direction.toUpperCase()} signal with ${analysis.confidence}% confidence`,
    });
    
    setIsAnalyzing(false);
  };

  const executeTrade = (direction: 'buy' | 'sell', confidence: number, reasoning: string) => {
    const newTrade: TradeEntry = {
      id: Date.now().toString(),
      pair: selectedPair,
      direction,
      entryPrice: currentPrice,
      entryTime: new Date(),
      status: 'open',
      confidence,
      reasoning
    };
    
    setOpenTrades(prev => [...prev, newTrade]);
    
    toast({
      title: "Trade Executed",
      description: `${direction.toUpperCase()} ${selectedPair} at ${currentPrice}`,
    });
  };

  const closeTrade = (tradeId: string) => {
    const trade = openTrades.find(t => t.id === tradeId);
    if (!trade) return;
    
    const exitPrice = currentPrice;
    const pips = trade.direction === 'buy' 
      ? (exitPrice - trade.entryPrice) * 10000
      : (trade.entryPrice - exitPrice) * 10000;
    const pnl = pips * 10; // $10 per pip
    
    const closedTrade: TradeEntry = {
      ...trade,
      exitPrice,
      exitTime: new Date(),
      pnl,
      status: 'closed'
    };
    
    setOpenTrades(prev => prev.filter(t => t.id !== tradeId));
    setTradeHistory(prev => [closedTrade, ...prev]);
    setBalance(prev => prev + pnl);
    setEquity(prev => prev + pnl);
    
    toast({
      title: pnl > 0 ? "Profitable Trade!" : "Trade Closed",
      description: `P&L: ${pnl > 0 ? '+' : ''}$${pnl.toFixed(2)}`,
      variant: pnl > 0 ? "default" : "destructive"
    });
  };

  const calculateUnrealizedPnL = () => {
    return openTrades.reduce((total, trade) => {
      const pips = trade.direction === 'buy' 
        ? (currentPrice - trade.entryPrice) * 10000
        : (trade.entryPrice - currentPrice) * 10000;
      return total + (pips * 10);
    }, 0);
  };

  const unrealizedPnL = calculateUnrealizedPnL();
  const totalPnL = tradeHistory.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const winRate = tradeHistory.length > 0 
    ? (tradeHistory.filter(t => (t.pnl || 0) > 0).length / tradeHistory.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Account Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-green-400">${balance.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Equity</p>
                <p className="text-2xl font-bold text-blue-400">${(balance + unrealizedPnL).toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold text-yellow-400">{winRate.toFixed(1)}%</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Controls */}
      <Card className="glass-card border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-blue-400">{selectedPair} - {timeframe}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-green-400 border-green-400">
                {currentPrice.toFixed(5)}
              </Badge>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={chartContainerRef} className="w-full h-96 mb-4" />
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={analyzeMarket}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isAnalyzing ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  AI Analysis
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => executeTrade('buy', 75, "Manual buy order")}
              className="bg-green-600 hover:bg-green-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy
            </Button>
            
            <Button 
              onClick={() => executeTrade('sell', 75, "Manual sell order")}
              className="bg-red-600 hover:bg-red-700"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Open Trades */}
      {openTrades.length > 0 && (
        <Card className="glass-card border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-orange-400">Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openTrades.map((trade) => {
                const pips = trade.direction === 'buy' 
                  ? (currentPrice - trade.entryPrice) * 10000
                  : (trade.entryPrice - currentPrice) * 10000;
                const pnl = pips * 10;
                
                return (
                  <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {trade.direction === 'buy' ? (
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <p className="font-semibold">{trade.pair} {trade.direction.toUpperCase()}</p>
                        <p className="text-sm text-gray-400">Entry: {trade.entryPrice.toFixed(5)}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">{pips.toFixed(1)} pips</p>
                    </div>
                    
                    <Button 
                      onClick={() => closeTrade(trade.id)}
                      size="sm"
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trade History */}
      {tradeHistory.length > 0 && (
        <Card className="glass-card border-gray-500/20">
          <CardHeader>
            <CardTitle className="text-gray-400">Trade History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {tradeHistory.slice(0, 10).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-2 bg-gray-800/20 rounded">
                  <div className="flex items-center space-x-2">
                    {trade.direction === 'buy' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm">{trade.pair}</span>
                  </div>
                  <span className={`text-sm font-semibold ${(trade.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(trade.pnl || 0) >= 0 ? '+' : ''}${(trade.pnl || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfessionalTradingGame;
