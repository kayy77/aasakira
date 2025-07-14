
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Brain } from 'lucide-react';
import { geminiEducationService } from '@/services/geminiEducationService';
import VisualExplanationCard from './VisualExplanationCard';
import { useToast } from '@/hooks/use-toast';

interface AasakiraAIButtonProps {
  topic?: string;
  context?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
}

const AasakiraAIButton: React.FC<AasakiraAIButtonProps> = ({
  topic,
  context,
  userLevel = 'intermediate'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const askAasakira = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    try {
      const fullContext = context ? `${context} - ${question}` : question;
      const aiResponse = await geminiEducationService.explainConcept(fullContext, userLevel);
      setResponse(aiResponse);
      setQuestion('');
      
      toast({
        title: "🧠 Aasakira AI Response",
        description: "Your personalized explanation is ready!"
      });
    } catch (error) {
      toast({
        title: "AI Unavailable",
        description: "Aasakira AI is having trouble right now. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAasakira();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:bg-purple-600/30 text-purple-300 hover:text-white"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Ask Aasakira AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gray-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            Ask Aasakira AI
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {topic && (
            <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
              <div className="text-sm text-purple-300">Current Topic: {topic}</div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about trading, SMC, risk management..."
              className="flex-1 bg-gray-800/50 border-purple-500/30"
              disabled={isLoading}
            />
            <Button
              onClick={askAasakira}
              disabled={!question.trim() || isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {response && (
            <VisualExplanationCard
              title="Aasakira AI Explanation"
              explanation={response.explanation}
              visualPrompt={response.visualPrompt}
              concepts={response.concepts}
            />
          )}

          <div className="text-xs text-gray-400 text-center">
            💡 Still confused? Ask follow-up questions for deeper understanding
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AasakiraAIButton;
