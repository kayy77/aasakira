// Signal Monitoring & Quality Assurance
// SQL queries and monitoring functions for signal health

import { supabase } from '@/integrations/supabase/client';

export class SignalMonitoring {
  
  // Query 1: Find recent signals with insufficient AI votes
  static async findSignalsWithMissingVotes(hours = 48) {
    const { data, error } = await supabase
      .from('signals')
      .select('id, created_at, status, pair, confluence_bucket, ai_votes')
      .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error finding signals with missing votes:', error);
      return [];
    }
    
    // Filter signals with insufficient votes
    return data.filter(signal => {
      const votesCount = Array.isArray(signal.ai_votes) ? signal.ai_votes.length : 0;
      return votesCount < 5 || (signal.confluence_bucket || 0) < 3;
    });
  }

  // Query 2: Signal quality distribution
  static async getSignalQualityStats(days = 7) {
    const { data, error } = await supabase
      .from('signals')
      .select('status, ui_label, confluence_bucket, weighted_ai_score, created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
    
    if (error) {
      console.error('Error getting signal quality stats:', error);
      return null;
    }

    const stats = {
      total: data.length,
      approved: data.filter(s => s.status === 'APPROVED').length,
      rejected: data.filter(s => s.status === 'REJECTED').length,
      weak: data.filter(s => s.status === 'WEAK').length,
      avgConfluence: data.reduce((sum, s) => sum + (s.confluence_bucket || 0), 0) / data.length,
      avgAIScore: data.reduce((sum, s) => sum + (s.weighted_ai_score || 0), 0) / data.length,
      qualityDistribution: {
        strong: data.filter(s => s.ui_label === 'Strong').length,
        medium: data.filter(s => s.ui_label === 'Medium').length,
        decent: data.filter(s => s.ui_label === 'Decent').length,
        weak: data.filter(s => s.ui_label?.includes('Weak')).length
      }
    };

    return stats;
  }

  // Query 3: Provider performance analysis
  static async getProviderPerformance(days = 30) {
    const { data, error } = await supabase
      .from('consensus_audit')
      .select('provider_name, status, latency_ms, created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
    
    if (error) {
      console.error('Error getting provider performance:', error);
      return {};
    }

    const providers = data.reduce((acc, record) => {
      const provider = record.provider_name;
      if (!acc[provider]) {
        acc[provider] = { total: 0, success: 0, failed: 0, avgLatency: 0, latencies: [] };
      }
      
      acc[provider].total++;
      if (record.status === 'SUCCESS') {
        acc[provider].success++;
        if (record.latency_ms) {
          acc[provider].latencies.push(record.latency_ms);
        }
      } else {
        acc[provider].failed++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.keys(providers).forEach(provider => {
      const p = providers[provider];
      p.successRate = p.total > 0 ? (p.success / p.total) * 100 : 0;
      p.avgLatency = p.latencies.length > 0 
        ? p.latencies.reduce((sum: number, lat: number) => sum + lat, 0) / p.latencies.length 
        : 0;
      delete p.latencies; // Clean up
    });

    return providers;
  }

  // Query 4: Recent rejected signals analysis
  static async getRecentRejectedSignals(limit = 50) {
    const { data, error } = await supabase
      .from('signals')
      .select('id, pair, status, ui_label, rejection_reasons, confluence_bucket, weighted_ai_score, created_at')
      .in('status', ['REJECTED', 'WEAK'])
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error getting rejected signals:', error);
      return [];
    }

    return data;
  }

  // Query 5: Signal health alerts
  static async checkSignalHealth(): Promise<{
    alerts: string[];
    metrics: Record<string, number>;
  }> {
    const alerts: string[] = [];
    const metrics: Record<string, number> = {};
    
    // Check rejection rate in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentSignals, error } = await supabase
      .from('signals')
      .select('status')
      .gte('created_at', oneHourAgo);
    
    if (!error && recentSignals) {
      const total = recentSignals.length;
      const rejected = recentSignals.filter(s => s.status === 'REJECTED').length;
      const rejectionRate = total > 0 ? (rejected / total) * 100 : 0;
      
      metrics.hourlyRejectionRate = rejectionRate;
      
      if (rejectionRate > 20) {
        alerts.push(`High rejection rate: ${rejectionRate.toFixed(1)}% in last hour`);
      }
    }
    
    // Check provider error rates
    const providerPerf = await this.getProviderPerformance(1); // Last day
    Object.entries(providerPerf).forEach(([provider, perf]: [string, any]) => {
      metrics[`${provider}_success_rate`] = perf.successRate;
      metrics[`${provider}_avg_latency`] = perf.avgLatency;
      
      if (perf.successRate < 95) {
        alerts.push(`${provider} error rate: ${(100 - perf.successRate).toFixed(1)}%`);
      }
      
      if (perf.avgLatency > 2000) {
        alerts.push(`${provider} high latency: ${perf.avgLatency.toFixed(0)}ms`);
      }
    });

    return { alerts, metrics };
  }

  // Query 6: Performance by pair analysis
  static async getPerformanceByPair(days = 30) {
    const { data, error } = await supabase
      .from('signals')
      .select('pair, status, confluence_bucket, expected_value, created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
    
    if (error) {
      console.error('Error getting performance by pair:', error);
      return {};
    }

    const pairStats = data.reduce((acc, signal) => {
      const pair = signal.pair;
      if (!acc[pair]) {
        acc[pair] = { 
          total: 0, 
          approved: 0, 
          avgConfluence: 0, 
          avgEV: 0,
          confluenceSum: 0,
          evSum: 0
        };
      }
      
      acc[pair].total++;
      if (signal.status === 'APPROVED') acc[pair].approved++;
      
      acc[pair].confluenceSum += signal.confluence_bucket || 0;
      acc[pair].evSum += signal.expected_value || 0;
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.keys(pairStats).forEach(pair => {
      const stats = pairStats[pair];
      stats.approvalRate = stats.total > 0 ? (stats.approved / stats.total) * 100 : 0;
      stats.avgConfluence = stats.total > 0 ? stats.confluenceSum / stats.total : 0;
      stats.avgEV = stats.total > 0 ? stats.evSum / stats.total : 0;
      
      // Clean up
      delete stats.confluenceSum;
      delete stats.evSum;
    });

    return pairStats;
  }
}

// SQL Functions to add to Supabase (run these in SQL editor)
export const MONITORING_SQL_FUNCTIONS = `
-- Function to find signals with missing AI votes
CREATE OR REPLACE FUNCTION find_signals_missing_votes(hours_back INTEGER DEFAULT 48)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  status TEXT,
  votes_count INTEGER,
  confluence_bucket INTEGER,
  pair TEXT
) 
LANGUAGE SQL
AS $$
  SELECT 
    s.id,
    s.created_at,
    s.status,
    jsonb_array_length(COALESCE(s.ai_votes, '[]'::jsonb)) as votes_count,
    s.confluence_bucket,
    s.pair
  FROM signals s
  WHERE s.created_at >= NOW() - (hours_back * INTERVAL '1 hour')
    AND (
      jsonb_array_length(COALESCE(s.ai_votes, '[]'::jsonb)) < 5
      OR s.confluence_bucket < 3
      OR s.status IN ('Medium', 'Strong') -- Investigate suspicious approvals
    )
  ORDER BY s.created_at DESC;
$$;

-- Function to get signal metrics for alerting
CREATE OR REPLACE FUNCTION get_signal_metrics(hours_back INTEGER DEFAULT 24)
RETURNS JSON
LANGUAGE SQL
AS $$
  SELECT json_build_object(
    'total_signals', COUNT(*),
    'approved_signals', COUNT(*) FILTER (WHERE status = 'APPROVED'),
    'rejected_signals', COUNT(*) FILTER (WHERE status = 'REJECTED'),
    'weak_signals', COUNT(*) FILTER (WHERE status = 'WEAK'),
    'avg_confluence', AVG(confluence_bucket),
    'avg_ai_score', AVG(weighted_ai_score),
    'rejection_rate_pct', 
      CASE 
        WHEN COUNT(*) > 0 
        THEN (COUNT(*) FILTER (WHERE status = 'REJECTED') * 100.0 / COUNT(*))
        ELSE 0 
      END
  )
  FROM signals
  WHERE created_at >= NOW() - (hours_back * INTERVAL '1 hour');
$$;
`;

export const signalMonitoring = new SignalMonitoring();