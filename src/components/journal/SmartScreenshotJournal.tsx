import React, { useState, useCallback } from 'react';
import { Upload, Camera, Loader2, CheckCircle, X, AlertCircle, Edit2, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ExtractedTrade {
  pair: string;
  direction: 'LONG' | 'SHORT';
  entry_price?: number;
  exit_price?: number;
  lot_size?: number;
  pnl?: number;
  date?: string;
  time?: string;
  confidence: number;
}

interface SmartScreenshotJournalProps {
  onTradesSaved: () => void;
}

const SmartScreenshotJournal: React.FC<SmartScreenshotJournalProps> = ({ onTradesSaved }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedTrades, setExtractedTrades] = useState<ExtractedTrade[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [platform, setPlatform] = useState<string>('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image (PNG, JPG, WEBP)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Max 10MB allowed",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      setExtractedTrades([]);
      analyzeScreenshot(result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeScreenshot = async (imageData: string) => {
    setAnalyzing(true);
    
    try {
      console.log('📤 Analyzing screenshot...');
      
      const { data, error } = await supabase.functions.invoke('analyze-trading-screenshot', {
        body: { imageData }
      });

      if (error) throw error;

      if (data?.success === false) {
        toast({
          title: "Not a trading screenshot",
          description: data?.userMessage || "Please upload a broker trade history",
          variant: "destructive"
        });
        setAnalyzing(false);
        return;
      }

      if (data?.tradeData) {
        const trades = Array.isArray(data.tradeData) ? data.tradeData : [data.tradeData];
        setExtractedTrades(trades);
        setPlatform(data?.metadata?.platform || 'Unknown');
        
        toast({
          title: `✅ ${trades.length} Trade${trades.length > 1 ? 's' : ''} Found!`,
          description: `${data?.metadata?.platform || 'Platform'} • Review and save below`,
        });
      } else {
        toast({
          title: "No trades found",
          description: "Could not extract trade data from this screenshot",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error?.message || "Please try a clearer screenshot",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const updateTrade = (index: number, field: keyof ExtractedTrade, value: any) => {
    setExtractedTrades(prev => prev.map((trade, i) => 
      i === index ? { ...trade, [field]: value } : trade
    ));
  };

  const removeTrade = (index: number) => {
    setExtractedTrades(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Trade removed" });
  };

  const saveAllTrades = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to save trades",
        variant: "destructive"
      });
      return;
    }

    if (extractedTrades.length === 0) {
      toast({
        title: "No trades to save",
        description: "Extract trades from a screenshot first",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    let savedCount = 0;

    try {
      for (const trade of extractedTrades) {
        // Build trade date from extracted data or use today
        let entryTime = new Date();
        if (trade.date) {
          try {
            const parsedDate = new Date(trade.date);
            if (!isNaN(parsedDate.getTime())) {
              entryTime = parsedDate;
              if (trade.time) {
                const [hours, minutes] = trade.time.split(':').map(Number);
                entryTime.setHours(hours || 0, minutes || 0);
              }
            }
          } catch (e) {
            console.warn('Could not parse date:', trade.date);
          }
        }

        // Calculate pips if we have entry/exit
        let resultPips = null;
        if (trade.entry_price && trade.exit_price) {
          const pipMultiplier = trade.pair?.includes('JPY') ? 100 : 
                               trade.pair?.includes('XAU') ? 10 : 10000;
          resultPips = trade.direction === 'LONG' 
            ? (trade.exit_price - trade.entry_price) * pipMultiplier
            : (trade.entry_price - trade.exit_price) * pipMultiplier;
        }

        const entryData = {
          user_id: user.id,
          pair: trade.pair?.toUpperCase() || 'UNKNOWN',
          direction: trade.direction || 'LONG',
          entry_price: trade.entry_price || 0,
          exit_price: trade.exit_price || null,
          entry_time: entryTime.toISOString(),
          exit_time: trade.exit_price ? entryTime.toISOString() : null,
          lot_size: trade.lot_size || null,
          result_pips: resultPips ? Math.round(resultPips * 10) / 10 : null,
          result_percentage: trade.pnl ? (trade.pnl > 0 ? trade.pnl : trade.pnl) : null,
          status: trade.exit_price || trade.pnl ? 'CLOSED' : 'OPEN',
          strategy: `AI-Extracted (${platform})`, // Auto-tag as AI extracted
          notes: `Auto-extracted from screenshot. P/L: ${trade.pnl ? `$${trade.pnl}` : 'N/A'} | Confidence: ${trade.confidence}%`,
          fees: 0
        };

        console.log('💾 Saving trade:', entryData);

        const { error } = await supabase
          .from('journal_entries')
          .insert(entryData);

        if (error) {
          console.error('Error saving trade:', error);
        } else {
          savedCount++;
        }
      }

      if (savedCount > 0) {
        toast({
          title: `✅ ${savedCount} Trade${savedCount > 1 ? 's' : ''} Saved!`,
          description: "Your trades have been added to the journal",
        });
        
        // Clear state and notify parent
        setExtractedTrades([]);
        setUploadedImage(null);
        setPlatform('');
        onTradesSaved();
      } else {
        toast({
          title: "Save Failed",
          description: "Could not save any trades. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save trades",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const clearAll = () => {
    setUploadedImage(null);
    setExtractedTrades([]);
    setPlatform('');
    setEditingIndex(null);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-foreground flex items-center gap-2 text-lg">
          <Camera className="w-5 h-5 text-primary" />
          Smart Screenshot Journal
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Upload your P/L screenshot → AI extracts Date, Profit, Pair → Auto-saved to journal
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        {!uploadedImage ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              dragActive 
                ? "border-primary bg-primary/10" 
                : "border-muted-foreground/30 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-medium">Drop your P/L screenshot here</p>
                <p className="text-muted-foreground text-xs mt-1">
                  PNG, JPG, WEBP • Max 10MB • Works with MT4/5, cTrader, Binance, any broker
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative rounded-lg overflow-hidden bg-background">
              <img 
                src={uploadedImage} 
                alt="Trade screenshot" 
                className="w-full h-auto max-h-48 object-contain"
              />
              <Button
                onClick={clearAll}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Analysis Status */}
            {analyzing && (
              <div className="flex items-center justify-center gap-2 py-4 bg-primary/10 rounded-lg">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-primary font-medium">AI is extracting trades...</span>
              </div>
            )}

            {/* Extracted Trades */}
            {extractedTrades.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Extracted Trades ({extractedTrades.length})
                  </h4>
                  <Badge variant="outline" className="text-xs">{platform}</Badge>
                </div>

                {extractedTrades.map((trade, index) => (
                  <div 
                    key={index} 
                    className="bg-background/50 border border-border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={trade.direction === 'LONG' ? 'default' : 'destructive'} className="text-xs">
                          {trade.direction}
                        </Badge>
                        {editingIndex === index ? (
                          <Input 
                            value={trade.pair}
                            onChange={(e) => updateTrade(index, 'pair', e.target.value.toUpperCase())}
                            className="h-7 w-24 text-xs"
                          />
                        ) : (
                          <span className="font-semibold text-foreground">{trade.pair}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive"
                          onClick={() => removeTrade(index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">P/L:</span>
                        {editingIndex === index ? (
                          <Input 
                            type="number"
                            value={trade.pnl || ''}
                            onChange={(e) => updateTrade(index, 'pnl', parseFloat(e.target.value))}
                            className="h-6 mt-1 text-xs"
                            placeholder="$"
                          />
                        ) : (
                          <p className={`font-semibold ${(trade.pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.pnl ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '—'}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        {editingIndex === index ? (
                          <Input 
                            type="date"
                            value={trade.date || ''}
                            onChange={(e) => updateTrade(index, 'date', e.target.value)}
                            className="h-6 mt-1 text-xs"
                          />
                        ) : (
                          <p className="text-foreground">{trade.date || 'Today'}</p>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Confidence:</span>
                        <p className={`font-medium ${trade.confidence >= 80 ? 'text-green-500' : trade.confidence >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {trade.confidence}%
                        </p>
                      </div>
                    </div>

                    {(trade.entry_price || trade.exit_price) && (
                      <div className="text-xs text-muted-foreground">
                        Entry: {trade.entry_price || '—'} → Exit: {trade.exit_price || '—'}
                        {trade.lot_size && ` • Lot: ${trade.lot_size}`}
                      </div>
                    )}
                  </div>
                ))}

                {/* Save Button */}
                <Button
                  onClick={saveAllTrades}
                  disabled={saving || extractedTrades.length === 0}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save {extractedTrades.length} Trade{extractedTrades.length > 1 ? 's' : ''} to Journal
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Re-analyze Button */}
            {!analyzing && extractedTrades.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">No trades found. Try a clearer screenshot.</span>
                <Button
                  onClick={() => analyzeScreenshot(uploadedImage)}
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Supported Platforms */}
        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <span className="font-medium text-primary">✅ Auto-extracts:</span> Date, P/L, Pair, Direction from MT4/5, cTrader, Deriv, Binance, TradingView screenshots
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartScreenshotJournal;
