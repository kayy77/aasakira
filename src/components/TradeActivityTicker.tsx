import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { getMaxTpPips, isTradeCountable } from '@/utils/tradePips';
import { startOfWeek, endOfWeek } from 'date-fns';

interface TradeItem {
  id: string;
  pair: string;
  pips: number;
  isWin: boolean;
}

export default function TradeActivityTicker() {
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (trades.length === 0) return;
    // Reveal items one by one
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= trades.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
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
      .limit(8);

    if (data) {
      const items: TradeItem[] = data
        .filter(isTradeCountable)
        .map((t) => ({
          id: t.id,
          pair: t.pair,
          pips: getMaxTpPips(t),
          isWin: getMaxTpPips(t) >= 0,
        }));
      setTrades(items);
    }
  };

  if (trades.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Recent Signals</p>
      <AnimatePresence>
        {trades.slice(0, visibleCount).map((trade, i) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center gap-2 text-sm py-1"
          >
            {trade.isWin ? (
              <CheckCircle className="w-3.5 h-3.5 text-neon-green-400 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
            )}
            <span className="font-medium text-foreground">{trade.pair}</span>
            <span className={`font-mono text-xs ${trade.isWin ? 'text-neon-green-400' : 'text-destructive'}`}>
              {trade.isWin ? '+' : ''}{trade.pips} pips
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
