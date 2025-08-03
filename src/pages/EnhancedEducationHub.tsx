
import React from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, Eye, Target, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CherryBlossomBackground from '@/components/CherryBlossomBackground';
import EnhancedAICoach from '@/components/education/EnhancedAICoach';

const EnhancedEducationHub = () => {
  const navigate = useNavigate();

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
              🚀 Enhanced AI Education Hub
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Your personal AI trading coach with visual learning, personalized lessons, and adaptive skill tracking
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="glass-card border-blue-500/20 hover:border-blue-400/40 transition-colors">
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Adaptive AI Coach</h3>
                <p className="text-gray-400 text-sm">Learns your skill level and adapts explanations to your experience</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-colors">
              <CardContent className="p-6 text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Visual Learning</h3>
                <p className="text-gray-400 text-sm">AI-generated charts and diagrams for every trading concept</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-green-500/20 hover:border-green-400/40 transition-colors">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Personalized Quizzes</h3>
                <p className="text-gray-400 text-sm">Smart quizzes that adapt to your progress and weak areas</p>
              </CardContent>
            </Card>
          </div>

          {/* What's New Section */}
          <Card className="glass-card border-yellow-500/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Sparkles className="w-6 h-6" />
                What's New in Enhanced AI Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Skill level tracking (Beginner → Intermediate → Pro)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">AI-generated visual charts for every concept</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Personalized learning path based on your progress</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Contextual follow-up actions and suggestions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Session memory for continuous conversations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Smart quiz generation based on your weak areas</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Education Interface */}
          <EnhancedAICoach />
        </div>
      </div>
    </div>
  );
};

export default EnhancedEducationHub;
