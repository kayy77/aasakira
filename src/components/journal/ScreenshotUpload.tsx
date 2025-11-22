import React, { useState, useCallback } from 'react';
import { Upload, Image, X, Camera, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ScreenshotUploadProps {
  onTradeExtracted: (tradeData: ExtractedTradeData) => void;
}

interface ExtractedTradeData {
  pair: string;
  entry_price: number;
  exit_price?: number;
  direction: 'LONG' | 'SHORT';
  lot_size?: number;
  pnl?: number;
  strategy?: string;
}

const ScreenshotUpload: React.FC<ScreenshotUploadProps> = ({ onTradeExtracted }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

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
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
      analyzeScreenshot(result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeScreenshot = async (imageData: string) => {
    setAnalyzing(true);
    
    try {
      // Call edge function to analyze screenshot with AI
      const { data, error } = await supabase.functions.invoke('analyze-trading-screenshot', {
        body: { imageData }
      });

      if (error) throw error;

      if (data?.tradeData) {
        onTradeExtracted(data.tradeData);
        toast({
          title: "Trade Extracted Successfully!",
          description: `Found ${data.tradeData.pair} ${data.tradeData.direction} trade`,
        });
      } else {
        toast({
          title: "Could not extract trade data",
          description: "Please verify the screenshot shows clear trade information",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error analyzing screenshot:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze the screenshot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
  };

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-400" />
          Screenshot Upload
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Upload your broker's profit/loss screenshot and AI will automatically extract the trade details
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {!uploadedImage ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? "border-purple-400 bg-purple-500/10" 
                  : "border-gray-600 hover:border-purple-500"
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
              
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-purple-400" />
                </div>
                
                <div>
                  <p className="text-white font-medium text-lg">Upload your P&L screenshot</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Drag & drop or click to select (PNG, JPG up to 10MB)
                  </p>
                </div>
                
                <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10">
                  <Image className="w-4 h-4 mr-2" />
                  Choose Screenshot
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded trade screenshot" 
                  className="w-full h-auto max-h-96 object-contain bg-gray-900"
                />
                <Button
                  onClick={clearImage}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {analyzing ? (
                <div className="flex items-center justify-center space-x-3 py-6 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  <span className="text-purple-300 font-medium">Analyzing your trade screenshot with AI...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3 py-6 bg-green-500/10 rounded-lg border border-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span className="text-green-300 font-medium">Trade data extracted successfully!</span>
                </div>
              )}

              <Button
                onClick={() => analyzeScreenshot(uploadedImage)}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Re-analyze Screenshot
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="font-semibold text-purple-400 mb-1">💡 Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Upload clear, high-quality screenshots from your broker</li>
              <li>Ensure trade details (pair, entry, exit, P&L) are visible</li>
              <li>Avoid blurry or cropped images</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScreenshotUpload;
