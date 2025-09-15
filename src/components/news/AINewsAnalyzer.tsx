import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AINewsAnalyzerProps {
  articles: Array<{
    id: number;
    title: string;
    description: string | null;
    source: string | null;
    content: string | null;
    published_at: string;
  }>;
}

interface MarketInsight {
  summary: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  keyPoints: string[];
  tradingOpportunities: string[];
  riskFactors: string[];
}

const AINewsAnalyzer = ({ articles }: AINewsAnalyzerProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const { toast } = useToast();

  const analyzeNews = async () => {
    if (articles.length === 0) return;

    setAnalyzing(true);
    try {
      // Prepare news data for AI analysis
      const newsText = articles.slice(0, 10).map(article => 
        `${article.title}: ${article.description || ''}`
      ).join('\n\n');

      const prompt = `
Analyze the following financial news headlines and provide a comprehensive market analysis.

News Headlines:
${newsText}

Please provide:
1. A 2-3 sentence market summary
2. Overall market sentiment (BULLISH, BEARISH, or NEUTRAL)
3. 3-5 key points affecting the markets
4. 2-3 potential trading opportunities
5. 2-3 key risk factors to watch

Format your response as JSON with this structure:
{
  "summary": "Brief market overview...",
  "sentiment": "BULLISH|BEARISH|NEUTRAL",
  "keyPoints": ["Point 1", "Point 2", ...],
  "tradingOpportunities": ["Opportunity 1", "Opportunity 2", ...],
  "riskFactors": ["Risk 1", "Risk 2", ...]
}
`;

      // Call Gemini AI service for analysis
      const { data, error } = await supabase.functions.invoke('gpt4o-chat', {
        body: { 
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4o-mini',
          temperature: 0.3
        }
      });

      if (error) throw error;

      try {
        const analysis = JSON.parse(data.response);
        setInsight(analysis);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        setInsight({
          summary: data.response,
          sentiment: 'NEUTRAL',
          keyPoints: ['Market analysis generated'],
          tradingOpportunities: ['Monitor key developments'],
          riskFactors: ['Stay informed of market changes']
        });
      }

      toast({
        title: "Analysis Complete",
        description: "AI market analysis has been generated",
      });

    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate AI market analysis",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'BEARISH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'NEUTRAL': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'BULLISH': return <TrendingUp className="h-4 w-4" />;
      case 'BEARISH': return <TrendingDown className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5 text-blue-400" />
          AI Market Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!insight ? (
          <div className="text-center py-6">
            <Button
              onClick={analyzeNews}
              disabled={analyzing || articles.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Analysis
                </>
              )}
            </Button>
            {articles.length === 0 && (
              <p className="text-zinc-400 text-sm mt-2">
                No news articles available for analysis
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Market Sentiment */}
            <div className="flex items-center gap-3">
              <Badge className={`${getSentimentColor(insight.sentiment)} border flex items-center gap-1`}>
                {getSentimentIcon(insight.sentiment)}
                {insight.sentiment} SENTIMENT
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeNews}
                disabled={analyzing}
                className="bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700"
              >
                {analyzing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Refresh Analysis'
                )}
              </Button>
            </div>

            {/* Market Summary */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Market Overview</h4>
              <p className="text-zinc-300 text-sm">{insight.summary}</p>
            </div>

            {/* Key Points */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Key Market Factors</h4>
              <ul className="space-y-1">
                {insight.keyPoints.map((point, index) => (
                  <li key={index} className="text-zinc-300 text-sm flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trading Opportunities */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Trading Opportunities</h4>
              <ul className="space-y-1">
                {insight.tradingOpportunities.map((opportunity, index) => (
                  <li key={index} className="text-green-300 text-sm flex items-start gap-2">
                    <TrendingUp className="h-3 w-3 mt-1 text-green-400" />
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Factors */}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Risk Factors</h4>
              <ul className="space-y-1">
                {insight.riskFactors.map((risk, index) => (
                  <li key={index} className="text-red-300 text-sm flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-1 text-red-400" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AINewsAnalyzer;