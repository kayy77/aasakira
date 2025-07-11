
import React from 'react';
import { Lightbulb, BookOpen, Target, TrendingUp, BarChart3, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickStartSectionProps {
  onQuickStart: (question: string) => void;
}

const QuickStartSection = ({ onQuickStart }: QuickStartSectionProps) => {
  const quickStartItems = [
    { title: "What is forex trading?", icon: BookOpen },
    { title: "How do I place a trade?", icon: Target },
    { title: "What is risk management?", icon: TrendingUp },
    { title: "Show me smart money concepts", icon: BarChart3 },
    { title: "How do I read candlestick patterns?", icon: Zap },
    { title: "What is leverage in trading?", icon: Lightbulb }
  ];

  const professionalTools = [
    {
      title: "Trading Journal",
      description: "Professional trade tracking & AI analysis",
      icon: BookOpen,
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Strategy Backtesting",
      description: "Test your strategies with historical data",
      icon: BarChart3,
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-400">
            <Lightbulb className="w-5 h-5" />
            <span>Quick Start</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickStartItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => onQuickStart(item.title)}
                className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-500/30 group"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                  <span className="text-gray-300 group-hover:text-white text-sm">{item.title}</span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-400">
            <Target className="w-5 h-5" />
            <span>Professional Tools</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {professionalTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg bg-gradient-to-r ${tool.color} bg-opacity-20 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-6 h-6 text-white mt-1 group-hover:scale-110 transition-transform" />
                  <div>
                    <h3 className="text-white font-semibold">{tool.title}</h3>
                    <p className="text-gray-300 text-sm mt-1">{tool.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStartSection;
