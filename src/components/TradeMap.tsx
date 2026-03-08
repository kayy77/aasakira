import React from 'react';
import { motion } from 'framer-motion';

interface TradeMapProps {
  pairs: string[];
}

const pairIcons: Record<string, string> = {
  'EURUSD': '🇪🇺',
  'GBPUSD': '🇬🇧',
  'GBPJPY': '🇬🇧',
  'USDJPY': '🇺🇸',
  'XAUUSD': '🥇',
  'NAS100': '📈',
  'US30': '📊',
  'BTCUSD': '₿',
  'AUDUSD': '🇦🇺',
  'USDCAD': '🇨🇦',
  'NZDUSD': '🇳🇿',
};

const TradeMap: React.FC<TradeMapProps> = ({ pairs }) => {
  if (pairs.length === 0) return null;

  return (
    <div>
      <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Markets Traded</p>
      <div className="flex flex-wrap gap-1.5">
        {pairs.map((pair, i) => (
          <motion.div
            key={pair}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="flex items-center gap-1 bg-muted/30 border border-border/50 rounded px-1.5 py-0.5 text-[10px] sm:text-xs font-medium text-foreground"
          >
            <span className="text-xs">{pairIcons[pair] || '💱'}</span>
            <span>{pair}</span>
            <span className="w-1 h-1 rounded-full bg-neon-green-400 shadow-[0_0_4px_rgba(74,222,128,0.6)]" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TradeMap;
