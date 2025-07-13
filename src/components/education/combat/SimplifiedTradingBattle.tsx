
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Brain, Target, Zap } from 'lucide-react';

interface SimplifiedTradingBattleProps {
  onFeatureUse?: () => void;
}

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const SimplifiedTradingBattle = ({ onFeatureUse }: SimplifiedTradingBattleProps) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [battlePhase, setBattlePhase] = useState<'prediction' | 'waiting' | 'result'>('prediction');
  const [selectedDirection, setSelectedDirection] = useState<'up' | 'down' | null>(null);
  const [playerStats, setPlayerStats] = useState({
    level: 14,
    xp: 1250,
    accuracy: 71,
    wins: 23,
    losses: 9
  });
  
  const [opponentStats] = useState({
    level: 12,
    xp: 1050,
    accuracy: 64,
    wins: 18,
    losses: 10
  });

  const [currentScenario, setCurrentScenario] = useState(() => {
    const scenarios = [
      {
        symbol: "EUR/USD",
        currentPrice: 1.0845,
        hint: "Look for the liquidity sweep at 1.0840 - Smart money is hunting stops",
        concept: "Liquidity Hunt",
        candles: generateRealisticCandles(1.0845, 'liquidity_hunt')
      },
      {
        symbol: "GBP/USD", 
        currentPrice: 1.2750,
        hint: "Price is testing major resistance at 1.2780 - Watch for rejection or breakout",
        concept: "Resistance Test",
        candles: generateRealisticCandles(1.2750, 'resistance_test')
      },
      {
        symbol: "USD/JPY",
        currentPrice: 149.85,
        hint: "RSI showing hidden bullish divergence - Bears losing momentum",
        concept: "RSI Divergence",
        candles: generateRealisticCandles(149.85, 'rsi_divergence')
      }
    ];
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  });

  const [result, setResult] = useState<{
    winner: 'player' | 'opponent';
    correct: boolean;
    xpGained: number;
    explanation: string;
  } | null>(null);

  function generateRealisticCandles(basePrice: number, scenario: string) {
    const candles: CandleData[] = [];
    let currentPrice = basePrice - 0.001;
    
    for (let i = 0; i < 20; i++) {
      const volatility = 0.0003 + Math.random() * 0.0002;
      let trend = 0;
      
      // Add scenario-specific behavior
      if (scenario === 'liquidity_hunt' && i > 15) {
        trend = -0.0001; // Dip then reverse
      } else if (scenario === 'resistance_test' && i > 12) {
        trend = 0.00005; // Gradual climb to resistance
      } else if (scenario === 'rsi_divergence') {
        trend = i > 10 ? 0.00003 : -0.00002; // Divergence pattern
      }
      
      const open = currentPrice;
      const close = open + (Math.random() - 0.5) * volatility + trend;
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;
      
      candles.push({
        timestamp: Date.now() - (20 - i) * 60000,
        open,
        high,
        low,
        close,
        volume: 1000 + Math.random() * 500
      });
      
      currentPrice = close;
    }
    
    return candles;
  }

  // Timer countdown
  useEffect(() => {
    if (battlePhase === 'prediction' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && battlePhase === 'prediction') {
      if (selectedDirection) {
        setBattlePhase('waiting');
        simulateBattleResult();
      }
    }
  }, [timeLeft, battlePhase, selectedDirection]);

  const simulateBattleResult = () => {
    setTimeout(() => {
      // Simulate realistic market outcome
      const isCorrect = Math.random() > 0.4; // 60% chance of being correct
      const xpGain = isCorrect ? 25 : 10;
      
      setResult({
        winner: isCorrect ? 'player' : 'opponent',
        correct: isCorrect,
        xpGained: xpGain,
        explanation: isCorrect 
          ? `Excellent analysis! The ${currentScenario.concept} played out as expected.`
          : `Market moved against prediction. Study the ${currentScenario.concept} pattern more.`
      });
      
      if (isCorrect) {
        setPlayerStats(prev => ({
          ...prev,
          xp: prev.xp + xpGain,
          wins: prev.wins + 1,
          accuracy: Math.round(((prev.wins + 1) / (prev.wins + prev.losses + 1)) * 100)
        }));
      }
      
      setBattlePhase('result');
      onFeatureUse?.();
    }, 3000);
  };

  const handlePrediction = (direction: 'up' | 'down') => {
    setSelectedDirection(direction);
    if (timeLeft === 0) {
      setBattlePhase('waiting');
      simulateBattleResult();
    }
  };

  const resetBattle = () => {
    setTimeLeft(30);
    setBattlePhase('prediction');
    setSelectedDirection(null);
    setResult(null);
    // Generate new scenario
    const scenarios = [
      {
        symbol: "EUR/USD",
        currentPrice: 1.0845 + (Math.random() - 0.5) * 0.001,
        hint: "Look for the liquidity sweep at key levels - Smart money is active",
        concept: "Liquidity Hunt"
      },
      {
        symbol: "GBP/USD", 
        currentPrice: 1.2750 + (Math.random() - 0.5) * 0.001,
        hint: "Price testing major resistance - Watch for rejection or breakout",
        concept: "Resistance Test"
      }
    ];
    const newScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setCurrentScenario({
      ...newScenario,
      candles: generateRealisticCandles(newScenario.currentPrice, newScenario.concept.toLowerCase().replace(' ', '_'))
    });
  };

  const SimplifiedChart = ({ candles }: { candles: CandleData[] }) => (
    <div className="w-full h-64 bg-gray-900 rounded-xl p-4 relative overflow-hidden">
      {/* Price Line */}
      <div className="absolute top-4 left-4 text-green-400 font-mono text-xl font-bold">
        {currentScenario.currentPrice.toFixed(4)}
      </div>
      
      {/* Simplified Candlestick Representation */}
      <div className="flex items-end justify-center h-48 mt-8 space-x-1">
        {candles.slice(-15).map((candle, index) => {
          const isBull = candle.close > candle.open;
          const bodyHeight = Math.abs(candle.close - candle.open) * 8000;
          const wickHeight = (candle.high - candle.low) * 8000;
          
          return (
            <div key={index} className="flex flex-col items-center justify-end">
              {/* Wick */}
              <div 
                className={`w-px ${isBull ? 'bg-green-400' : 'bg-red-400'}`}
                style={{ height: `${Math.max(wickHeight, 2)}px` }}
              />
              {/* Body */}
              <div 
                className={`w-3 ${isBull ? 'bg-green-500' : 'bg-red-500'} rounded-sm`}
                style={{ height: `${Math.max(bodyHeight, 1)}px` }}
              />
            </div>
          );
        })}
      </div>
      
      {/* Price Direction Indicator */}
      <div className="absolute bottom-4 right-4">
        {selectedDirection && (
          <Badge variant={selectedDirection === 'up' ? 'default' : 'destructive'} className="text-lg px-4 py-2">
            {selectedDirection === 'up' ? '📈 BULLISH' : '📉 BEARISH'}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Trading Battle Arena</h2>
            <p className="text-gray-300">Analyze. Predict. Learn from real market scenarios.</p>
          </div>
        </CardContent>
      </Card>

      {/* Main Battle Interface */}
      <Card className="glass-card">
        <CardContent className="p-6">
          {/* Current Market Scenario */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">{currentScenario.symbol}</h3>
                  <p className="text-gray-400">{currentScenario.concept}</p>
                </div>
              </div>
              
              {/* Timer */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                timeLeft <= 10 ? 'bg-red-900/40 border border-red-500' : 
                timeLeft <= 20 ? 'bg-yellow-900/40 border border-yellow-500' :
                'bg-green-900/40 border border-green-500'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">0:{timeLeft.toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Master's Wisdom */}
            <div className="bg-blue-900/40 border border-blue-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-start space-x-3">
                <Brain className="w-6 h-6 text-blue-400 mt-1" />
                <div>
                  <h4 className="text-blue-400 font-semibold mb-1">Master's Wisdom</h4>
                  <p className="text-blue-100">{currentScenario.hint}</p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <SimplifiedChart candles={currentScenario.candles} />
          </div>

          {/* Battle Actions */}
          {battlePhase === 'prediction' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                onClick={() => handlePrediction('up')}
                disabled={selectedDirection !== null}
                className="h-16 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl"
              >
                <TrendingUp className="w-6 h-6 mr-2" />
                📈 Bullish Strike
                <br />
                <span className="text-sm opacity-80">Price will rise</span>
              </Button>
              
              <Button
                onClick={() => handlePrediction('down')}
                disabled={selectedDirection !== null}
                className="h-16 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-xl"
              >
                <TrendingDown className="w-6 h-6 mr-2" />
                📉 Bearish Attack
                <br />
                <span className="text-sm opacity-80">Price will fall</span>
              </Button>
            </div>
          )}

          {battlePhase === 'waiting' && (
            <div className="text-center mb-6">
              <div className="animate-pulse text-yellow-400 text-xl font-bold mb-2">
                <Zap className="w-6 h-6 inline mr-2" />
                Analyzing Market Movement...
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {battlePhase === 'result' && result && (
            <div className="text-center mb-6">
              <div className={`text-2xl font-bold mb-4 ${result.correct ? 'text-green-400' : 'text-red-400'}`}>
                {result.correct ? '🏆 Victory!' : '📚 Learning Moment'}
              </div>
              <p className="text-gray-300 mb-4">{result.explanation}</p>
              <div className="flex justify-center space-x-4 mb-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  XP Gained: +{result.xpGained}
                </Badge>
              </div>
              <Button onClick={resetBattle} className="bg-purple-600 hover:bg-purple-700 rounded-xl">
                Next Battle
              </Button>
            </div>
          )}

          {/* Player vs Opponent Stats */}
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <h4 className="text-white font-semibold mb-2">You (Level {playerStats.level})</h4>
              <div className="space-y-1 text-sm">
                <div>XP: {playerStats.xp}</div>
                <div>Accuracy: {playerStats.accuracy}%</div>
                <div className="text-green-400">{playerStats.wins}W - {playerStats.losses}L</div>
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="text-white font-semibold mb-2">Opponent (Level {opponentStats.level})</h4>
              <div className="space-y-1 text-sm">
                <div>XP: {opponentStats.xp}</div>
                <div>Accuracy: {opponentStats.accuracy}%</div>
                <div className="text-red-400">{opponentStats.wins}W - {opponentStats.losses}L</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedTradingBattle;
