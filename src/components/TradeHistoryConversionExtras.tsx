import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, TrendingUp, Target, Trophy } from 'lucide-react';
import {
  getMaxTpPips,
  classifyTradeOutcome,
  isTradeCountable,
  type TradeForPips,
} from '@/utils/tradePips';

const TELEGRAM_FREE = 'https://t.me/+E3IYiJSGNqkxNTdk';

interface Stats {
  wins: number;
  losses: number;
  pips: number;
  total: number;
}

export function TradeStatsBanner() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data } = await supabase
        .from('active_trades')
        .select('status,outcome,take_profits,pips_realized,created_at')
        .gte('created_at', since.toISOString());

      if (!active || !data) return;
      let wins = 0,
        losses = 0,
        pips = 0,
        total = 0;
      (data as TradeForPips[]).forEach((t) => {
        if (!isTradeCountable(t)) return;
        total++;
        if (classifyTradeOutcome(t) === 'win') wins++;
        else losses++;
        pips += getMaxTpPips(t);
      });
      setStats({ wins, losses, pips: Math.round(pips), total });
    };
    load();
  }, []);

  const winRate =
    stats && stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;

  return (
    <div className="mb-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 p-4 md:p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Last 30 Days · Verified Results
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Trophy className="w-3 h-3" /> Win Rate
          </div>
          <div className="text-xl md:text-3xl font-extrabold text-green-400">
            {winRate}%
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Target className="w-3 h-3" /> Pips
          </div>
          <div className="text-xl md:text-3xl font-extrabold text-primary">
            +{stats?.pips ?? 0}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <TrendingUp className="w-3 h-3" /> Wins
          </div>
          <div className="text-xl md:text-3xl font-extrabold">
            {stats?.wins ?? 0}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Trades</div>
          <div className="text-xl md:text-3xl font-extrabold">
            {stats?.total ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}

export function StickyTelegramCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-2 pointer-events-none">
      <div className="pointer-events-auto max-w-2xl mx-auto rounded-2xl border border-sky-400/40 bg-gradient-to-r from-sky-500/95 via-blue-500/95 to-cyan-500/95 backdrop-blur-md shadow-[0_10px_40px_rgba(56,189,248,0.45)] p-3 flex items-center gap-3">
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/15">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm md:text-base leading-tight">
            Get these signals live on Telegram
          </div>
          <div className="text-white/85 text-xs">
            Free channel · Real-time alerts · No credit card
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => window.open(TELEGRAM_FREE, '_blank')}
          className="bg-white text-sky-700 hover:bg-white/90 font-bold whitespace-nowrap shrink-0"
        >
          Join Free
        </Button>
      </div>
    </div>
  );
}

export function FloatingVipBadge({ onClick }: { onClick: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const tick = () => {
      const ms = end.getTime() - Date.now();
      if (ms <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <button
      onClick={onClick}
      className="fixed top-20 right-3 md:right-6 z-40 group animate-pulse hover:animate-none"
      aria-label="Claim 50% off VIP"
    >
      <div className="rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-[2px] shadow-[0_8px_30px_rgba(251,146,60,0.55)]">
        <div className="rounded-[10px] bg-black/85 backdrop-blur px-3 py-2 text-left">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] md:text-xs font-extrabold tracking-wider text-amber-300">
              50% OFF VIP
            </span>
          </div>
          <div className="text-[10px] text-white/70 leading-tight">
            Ends in <span className="font-mono text-white">{timeLeft}</span>
          </div>
        </div>
      </div>
    </button>
  );
}