import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Send, Crown, Users } from 'lucide-react';
import {
  getMaxTpPips,
  classifyTradeOutcome,
  isTradeCountable,
  type TradeForPips,
} from '@/utils/tradePips';

const TELEGRAM_FREE = 'https://t.me/+E3IYiJSGNqkxNTdk';
const COMMUNITY_CHANNEL_ID = -1002187927163;
const VIP_CHANNEL_ID = -1003491244183;

interface Stats {
  wins: number;
  losses: number;
  pips: number;
  total: number;
}

const EMPTY: Stats = { wins: 0, losses: 0, pips: 0, total: 0 };

export function TradeStatsBanner() {
  const [vip, setVip] = useState<Stats>(EMPTY);
  const [free, setFree] = useState<Stats>(EMPTY);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data } = await supabase
        .from('active_trades')
        .select('status,outcome,take_profits,pips_realized,created_at,channel_id')
        .gte('created_at', since.toISOString());

      if (!active || !data) return;
      const acc = { vip: { ...EMPTY }, free: { ...EMPTY } };
      (data as (TradeForPips & { channel_id: number })[]).forEach((t) => {
        if (!isTradeCountable(t)) return;
        const bucket =
          t.channel_id === VIP_CHANNEL_ID
            ? acc.vip
            : t.channel_id === COMMUNITY_CHANNEL_ID
            ? acc.free
            : null;
        if (!bucket) return;
        bucket.total++;
        if (classifyTradeOutcome(t) === 'win') bucket.wins++;
        else bucket.losses++;
        bucket.pips += getMaxTpPips(t);
      });
      setVip({ ...acc.vip, pips: Math.round(acc.vip.pips) });
      setFree({ ...acc.free, pips: Math.round(acc.free.pips) });
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mb-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            Last 30 Days · Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatColumn
          label="VIP"
          icon={<Crown className="w-3.5 h-3.5" />}
          accent="text-amber-400"
          ring="border-amber-500/30 bg-amber-500/[0.04]"
          stats={vip}
        />
        <StatColumn
          label="FREE"
          icon={<Users className="w-3.5 h-3.5" />}
          accent="text-sky-400"
          ring="border-sky-500/30 bg-sky-500/[0.04]"
          stats={free}
        />
      </div>
    </div>
  );
}

function StatColumn({
  label,
  icon,
  accent,
  ring,
  stats,
}: {
  label: string;
  icon: React.ReactNode;
  accent: string;
  ring: string;
  stats: Stats;
}) {
  const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
  return (
    <div className={`rounded-xl border ${ring} p-3`}>
      <div className={`flex items-center gap-1.5 mb-2 ${accent}`}>
        {icon}
        <span className="text-[11px] font-bold tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl md:text-3xl font-extrabold ${accent}`}>
          {winRate}%
        </span>
        <span className="text-[10px] text-muted-foreground uppercase">win</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          <span className="text-foreground font-semibold">
            {stats.pips >= 0 ? '+' : ''}
            {stats.pips}
          </span>{' '}
          pips
        </span>
        <span>
          <span className="text-foreground font-semibold">{stats.total}</span>{' '}
          trades
        </span>
      </div>
    </div>
  );
}

export function StickyTelegramCTA() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-2 pointer-events-none">
      <div className="pointer-events-auto max-w-xl mx-auto rounded-full border border-border/60 bg-background/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] pl-4 pr-1.5 py-1.5 flex items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-foreground font-semibold text-[13px] md:text-sm leading-tight truncate">
              Live signals on Telegram
            </div>
            <div className="text-muted-foreground text-[11px] truncate">
              Free · Real-time · No card
            </div>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => window.open(TELEGRAM_FREE, '_blank')}
          className="rounded-full bg-sky-500 hover:bg-sky-400 text-white font-semibold whitespace-nowrap shrink-0 gap-1.5 h-9 px-4"
        >
          <Send className="w-3.5 h-3.5" />
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
      className="fixed top-24 right-3 md:right-6 z-40 group"
      aria-label="Claim 50% off VIP"
    >
      <div className="rounded-2xl border border-amber-400/30 bg-gradient-to-b from-zinc-900/95 to-black/95 backdrop-blur-xl px-3.5 py-2.5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition group-hover:border-amber-300/60 group-hover:-translate-y-0.5">
        <div className="flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] md:text-[11px] font-bold tracking-[0.15em] text-amber-300 uppercase">
            50% Off VIP
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          Ends in{' '}
          <span className="font-mono text-foreground tabular-nums">{timeLeft}</span>
        </div>
      </div>
    </button>
  );
}