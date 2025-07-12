
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Eye, 
  Flame, 
  Zap, 
  Moon, 
  Sword, 
  Shield, 
  Target,
  Crown,
  Star,
  Sparkles
} from 'lucide-react';

interface TradingPattern {
  riskLevel: 'low' | 'medium' | 'high';
  patience: 'impulsive' | 'balanced' | 'patient';
  accuracy: 'learning' | 'decent' | 'sharp';
  style: 'scalper' | 'momentum' | 'structure' | 'contrarian';
}

interface SamuraiAvatar {
  id: string;
  name: string;
  title: string;
  description: string;
  maskColor: string;
  auraColor: string;
  weaponry: string[];
  personality: string;
  icon: React.ComponentType<any>;
  evolvedForm?: string;
  xpRequired: number;
}

const SAMURAI_ARCHETYPES: SamuraiAvatar[] = [
  // Liquidity Hunters (Patient + Structure)
  {
    id: 'liquidity_phantom',
    name: 'Kumo',
    title: 'Liquidity Phantom',
    description: 'A shadow that feeds on trapped liquidity',
    maskColor: 'from-gray-400 to-gray-600',
    auraColor: 'shadow-gray-500/50',
    weaponry: ['Shadow Blade', 'Liquidity Sensor', 'Patience Charm'],
    personality: 'Silent and calculating, strikes when others panic',
    icon: Eye,
    evolvedForm: 'Phantom Lord',
    xpRequired: 500
  },
  
  // Breakout Warriors (High Risk + Momentum)
  {
    id: 'breakout_oni',
    name: 'Bakudan',
    title: 'Breakout Oni',
    description: 'Explosive demon that shatters resistance',
    maskColor: 'from-red-500 to-orange-600',
    auraColor: 'shadow-red-500/50',
    weaponry: ['Thunder Katana', 'Momentum Gauntlets', 'Explosive Shurikens'],
    personality: 'Fierce and aggressive, strikes with overwhelming force',
    icon: Flame,
    evolvedForm: 'Inferno Shogun',
    xpRequired: 750
  },
  
  // Flow Traders (Patient + Balanced)
  {
    id: 'flow_monk',
    name: 'Nagare',
    title: 'Flow Monk',
    description: 'Zen master who reads market currents',
    maskColor: 'from-blue-400 to-cyan-500',
    auraColor: 'shadow-blue-500/50',
    weaponry: ['Current Staff', 'Harmony Beads', 'Flow Robes'],
    personality: 'Wise and measured, moves with market rhythm',
    icon: Moon,
    evolvedForm: 'Current Master',
    xpRequired: 600
  },
  
  // Scalping Ninjas (Fast + High Risk)
  {
    id: 'speed_shinobi',
    name: 'Hayai',
    title: 'Speed Shinobi',
    description: 'Lightning-fast warrior of micro movements',
    maskColor: 'from-yellow-400 to-amber-500',
    auraColor: 'shadow-yellow-500/50',
    weaponry: ['Twin Speed Daggers', 'Flash Smoke', 'Time Accelerator'],
    personality: 'Quick and precise, strikes before others react',
    icon: Zap,
    evolvedForm: 'Lightning God',
    xpRequired: 800
  },
  
  // Contrarian Samurai (High Accuracy + Structure)
  {
    id: 'counter_samurai',
    name: 'Hangyaku',
    title: 'Counter Samurai',
    description: 'Rebel who profits from crowd mistakes',
    maskColor: 'from-purple-500 to-indigo-600',
    auraColor: 'shadow-purple-500/50',
    weaponry: ['Reversal Blade', 'Contrarian Armor', 'Crowd-Reading Lens'],
    personality: 'Rebellious and sharp, sees what others miss',
    icon: Target,
    evolvedForm: 'Reversal Master',
    xpRequired: 700
  }
];

interface AvatarGeneratorProps {
  userStats: {
    wins: number;
    losses: number;
    streak: number;
    points: number;
    averageDecisionTime?: number;
    riskTaken?: number;
    accuracy?: number;
  };
  tradingHistory?: Array<{
    prediction: 'up' | 'down';
    result: 'win' | 'lose';
    decisionTime: number;
    confidence: number;
  }>;
}

const AvatarGenerator = ({ userStats, tradingHistory = [] }: AvatarGeneratorProps) => {
  const [currentAvatar, setCurrentAvatar] = useState<SamuraiAvatar | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [xp, setXp] = useState(0);

  // AI Analysis of Trading Pattern
  const analyzeTradingPattern = (): TradingPattern => {
    const totalTrades = userStats.wins + userStats.losses;
    const winRate = totalTrades > 0 ? userStats.wins / totalTrades : 0;
    
    // Analyze decision speed (if available)
    const avgDecisionTime = userStats.averageDecisionTime || 15;
    const patience = avgDecisionTime > 20 ? 'patient' : avgDecisionTime > 10 ? 'balanced' : 'impulsive';
    
    // Analyze risk level
    const riskLevel = userStats.riskTaken ? 
      (userStats.riskTaken > 70 ? 'high' : userStats.riskTaken > 40 ? 'medium' : 'low') : 'medium';
    
    // Analyze accuracy
    const accuracy = winRate > 0.7 ? 'sharp' : winRate > 0.5 ? 'decent' : 'learning';
    
    // Determine style based on patterns
    let style: TradingPattern['style'] = 'momentum';
    if (patience === 'patient' && riskLevel === 'low') style = 'structure';
    else if (patience === 'impulsive' && riskLevel === 'high') style = 'scalper';
    else if (accuracy === 'sharp' && riskLevel === 'medium') style = 'contrarian';
    
    return { riskLevel, patience, accuracy, style };
  };

  // AI Avatar Assignment
  const assignAvatar = () => {
    const pattern = analyzeTradingPattern();
    let selectedAvatar: SamuraiAvatar;
    
    // AI logic to match pattern to archetype
    if (pattern.style === 'structure' && pattern.patience === 'patient') {
      selectedAvatar = SAMURAI_ARCHETYPES.find(a => a.id === 'liquidity_phantom')!;
    } else if (pattern.style === 'scalper' && pattern.riskLevel === 'high') {
      selectedAvatar = SAMURAI_ARCHETYPES.find(a => a.id === 'speed_shinobi')!;
    } else if (pattern.style === 'momentum' && pattern.riskLevel === 'high') {
      selectedAvatar = SAMURAI_ARCHETYPES.find(a => a.id === 'breakout_oni')!;
    } else if (pattern.patience === 'patient' && pattern.accuracy === 'decent') {
      selectedAvatar = SAMURAI_ARCHETYPES.find(a => a.id === 'flow_monk')!;
    } else {
      selectedAvatar = SAMURAI_ARCHETYPES.find(a => a.id === 'counter_samurai')!;
    }
    
    return selectedAvatar;
  };

  // Calculate XP and check evolution
  useEffect(() => {
    const newXp = (userStats.wins * 50) + (userStats.streak * 25) + Math.floor(userStats.points / 10);
    setXp(newXp);
    
    const avatar = assignAvatar();
    
    // Check if avatar should evolve
    if (newXp >= avatar.xpRequired && currentAvatar?.id === avatar.id && avatar.evolvedForm) {
      setIsEvolving(true);
      setTimeout(() => {
        setCurrentAvatar({
          ...avatar,
          name: avatar.evolvedForm!,
          title: `${avatar.evolvedForm}`,
          weaponry: [...avatar.weaponry, 'Legendary Crest'],
          auraColor: `${avatar.auraColor} glow-lg`,
        });
        setIsEvolving(false);
      }, 2000);
    } else {
      setCurrentAvatar(avatar);
    }
  }, [userStats]);

  if (!currentAvatar) return null;

  const IconComponent = currentAvatar.icon;
  const evolutionProgress = Math.min((xp / currentAvatar.xpRequired) * 100, 100);
  const canEvolve = xp >= currentAvatar.xpRequired && currentAvatar.evolvedForm;

  return (
    <Card className="glass-card border-gradient-to-r from-purple-500/20 to-pink-500/20 relative overflow-hidden">
      {/* Evolution Animation */}
      {isEvolving && (
        <div className="absolute inset-0 z-50 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 animate-pulse flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-16 h-16 mx-auto text-yellow-400 animate-spin mb-4" />
            <div className="text-2xl font-bold text-yellow-400">EVOLUTION!</div>
            <div className="text-lg text-white">{currentAvatar.name} is evolving...</div>
          </div>
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-center space-x-6">
          {/* AI-Generated Avatar */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${currentAvatar.maskColor} flex items-center justify-center border-4 border-white/20 shadow-2xl ${currentAvatar.auraColor}`}>
              <IconComponent className="w-12 h-12 text-white" />
            </div>
            
            {/* Evolution indicator */}
            {canEvolve && (
              <div className="absolute -top-2 -right-2 animate-pulse">
                <Crown className="w-6 h-6 text-yellow-400" />
              </div>
            )}
            
            {/* XP Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeDasharray={`${evolutionProgress * 2.89} 289`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Avatar Info */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-xl font-bold text-white">{currentAvatar.name}</h3>
              <Badge className={`bg-gradient-to-r ${currentAvatar.maskColor} text-white border-0`}>
                {currentAvatar.title}
              </Badge>
            </div>

            {/* AI-Generated Description */}
            <p className="text-sm text-gray-400 italic">
              "{currentAvatar.description}"
            </p>
            <p className="text-xs text-gray-500">
              {currentAvatar.personality}
            </p>

            {/* Current Gear */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-300">Current Arsenal:</h4>
              <div className="flex flex-wrap gap-2">
                {currentAvatar.weaponry.map((weapon, index) => (
                  <Badge key={index} variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                    {weapon}
                  </Badge>
                ))}
              </div>
            </div>

            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">XP Progress</span>
                <span className="text-yellow-400">{xp}/{currentAvatar.xpRequired}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${evolutionProgress}%` }}
                />
              </div>
              {canEvolve && (
                <div className="text-center">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse">
                    <Star className="w-3 h-3 mr-1" />
                    Ready to Evolve!
                  </Badge>
                </div>
              )}
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
              <div className="text-xs text-gray-400">Honor</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarGenerator;
