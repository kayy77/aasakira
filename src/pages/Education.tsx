import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Zap, 
  GraduationCap,
  Brain,
  Swords,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import ComprehensiveLearningPath from '@/components/education/ComprehensiveLearningPath';
import SimpleLearningPath from '@/components/education/SimpleLearningPath';

const Education = () => {
  const [selectedPath, setSelectedPath] = useState<'comprehensive' | 'simple' | null>(null);

  const learningPaths = [
    {
      id: 'comprehensive',
      title: 'Comprehensive Path',
      description: 'A structured learning experience with levels and progress tracking',
      icon: GraduationCap,
    },
    {
      id: 'simple',
      title: 'Simple Path',
      description: 'A quick and easy way to learn the basics of trading',
      icon: BookOpen,
    },
    {
      id: 'strategy',
      title: 'Strategy Lab',
      description: 'Explore advanced trading strategies and techniques',
      icon: Swords,
      comingSoon: true,
    },
  ];

  if (selectedPath === 'comprehensive') {
    return <ComprehensiveLearningPath />;
  }

  if (selectedPath === 'simple') {
    return <SimpleLearningPath onBack={() => setSelectedPath(null)} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Trading Education
          </CardTitle>
          <p className="text-gray-400">Unlock your trading potential with our structured learning paths</p>
        </CardHeader>
      </Card>

      {/* Learning Paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningPaths.map((path) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card 
              className={`glass-card transition-all duration-300 hover:border-purple-500/50 ${path.comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !path.comingSoon && setSelectedPath(path.id as any)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                    <path.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{path.title}</h3>
                    <p className="text-gray-400">{path.description}</p>
                  </div>
                </div>
                {path.comingSoon && (
                  <Badge className="bg-yellow-500/20 text-yellow-400">
                    Coming Soon
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Features */}
      <Card className="glass-card border-green-500/20">
        <CardContent className="p-6 text-center">
          <Zap className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Ready to Start?</h3>
          <p className="text-gray-400 mb-4">
            Begin your trading education journey with our structured learning path
          </p>
          <Button
            onClick={() => setSelectedPath('comprehensive')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Start Learning Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Education;
