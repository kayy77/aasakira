
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, BookOpen } from 'lucide-react';

interface LessonContentProps {
  lesson: {
    id: string;
    title: string;
    content: string;
    keyPoints: string[];
    examples?: string[];
    duration: number;
  };
  onComplete: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({ lesson, onComplete }) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            {lesson.title}
          </CardTitle>
          <Badge className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lesson.duration} min
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-gray-300 leading-relaxed">
          {lesson.content}
        </div>
        
        {lesson.keyPoints.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-white font-semibold">Key Points:</h4>
            {lesson.keyPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{point}</span>
              </div>
            ))}
          </div>
        )}
        
        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
        >
          Complete Lesson
        </button>
      </CardContent>
    </Card>
  );
};

export default LessonContent;
