import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Circle } from 'lucide-react';
import { getMaxTpPips } from '@/utils/tradePips';
import { startOfWeek, endOfWeek } from 'date-fns';

interface TradeItem {
  id: string;
  pair: string;
  pips: number;
  hasHitTp: boolean;
  isLoss: boolean;
}

export default function TradeActivityTicker() {
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    fetchTrades();

    const channel = supabase
      .channel('ticker-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_trades' }, () => {
        fetchTrades();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (trades.length === 0) return;
    setVisibleCount(0);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= trades.length) clearInterval(interval);
    }, 800);
    return () => clearInterval(interval);
  }, [trades]);

  const fetchTrades = async () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const { data } = await supabase
      .from('active_trades')
      .select('id, pair, pips_realized, status, outcome, take_profits')
      .in('status', ['ACTIVE', 'CLOSED', 'STOPPED_OUT'])
      .gte('created_at', weekStart.toISOString())
      .lte('created_at', weekEnd.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      const items: TradeItem[] = data.map((t) => {
        const pips = getMaxTpPips(t);
        const hasAnyTpHit = Array.isArray(t.take_profits) &&
          t.take_profits.some((tp: any) => tp?.hit === true);
        const isLoss = t.status === 'STOPPED_OUT' && !hasAnyTpHit;

        return {
          id: t.id,
          pair: t.pair,
          pips,
          hasHitTp: hasAnyTpHit,
          isLoss,
        };
      });
      setTrades(items);
    }
  };

  if (trades.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Recent Signals</p>
      <AnimatePresence>
        {trades.slice(0, visibleCount).map((trade) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-2 text-sm py-1"
          >
            {trade.isLoss ? (
              <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
            ) : trade.hasHitTp ? (
              <CheckCircle className="w-3.5 h-3.5 text-neon-green-400 shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="font-medium text-foreground">{trade.pair}</span>
            <span className={`font-mono text-xs ${
              trade.isLoss ? 'text-destructive' : 
              trade.pips > 0 ? 'text-neon-green-400' : 'text-muted-foreground'
            }`}>
              {trade.pips > 0 ? '+' : ''}{trade.pips} pips
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
