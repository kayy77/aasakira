
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Eye, Star } from 'lucide-react';

interface CharacterStatsProps {
  character: {
    name: string;
    class: 'monk' | 'samurai' | 'phantom';
    level: number;
    xp: number;
    maxXp: number;
    stats: {
      wisdom: number;
      aggression: number;
      stealth: number;
    };
    titles: string[];
    rank: string;
  };
}

const CharacterStats = ({ character }: CharacterStatsProps) => {
  const getClassColor = (className: string) => {
    switch (className) {
      case 'monk': return 'from-cyan-500 to-blue-600';
      case 'samurai': return 'from-red-500 to-orange-600';
      case 'phantom': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRankColor = (rank: string) => {
    const rankColors = {
      'Ronin': 'bg-gray-600',
      'Samurai': 'bg-blue-600',
      'Master': 'bg-purple-600',
      'Ascended': 'bg-gold',
      'Shadow Lord': 'bg-black border-2 border-red-500'
    };
    return rankColors[rank as keyof typeof rankColors] || 'bg-gray-600';
  };

  return (
    <Card className="glass-card border-purple-500/20">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${getClassColor(character.class)} flex items-center justify-center pixel-art`}>
            <div className="text-3xl font-bold text-white pixel-font">
              {character.class === 'monk' ? '🧘' : character.class === 'samurai' ? '⚔️' : '👤'}
            </div>
          </div>
          
          <h3 className="text-2xl font-bold gradient-text mb-2">{character.name}</h3>
          <div className="flex justify-center items-center space-x-2 mb-2">
            <Badge className={`${getRankColor(character.rank)} text-white px-3 py-1`}>
              {character.rank}
            </Badge>
            <Badge variant="outline" className="border-purple-500/30">
              Level {character.level}
            </Badge>
          </div>
          
          {character.titles.length > 0 && (
            <div className="text-sm text-gray-400 mb-4">
              {character.titles.join(' • ')}
            </div>
          )}
        </div>

        {/* XP Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Experience</span>
            <span>{character.xp} / {character.maxXp} XP</span>
          </div>
          <Progress 
            value={(character.xp / character.maxXp) * 100} 
            className="h-3 bg-gray-800"
          />
        </div>

        {/* Combat Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-semibold">Wisdom (WIS)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-800 rounded-full h-2">
                <div 
                  className="h-2 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" 
                  style={{ width: `${(character.stats.wisdom / 100) * 100}%` }}
                />
              </div>
              <span className="text-cyan-400 font-bold text-sm w-8">{character.stats.wisdom}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-red-400" />
              <span className="text-white font-semibold">Aggression (AGG)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-800 rounded-full h-2">
                <div 
                  className="h-2 bg-gradient-to-r from-red-400 to-red-600 rounded-full" 
                  style={{ width: `${(character.stats.aggression / 100) * 100}%` }}
                />
              </div>
              <span className="text-red-400 font-bold text-sm w-8">{character.stats.aggression}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Stealth (STL)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-800 rounded-full h-2">
                <div 
                  className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" 
                  style={{ width: `${(character.stats.stealth / 100) * 100}%` }}
                />
              </div>
              <span className="text-purple-400 font-bold text-sm w-8">{character.stats.stealth}</span>
            </div>
          </div>
        </div>

        {/* Class Specialty */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-sm">Class Specialty</span>
          </div>
          <p className="text-gray-300 text-sm">
            {character.class === 'monk' ? 'Patient analysis and defensive trading strategies' :
             character.class === 'samurai' ? 'Aggressive entries and precise execution' :
             'Stealth tactics and market manipulation detection'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CharacterStats;
