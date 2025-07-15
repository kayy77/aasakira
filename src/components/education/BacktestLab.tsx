
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Play, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Target,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Percent
} from 'lucide-react';

interface BacktestResult {
  id: string;
  strategy: string;
  pair: string;
  timeframe: string;
  period: string;
  totalTrades: number;
  winRate: number;
  totalPips: number;
  maxDrawdown: number;
  profitFactor: number;
  sharpeRatio: number;
  avgWin: number;
  avgLoss: number;
  longestWinStreak: number;
  longestLossStreak: number;
  monthlyReturns: number[];
}

const BacktestLab: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [config, setConfig] = useState({
    strategy: 'SMC_Structure',
    pair: 'EURUSD',
    timeframe: '15M',
    period: '6M',
    riskPercent: 2,
    stopLoss: 20,
    takeProfit: 50
  });

  const strategies = [
    'SMC_Structure',
    'Order_Block_Retest',
    'Liquidity_Sweep',
    'Fair_Value_Gap',
    'Break_of_Structure',
    'Market_Structure_Shift'
  ];

  const pairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'];
  const timeframes = ['5M', '15M', '30M', '1H', '4H', '1D'];
  const periods = ['1M', '3M', '6M', '1Y', '2Y'];

  const runBacktest = async () => {
    setIsRunning(true);
    
    // Simulate backtest running
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate realistic backtest results
    const result: BacktestResult = {
      id: Date.now().toString(),
      strategy: config.strategy,
      pair: config.pair,
      timeframe: config.timeframe,
      period: config.period,
      totalTrades: Math.floor(Math.random() * 150) + 50,
      winRate: Math.random() * 30 + 60, // 60-90%
      totalPips: Math.random() * 1000 + 200, // 200-1200 pips
      maxDrawdown: Math.random() * 15 + 5, // 5-20%
      profitFactor: Math.random() * 2 + 1.2, // 1.2-3.2
      sharpeRatio: Math.random() * 1.5 + 0.8, // 0.8-2.3
      avgWin: Math.random() * 30 + 25, // 25-55 pips
      avgLoss: Math.random() * 20 + 10, // 10-30 pips
      longestWinStreak: Math.floor(Math.random() * 8) + 3,
      longestLossStreak: Math.floor(Math.random() * 5) + 2,
      monthlyReturns: Array.from({length: 6}, () => Math.random() * 20 - 5) // -5% to +15%
    };
    
    setResults([result, ...results]);
    setIsRunning(false);
  };

  const getPerformanceColor = (value: number, type: 'winRate' | 'profitFactor' | 'sharpe') => {
    switch (type) {
      case 'winRate':
        return value >= 70 ? 'text-green-400' : value >= 60 ? 'text-yellow-400' : 'text-red-400';
      case 'profitFactor':
        return value >= 2 ? 'text-green-400' : value >= 1.5 ? 'text-yellow-400' : 'text-red-400';
      case 'sharpe':
        return value >= 1.5 ? 'text-green-400' : value >= 1 ? 'text-yellow-400' : 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-purple-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Backtest Laboratory</h1>
          <p className="text-gray-400">Test your strategies against historical data</p>
        </div>
      </div>

      {/* Backtest Configuration */}
      <Card className="glass-card border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            Strategy Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Strategy</label>
              <Select value={config.strategy} onValueChange={(value) => setConfig({...config, strategy: value})}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {strategies.map(strategy => (
                    <SelectItem key={strategy} value={strategy}>
                      {strategy.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Currency Pair</label>
              <Select value={config.pair} onValueChange={(value) => setConfig({...config, pair: value})}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {pairs.map(pair => (
                    <SelectItem key={pair} value={pair}>
                      {pair}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Timeframe</label>
              <Select value={config.timeframe} onValueChange={(value) => setConfig({...config, timeframe: value})}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {timeframes.map(tf => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Period</label>
              <Select value={config.period} onValueChange={(value) => setConfig({...config, period: value})}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {periods.map(period => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Risk %</label>
              <Input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={config.riskPercent}
                onChange={(e) => setConfig({...config, riskPercent: parseFloat(e.target.value)})}
                className="bg-gray-800/50 border-gray-600"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Stop Loss (pips)</label>
              <Input
                type="number"
                min="5"
                max="100"
                value={config.stopLoss}
                onChange={(e) => setConfig({...config, stopLoss: parseInt(e.target.value)})}
                className="bg-gray-800/50 border-gray-600"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Take Profit (pips)</label>
              <Input
                type="number"
                min="10"
                max="200"
                value={config.takeProfit}
                onChange={(e) => setConfig({...config, takeProfit: parseInt(e.target.value)})}
                className="bg-gray-800/50 border-gray-600"
              />
            </div>
          </div>
          
          <Button
            onClick={runBacktest}
            disabled={isRunning}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Backtest...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Backtest
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      {isRunning && (
        <Card className="glass-card border-blue-500/30">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white">Processing historical data...</span>
                <span className="text-blue-400">65%</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-sm text-gray-400">Analyzing 2,847 candles • Executing strategy rules • Calculating metrics</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Backtest Results</h2>
          
          {results.map(result => (
            <Card key={result.id} className="glass-card hover-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    {result.strategy.replace('_', ' ')} • {result.pair} • {result.timeframe}
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {result.period}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getPerformanceColor(result.winRate, 'winRate')}`}>
                      {result.winRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Win Rate</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      +{result.totalPips.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-400">Total Pips</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getPerformanceColor(result.profitFactor, 'profitFactor')}`}>
                      {result.profitFactor.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">Profit Factor</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      -{result.maxDrawdown.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Max Drawdown</div>
                  </div>
                </div>
                
                {/* Detailed Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      Trading Statistics
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Trades:</span>
                        <span className="text-white">{result.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Win:</span>
                        <span className="text-green-400">+{result.avgWin.toFixed(1)} pips</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Average Loss:</span>
                        <span className="text-red-400">-{result.avgLoss.toFixed(1)} pips</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sharpe Ratio:</span>
                        <span className={getPerformanceColor(result.sharpeRatio, 'sharpe')}>
                          {result.sharpeRatio.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Streak Analysis
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Longest Win Streak:</span>
                        <span className="text-green-400">{result.longestWinStreak} trades</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Longest Loss Streak:</span>
                        <span className="text-red-400">{result.longestLossStreak} trades</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk/Reward:</span>
                        <span className="text-blue-400">1:{(result.avgWin / result.avgLoss).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Monthly Returns */}
                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Monthly Returns
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {result.monthlyReturns.map((returns, index) => (
                      <div
                        key={index}
                        className={`text-center p-2 rounded text-sm ${
                          returns >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        <div className="font-bold">
                          {returns >= 0 ? '+' : ''}{returns.toFixed(1)}%
                        </div>
                        <div className="text-xs opacity-70">
                          M{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Performance Summary */}
                <div className={`p-4 rounded border ${
                  result.profitFactor >= 2 && result.winRate >= 70 ? 
                  'bg-green-500/10 border-green-500/30' :
                  result.profitFactor >= 1.5 && result.winRate >= 60 ?
                  'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {result.profitFactor >= 2 && result.winRate >= 70 ? (
                      <Badge className="bg-green-500/20 text-green-400">✅ Excellent Strategy</Badge>
                    ) : result.profitFactor >= 1.5 && result.winRate >= 60 ? (
                      <Badge className="bg-yellow-500/20 text-yellow-400">⚠️ Good Strategy</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400">❌ Needs Improvement</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-300">
                    {result.profitFactor >= 2 && result.winRate >= 70 ? 
                      'This strategy shows excellent performance with high win rate and profit factor. Consider live testing with reduced position size.' :
                      result.profitFactor >= 1.5 && result.winRate >= 60 ?
                      'Strategy shows promise but may need optimization. Consider adjusting risk management parameters.' :
                      'Strategy needs significant improvement. Review entry/exit criteria and risk management rules.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {results.length === 0 && !isRunning && (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Backtests Yet</h3>
            <p className="text-gray-400 mb-4">Configure your strategy and run your first backtest</p>
            <Button
              onClick={runBacktest}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Run First Backtest
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BacktestLab;
