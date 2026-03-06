import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * Get next Friday 22:00 UK time as a UTC timestamp.
 * Uses Intl to reliably determine the current UK time.
 */
function getNextFriday10pmUK(): number {
  const now = Date.now();
  
  // Get current UK day/hour using Intl
  const ukFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const ukParts = ukFormatter.formatToParts(new Date(now));
  const get = (t: string) => ukParts.find(p => p.type === t)?.value || '';
  
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const ukDay = dayMap[get('weekday')] ?? 0;
  const ukHour = parseInt(get('hour'));
  const ukMin = parseInt(get('minute'));
  const ukSec = parseInt(get('second'));
  
  // Days until Friday
  let daysAhead = (5 - ukDay + 7) % 7;
  if (daysAhead === 0 && (ukHour > 22 || (ukHour === 22 && (ukMin > 0 || ukSec > 0)))) {
    daysAhead = 7; // Already past this Friday's close
  }
  
  // Seconds from now (in UK time) to target
  const nowSecsInDay = ukHour * 3600 + ukMin * 60 + ukSec;
  const targetSecsInDay = 22 * 3600; // 22:00:00
  
  let secsRemaining: number;
  if (daysAhead === 0) {
    secsRemaining = targetSecsInDay - nowSecsInDay;
  } else {
    secsRemaining = (daysAhead - 1) * 86400 + (86400 - nowSecsInDay) + targetSecsInDay;
  }
  
  return now + secsRemaining * 1000;
}

export default function WeeklyCountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = getNextFriday10pmUK();
    
    const update = () => {
      const diff = Math.max(0, target - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-2 text-sm">
      <Clock className="w-3.5 h-3.5 text-cyber-purple-400" />
      <span className="text-muted-foreground">Market closes in</span>
      <div className="flex items-center gap-1 font-mono font-bold text-foreground">
        <span className="bg-cyber-purple-500/20 px-1.5 py-0.5 rounded text-cyber-purple-300 text-xs">{timeLeft.days}D</span>
        <span className="bg-cyber-purple-500/20 px-1.5 py-0.5 rounded text-cyber-purple-300 text-xs">{pad(timeLeft.hours)}H</span>
        <span className="bg-cyber-purple-500/20 px-1.5 py-0.5 rounded text-cyber-purple-300 text-xs">{pad(timeLeft.minutes)}M</span>
        <span className="bg-cyber-pink-500/20 px-1.5 py-0.5 rounded text-cyber-pink-300 text-xs animate-pulse">{pad(timeLeft.seconds)}S</span>
      </div>
    </div>
  );
}
