import { useEffect, useState } from 'react';
import { endOfWeek } from 'date-fns';
import { Clock } from 'lucide-react';

export default function WeeklyCountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      weekEnd.setHours(23, 59, 59, 999);
      const diff = Math.max(0, weekEnd.getTime() - now.getTime());

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
      <span className="text-muted-foreground">Week closes in</span>
      <div className="flex items-center gap-1 font-mono font-bold text-foreground">
        <span className="bg-cyber-purple-500/20 px-1.5 py-0.5 rounded text-cyber-purple-300 text-xs">{timeLeft.days}D</span>
        <span className="bg-cyber-purple-500/20 px-1.5 py-0.5 rounded text-cyber-purple-300 text-xs">{pad(timeLeft.hours)}H</span>
        <span className="bg-cyber-purple-500/20 px-1.5 py-0.5 rounded text-cyber-purple-300 text-xs">{pad(timeLeft.minutes)}M</span>
        <span className="bg-cyber-pink-500/20 px-1.5 py-0.5 rounded text-cyber-pink-300 text-xs animate-pulse">{pad(timeLeft.seconds)}S</span>
      </div>
    </div>
  );
}
