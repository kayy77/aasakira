
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Image, RefreshCw, Brain } from 'lucide-react';
import { replicateService } from '@/services/replicateService';
import { useToast } from '@/hooks/use-toast';

interface VisualExplanationCardProps {
  title: string;
  explanation: string;
  visualPrompt?: string;
  concepts: string[];
  grade?: number;
}

const VisualExplanationCard: React.FC<VisualExplanationCardProps> = ({
  title,
  explanation,
  visualPrompt,
  concepts,
  grade
}) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateVisual = async () => {
    if (!visualPrompt) return;

    setIsGenerating(true);
    try {
      const response = await replicateService.generateTradingChart({
        prompt: visualPrompt,
        chartType: 'smc_analysis'
      });

      if (response.status === 'success' && response.imageUrl) {
        setGeneratedImage(response.imageUrl);
        toast({
          title: "📊 Visual Generated!",
          description: "Your trading concept has been visualized"
        });
      } else {
        throw new Error(response.error || 'Failed to generate visual');
      }
    } catch (error) {
      toast({
        title: "Visual Generation Failed",
        description: "Unable to create visual explanation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card border-purple-500/20 hover:border-purple-400/40 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            {title}
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          {grade && (
            <Badge className={`${
              grade >= 8 ? 'bg-green-500/20 text-green-400' :
              grade >= 6 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {grade}/10
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Explanation */}
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
            {explanation}
          </div>
        </div>

        {/* Concepts */}
        {concepts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {concepts.map((concept, index) => (
              <Badge key={index} variant="outline" className="border-purple-500/30 text-purple-300">
                {concept}
              </Badge>
            ))}
          </div>
        )}

        {/* Visual Generation */}
        {visualPrompt && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">Visual Explanation</h4>
              <Button
                onClick={generateVisual}
                disabled={isGenerating}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Image className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Visual'}
              </Button>
            </div>

            {generatedImage && (
              <div className="rounded-lg overflow-hidden border border-purple-500/30">
                <img
                  src={generatedImage}
                  alt="AI Generated Trading Visual"
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualExplanationCard;
