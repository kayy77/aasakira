import { supabase } from '@/integrations/supabase/client';
import { groqService } from './groqService';

interface JournalEntry {
  id: string;
  pair: string;
  entry_price: number;
  exit_price?: number;
  entry_time: string;
  exit_time?: string;
  direction: 'LONG' | 'SHORT';
  strategy: string;
  lot_size?: number;
  fees?: number;
  risk_reward_ratio?: number;
  result_pips?: number;
  result_percentage?: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  notes?: string;
  ai_feedback?: string;
  created_at: string;
}

interface TradingStats {
  totalTrades: number;
  winRate: number;
  totalPnL: number;
  avgWin: number;
  avgLoss: number;
  bestDay: number;
  worstDay: number;
  currentStreak: number;
  longestWinStreak: number;
}

interface TimeFilter {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export class JournalAnalyticsService {
  
  calculateStats(entries: JournalEntry[], filter: TimeFilter): TradingStats {
    const closedTrades = this.filterEntriesByTime(entries, filter)
      .filter(entry => entry.status === 'CLOSED')
      .filter(entry => Math.abs(entry.result_pips || 0) <= 1000); // Filter unrealistic values
    
    if (closedTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        bestDay: 0,
        worstDay: 0,
        currentStreak: 0,
        longestWinStreak: 0
      };
    }

    // Calculate USD P&L using lot sizes
    const calculateUSDPnL = (entry: JournalEntry): number => {
      const pips = entry.result_pips || 0;
      const lotSize = entry.lot_size || 1;
      const fees = entry.fees || 0;
      const actualLotSize = lotSize === 0 ? 0.01 : lotSize;
      const pipValue = actualLotSize * 10;
      return (pips * pipValue) - fees;
    };

    const wins = closedTrades.filter(t => (t.result_pips || 0) >= 0);
    const losses = closedTrades.filter(t => (t.result_pips || 0) < 0);
    
    const totalPnL = closedTrades.reduce((sum, t) => sum + calculateUSDPnL(t), 0);
    const winRate = (wins.length / closedTrades.length) * 100;
    
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + calculateUSDPnL(t), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((sum, t) => sum + calculateUSDPnL(t), 0) / losses.length : 0;

    // Calculate daily P/L for best/worst day (in USD)
    const dailyPnL = this.getDailyPnL(closedTrades);
    const bestDay = Math.max(...Object.values(dailyPnL), 0);
    const worstDay = Math.min(...Object.values(dailyPnL), 0);

    // Calculate streaks
    const { currentStreak, longestWinStreak } = this.calculateStreaks(closedTrades);

    return {
      totalTrades: closedTrades.length,
      winRate: Math.round(winRate * 100) / 100,
      totalPnL: Math.round(totalPnL * 100) / 100, // Already in USD
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(Math.abs(avgLoss) * 100) / 100,
      bestDay: Math.round(bestDay * 100) / 100,
      worstDay: Math.round(worstDay * 100) / 100,
      currentStreak,
      longestWinStreak
    };
  }

  private filterEntriesByTime(entries: JournalEntry[], filter: TimeFilter): JournalEntry[] {
    const now = new Date();
    let startDate: Date;
    let endDate = filter.endDate || new Date();

    switch (filter.type) {
      case 'daily':
        // Use UTC boundaries to match stored UTC timestamps
        const nowUTC = new Date();
        const todayStartUTC = new Date(nowUTC.getFullYear(), nowUTC.getMonth(), nowUTC.getDate());
        const todayEndUTC = new Date(nowUTC.getFullYear(), nowUTC.getMonth(), nowUTC.getDate(), 23, 59, 59, 999);
        startDate = todayStartUTC;
        endDate = todayEndUTC;
        console.log('🔍 Daily filter range (UTC):', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });
        break;
      case 'weekly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
      case 'custom':
        startDate = filter.startDate || new Date(0);
        break;
      default:
        return entries;
    }

    const filtered = entries.filter(entry => {
      const entryDate = new Date(entry.entry_time);
      const inRange = entryDate >= startDate && entryDate <= endDate;
      if (filter.type === 'daily') {
        console.log('🔍 Checking entry:', { 
          pair: entry.pair, 
          entryDate: entryDate.toISOString(), 
          status: entry.status,
          inRange,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });
      }
      return inRange;
    });

    if (filter.type === 'daily') {
      console.log('🔍 Filtered entries for today:', filtered.length, filtered.map(e => ({ pair: e.pair, status: e.status, pips: e.result_pips })));
    }

    return filtered;
  }

  private getDailyPnL(entries: JournalEntry[]): Record<string, number> {
    const dailyPnL: Record<string, number> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.entry_time).toISOString().split('T')[0];
      const pips = entry.result_pips || 0;
      const lotSize = entry.lot_size || 1;
      const fees = entry.fees || 0;
      const actualLotSize = lotSize === 0 ? 0.01 : lotSize;
      const pipValue = actualLotSize * 10;
      const usdPnL = (pips * pipValue) - fees;
      if (!dailyPnL[date]) dailyPnL[date] = 0;
      dailyPnL[date] += usdPnL;
    });
    
    return dailyPnL;
  }

  private calculateStreaks(entries: JournalEntry[]): { currentStreak: number; longestWinStreak: number } {
    if (entries.length === 0) return { currentStreak: 0, longestWinStreak: 0 };

    // Sort by entry time
    const sortedTrades = [...entries].sort((a, b) => 
      new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
    );

    let currentStreak = 0;
    let longestWinStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from most recent trades backwards)
    for (let i = sortedTrades.length - 1; i >= 0; i--) {
      const isWin = (sortedTrades[i].result_pips || 0) >= 0;
      
      if (i === sortedTrades.length - 1) {
        currentStreak = isWin ? 1 : -1;
      } else {
        const wasLastWin = currentStreak > 0;
        if ((isWin && wasLastWin) || (!isWin && currentStreak < 0)) {
          currentStreak += isWin ? 1 : -1;
        } else {
          break;
        }
      }
    }

    // Calculate longest win streak
    for (const trade of sortedTrades) {
      const isWin = (trade.result_pips || 0) >= 0;
      
      if (isWin) {
        tempStreak++;
        longestWinStreak = Math.max(longestWinStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestWinStreak };
  }

  async generateAISummary(userId: string, entries: JournalEntry[], timeframe: string): Promise<string> {
    const closedTrades = entries.filter(entry => entry.status === 'CLOSED');
    
    if (closedTrades.length === 0) {
      return "No completed trades found for analysis. Start trading and close some positions to get AI insights.";
    }

    const stats = this.calculateStats(entries, { type: 'monthly' });
    
    // Prepare data for AI analysis
    const recentTrades = closedTrades.slice(0, 10).map(trade => ({
      pair: trade.pair,
      direction: trade.direction,
      strategy: trade.strategy,
      result: trade.result_pips,
      notes: trade.notes || 'No notes'
    }));

    const prompt = `You are Aasakira, an elite trading mentor. Analyze this trader's ${timeframe} performance data and provide brutal honest feedback.

TRADING STATISTICS:
- Total Trades: ${stats.totalTrades}
- Win Rate: ${stats.winRate}%
- Total P/L: ${stats.totalPnL} pips
- Average Win: ${stats.avgWin} pips
- Average Loss: ${stats.avgLoss} pips
- Current Streak: ${stats.currentStreak} ${stats.currentStreak > 0 ? 'wins' : 'losses'}
- Best Day: ${stats.bestDay} pips
- Worst Day: ${stats.worstDay} pips

RECENT TRADES:
${recentTrades.map(t => `${t.pair} ${t.direction} | ${t.strategy} | ${t.result >= 0 ? '+' : ''}${t.result} pips | Notes: ${t.notes}`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Identify their biggest weakness (risk management, strategy selection, psychology)
2. Call out specific patterns in their losses
3. Provide 3 concrete improvements they must implement immediately
4. Rate their discipline from 1-10 and justify it
5. Predict what will happen if they don't fix these issues

Be direct. No praise without performance. Elite traders demand truth.
Keep response under 300 words. No emojis.`;

    try {
      const response = await groqService.generateResponse(prompt, {
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 400
      });

      return response;
    } catch (error) {
      console.error('Error generating AI summary:', error);
      return "AI analysis temporarily unavailable. Your trading data has been recorded for future analysis.";
    }
  }

  getCategories(): Array<{ name: string; key: string; color: string }> {
    return [
      { name: 'Overview', key: 'overview', color: 'text-primary' },
      { name: 'Winning Trades', key: 'wins', color: 'text-green-400' },
      { name: 'Losing Trades', key: 'losses', color: 'text-red-400' },
      { name: 'Strategy Analysis', key: 'strategy', color: 'text-blue-400' },
      { name: 'Risk Management', key: 'risk', color: 'text-orange-400' },
      { name: 'Monthly Report', key: 'monthly', color: 'text-purple-400' }
    ];
  }
}