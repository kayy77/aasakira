
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Brain, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import EnhancedAIMentor from '@/components/education/EnhancedAIMentor';

const Education = () => {
  const navigate = useNavigate();

  const handleFeatureUse = () => {
    console.log('Education feature used');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-black relative">
      <CherryBlossomBackground />
      <Navigation />
      
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex items-center space-x-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold gradient-text mb-4">
              AI Trading Education
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Master trading with your personal AI mentor - from beginner concepts to advanced strategies
            </p>
          </div>

          {/* Education Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-colors">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg font-semibold text-white mb-2">AI Mentor</h3>
                <p className="text-gray-400 text-sm">Personal AI tutor adapts to your learning style</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-blue-500/20 hover:border-blue-400/40 transition-colors">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Smart Courses</h3>
                <p className="text-gray-400 text-sm">Interactive lessons with real market examples</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-green-500/20 hover:border-green-400/40 transition-colors">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Chart Analysis</h3>
                <p className="text-gray-400 text-sm">Upload screenshots for AI-powered analysis</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-yellow-500/20 hover:border-yellow-400/40 transition-colors">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Progress Tracking</h3>
                <p className="text-gray-400 text-sm">Monitor your learning journey and skill development</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Education Interface */}
          <EnhancedAIMentor onFeatureUse={handleFeatureUse} />
        </div>
      </div>
    </div>
  );
};

export default Education;
