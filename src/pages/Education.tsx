
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Brain, 
  Target, 
  BarChart3,
  Gamepad2,
  MessageSquare,
  TrendingUp,
  Award,
  Calendar,
  TestTube
} from 'lucide-react';
import TradingJournal from '@/components/education/TradingJournal';
import BacktestLab from '@/components/education/BacktestLab';
import EnhancedAIMentor from '@/components/education/EnhancedAIMentor';
import CombatMode from '@/components/education/CombatMode';

const Education = () => {
  const [activeTab, setActiveTab] = useState('mentor');

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      title: "AI Mentor",
      description: "Personalized trading education with AI-powered explanations",
      tab: "mentor"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-blue-400" />,
      title: "Trading Journal",
      description: "Track your trades, emotions, and learning progress",
      tab: "journal"
    },
    {
      icon: <TestTube className="w-8 h-8 text-green-400" />,
      title: "Backtest Lab",
      description: "Test your strategies against historical market data",
      tab: "backtest"
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-red-400" />,
      title: "Combat Mode",
      description: "Gamified learning with trading battles and challenges",
      tab: "combat"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              Trading Education Hub
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Master the markets with AI-powered education, personal journaling, strategy backtesting, and gamified learning
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`glass-card hover-glow cursor-pointer transition-all duration-300 ${
                    activeTab === feature.tab ? 'border-purple-500/50 bg-purple-500/10' : 'border-gray-700/50'
                  }`}
                  onClick={() => setActiveTab(feature.tab)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <TabsContent value="mentor">
              <EnhancedAIMentor />
            </TabsContent>

            <TabsContent value="journal">
              <TradingJournal />
            </TabsContent>

            <TabsContent value="backtest">
              <BacktestLab />
            </TabsContent>

            <TabsContent value="combat">
              <CombatMode />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Education;
