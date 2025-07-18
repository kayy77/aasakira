
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Target, 
  BarChart3,
  MessageSquare,
  GraduationCap,
  BookOpen,
  Trophy
} from 'lucide-react';
import EnhancedTradingJournal from '@/components/education/EnhancedTradingJournal';
import BacktestLab from '@/components/education/BacktestLab';
import EnhancedAIMentor from '@/components/education/EnhancedAIMentor';
import ComprehensiveLearningPath from '@/components/education/ComprehensiveLearningPath';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

const Education = () => {
  const [activeTab, setActiveTab] = useState('path');
  const isMobile = useIsMobile();

  const features = [
    {
      icon: <Trophy className="w-6 h-6 md:w-8 md:h-8 text-gold-400" />,
      title: "6-Month Path",
      description: "Complete professional trading mastery program",
      tab: "path"
    },
    {
      icon: <Brain className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />,
      title: "AI Mentor",
      description: "Your personal trading mentor with chart analysis",
      tab: "mentor"
    },
    {
      icon: <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />,
      title: "Trading Journal",
      description: "Track progress and analyze your trades with AI",
      tab: "journal"
    },
    {
      icon: <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />,
      title: "Backtest Lab",
      description: "Test strategies with historical data",
      tab: "backtest"
    }
  ];

  const handleAskMentor = (prompt: string) => {
    setActiveTab('mentor');
    // In a real implementation, you'd pass this prompt to the mentor component
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      {isMobile ? <MobileNavigation /> : <Navigation />}
      
      <div className="relative z-10 pt-20 md:pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl font-bold gradient-text mb-4">
              Professional Trading Education
            </h1>
            <p className="text-gray-300 text-sm md:text-lg max-w-3xl mx-auto px-4">
              Complete 6-month journey from absolute beginner to professional trader. Master the fundamentals, psychology, and advanced strategies with personalized AI mentorship.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
            <div className={`grid gap-3 md:gap-4 mb-6 md:mb-8 ${
              isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'
            }`}>
              {features.map((feature, index) => (
                <Card 
                  key={index}
                  className={`glass-card hover-glow cursor-pointer transition-all duration-300 ${
                    activeTab === feature.tab ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20' : 'border-gray-700/50'
                  }`}
                  onClick={() => setActiveTab(feature.tab)}
                >
                  <CardContent className={`p-4 md:p-6 text-center ${isMobile ? 'space-y-2' : ''}`}>
                    <div className="flex justify-center mb-2 md:mb-4">
                      {feature.icon}
                    </div>
                    <h3 className={`font-semibold text-white mb-1 md:mb-2 ${
                      isMobile ? 'text-xs' : 'text-lg'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-gray-400 ${
                      isMobile ? 'text-xs hidden' : 'text-sm'
                    }`}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <TabsContent value="path">
              <ComprehensiveLearningPath />
            </TabsContent>

            <TabsContent value="mentor">
              <Card className="glass-card h-[600px]">
                <CardHeader>
                  <CardTitle className="flex items-center text-purple-400">
                    <Brain className="w-6 h-6 mr-2" />
                    AI Trading Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full p-0">
                  <EnhancedAIMentor />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="journal">
              <EnhancedTradingJournal />
            </TabsContent>

            <TabsContent value="backtest">
              <BacktestLab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Education;
