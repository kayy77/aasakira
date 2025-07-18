
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Brain, Target } from 'lucide-react';

export interface LessonContentProps {
  lesson: {
    title: string;
    content: string;
    keyPoints: string[];
    learningObjectives: string[];
  };
  onComplete: () => void;
  onAskMentor: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({ lesson, onComplete, onAskMentor }) => {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Learning Objectives */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Learning Objectives
          </h4>
          <ul className="space-y-2">
            {lesson.learningObjectives.map((objective, index) => (
              <li key={index} className="text-gray-300 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                {objective}
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div className="prose prose-invert max-w-none">
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">
            {lesson.content}
          </div>
        </div>

        {/* Key Points */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <h4 className="text-purple-400 font-semibold mb-3">Key Points to Remember</h4>
          <div className="space-y-2">
            {lesson.keyPoints.map((point, index) => (
              <Badge key={index} variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30 mr-2 mb-2">
                {point}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onComplete}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Complete
          </Button>
          <Button
            onClick={onAskMentor}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
          >
            <Brain className="w-4 h-4 mr-2" />
            Ask AI Mentor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonContent;
