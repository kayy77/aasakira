
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, TrendingUp, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { groqService } from '@/services/groqService';

interface TradeAnalysis {
  strengthRating: number;
  violations: string[];
  strengths: string[];
  suggestions: string[];
  revisedSetup?: {
    entry: number;
    stop: number;
    tp: number;
    reasoning: string;
  };
}

const ManualTradeAnalyzer: React.FC = () => {
  const [formData, setFormData] = useState({
    pair: '',
    direction: 'BUY',
    entry: '',
    stop: '',
    tp: '',
    timeframe: '15M',
    reasoning: ''
  });
  const [analysis, setAnalysis] = useState<TradeAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const { toast } = useToast();

  const analyzeTradeSetup = async () => {
    if (!formData.pair || !formData.entry || !formData.stop || !formData.tp) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required trade details",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const riskReward = Math.abs(Number(formData.tp) - Number(formData.entry)) / 
                         Math.abs(Number(formData.entry) - Number(formData.stop));

      const prompt = `Analyze this ${formData.direction} trade setup on ${formData.pair}:

Entry: ${formData.entry}
Stop Loss: ${formData.stop}
Take Profit: ${formData.tp}
Timeframe: ${formData.timeframe}
Risk:Reward: ${riskReward.toFixed(2)}
Reasoning: ${formData.reasoning}

Evaluate based on:
- SMC (Smart Money Concepts)
- BOS (Break of Structure) 
- FVG (Fair Value Gaps)
- Liquidity sweeps
- Session timing
- Risk management
- Confluence factors

Provide:
1. Strength rating (1-10)
2. ✅ Strengths 
3. ❌ Violations/Issues
4. 💡 Suggestions for improvement
5. Revised setup if needed

Be direct and elite-level critical. No fluff.`;

      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 1000
      });

      // Parse the response into structured data
      const analysisData = parseAnalysisResponse(response);
      setAnalysis(analysisData);

    } catch (error) {
      console.error('Error analyzing trade:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze trade setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseAnalysisResponse = (response: string): TradeAnalysis => {
    const lines = response.split('\n');
    
    // Extract strength rating
    const ratingMatch = response.match(/(\d+)\/10|rating[:\s]*(\d+)/i);
    const strengthRating = ratingMatch ? parseInt(ratingMatch[1] || ratingMatch[2]) : 5;

    // Extract violations and strengths
    const violations: string[] = [];
    const strengths: string[] = [];
    const suggestions: string[] = [];

    lines.forEach(line => {
      if (line.includes('❌') || line.includes('violation') || line.includes('issue')) {
        violations.push(line.replace(/❌|violation|issue/gi, '').trim());
      } else if (line.includes('✅') || line.includes('strength')) {
        strengths.push(line.replace(/✅|strength/gi, '').trim());
      } else if (line.includes('💡') || line.includes('suggest')) {
        suggestions.push(line.replace(/💡|suggest/gi, '').trim());
      }
    });

    return {
      strengthRating,
      violations: violations.filter(v => v.length > 0),
      strengths: strengths.filter(s => s.length > 0),
      suggestions: suggestions.filter(s => s.length > 0)
    };
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      toast({
        title: "Chart Uploaded",
        description: "Chart screenshot uploaded for analysis"
      });
    }
  };

  const getStrengthColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Elite Trade Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pair" className="text-gray-300">Currency Pair</Label>
              <Input
                id="pair"
                placeholder="EURUSD"
                value={formData.pair}
                onChange={(e) => setFormData({...formData, pair: e.target.value.toUpperCase()})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="direction" className="text-gray-300">Direction</Label>
              <Select value={formData.direction} onValueChange={(value) => setFormData({...formData, direction: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeframe" className="text-gray-300">Timeframe</Label>
              <Select value={formData.timeframe} onValueChange={(value) => setFormData({...formData, timeframe: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1M">1M</SelectItem>
                  <SelectItem value="5M">5M</SelectItem>
                  <SelectItem value="15M">15M</SelectItem>
                  <SelectItem value="1H">1H</SelectItem>
                  <SelectItem value="4H">4H</SelectItem>
                  <SelectItem value="1D">1D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="entry" className="text-gray-300">Entry Price</Label>
              <Input
                id="entry"
                type="number"
                step="0.00001"
                placeholder="1.08500"
                value={formData.entry}
                onChange={(e) => setFormData({...formData, entry: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="stop" className="text-gray-300">Stop Loss</Label>
              <Input
                id="stop"
                type="number"
                step="0.00001"
                placeholder="1.08200"
                value={formData.stop}
                onChange={(e) => setFormData({...formData, stop: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="tp" className="text-gray-300">Take Profit</Label>
              <Input
                id="tp"
                type="number"
                step="0.00001"
                placeholder="1.09200"
                value={formData.tp}
                onChange={(e) => setFormData({...formData, tp: e.target.value})}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reasoning" className="text-gray-300">Trade Reasoning</Label>
            <Textarea
              id="reasoning"
              placeholder="Explain your trade setup, confluence factors, and reasoning..."
              value={formData.reasoning}
              onChange={(e) => setFormData({...formData, reasoning: e.target.value})}
              className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="chart" className="text-gray-300">Chart Screenshot (Optional)</Label>
            <div className="mt-2">
              <input
                id="chart"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('chart')?.click()}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadedImage ? uploadedImage.name : 'Upload Chart'}
              </Button>
            </div>
          </div>

          <Button
            onClick={analyzeTradeSetup}
            disabled={isAnalyzing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isAnalyzing ? (
              <>
                <TrendingUp className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing Trade Setup...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyze Trade Setup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card className="glass-card border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>Elite Analysis Results</span>
              <Badge className={`text-2xl font-bold ${getStrengthColor(analysis.strengthRating)}`}>
                {analysis.strengthRating}/10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {analysis.strengths.length > 0 && (
              <div>
                <h3 className="text-green-400 font-semibold mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Strengths
                </h3>
                <div className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.violations.length > 0 && (
              <div>
                <h3 className="text-red-400 font-semibold mb-3 flex items-center">
                  <X className="w-5 h-5 mr-2" />
                  Violations & Issues
                </h3>
                <div className="space-y-2">
                  {analysis.violations.map((violation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{violation}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div>
                <h3 className="text-yellow-400 font-semibold mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Improvement Suggestions
                </h3>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ManualTradeAnalyzer;
