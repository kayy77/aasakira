
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Sword, 
  Shield, 
  Zap, 
  Star,
  Users,
  Trophy,
  Target,
  Brain,
  Ghost,
  Flame,
  Eye,
  Mountain,
  Sparkles,
  Settings
} from 'lucide-react';

// Base Classes
interface BaseClass {
  id: string;
  name: string;
  title: string;
  lore: string;
  visualStyle: {
    hair: string;
    clothing: string;
    footwear: string;
    color: string;
  };
  starterGear: string[];
  stats: {
    wisdom: number;
    stealth: number;
    aggression: number;
  };
  evolutions: string[];
  icon: React.ComponentType<any>;
}

// Gear System
interface GearItem {
  id: string;
  name: string;
  category: 'weapon' | 'armor' | 'accessory' | 'mask' | 'cape';
  xpRequired: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  visualEffect?: string;
  classRestriction?: string[];
}

// Pet System
interface Pet {
  id: string;
  name: string;
  aura: string;
  xpRequired: number;
  perk: string;
  icon: string;
  rarity: 'rare' | 'epic' | 'legendary' | 'mythic';
}

const BASE_CLASSES: BaseClass[] = [
  {
    id: 'wandering_monk',
    name: 'Wandering Monk',
    title: 'Student of Flow',
    lore: 'A peaceful mind, a deadly precision. This Monk studies the flow, waits for imbalance, and strikes only when the time is right.',
    visualStyle: {
      hair: 'Short shaved head or bald',
      clothing: 'Simple brown robes',
      footwear: 'Barefoot',
      color: 'from-amber-700 to-orange-800'
    },
    starterGear: ['Empty hands', 'Brown sash'],
    stats: { wisdom: 85, stealth: 60, aggression: 35 },
    evolutions: ['Zen Monk', 'Elemental Monk', 'Time Bender'],
    icon: Mountain
  },
  {
    id: 'rising_samurai',
    name: 'Rising Samurai',
    title: 'Warrior of Momentum',
    lore: 'An aggressive warrior who seeks to conquer the market\'s direction with bold strikes and fearless entries.',
    visualStyle: {
      hair: 'Traditional topknot',
      clothing: 'Red or black robe',
      footwear: 'Leather boots',
      color: 'from-red-700 to-red-900'
    },
    starterGear: ['Basic wooden sword', 'Red belt', 'Leather arm guards'],
    stats: { wisdom: 60, stealth: 35, aggression: 85 },
    evolutions: ['Blade Shogun', 'Flame Ronin', 'Storm Caller'],
    icon: Sword
  },
  {
    id: 'market_phantom',
    name: 'Market Phantom',
    title: 'Shadow Trader',
    lore: 'A shadow from the edges of the market. Never seen — only felt. A master of range traps, fake-outs, and misdirection.',
    visualStyle: {
      hair: 'Hidden under hood',
      clothing: 'Hooded cloak',
      footwear: 'Silent boots',
      color: 'from-purple-800 to-gray-900'
    },
    starterGear: ['Kunai', 'Black cloak', 'Face mask'],
    stats: { wisdom: 50, stealth: 90, aggression: 60 },
    evolutions: ['Silent Executioner', 'Liquidity Reaper', 'Wick Whisperer'],
    icon: Ghost
  }
];

const GEAR_PROGRESSION: GearItem[] = [
  // Early Game (0-250 XP)
  { id: 'straw_hat', name: 'Straw Hat', category: 'accessory', xpRequired: 100, rarity: 'common' },
  { id: 'shinobi_mask', name: 'Shinobi Mask', category: 'mask', xpRequired: 100, rarity: 'common' },
  { id: 'obsidian_blade', name: 'Obsidian Blade', category: 'weapon', xpRequired: 250, rarity: 'rare' },
  { id: 'tiger_cloak', name: 'Tiger Cloak', category: 'cape', xpRequired: 250, rarity: 'rare' },
  
  // Mid Game (500-1000 XP)
  { id: 'spirit_cape', name: 'Spirit Cape', category: 'cape', xpRequired: 500, rarity: 'epic', visualEffect: 'glowing' },
  { id: 'white_katana', name: 'White Katana', category: 'weapon', xpRequired: 500, rarity: 'epic' },
  { id: 'oni_mask', name: 'Oni Mask', category: 'mask', xpRequired: 1000, rarity: 'epic' },
  { id: 'celestial_armor', name: 'Celestial Armor', category: 'armor', xpRequired: 1000, rarity: 'epic', visualEffect: 'glowing' },
  
  // End Game (2000+ XP)
  { id: 'dragon_helm', name: 'Dragon Helm', category: 'accessory', xpRequired: 2000, rarity: 'legendary' },
  { id: 'soulpiercer_naginata', name: 'Soulpiercer Naginata', category: 'weapon', xpRequired: 2000, rarity: 'legendary' },
  { id: 'void_cloak', name: 'Mythic Cloak of the Void', category: 'cape', xpRequired: 5000, rarity: 'mythic', visualEffect: 'animated' },
  { id: 'galaxy_katana', name: 'Galaxy Katana', category: 'weapon', xpRequired: 5000, rarity: 'mythic', visualEffect: 'animated' }
];

const BATTLE_PETS: Pet[] = [
  {
    id: 'spirit_fox',
    name: 'Spirit Fox (Kitsune)',
    aura: 'Blue flames',
    xpRequired: 750,
    perk: '+5% XP bonus when winning back-to-back battles',
    icon: '🦊',
    rarity: 'rare'
  },
  {
    id: 'onyx_dragon',
    name: 'Onyx Dragon Pup',
    aura: 'Pulsing black lightning',
    xpRequired: 1500,
    perk: '+5% damage boost vs higher-ranked opponents',
    icon: '🐉',
    rarity: 'epic'
  },
  {
    id: 'trade_tanuki',
    name: 'Trade Tanuki',
    aura: 'Lucky falling leaves',
    xpRequired: 2500,
    perk: '1x per day, lets you re-roll a bad prediction',
    icon: '🐻',
    rarity: 'legendary'
  },
  {
    id: 'void_phantom',
    name: 'Void Phantom',
    aura: 'Glitching void trails',
    xpRequired: 5000,
    perk: 'Unlocks "Vanish & Strike" - hide your move until last second',
    icon: '👻',
    rarity: 'mythic'
  }
];

interface ComprehensiveAvatarSystemProps {
  userStats: {
    wins: number;
    losses: number;
    streak: number;
    points: number;
    xp: number;
  };
  selectedClass?: string;
  onClassSelect?: (classId: string) => void;
}

const ComprehensiveAvatarSystem = ({ 
  userStats, 
  selectedClass,
  onClassSelect 
}: ComprehensiveAvatarSystemProps) => {
  const [currentClass, setCurrentClass] = useState<BaseClass | null>(null);
  const [unlockedGear, setUnlockedGear] = useState<string[]>([]);
  const [equippedGear, setEquippedGear] = useState<string[]>([]);
  const [unlockedPets, setUnlockedPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [showClassSelection, setShowClassSelection] = useState(false);
  const [showGearCustomization, setShowGearCustomization] = useState(false);

  // Initialize or load selected class
  useEffect(() => {
    if (selectedClass) {
      const foundClass = BASE_CLASSES.find(c => c.id === selectedClass);
      setCurrentClass(foundClass || null);
    } else {
      setShowClassSelection(true);
    }
  }, [selectedClass]);

  // Calculate unlocked gear based on XP
  useEffect(() => {
    const unlocked = GEAR_PROGRESSION
      .filter(gear => userStats.xp >= gear.xpRequired)
      .map(gear => gear.id);
    setUnlockedGear(unlocked);

    // Auto-equip starter gear
    if (currentClass && equippedGear.length === 0) {
      const starterGearIds = currentClass.starterGear.map(gear => 
        gear.toLowerCase().replace(/\s+/g, '_')
      );
      setEquippedGear(starterGearIds);
    }
  }, [userStats.xp, currentClass]);

  // Calculate unlocked pets
  useEffect(() => {
    const unlocked = BATTLE_PETS.filter(pet => userStats.xp >= pet.xpRequired);
    setUnlockedPets(unlocked);

    // Auto-select first unlocked pet
    if (unlocked.length > 0 && !activePet) {
      setActivePet(unlocked[0]);
    }
  }, [userStats.xp]);

  const handleClassSelect = (classData: BaseClass) => {
    setCurrentClass(classData);
    setShowClassSelection(false);
    onClassSelect?.(classData.id);
  };

  const toggleGearEquip = (gearId: string) => {
    setEquippedGear(prev => 
      prev.includes(gearId) 
        ? prev.filter(id => id !== gearId)
        : [...prev, gearId]
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      case 'mythic': return 'text-pink-400 border-pink-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getNextXPMilestone = () => {
    const milestones = [100, 250, 500, 750, 1000, 1500, 2000, 2500, 5000];
    return milestones.find(m => m > userStats.xp) || 10000;
  };

  if (showClassSelection) {
    return (
      <Card className="glass-card border-gradient-to-r from-purple-500/20 to-pink-500/20">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text mb-2">Choose Your Path</h2>
            <p className="text-gray-400">Select your starting class - this will shape your trading journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BASE_CLASSES.map((classData) => {
              const IconComponent = classData.icon;
              return (
                <Card 
                  key={classData.id}
                  className="glass-card border-purple-500/20 hover:border-purple-400/40 cursor-pointer transition-all duration-300 hover:scale-105"
                  onClick={() => handleClassSelect(classData)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${classData.visualStyle.color} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{classData.name}</h3>
                    <Badge className="mb-3">{classData.title}</Badge>

                    <p className="text-sm text-gray-400 italic mb-4">"{classData.lore}"</p>

                    {/* Stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-400">Wisdom</span>
                        <span className="text-white">{classData.stats.wisdom}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-400">Stealth</span>
                        <span className="text-white">{classData.stats.stealth}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-400">Aggression</span>
                        <span className="text-white">{classData.stats.aggression}</span>
                      </div>
                    </div>

                    {/* Starter Gear */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Starter Gear:</h4>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {classData.starterGear.map((gear, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-gray-500 text-gray-400">
                            {gear}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Evolution Paths */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Evolution Paths:</h4>
                      <div className="space-y-1">
                        {classData.evolutions.map((evolution, index) => (
                          <div key={index} className="text-xs text-yellow-400">{evolution}</div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentClass) return null;

  const CurrentIcon = currentClass.icon;
  const nextMilestone = getNextXPMilestone();
  const progressPercent = ((userStats.xp % 1000) / 1000) * 100;

  return (
    <div className="space-y-6">
      {/* Main Avatar Display */}
      <Card className="glass-card border-gradient-to-r from-purple-500/20 to-pink-500/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            {/* Avatar Visual */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${currentClass.visualStyle.color} flex items-center justify-center border-4 border-white/20 shadow-2xl`}>
                <CurrentIcon className="w-16 h-16 text-white" />
              </div>
              
              {/* Active Pet */}
              {activePet && (
                <div className="absolute -bottom-2 -right-2 text-2xl animate-bounce">
                  {activePet.icon}
                </div>
              )}

              {/* XP Ring */}
              <div className="absolute inset-0 rounded-full">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="url(#xpGradient)"
                    strokeWidth="4"
                    strokeDasharray={`${progressPercent * 2.89} 289`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Character Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{currentClass.name}</h3>
                <Badge className={`bg-gradient-to-r ${currentClass.visualStyle.color} text-white border-0`}>
                  {currentClass.title}
                </Badge>
              </div>

              {/* XP Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">XP Progress</span>
                  <span className="text-yellow-400">{userStats.xp} / {nextMilestone}</span>
                </div>
                <Progress value={progressPercent} className="h-2 bg-gray-800" />
              </div>

              {/* Stats Display */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-blue-400 text-sm">Wisdom</div>
                  <div className="text-xl font-bold text-white">{currentClass.stats.wisdom}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 text-sm">Stealth</div>
                  <div className="text-xl font-bold text-white">{currentClass.stats.stealth}</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 text-sm">Aggression</div>
                  <div className="text-xl font-bold text-white">{currentClass.stats.aggression}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowGearCustomization(true)}
                  className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowClassSelection(true)}
                  className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
                >
                  Change Class
                </Button>
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
                <div className="text-xl font-bold text-yellow-400">{userStats.streak}</div>
                <div className="text-xs text-gray-400">Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gear Progression Overview */}
      <Card className="glass-card border-blue-500/20">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Gear Progression
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GEAR_PROGRESSION.slice(0, 8).map((gear) => {
              const isUnlocked = unlockedGear.includes(gear.id);
              const isEquipped = equippedGear.includes(gear.id);
              
              return (
                <div
                  key={gear.id}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    isUnlocked 
                      ? `${getRarityColor(gear.rarity)} bg-gradient-to-br from-gray-900/50 to-gray-800/50` 
                      : 'border-gray-700 bg-gray-900/30 opacity-50'
                  } ${isEquipped ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  <div className="text-sm font-semibold text-white mb-1">{gear.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{gear.xpRequired} XP</div>
                  <Badge 
                    className={`text-xs ${
                      isUnlocked ? getRarityColor(gear.rarity) : 'text-gray-500'
                    }`}
                    variant="outline"
                  >
                    {gear.rarity}
                  </Badge>
                  {gear.visualEffect && (
                    <div className="text-xs text-yellow-400 mt-1">{gear.visualEffect}</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Battle Pets */}
      {unlockedPets.length > 0 && (
        <Card className="glass-card border-green-500/20">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Battle Companions
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedPets.map((pet) => (
                <div
                  key={pet.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    activePet?.id === pet.id 
                      ? 'border-yellow-400 bg-yellow-900/20' 
                      : 'border-green-500/30 hover:border-green-400/50'
                  }`}
                  onClick={() => setActivePet(pet)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{pet.icon}</div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-white">{pet.name}</h5>
                      <p className="text-sm text-gray-400">{pet.aura}</p>
                      <p className="text-xs text-green-400 mt-1">{pet.perk}</p>
                    </div>
                    {activePet?.id === pet.id && (
                      <Badge className="bg-yellow-500 text-black">Active</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComprehensiveAvatarSystem;
