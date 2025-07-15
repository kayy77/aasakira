
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  BarChart3, 
  CheckCircle, 
  Target,
  TrendingUp,
  Eye
} from 'lucide-react';

interface LessonCardProps {
  topic: string;
  strategy: string;
  rule: string;
  visual: string;
  onPractice?: () => void;
}

const LessonCard = ({ topic, strategy, rule, visual, onPractice }: LessonCardProps) => {
  return (
    <Card className="glass-card border-blue-500/20 bg-gradient-to-br from-blue-900/10 to-purple-900/10 mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-300">
          <BookOpen className="w-5 h-5" />
          Mini Lesson Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topic */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Topic:</div>
            <div className="text-sm font-medium text-white">{topic}</div>
          </div>
        </div>

        {/* Strategy */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Strategy:</div>
            <div className="text-sm font-medium text-white">{strategy}</div>
          </div>
        </div>

        {/* Rule */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Rule:</div>
            <div className="text-sm font-medium text-white">{rule}</div>
          </div>
        </div>

        {/* Visual */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Visual:</div>
            <div className="text-sm font-medium text-white">{visual}</div>
          </div>
        </div>

        {/* Practice Button */}
        {onPractice && (
          <Button
            onClick={onPractice}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Target className="w-4 h-4 mr-2" />
            Practice This Concept
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonCard;
