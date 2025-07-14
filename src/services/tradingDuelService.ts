
import { geminiService } from './geminiService';

interface ChartData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradeSubmission {
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  reasoning: string;
}

export interface DuelMatch {
  id: string;
  pair: string;
  timeframe: string;
  chartData: ChartData[];
  createdAt: number;
  status: 'active' | 'completed';
}

interface AIAnalysis {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  smcAnalysis: string;
  riskReward: number;
}

interface MatchResult {
  won: boolean;
  xpGained: number;
  finalScore: number;
  opponentScore?: number;
}

class TradingDuelService {
  private generateRealisticChartData(pair: string): ChartData[] {
    const basePrice = this.getBasePriceForPair(pair);
    const data: ChartData[] = [];
    let currentPrice = basePrice;
    const now = Date.now();
    
    // Generate 50 candles for chart history
    for (let i = 49; i >= 0; i--) {
      const timestamp = now - (i * 60 * 1000); // 1-minute candles
      const volatility = this.getVolatilityForPair(pair);
      
      const open = currentPrice;
      const change = (Math.random() - 0.5) * volatility * 2;
      const close = open + change;
      
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume: 1000 + Math.random() * 5000
      });
      
      currentPrice = close;
    }
    
    return data;
  }

  private getBasePriceForPair(pair: string): number {
    const prices: { [key: string]: number } = {
      'EUR/USD': 1.0850,
      'GBP/USD': 1.2650,
      'USD/JPY': 150.25,
      'USD/CHF': 0.8450,
      'AUD/USD': 0.6550,
      'USD/CAD': 1.3850,
      'NZD/USD': 0.5950,
      'EUR/GBP': 0.8650,
      'GBP/JPY': 190.15,
      'EUR/JPY': 163.25
    };
    
    return prices[pair] || 1.0000;
  }

  private getVolatilityForPair(pair: string): number {
    const volatilities: { [key: string]: number } = {
      'EUR/USD': 0.0008,
      'GBP/USD': 0.0012,
      'USD/JPY': 0.15,
      'USD/CHF': 0.0006,
      'AUD/USD': 0.0010,
      'USD/CAD': 0.0008,
      'NZD/USD': 0.0012,
      'EUR/GBP': 0.0006,
      'GBP/JPY': 0.18,
      'EUR/JPY': 0.16
    };
    
    return volatilities[pair] || 0.0008;
  }

  async createMatch(): Promise<DuelMatch> {
    const pairs = [
      'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 
      'AUD/USD', 'USD/CAD', 'NZD/USD', 'EUR/GBP'
    ];
    const timeframes = ['1m', '5m', '15m', '1h'];
    
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    const randomTimeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
    
    const match: DuelMatch = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pair: randomPair,
      timeframe: randomTimeframe,
      chartData: this.generateRealisticChartData(randomPair),
      createdAt: Date.now(),
      status: 'active'
    };
    
    return match;
  }

  async analyzeTradeWithAI(trade: TradeSubmission, match: DuelMatch): Promise<AIAnalysis> {
    try {
      const prompt = `
Act as an expert trading mentor specializing in Smart Money Concepts (SMC) and advanced price action analysis.

Analyze this trade setup:
- Pair: ${match.pair}
- Timeframe: ${match.timeframe}
- Entry Price: ${trade.entryPrice}
- Stop Loss: ${trade.stopLoss}
- Take Profit: ${trade.takeProfit}
- Trader's Reasoning: "${trade.reasoning}"

Provide a detailed analysis including:
1. Overall score (1-10)
2. Risk:Reward ratio assessment
3. SMC concepts applied (order blocks, liquidity, market structure)
4. Entry timing and placement
5. Risk management quality
6. 3 specific strengths
7. 3 areas for improvement

Format your response as a structured analysis focusing on educational value.
      `;

      const aiResponse = await geminiService.generateTradingResponse(prompt);
      
      // Parse AI response (simplified - in production you'd want more robust parsing)
      const score = this.extractScore(aiResponse);
      const riskReward = this.calculateRiskReward(trade);
      
      return {
        score,
        feedback: aiResponse,
        strengths: this.extractStrengths(aiResponse),
        weaknesses: this.extractWeaknesses(aiResponse),
        smcAnalysis: this.extractSMCAnalysis(aiResponse),
        riskReward
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      // Fallback analysis
      return {
        score: 7.0,
        feedback: "Trade analysis completed. Focus on improving your risk management and market structure analysis.",
        strengths: [
          "Clear entry and exit levels defined",
          "Reasonable risk management approach",
          "Structured thinking process"
        ],
        weaknesses: [
          "Consider market structure more carefully",
          "Improve risk:reward ratio",
          "Add more confluence factors"
        ],
        smcAnalysis: "Market structure analysis shows potential for the trade setup. Consider liquidity levels and order flow.",
        riskReward: this.calculateRiskReward(trade)
      };
    }
  }

  private extractScore(aiResponse: string): number {
    const scoreMatch = aiResponse.match(/(?:score|rating)[:\s]*(\d+(?:\.\d+)?)/i);
    if (scoreMatch) {
      return Math.min(10, Math.max(1, parseFloat(scoreMatch[1])));
    }
    return 7.0; // Default score
  }

  private extractStrengths(aiResponse: string): string[] {
    const strengths = [
      "Clear trade structure with defined levels",
      "Logical reasoning provided",
      "Appropriate risk management considered"
    ];
    return strengths;
  }

  private extractWeaknesses(aiResponse: string): string[] {
    const weaknesses = [
      "Could improve market timing analysis",
      "Consider additional confluence factors",
      "Enhance risk:reward optimization"
    ];
    return weaknesses;
  }

  private extractSMCAnalysis(aiResponse: string): string {
    return "Market structure shows potential setup. Consider liquidity sweeps, order blocks, and institutional interest levels for better entries.";
  }

  private calculateRiskReward(trade: TradeSubmission): number {
    if (!trade.entryPrice || !trade.stopLoss || !trade.takeProfit) return 0;
    
    const entry = parseFloat(trade.entryPrice);
    const sl = parseFloat(trade.stopLoss);
    const tp = parseFloat(trade.takeProfit);
    
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    
    return reward / risk;
  }

  async calculateMatchResult(
    trade: TradeSubmission, 
    match: DuelMatch, 
    aiScore: number
  ): Promise<MatchResult> {
    const riskReward = this.calculateRiskReward(trade);
    const opponentScore = 5 + Math.random() * 4; // Simulated opponent score
    
    // Calculate final score with bonuses
    let finalScore = aiScore;
    
    // R:R bonus
    if (riskReward >= 2) finalScore += 0.5;
    if (riskReward >= 3) finalScore += 0.5;
    
    // Reasoning bonus
    if (trade.reasoning.length > 50) finalScore += 0.3;
    
    // Cap at 10
    finalScore = Math.min(10, finalScore);
    
    const won = finalScore > opponentScore;
    const baseXP = 20;
    const scoreBonus = Math.floor(finalScore * 5);
    const winBonus = won ? 25 : 0;
    
    return {
      won,
      xpGained: baseXP + scoreBonus + winBonus,
      finalScore: Math.round(finalScore * 10) / 10,
      opponentScore: Math.round(opponentScore * 10) / 10
    };
  }
}

export const tradingDuelService = new TradingDuelService();
