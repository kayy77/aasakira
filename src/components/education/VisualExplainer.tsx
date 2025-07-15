
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Image, 
  TrendingUp, 
  BarChart3, 
  Eye, 
  Download,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { hybridAIService, type AIResponse } from '@/services/hybridAIService';
import { useToast } from '@/hooks/use-toast';

interface VisualExplainerProps {
  message: string;
  userContext?: any;
  onAnalysisComplete?: (response: AIResponse) => void;
}

const VisualExplainer = ({ message, userContext = {}, onAnalysisComplete }: VisualExplainerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [showVisual, setShowVisual] = useState(false);
  const { toast } = useToast();

  const generateExplanation = async (includeVisual: boolean = false) => {
    setIsLoading(true);
    setShowVisual(includeVisual);

    try {
      const aiResponse = await hybridAIService.generateComprehensiveResponse(
        message,
        userContext,
        includeVisual
      );

      setResponse(aiResponse);
      onAnalysisComplete?.(aiResponse);

      toast({
        title: includeVisual ? "Visual Analysis Complete!" : "Analysis Complete!",
        description: includeVisual 
          ? "Your trading explanation with visual chart has been generated."
          : "Your trading explanation is ready.",
      });

    } catch (error) {
      console.error('Visual explainer error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to generate explanation.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadVisual = () => {
    if (response?.visualUrl) {
      const link = document.createElement('a');
      link.href = response.visualUrl;
      link.download = `trading-chart-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            AI Visual Explainer
            <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500">
              Enhanced
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => generateExplanation(false)}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {isLoading && !showVisual ? 'Analyzing...' : 'Generate Analysis'}
            </Button>
            
            <Button
              onClick={() => generateExplanation(true)}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Image className="w-4 h-4 mr-2" />
              {isLoading && showVisual ? 'Creating Visual...' : 'Generate with Chart'}
            </Button>
          </div>

          {/* Rate Limit Indicator */}
          <div className="text-xs text-gray-400 text-center">
            AI calls and visual generations are rate limited to prevent overuse
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card className="glass-card border-blue-500/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                <span className="text-purple-400">
                  {showVisual ? 'Generating visual chart explanation...' : 'Analyzing trading concepts...'}
                </span>
              </div>
              <Skeleton className="h-4 w-full bg-gray-700/50" />
              <Skeleton className="h-4 w-3/4 bg-gray-700/50" />
              {showVisual && (
                <>
                  <Skeleton className="h-32 w-full bg-gray-700/50" />
                  <div className="text-xs text-gray-500">Creating professional trading chart...</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Response Display */}
      {response && !isLoading && (
        <div className="space-y-6">
          {/* Analysis Card */}
          <Card className="glass-card border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
                  Trading Analysis
                </div>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Confidence: {Math.round((response.confidence || 0) * 100)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {response.text}
                </div>
              </div>

              {/* Trading Analysis Details */}
              {response.analysis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-gray-800/30 rounded-lg">
                  {response.analysis.pair && (
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Pair</div>
                      <div className="text-lg font-bold text-blue-400">{response.analysis.pair}</div>
                    </div>
                  )}
                  {response.analysis.timeframe && (
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Timeframe</div>
                      <div className="text-lg font-bold text-purple-400">{response.analysis.timeframe}</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Trend</div>
                    <div className={`text-lg font-bold ${
                      response.analysis.trend === 'bullish' ? 'text-green-400' :
                      response.analysis.trend === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {response.analysis.trend?.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visual Chart Display */}
          {response.visualUrl && (
            <Card className="glass-card border-pink-500/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-pink-400" />
                    Visual Chart Analysis
                  </div>
                  <Button
                    onClick={downloadVisual}
                    size="sm"
                    variant="outline"
                    className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <img
                    src={response.visualUrl}
                    alt="Trading Chart Analysis"
                    className="w-full h-auto rounded-lg shadow-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
                      AI Generated
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Levels Display */}
          {response.analysis?.keyLevels && response.analysis.keyLevels.length > 0 && (
            <Card className="glass-card border-yellow-500/20">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-400" />
                  Key Trading Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {response.analysis.keyLevels.map((level, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        level.type === 'support' ? 'border-green-500/30 bg-green-500/10' :
                        level.type === 'resistance' ? 'border-red-500/30 bg-red-500/10' :
                        'border-blue-500/30 bg-blue-500/10'
                      }`}
                    >
                      <div className="text-sm text-gray-400 capitalize">{level.type.replace('_', ' ')}</div>
                      <div className="text-lg font-mono font-bold text-white">{level.level}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default VisualExplainer;
