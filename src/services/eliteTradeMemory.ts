
import { supabase } from '@/integrations/supabase/client';

export interface TradeRecord {
  id: string;
  userId: string;
  pair: string;
  type: 'Buy' | 'Sell';
  entry: number;
  stop: number;
  tp: number;
  result: 'Win' | 'Loss' | 'Breakeven' | 'Running';
  violatedFramework: string[];
  notes: string;
  timestamp: Date;
  riskReward: number;
  sessionTime: string;
  confluence: number;
}

export interface UserPattern {
  userId: string;
  commonMistakes: string[];
  strengths: string[];
  averageRR: number;
  winRate: number;
  emotionalTriggers: string[];
  frameworkAdherence: number;
  lastAnalysis: Date;
}

class EliteTradeMemory {
  async storeTradeRecord(trade: Omit<TradeRecord, 'id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_memory')
        .insert({
          user_id: trade.userId,
          memory_type: 'trade_record',
          content: JSON.stringify(trade),
          importance_score: this.calculateImportance(trade),
          context: {
            trade_outcome: trade.result,
            framework_violations: trade.violatedFramework,
            risk_reward: trade.riskReward,
            session_time: trade.sessionTime
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store trade record:', error);
    }
  }

  async getUserTradeHistory(userId: string, limit: number = 10): Promise<TradeRecord[]> {
    try {
      const { data, error } = await supabase
        .from('ai_memory')
        .select('*')
        .eq('user_id', userId)
        .eq('memory_type', 'trade_record')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(record => ({
        id: record.id,
        ...JSON.parse(record.content),
        timestamp: new Date(record.created_at)
      })) || [];
    } catch (error) {
      console.error('Failed to get trade history:', error);
      return [];
    }
  }

  async analyzeUserPatterns(userId: string): Promise<UserPattern> {
    const trades = await this.getUserTradeHistory(userId, 50);
    
    if (trades.length === 0) {
      return {
        userId,
        commonMistakes: [],
        strengths: [],
        averageRR: 0,
        winRate: 0,
        emotionalTriggers: [],
        frameworkAdherence: 0,
        lastAnalysis: new Date()
      };
    }

    const wins = trades.filter(t => t.result === 'Win').length;
    const totalTrades = trades.filter(t => t.result !== 'Running').length;
    
    const allViolations = trades.flatMap(t => t.violatedFramework);
    const commonMistakes = this.getMostFrequent(allViolations);
    
    const avgRR = trades.reduce((sum, t) => sum + t.riskReward, 0) / trades.length;
    const frameworkViolations = trades.filter(t => t.violatedFramework.length > 0).length;
    const frameworkAdherence = ((trades.length - frameworkViolations) / trades.length) * 100;

    return {
      userId,
      commonMistakes,
      strengths: this.identifyStrengths(trades),
      averageRR: avgRR,
      winRate: totalTrades > 0 ? (wins / totalTrades) * 100 : 0,
      emotionalTriggers: this.identifyEmotionalTriggers(trades),
      frameworkAdherence,
      lastAnalysis: new Date()
    };
  }

  private calculateImportance(trade: TradeRecord): number {
    let score = 5; // base importance
    
    if (trade.result === 'Loss') score += 3;
    if (trade.violatedFramework.length > 0) score += 2;
    if (trade.riskReward < 1) score += 2;
    if (trade.riskReward > 3) score += 1;
    
    return Math.min(score, 10);
  }

  private getMostFrequent(arr: string[]): string[] {
    const frequency: Record<string, number> = {};
    arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([item]) => item);
  }

  private identifyStrengths(trades: TradeRecord[]): string[] {
    const strengths: string[] = [];
    
    const avgRR = trades.reduce((sum, t) => sum + t.riskReward, 0) / trades.length;
    if (avgRR > 2) strengths.push('Excellent Risk Management');
    
    const winningTrades = trades.filter(t => t.result === 'Win');
    if (winningTrades.length > trades.length * 0.6) strengths.push('High Win Rate');
    
    const disciplinedTrades = trades.filter(t => t.violatedFramework.length === 0);
    if (disciplinedTrades.length > trades.length * 0.8) strengths.push('Framework Discipline');
    
    return strengths;
  }

  private identifyEmotionalTriggers(trades: TradeRecord[]): string[] {
    const triggers: string[] = [];
    
    const recentLosses = trades.filter(t => t.result === 'Loss').slice(0, 3);
    if (recentLosses.length >= 2) triggers.push('Loss Streaks');
    
    const impatientEntries = trades.filter(t => 
      t.violatedFramework.includes('Early Entry') || 
      t.violatedFramework.includes('FOMO')
    );
    if (impatientEntries.length > trades.length * 0.3) triggers.push('Impatience');
    
    return triggers;
  }

  async storeMentorInteraction(userId: string, userMessage: string, mentorResponse: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_memory')
        .insert({
          user_id: userId,
          memory_type: 'mentor_interaction',
          content: JSON.stringify({ userMessage, mentorResponse }),
          importance_score: 6,
          context: {
            interaction_type: 'chat',
            timestamp: new Date().toISOString()
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store mentor interaction:', error);
    }
  }
}

export const eliteTradeMemory = new EliteTradeMemory();
