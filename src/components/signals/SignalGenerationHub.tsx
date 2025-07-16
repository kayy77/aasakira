
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Brain, RefreshCw, Target, BookOpen, FileText, FlaskConical, Webhook, Share2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SignalGenerationHubProps {
  isGenerating: boolean;
  onGeneratePremium: () => void;
  onGenerateStandard: () => void;
  onShowMemory: () => void;
  onShowJournal: () => void;
  onShowABTesting: () => void;
  onShowDigest: () => void;
  onShowWebhook: () => void;
  onShowShare: () => void;
  lastGenerated: Date | null;
}

const SignalGenerationHub: React.FC<SignalGenerationHubProps> = ({
  isGenerating,
  onGeneratePremium,
  onGenerateStandard,
  onShowMemory,
  onShowJournal,
  onShowABTesting,
  onShowDigest,
  onShowWebhook,
  onShowShare,
  lastGenerated
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className="bg-gray-900/50 border border-blue-500/20">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="text-blue-400 flex items-center gap-2 text-lg md:text-xl">
          <Target className="w-4 h-4 md:w-5 md:h-5" />
          Signal Generation Hub
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Button
            onClick={onGeneratePremium}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-10 md:h-12 text-sm md:text-base"
          >
            {isGenerating ? (
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
            ) : (
              <Crown className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            )}
            Generate Premium Signal
          </Button>
          
          <Button
            onClick={onGenerateStandard}
            disabled={isGenerating}
            variant="outline"
            className="border-pink-500/30 text-pink-400 hover:bg-pink-500/20 h-10 md:h-12 text-sm md:text-base"
          >
            {isGenerating ? (
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
            ) : (
              <Brain className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            )}
            Generate Standard Signal
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onShowMemory}
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs md:text-sm"
          >
            <BookOpen className="w-3 h-3 mr-1" />
            {!isMobile && "Memory"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowJournal}
            className="border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs md:text-sm"
          >
            <FileText className="w-3 h-3 mr-1" />
            {!isMobile && "Journal"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowABTesting}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20 text-xs md:text-sm"
          >
            <FlaskConical className="w-3 h-3 mr-1" />
            {!isMobile && "A/B Test"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowDigest}
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20 text-xs md:text-sm"
          >
            <Brain className="w-3 h-3 mr-1" />
            {!isMobile && "Digest"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowWebhook}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-xs md:text-sm"
          >
            <Webhook className="w-3 h-3 mr-1" />
            {!isMobile && "Webhook"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowShare}
            className="border-pink-500/30 text-pink-400 hover:bg-pink-500/20 text-xs md:text-sm"
          >
            <Share2 className="w-3 h-3 mr-1" />
            {!isMobile && "Share"}
          </Button>
        </div>

        {lastGenerated && (
          <div className="text-center text-xs md:text-sm text-gray-400">
            Last generated: {lastGenerated.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SignalGenerationHub;
