
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowLeft, 
  Play, 
  Trophy,
  Target,
  Brain
} from 'lucide-react';

interface SimpleLearningPathProps {
  onBack: () => void;
}

const SimpleLearningPath: React.FC<SimpleLearningPathProps> = ({ onBack }) => {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  const lessons = [
    {
      id: 1,
      title: "What is Forex Trading?",
      description: "Learn the basics of currency trading and market fundamentals",
      content: "Forex trading involves buying and selling currencies to profit from exchange rate movements...",
      duration: "5 min"
    },
    {
      id: 2,
      title: "Currency Pairs Explained",
      description: "Understand major, minor, and exotic currency pairs",
      content: "Currency pairs show the exchange rate between two currencies...",
      duration: "7 min"
    },
    {
      id: 3,
      title: "Understanding Pips",
      description: "Learn how to calculate pips and their value",
      content: "A pip is the smallest price move in a currency pair...",
      duration: "6 min"
    }
  ];

  const handleCompleteLesson = (lessonId: number) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };

  const progress = (completedLessons.length / lessons.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-purple-400 hover:bg-purple-500/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Learning Path
            </Button>
            <Badge className="bg-purple-500/20 text-purple-300">
              {completedLessons.length}/{lessons.length} Complete
            </Badge>
          </div>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            Trading Foundations
          </CardTitle>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Lessons */}
      <div className="grid gap-4">
        {lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isCurrent = index === currentLesson;
          const isLocked = index > currentLesson && !isCompleted;

          return (
            <Card 
              key={lesson.id}
              className={`glass-card transition-all ${
                isCurrent ? 'border-purple-500/50 bg-purple-500/5' :
                isCompleted ? 'border-green-500/30' :
                isLocked ? 'border-gray-600/30 opacity-60' :
                'border-gray-500/20'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        isCompleted ? 'bg-green-500/20' :
                        isCurrent ? 'bg-purple-500/20' :
                        'bg-gray-600/20'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : isCurrent ? (
                          <Play className="w-5 h-5 text-purple-400" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
                        <p className="text-gray-400 text-sm">{lesson.description}</p>
                      </div>
                    </div>
                    
                    {isCurrent && (
                      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                        <p className="text-gray-300 mb-4">{lesson.content}</p>
                        <Button
                          onClick={() => handleCompleteLesson(lesson.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Complete Lesson
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {lesson.duration}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Reward */}
      {completedLessons.length === lessons.length && (
        <Card className="glass-card border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Congratulations!</h3>
            <p className="text-gray-400 mb-4">You've completed Trading Foundations</p>
            <Button
              onClick={onBack}
              className="bg-gradient-to-r from-yellow-600 to-orange-600"
            >
              <Target className="w-4 h-4 mr-2" />
              Continue Learning Journey
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleLearningPath;
