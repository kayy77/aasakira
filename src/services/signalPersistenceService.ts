import { supabase } from '@/integrations/supabase/client';

interface SignalCandidate {
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  score: number;
  filters: any[];
  priceTimestamp: number;
  priceAge: number;
  idempotencyKey: string;
  engineVersion: string;
}

interface UserQuota {
  user_id: string;
  last_free_signal_at: Date | null;
  signals_today: number;
}

class SignalPersistenceService {
  async saveSignal(signal: SignalCandidate): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log(`💾 Saving signal: ${signal.symbol} ${signal.direction}`);

      // Check for duplicate by idempotency key
      const { data: existing } = await supabase
        .from('signals')
        .select('id')
        .eq('ui_label', signal.idempotencyKey)
        .single();

      if (existing) {
        console.log(`⚠️ Signal already exists: ${signal.idempotencyKey}`);
        return { success: false, error: 'Duplicate signal' };
      }

      // Calculate risk-reward ratio
      const riskRewardRatio = Math.abs(
        (signal.takeProfit - signal.entryPrice) / (signal.entryPrice - signal.stopLoss)
      );

      // Insert signal
      const { data, error } = await supabase
        .from('signals')
        .insert({
          pair: signal.symbol,
          signal_type: 'LIVE',
          direction: signal.direction,
          entry_price: signal.entryPrice,
          stop_loss: signal.stopLoss,
          take_profit: signal.takeProfit,
          risk_reward_ratio: riskRewardRatio,
          confidence: signal.score,
          status: 'APPROVED',
          ui_label: signal.idempotencyKey,
          raw_ai_responses: signal.filters,
          consensus: {
            engine_version: signal.engineVersion,
            price_timestamp: signal.priceTimestamp,
            price_age_ms: signal.priceAge,
            filters_passed: signal.filters.filter(f => f.pass).length,
            total_filters: signal.filters.length
          },
          session_type: this.getSessionType()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving signal:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Signal saved with ID: ${data.id}`);
      return { success: true, id: data.id };

    } catch (error) {
      console.error('❌ Unexpected error saving signal:', error);
      return { success: false, error: 'Unexpected error' };
    }
  }

  async checkUserQuota(userId: string): Promise<{ canReceiveSignal: boolean; reason?: string }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check user's signals today
      const { data: todaySignals, error } = await supabase
        .from('signals')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      if (error) {
        console.error('Error checking user quota:', error);
        return { canReceiveSignal: true }; // Default to allowing on error
      }

      // Free users get 1 signal per day
      if (todaySignals && todaySignals.length >= 1) {
        return { 
          canReceiveSignal: false, 
          reason: 'Daily limit reached. Upgrade to Premium for unlimited signals.' 
        };
      }

      return { canReceiveSignal: true };

    } catch (error) {
      console.error('Error in checkUserQuota:', error);
      return { canReceiveSignal: true };
    }
  }

  async getRecentSignals(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('status', 'APPROVED')
        .eq('signal_type', 'LIVE')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent signals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentSignals:', error);
      return [];
    }
  }

  async getUserSignals(userId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user signals:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserSignals:', error);
      return [];
    }
  }

  async updateSignalOutcome(signalId: string, outcome: 'WIN' | 'LOSS' | 'PENDING', pips?: number) {
    try {
      const { error } = await supabase
        .from('signals')
        .update({
          outcome,
          pips_result: pips,
          outcome_time: outcome !== 'PENDING' ? new Date().toISOString() : null
        })
        .eq('id', signalId);

      if (error) {
        console.error('Error updating signal outcome:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSignalOutcome:', error);
      return false;
    }
  }

  private getSessionType(): string {
    const hour = new Date().getUTCHours();
    
    if (hour >= 8 && hour <= 16) return 'LONDON';
    if (hour >= 13 && hour <= 21) return 'NEW_YORK';
    if (hour >= 13 && hour <= 16) return 'OVERLAP';
    return 'ASIAN';
  }

  // Clean up old signals (older than 7 days)
  async cleanupOldSignals() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { error } = await supabase
        .from('signals')
        .delete()
        .lt('created_at', sevenDaysAgo.toISOString())
        .eq('signal_type', 'LIVE');

      if (error) {
        console.error('Error cleaning up old signals:', error);
      } else {
        console.log('✅ Old signals cleaned up');
      }
    } catch (error) {
      console.error('Error in cleanupOldSignals:', error);
    }
  }
}

export const signalPersistenceService = new SignalPersistenceService();