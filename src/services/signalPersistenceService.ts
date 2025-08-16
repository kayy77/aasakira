import { supabase } from '@/integrations/supabase/client';
import { BaseSignal } from '@/types/signalTypes';

export interface SignalRecord {
  id: string;
  user_id?: string;
  pair: string;
  direction: string;
  signal_type: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_reward_ratio: number;
  confidence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  outcome: 'PENDING' | 'WIN' | 'LOSS' | 'BREAKEVEN';
  outcome_price?: number;
  outcome_time?: string;
  pips_result?: number;
  rr_achieved?: number;
  created_at: string;
  session_type?: string;
  ai_votes?: any;
  consensus?: any;
}

class SignalPersistenceService {
  
  async saveSignal(signal: BaseSignal, userId?: string): Promise<string | null> {
    try {
      const signalRecord = {
        user_id: userId,
        pair: signal.symbol,
        direction: signal.direction,
        signal_type: 'STATE_MACHINE',
        entry_price: signal.entry,
        stop_loss: signal.stopLoss,
        take_profit: signal.takeProfit,
        risk_reward_ratio: signal.riskReward,
        confidence: signal.confidence,
        status: 'APPROVED' as const,
        session_type: signal.session || 'Live',
        created_at: new Date(signal.createdAt).toISOString()
      };

      const { data, error } = await supabase
        .from('signals')
        .insert(signalRecord)
        .select('id')
        .single();

      if (error) {
        console.error('❌ Failed to save signal:', error);
        return null;
      }

      console.log('✅ Signal saved to database:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Signal persistence error:', error);
      return null;
    }
  }

  async getUserSignals(userId: string, limit: number = 50): Promise<SignalRecord[]> {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return (data as SignalRecord[]) || [];
    } catch (error) {
      console.error('❌ Error fetching user signals:', error);
      return [];
    }
  }

  async getAllApprovedSignals(limit: number = 20): Promise<SignalRecord[]> {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false })
        .limit(limit);

      return (data as SignalRecord[]) || [];
    } catch (error) {
      console.error('❌ Error fetching approved signals:', error);
      return [];
    }
  }

  async updateSignalOutcome(
    signalId: string, 
    outcome: 'WIN' | 'LOSS' | 'BREAKEVEN',
    outcomePrice: number,
    pipsResult: number,
    rrAchieved: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('signals')
        .update({
          outcome,
          outcome_price: outcomePrice,
          outcome_time: new Date().toISOString(),
          pips_result: pipsResult,
          rr_achieved: rrAchieved
        })
        .eq('id', signalId);

      if (error) {
        console.error('❌ Failed to update signal outcome:', error);
        return false;
      }

      console.log('✅ Signal outcome updated:', signalId, outcome);
      return true;
    } catch (error) {
      console.error('❌ Error updating signal outcome:', error);
      return false;
    }
  }

  async getSignalStats(userId?: string): Promise<{
    totalSignals: number;
    winRate: number;
    avgRR: number;
    totalPips: number;
  }> {
    try {
      let query = supabase
        .from('signals')
        .select('outcome, pips_result, rr_achieved')
        .neq('outcome', 'PENDING');

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('status', 'APPROVED');
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Failed to fetch signal stats:', error);
        return { totalSignals: 0, winRate: 0, avgRR: 0, totalPips: 0 };
      }

      const totalSignals = data.length;
      const wins = data.filter(s => s.outcome === 'WIN').length;
      const winRate = totalSignals > 0 ? (wins / totalSignals) * 100 : 0;
      const avgRR = data.length > 0 ? 
        data.reduce((sum, s) => sum + (s.rr_achieved || 0), 0) / data.length : 0;
      const totalPips = data.reduce((sum, s) => sum + (s.pips_result || 0), 0);

      return { totalSignals, winRate, avgRR, totalPips };
    } catch (error) {
      console.error('❌ Error calculating signal stats:', error);
      return { totalSignals: 0, winRate: 0, avgRR: 0, totalPips: 0 };
    }
  }
}

export const signalPersistenceService = new SignalPersistenceService();