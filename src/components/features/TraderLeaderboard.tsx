import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, TrendingUp, Medal, Crown, Star, Sword } from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  avatar?: string;
  winRate: number;
  totalTrades: number;
  profit: number;
  rank: number;
  tier: 'Ronin' | 'Shogun' | 'Sage';
  combatWins?: number;
  signalAccuracy?: number;
}

const TraderLeaderboard: React.FC = () => {
  const [traders, setTraders] = useState<Trader[]>([
    {
      id: '1',
      name: 'DragonSlayer',
      winRate: 87.5,
      totalTrades: 156,
      profit: 12847.32,
      rank: 1,
      tier: 'Sage',
      combatWins: 23,
      signalAccuracy: 91.2
    },
    {
      id: '2',
      name: 'SamuraiTrader',
      winRate: 82.1,
      totalTrades: 203,
      profit: 9632.18,
      rank: 2,
      tier: 'Shogun',
      combatWins: 18,
      signalAccuracy: 85.7
    },
    {
      id: '3',
      name: 'NinjaFX',
      winRate: 79.8,
      totalTrades: 189,
      profit: 8945.67,
      rank: 3,
      tier: 'Shogun',
      combatWins: 15,
      signalAccuracy: 83.4
    },
    {
      id: '4',
      name: 'KatanaKing',
      winRate: 76.3,
      totalTrades: 142,
      profit: 7234.21,
      rank: 4,
      tier: 'Ronin',
      combatWins: 12,
      signalAccuracy: 78.9
    },
    {
      id: '5',
      name: 'WiseOni',
      winRate: 74.2,
      totalTrades: 167,
      profit: 6821.45,
      rank: 5,
      tier: 'Ronin',
      combatWins: 11,
      signalAccuracy: 76.2
    }
  ]);

  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Trophy className="h-6 w-6 text-orange-400" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Sage':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Shogun':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Ronin':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatProfit = (profit: number) => {
    if (profit >= 1000) {
      return `$${(profit / 1000).toFixed(1)}K`;
    }
    return `$${profit.toFixed(0)}`;
  };

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sword className="h-5 w-5 text-red-400" />
          Warrior Leaderboard
          <Badge className="ml-auto bg-red-500/20 text-red-400 border-red-500/30">
            Live
          </Badge>
        </CardTitle>
        
        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                timeframe === period
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {period === 'allTime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {traders.map((trader) => (
          <div
            key={trader.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:bg-white/5 ${
              trader.rank <= 3 ? 'bg-white/5 border-white/20' : 'bg-white/2 border-white/10'
            }`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-10">
              {getRankIcon(trader.rank)}
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/20 text-primary border border-primary/30">
                  {trader.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{trader.name}</span>
                  <Badge className={getTierColor(trader.tier)}>
                    {trader.tier}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{trader.totalTrades} trades</span>
                  {trader.combatWins && (
                    <span className="flex items-center gap-1">
                      <Sword className="h-3 w-3" />
                      {trader.combatWins} combat wins
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="font-bold text-green-400">{formatProfit(trader.profit)}</span>
              </div>
              <div className="text-xs text-gray-400">
                {trader.winRate}% win rate
              </div>
              {trader.signalAccuracy && (
                <div className="flex items-center gap-1 text-xs text-purple-400">
                  <Star className="h-3 w-3" />
                  {trader.signalAccuracy}% accuracy
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Rankings update every hour • Join the elite warriors
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TraderLeaderboard;