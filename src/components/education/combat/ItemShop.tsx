
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sword, 
  Shield, 
  Sparkles, 
  Heart,
  Smile,
  Coins,
  Star,
  Crown,
  Flame
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'XP' | 'Legend Points';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  category: 'weapons' | 'armor' | 'auras' | 'pets' | 'emotes';
  effect?: string;
  owned: boolean;
}

interface ItemShopProps {
  userCurrency: {
    xp: number;
    legendPoints: number;
  };
  onPurchase: (itemId: string) => void;
}

const ItemShop = ({ userCurrency, onPurchase }: ItemShopProps) => {
  const [selectedCategory, setSelectedCategory] = useState('weapons');

  const shopItems: Item[] = [
    // Weapons
    {
      id: 'wooden_sword',
      name: 'Wooden Training Sword',
      description: 'A humble beginning for any warrior',
      price: 100,
      currency: 'XP',
      rarity: 'Common',
      category: 'weapons',
      effect: '+5 Aggression in battles',
      owned: false
    },
    {
      id: 'aasakira_blade',
      name: 'Aasakira Blade',
      description: 'The legendary katana of the trading masters',
      price: 5000,
      currency: 'Legend Points',
      rarity: 'Mythic',
      category: 'weapons',
      effect: '+25 All Stats, Special: Phoenix Strike',
      owned: false
    },
    
    // Armor
    {
      id: 'cherry_cloak',
      name: 'Cherry Blossom Cloak',
      description: 'Woven with the essence of spring',
      price: 2500,
      currency: 'XP',
      rarity: 'Epic',
      category: 'armor',
      effect: '+15 Wisdom, Meditation Bonus',
      owned: false
    },
    {
      id: 'oni_mask',
      name: 'Golden Oni Mask',
      description: 'Strike fear into your opponents',
      price: 1500,
      currency: 'Legend Points',
      rarity: 'Legendary',
      category: 'armor',
      effect: '+20 Stealth, Intimidation Aura',
      owned: false
    },
    
    // Auras
    {
      id: 'shadow_mist',
      name: 'Shadow Mist Aura',
      description: 'Envelop yourself in mysterious darkness',
      price: 800,
      currency: 'XP',
      rarity: 'Rare',
      category: 'auras',
      effect: '+10 Stealth, Phantom Presence',
      owned: false
    },
    
    // Pets
    {
      id: 'spirit_fox',
      name: 'Spirit Fox',
      description: 'A mystical companion with market insight',
      price: 3000,
      currency: 'XP',
      rarity: 'Epic',
      category: 'pets',
      effect: 'Provides trading hints during battles',
      owned: false
    },
    
    // Emotes
    {
      id: 'victory_dance',
      name: 'Victory Dance',
      description: 'Celebrate your wins in style',
      price: 500,
      currency: 'XP',
      rarity: 'Common',
      category: 'emotes',
      effect: 'Unlocks victory celebration animation',
      owned: false
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'border-gray-500 bg-gray-500/10';
      case 'Rare': return 'border-blue-500 bg-blue-500/10';
      case 'Epic': return 'border-purple-500 bg-purple-500/10';
      case 'Legendary': return 'border-yellow-500 bg-yellow-500/10';
      case 'Mythic': return 'border-red-500 bg-red-500/10 animate-pulse';
      default: return 'border-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weapons': return <Sword className="w-5 h-5" />;
      case 'armor': return <Shield className="w-5 h-5" />;
      case 'auras': return <Sparkles className="w-5 h-5" />;
      case 'pets': return <Heart className="w-5 h-5" />;
      case 'emotes': return <Smile className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const filteredItems = shopItems.filter(item => item.category === selectedCategory);
  const canAfford = (item: Item) => {
    return item.currency === 'XP' 
      ? userCurrency.xp >= item.price 
      : userCurrency.legendPoints >= item.price;
  };

  return (
    <div className="space-y-6">
      {/* Currency Display */}
      <Card className="glass-card border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">{userCurrency.xp.toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-400">XP Points</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <Crown className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold text-purple-400">{userCurrency.legendPoints}</span>
              </div>
              <div className="text-sm text-gray-400">Legend Points</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800/50">
          <TabsTrigger value="weapons" className="data-[state=active]:bg-red-600">
            <Sword className="w-4 h-4 mr-2" />
            Weapons
          </TabsTrigger>
          <TabsTrigger value="armor" className="data-[state=active]:bg-blue-600">
            <Shield className="w-4 h-4 mr-2" />
            Armor
          </TabsTrigger>
          <TabsTrigger value="auras" className="data-[state=active]:bg-purple-600">
            <Sparkles className="w-4 h-4 mr-2" />
            Auras
          </TabsTrigger>
          <TabsTrigger value="pets" className="data-[state=active]:bg-pink-600">
            <Heart className="w-4 h-4 mr-2" />
            Pets
          </TabsTrigger>
          <TabsTrigger value="emotes" className="data-[state=active]:bg-green-600">
            <Smile className="w-4 h-4 mr-2" />
            Emotes
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className={`glass-card ${getRarityColor(item.rarity)} transition-all hover:scale-105`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(item.category)}
                      <CardTitle className="text-lg text-white">{item.name}</CardTitle>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getRarityColor(item.rarity)}`}
                    >
                      {item.rarity}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">{item.description}</p>
                  
                  {item.effect && (
                    <div className="p-2 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded border border-purple-500/20">
                      <div className="flex items-center space-x-1 mb-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span className="text-xs text-orange-400 font-semibold">Effect</span>
                      </div>
                      <p className="text-xs text-gray-300">{item.effect}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {item.currency === 'XP' ? (
                        <Star className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <Crown className="w-4 h-4 text-purple-400" />
                      )}
                      <span className={`font-bold ${
                        item.currency === 'XP' ? 'text-yellow-400' : 'text-purple-400'
                      }`}>
                        {item.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => onPurchase(item.id)}
                      disabled={item.owned || !canAfford(item)}
                      size="sm"
                      className={`${
                        item.owned 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : canAfford(item)
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            : 'bg-red-600/50 cursor-not-allowed'
                      }`}
                    >
                      {item.owned ? 'Owned' : !canAfford(item) ? 'Insufficient Funds' : 'Purchase'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default ItemShop;
