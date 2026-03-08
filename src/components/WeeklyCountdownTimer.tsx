import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

type MarketState = 'open' | 'closed';

interface CountdownInfo {
  state: MarketState;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Market opens Sunday 10pm UK, closes Friday 10pm UK.
 * Returns countdown to the next state change.
 */
function getCountdownInfo(): CountdownInfo {
  const now = new Date();

  const ukFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const ukParts = ukFormatter.formatToParts(now);
  const get = (t: string) => ukParts.find(p => p.type === t)?.value || '';

  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const ukDay = dayMap[get('weekday')] ?? 0;
  const ukHour = parseInt(get('hour'));
  const ukMin = parseInt(get('minute'));
  const ukSec = parseInt(get('second'));
  const nowSecsInDay = ukHour * 3600 + ukMin * 60 + ukSec;
  const target22h = 22 * 3600;

  // Determine if market is open or closed
  // Closed: Friday after 22:00 → Sunday 22:00
  // Open: Sunday 22:00 → Friday 22:00
  let isOpen: boolean;
  if (ukDay === 5) {
    // Friday - open until 22:00
    isOpen = nowSecsInDay < target22h;
  } else if (ukDay === 6) {
    // Saturday - closed
    isOpen = false;
  } else if (ukDay === 0) {
    // Sunday - closed until 22:00, open after
    isOpen = nowSecsInDay >= target22h;
  } else {
    // Mon-Thu - open
    isOpen = true;
  }

  let secsRemaining: number;

  if (isOpen) {
    // Count down to Friday 22:00
    let daysToFri = (5 - ukDay + 7) % 7;
    if (daysToFri === 0 && nowSecsInDay >= target22h) daysToFri = 7;
    if (daysToFri === 0) {
      secsRemaining = target22h - nowSecsInDay;
    } else {
      secsRemaining = (daysToFri - 1) * 86400 + (86400 - nowSecsInDay) + target22h;
    }
  } else {
    // Count down to Sunday 22:00
    let daysToSun = (0 - ukDay + 7) % 7;
    if (daysToSun === 0 && nowSecsInDay >= target22h) daysToSun = 7;
    if (daysToSun === 0) {
      secsRemaining = target22h - nowSecsInDay;
    } else {
      secsRemaining = (daysToSun - 1) * 86400 + (86400 - nowSecsInDay) + target22h;
    }
  }

  return {
    state: isOpen ? 'open' : 'closed',
    days: Math.floor(secsRemaining / 86400),
    hours: Math.floor((secsRemaining % 86400) / 3600),
    minutes: Math.floor((secsRemaining % 3600) / 60),
    seconds: secsRemaining % 60,
  };
}

export default function WeeklyCountdownTimer() {
  const [info, setInfo] = useState<CountdownInfo>(getCountdownInfo);

  useEffect(() => {
    const update = () => setInfo(getCountdownInfo());
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const label = info.state === 'open' ? 'Market closes in' : 'Market opens in';

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="w-3.5 h-3.5 text-cyber-purple-400" />
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 font-mono font-bold text-foreground">
        <span className="bg-cyber-purple-500/20 px-1.5 py-0.5 rounded text-cyber-purple-300 text-xs">{info.days}D</span>
        <span className="bg-cyber-purple-500/20 px-1.5 py-0.5 rounded text-cyber-purple-300 text-xs">{pad(info.hours)}H</span>
        <span className="bg-cyber-purple-500/20 px-1.5 py-0.5 rounded text-cyber-purple-300 text-xs">{pad(info.minutes)}M</span>
        <span className="bg-cyber-pink-500/20 px-1.5 py-0.5 rounded text-cyber-pink-300 text-xs animate-pulse">{pad(info.seconds)}S</span>
      </div>
      {info.state === 'closed' && (
        <span className="text-xs text-red-400 font-medium ml-1">CLOSED</span>
      )}
    </div>
  );
}
