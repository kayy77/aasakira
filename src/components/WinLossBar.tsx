import React from 'react';
import { motion } from 'framer-motion';

interface WinLossBarProps {
  wins: number;
  losses: number;
}

const WinLossBar: React.FC<WinLossBarProps> = ({ wins, losses }) => {
  const total = wins + losses;
  if (total === 0) return null;
  const winPct = (wins / total) * 100;

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
        <span className="text-neon-green-400 font-medium">{wins} Wins</span>
        <span className="text-destructive font-medium">{losses} Loss{losses !== 1 ? 'es' : ''}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted/30 overflow-hidden flex">
        <motion.div
          className="h-full bg-gradient-to-r from-neon-green-500 to-neon-green-400 rounded-l-full"
          initial={{ width: 0 }}
          animate={{ width: `${winPct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${100 - winPct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  );
};

export default WinLossBar;
