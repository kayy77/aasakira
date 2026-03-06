import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * Returns the next Friday at 22:00 UK time (Europe/London).
 * Market closes every Friday at 10pm UK time.
 */
function getNextMarketClose(): Date {
  const now = new Date();
  
  // Work in UK timezone
  const ukNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const ukDay = ukNow.getDay(); // 0=Sun, 5=Fri
  const ukHour = ukNow.getHours();
  
  let daysUntilFriday = (5 - ukDay + 7) % 7;
  
  // If it's Friday and past 22:00, go to next Friday
  if (daysUntilFriday === 0 && ukHour >= 22) {
    daysUntilFriday = 7;
  }
  
  // Build target date in UK time
  const target = new Date(ukNow);
  target.setDate(target.getDate() + daysUntilFriday);
  target.setHours(22, 0, 0, 0);
  
  // Convert back: get the offset difference
  const targetUk = new Date(target.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const diff = target.getTime() - targetUk.getTime();
  
  // Return in local time that corresponds to Friday 22:00 UK
  const result = new Date(now);
  result.setTime(now.getTime() + daysUntilFriday * 86400000);
  
  // More reliable approach: calculate from UTC
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });
  
  // Get current UK date parts
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parseInt(parts.find(p => p.type === type)?.value || '0');
  
  const currentUkDay = new Date(
    getPart('year'), getPart('month') - 1, getPart('day')
  ).getDay();
  
  let days = (5 - currentUkDay + 7) % 7;
  if (days === 0 && (getPart('hour') >= 22)) {
    days = 7;
  }
  
  // Target UK datetime
  const targetDate = new Date(
    getPart('year'), getPart('month') - 1, getPart('day') + days,
    22, 0, 0, 0
  );
  
  // Convert UK local to UTC by finding offset
  // Create a date string in UK timezone and parse
  const ukTargetStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth()+1).padStart(2,'0')}-${String(targetDate.getDate()).padStart(2,'0')}T22:00:00`;
  
  // Determine UK offset (BST or GMT)
  const jan = new Date(targetDate.getFullYear(), 0, 1);
  const jul = new Date(targetDate.getFullYear(), 6, 1);
  const janOffset = new Date(jan.toLocaleString('en-US', { timeZone: 'Europe/London' })).getTime() - jan.getTime();
  const julOffset = new Date(jul.toLocaleString('en-US', { timeZone: 'Europe/London' })).getTime() - jul.getTime();
  
  // Simple: just compute the milliseconds remaining
  // Use the Intl approach to get exact UTC equivalent
  const utcTarget = new Date(ukTargetStr + 'Z');
  
  // Check if target date is in BST (last Sunday of March to last Sunday of October)
  const month = targetDate.getMonth(); // 0-indexed
  const isBST = month > 2 && month < 9; // rough Apr-Sep always BST
  // For March and October, need more precision but this is close enough
  if (month === 2) {
    // March: BST starts last Sunday
    const lastSun = new Date(targetDate.getFullYear(), 2, 31);
    while (lastSun.getDay() !== 0) lastSun.setDate(lastSun.getDate() - 1);
    if (targetDate.getDate() >= lastSun.getDate()) {
      // BST
      utcTarget.setHours(utcTarget.getHours() - 1); // subtract BST offset -> UTC is 1hr earlier
    }
  } else if (month === 9) {
    // October: BST ends last Sunday
    const lastSun = new Date(targetDate.getFullYear(), 9, 31);
    while (lastSun.getDay() !== 0) lastSun.setDate(lastSun.getDate() - 1);
    if (targetDate.getDate() < lastSun.getDate()) {
      utcTarget.setHours(utcTarget.getHours() - 1);
    }
  } else if (isBST) {
    utcTarget.setHours(utcTarget.getHours() - 1); // 22:00 BST = 21:00 UTC
  }
  // GMT months (Nov-Feb): 22:00 GMT = 22:00 UTC, no adjustment needed
  
  return utcTarget;
}

export default function WeeklyCountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const target = getNextMarketClose();
      const diff = Math.max(0, target.getTime() - Date.now());

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
