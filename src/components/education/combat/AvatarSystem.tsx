
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Sword, 
  Shield, 
  Zap, 
  Star,
  Users,
  Trophy,
  Target,
  Brain
} from 'lucide-react';

interface AvatarRank {
  id: string;
  name: string;
  title: string;
  minWins: number;
  color: string;
  icon: React.ComponentType<any>;
  gear: string[];
  abilities: string[];
}

interface UserAvatar {
  rank: AvatarRank;
  wins: number;
  losses: number;
  gear: string[];
  title: string;
  xp: number;
  nextRankXp: number;
}

const AVATAR_RANKS: AvatarRank[] = [
  {
    id: 'ronin',
    name: 'Ronin',
    title: 'Wandering Trader',
    minWins: 0,
    color: 'from-gray-600 to-gray-800',
    icon: Users,
    gear: ['Basic Katana', 'Cloth Gi'],
    abilities: ['Basic Pattern Recognition']
  },
  {
    id: 'shinobi',
    name: 'Shinobi',
    title: 'Shadow Analyst',
    minWins: 10,
    color: 'from-blue-600 to-blue-800',
    icon: Target,
    gear: ['Steel Katana', 'Ninja Mask', 'Throwing Stars'],
    abilities: ['Stealth Analysis', 'Quick Strike Predictions']
  },
  {
    id: 'strategist',
    name: 'Strategist',
    title: 'Market Tactician',
    minWins: 25,
    color: 'from-purple-600 to-purple-800',
    icon: Brain,
    gear: ['Enchanted Blade', 'War Fan', 'Strategy Scroll'],
    abilities: ['Multi-Timeframe Vision', 'Risk Calculation Mastery']
  },
  {
    id: 'shogun',
    name: 'Shogun AI',
    title: 'Legendary Master',
    minWins: 50,
    color: 'from-yellow-600 to-orange-600',
    icon: Crown,
    gear: ['Dragon Katana', 'Golden Armor', 'Oni Mask', 'Lightning Chakra'],
    abilities: ['Market Structure Mastery', 'Liquidity Reading', 'Time Manipulation']
  }
];

interface AvatarSystemProps {
  userStats: {
    wins: number;
    losses: number;
    streak: number;
    points: number;
    tradingStyle: string;
  };
}

const AvatarSystem = ({ userStats }: AvatarSystemProps) => {
  // Calculate current rank based on wins
  const getCurrentRank = (): AvatarRank => {
    for (let i = AVATAR_RANKS.length - 1; i >= 0; i--) {
      if (userStats.wins >= AVATAR_RANKS[i].minWins) {
        return AVATAR_RANKS[i];
      }
    }
    return AVATAR_RANKS[0];
  };

  const getNextRank = (): AvatarRank | null => {
    const currentRank = getCurrentRank();
    const currentIndex = AVATAR_RANKS.findIndex(r => r.id === currentRank.id);
    return currentIndex < AVATAR_RANKS.length - 1 ? AVATAR_RANKS[currentIndex + 1] : null;
  };

  const generateAITitle = (style: string, wins: number): string => {
    const styleMap: { [key: string]: string[] } = {
      'Scalper': ['Lightning Striker', 'Quick Draw Master', 'Speed Demon'],
      'Day Trader': ['Breakout Beast', 'Trend Rider', 'Market Hunter'],
      'Swing Trader': ['Range Reaper', 'Patient Predator', 'Structure Slayer'],
      'Position Trader': ['Liquidity Hunter', 'Macro Mystic', 'Long-term Legend']
    };

    const titles = styleMap[style] || ['Trading Warrior', 'Market Samurai', 'Chart Champion'];
    return titles[Math.min(Math.floor(wins / 10), titles.length - 1)];
  };

  const currentRank = getCurrentRank();
  const nextRank = getNextRank();
  const CurrentIcon = currentRank.icon;
  const aiTitle = generateAITitle(userStats.tradingStyle, userStats.wins);

  return (
    <Card className="glass-card border-gradient-to-r from-purple-500/20 to-pink-500/20">
      <CardContent className="p-6">
        <div className="flex items-center space-x-6">
          {/* Avatar Display */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentRank.color} flex items-center justify-center border-4 border-white/20 shadow-2xl`}>
              <CurrentIcon className="w-12 h-12 text-white" />
            </div>
            
            {/* Rank Badge */}
            <Badge className={`absolute -top-2 -right-2 bg-gradient-to-r ${currentRank.color} text-white border-0`}>
              {currentRank.name}
            </Badge>

            {/* Streak Indicator */}
            {userStats.streak >= 3 && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {userStats.streak}x
                </div>
              </div>
            )}
          </div>

          {/* Stats & Progression */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-bold text-white">{currentRank.title}</h3>
              <p className="text-sm text-gray-400">"{aiTitle}"</p>
            </div>

            {/* XP Progress */}
            {nextRank && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress to {nextRank.name}</span>
                  <span className="text-purple-400">{userStats.wins}/{nextRank.minWins}</span>
                </div>
                <Progress 
                  value={(userStats.wins / nextRank.minWins) * 100} 
                  className="h-2 bg-gray-800"
                />
              </div>
            )}

            {/* Current Gear */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-300">Current Gear:</h4>
              <div className="flex flex-wrap gap-2">
                {currentRank.gear.map((item, index) => (
                  <Badge key={index} variant="outline" className="border-purple-500/30 text-purple-400">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Abilities */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-300">Active Abilities:</h4>
              <div className="flex flex-wrap gap-2">
                {currentRank.abilities.map((ability, index) => (
                  <Badge key={index} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Star className="w-3 h-3 mr-1" />
                    {ability}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Battle Stats */}
          <div className="text-right space-y-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{userStats.wins}</div>
              <div className="text-xs text-gray-400">Victories</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{userStats.losses}</div>
              <div className="text-xs text-gray-400">Defeats</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{userStats.points}</div>
              <div className="text-xs text-gray-400">Honor Points</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarSystem;
