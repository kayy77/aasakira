
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Eye, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChartUploadAnalysisProps {
  onImageUpload?: (analysis: string) => void;
}

const ChartUploadAnalysis = ({ onImageUpload }: ChartUploadAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const sampleAnalyses = [
        "This looks like a bearish Break of Structure (BOS). I can see price has broken below the previous swing low, indicating potential downward momentum. I would wait for price to return to the imbalance around the 1.0924 level before considering a short entry. The market structure suggests bearish sentiment.",
        
        "I notice a Fair Value Gap (FVG) formation here. There's a clear imbalance between the three candles, and price will likely return to fill this gap. This could be a good entry opportunity when price retraces to the gap area. Wait for confirmation before entering.",
        
        "This chart shows a classic Order Block setup. The highlighted area represents where institutional traders likely placed their orders. Price has moved away and may return to this zone for a potential reversal. This is a high-probability setup in Smart Money Concepts.",
        
        "I see liquidity being targeted above the previous swing high. This is typical smart money behavior - they sweep liquidity (stop losses) before making their real move. After the liquidity grab, look for price to reverse and move in the opposite direction."
      ];
      
      const randomAnalysis = sampleAnalyses[Math.floor(Math.random() * sampleAnalyses.length)];
      setAnalysis(randomAnalysis);
      onImageUpload?.(randomAnalysis);
      setIsAnalyzing(false);
      
      toast({
        title: "✨ Chart Analyzed",
        description: "AI has provided detailed feedback on your chart",
      });
    }, 2000);
  };

  return (
    <Card className="glass-card border-cyan-500/20 bg-black/40 mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-300">
          <Eye className="w-5 h-5" />
          Chart Analysis
          <Badge className="bg-cyan-500/20 text-cyan-400">AI Powered</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis ? (
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <h3 className="text-sm font-medium text-white mb-2">Upload Your Chart</h3>
            <p className="text-xs text-gray-400 mb-4">
              Get instant AI feedback on your trading setup
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="chart-upload"
              disabled={isAnalyzing}
            />
            <Button
              asChild
              className="bg-gradient-to-r from-cyan-600 to-blue-600"
              disabled={isAnalyzing}
            >
              <label htmlFor="chart-upload" className="cursor-pointer">
                {isAnalyzing ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Chart Image
                  </>
                )}
              </label>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-4 rounded-lg border border-cyan-500/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-cyan-300 mb-2">AI Analysis:</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{analysis}</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => {
                setAnalysis(null);
                const input = document.getElementById('chart-upload') as HTMLInputElement;
                if (input) input.value = '';
              }}
              variant="outline"
              className="w-full border-gray-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Another Chart
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartUploadAnalysis;
