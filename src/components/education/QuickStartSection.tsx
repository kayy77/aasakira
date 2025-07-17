
import React from 'react';
import { Lightbulb, BookOpen, Target, TrendingUp, BarChart3, Zap, HelpCircle, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickStartSectionProps {
  onQuickStart: (question: string) => void;
}

const QuickStartSection = ({ onQuickStart }: QuickStartSectionProps) => {
  const quickStartItems = [
    { title: "I'm completely new to trading - where do I start?", icon: GraduationCap },
    { title: "What is a currency pair?", icon: HelpCircle },
    { title: "How do I read a trading chart?", icon: BarChart3 },
    { title: "What is risk management?", icon: Target },
    { title: "When should I trade?", icon: TrendingUp },
    { title: "How much money do I need to start?", icon: BookOpen }
  ];

  const learningPaths = [
    {
      title: "Complete Beginner Path",
      description: "Start from absolute zero with step-by-step guidance",
      icon: BookOpen,
      color: "from-green-500 to-blue-600",
      lessons: 6
    },
    {
      title: "Quick Foundation",
      description: "Essential concepts in bite-sized lessons",
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      lessons: 3
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="glass-card border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-400">
            <GraduationCap className="w-5 h-5" />
            <span>New to Trading? Start Here</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickStartItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => onQuickStart(item.title)}
                className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-green-500/30 group"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                  <span className="text-gray-300 group-hover:text-white text-sm">{item.title}</span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-400">
            <Target className="w-5 h-5" />
            <span>Learning Paths</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {learningPaths.map((path, index) => {
            const Icon = path.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg bg-gradient-to-r ${path.color} bg-opacity-20 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex items-start space-x-3">
                  <Icon className="w-6 h-6 text-white mt-1 group-hover:scale-110 transition-transform" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">{path.title}</h3>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">
                        {path.lessons} lessons
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{path.description}</p>
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
