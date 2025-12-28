import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Camera, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TradeSetup } from '@/pages/SetupScanner';
import ImageUpload from './ImageUpload';

interface SetupFormProps {
  onAnalysisComplete: (setup: TradeSetup) => void;
}

const commonPairs = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURJPY', 'EURGBP', 'GBPJPY', 'XAUUSD', 'BTCUSD', 'ETHUSD'
];

const SetupForm: React.FC<SetupFormProps> = ({ onAnalysisComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<TradeSetup>>({
    pair: '',
    direction: 'BUY',
    entry_reason: '',
    entry_price: 0,
    stop_loss: 0,
    take_profit: 0,
    timeframe: '1H',
    risk_percentage: 2.0,
    market_structure: 'bullish',
    liquidity_sweep: 'none',
    session_context: 'london',
    status: 'PENDING'
  });

  const handleInputChange = (field: keyof TradeSetup, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadScreenshot = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('setup-screenshots')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('setup-screenshots')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.pair || !formData.entry_reason || !formData.entry_price || !formData.stop_loss || !formData.take_profit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let screenshotUrl = null;
      if (screenshotFile) {
        screenshotUrl = await uploadScreenshot(screenshotFile);
      }

      // Save to database with v1 scanner fields
      const setupData = {
        user_id: user.id,
        pair: formData.pair!,
        direction: formData.direction!,
        entry_reason: formData.entry_reason!,
        entry_price: formData.entry_price!,
        stop_loss: formData.stop_loss!,
        take_profit: formData.take_profit!,
        timeframe: formData.timeframe!,
        risk_percentage: formData.risk_percentage!,
        screenshot_url: screenshotUrl,
        status: 'PENDING' as const
      };
      
      // Pass v1 fields separately for AI analysis
      const v1Fields = {
        market_structure: formData.market_structure || 'bullish',
        liquidity_sweep: formData.liquidity_sweep || 'none',
        session_context: formData.session_context || 'london'
      };

      const { data: savedSetup, error: saveError } = await supabase
        .from('trade_setups')
        .insert(setupData)
        .select()
        .single();

      if (saveError) throw saveError;

      // Call AI analysis with v1 fields
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-trading-setup', {
          body: {
            setupId: savedSetup.id,
            setup: { ...savedSetup, ...v1Fields }
          }
        });

      if (analysisError) throw analysisError;

      toast({
        title: "Analysis Complete!",
        description: "Your trading setup has been analyzed successfully"
      });

      onAnalysisComplete(analysisData.setup);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your setup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Upload Your Trading Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Screenshot Upload */}
          <div className="space-y-2">
            <Label>Chart Screenshot</Label>
            <ImageUpload
              onImageSelect={setScreenshotFile}
              selectedImage={screenshotFile}
            />
          </div>

          {/* Pair Selection */}
          <div className="space-y-2">
            <Label htmlFor="pair">Currency Pair *</Label>
            <Select
              value={formData.pair}
              onValueChange={(value) => handleInputChange('pair', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a pair" />
              </SelectTrigger>
              <SelectContent>
                {commonPairs.map(pair => (
                  <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Direction and Timeframe */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Direction *</Label>
              <Select
                value={formData.direction}
                onValueChange={(value: 'BUY' | 'SELL') => handleInputChange('direction', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">BUY</SelectItem>
                  <SelectItem value="SELL">SELL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select
                value={formData.timeframe}
                onValueChange={(value) => handleInputChange('timeframe', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5M">5 Minutes</SelectItem>
                  <SelectItem value="15M">15 Minutes</SelectItem>
                  <SelectItem value="1H">1 Hour</SelectItem>
                  <SelectItem value="4H">4 Hours</SelectItem>
                  <SelectItem value="1D">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* V1 Scanner Fields - Market Structure, Liquidity, Session */}
          <div className="p-4 border border-primary/20 rounded-lg bg-primary/5 space-y-4">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Advanced Setup Context
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Market Structure</Label>
                <Select
                  value={formData.market_structure}
                  onValueChange={(value: 'bullish' | 'bearish' | 'ranging' | 'transition') => handleInputChange('market_structure', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bullish">Bullish</SelectItem>
                    <SelectItem value="bearish">Bearish</SelectItem>
                    <SelectItem value="ranging">Ranging</SelectItem>
                    <SelectItem value="transition">Transition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Liquidity Sweep</Label>
                <Select
                  value={formData.liquidity_sweep}
                  onValueChange={(value: 'confirmed' | 'anticipated' | 'none') => handleInputChange('liquidity_sweep', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="anticipated">Anticipated</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Session</Label>
                <Select
                  value={formData.session_context}
                  onValueChange={(value: 'london' | 'newyork' | 'asia' | 'london_ny_overlap' | 'off_hours') => handleInputChange('session_context', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="london">London</SelectItem>
                    <SelectItem value="newyork">New York</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="london_ny_overlap">London/NY Overlap</SelectItem>
                    <SelectItem value="off_hours">Off Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Entry Reason */}
          <div className="space-y-2">
            <Label htmlFor="entry_reason">Entry Reason / Setup Description *</Label>
            <Textarea
              id="entry_reason"
              placeholder="Break & retest of key level, liquidity sweep below previous low, displacement candle with FVG..."
              value={formData.entry_reason}
              onChange={(e) => handleInputChange('entry_reason', e.target.value)}
              rows={3}
            />
          </div>

          {/* Entry Price */}
          <div className="space-y-2">
            <Label htmlFor="entry_price">Entry Price *</Label>
            <Input
              id="entry_price"
              type="number"
              step="0.00001"
              placeholder="1.2550"
              value={formData.entry_price || ''}
              onChange={(e) => handleInputChange('entry_price', parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Stop Loss and Take Profit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stop_loss">Stop Loss *</Label>
              <Input
                id="stop_loss"
                type="number"
                step="0.00001"
                placeholder="1.2500"
                value={formData.stop_loss || ''}
                onChange={(e) => handleInputChange('stop_loss', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="take_profit">Take Profit *</Label>
              <Input
                id="take_profit"
                type="number"
                step="0.00001"
                placeholder="1.2600"
                value={formData.take_profit || ''}
                onChange={(e) => handleInputChange('take_profit', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Risk Percentage */}
          <div className="space-y-2">
            <Label htmlFor="risk_percentage">Risk % of Account</Label>
            <Input
              id="risk_percentage"
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              placeholder="2.0"
              value={formData.risk_percentage || ''}
              onChange={(e) => handleInputChange('risk_percentage', parseFloat(e.target.value) || 2.0)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Setup...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Analyze My Setup
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SetupForm;