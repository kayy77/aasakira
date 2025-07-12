
import React, { useState, useCallback } from 'react';
import { Upload, Image, X, Camera, FileImage } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageAnalysis: (analysis: string) => void;
}

const ImageUpload = ({ onImageAnalysis }: ImageUploadProps) => {
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

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
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
      analyzeImage(result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true);
    
    // Simulate AI image analysis - in production, this would call an AI vision API
    setTimeout(() => {
      const analyses = [
        "I can see this is an EUR/USD chart showing a bullish flag pattern. The price has broken above the flag resistance around 1.0850. This is a continuation pattern suggesting further upside. Consider a long position with entry above 1.0855, stop loss at 1.0820, and target at 1.0920. The risk-reward ratio is approximately 1:2.",
        
        "This appears to be a Gold (XAU/USD) chart displaying a head and shoulders reversal pattern. The right shoulder is forming, and if price breaks below the neckline at $1,950, we could see a move down to $1,920. Wait for the breakout confirmation before entering short.",
        
        "I notice this BTC/USD chart shows a falling wedge pattern, which is typically bullish. The volume is decreasing as price consolidates, which is characteristic of this pattern. Watch for a breakout above $28,500 for a potential long opportunity targeting $30,000.",
        
        "This GBP/JPY chart displays strong support at the 180.50 level. Price has tested this level multiple times and bounced. The RSI is showing bullish divergence. Consider a long position at current levels with stop below 180.20 and target at 182.80.",
      ];
      
      const randomAnalysis = analyses[Math.floor(Math.random() * analyses.length)];
      onImageAnalysis(randomAnalysis);
      setAnalyzing(false);
      
      toast({
        title: "Analysis Complete",
        description: "I've analyzed your chart and provided insights below.",
      });
    }, 2000);
  };

  const clearImage = () => {
    setUploadedImage(null);
  };

  return (
    <Card className="glass-card border-purple-500/20">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Camera className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Chart Analysis</h3>
          </div>

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
                <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-purple-400" />
                </div>
                
                <div>
                  <p className="text-white font-medium">Upload your trading chart</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Drag & drop or click to select (PNG, JPG up to 10MB)
                  </p>
                </div>
                
                <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/10">
                  <FileImage className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded chart" 
                  className="w-full h-64 object-contain bg-gray-900 rounded-lg"
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
              
              {analyzing && (
                <div className="flex items-center justify-center space-x-2 py-4">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-purple-300">Analyzing your chart...</span>
                </div>
              )}

              <Button
                onClick={() => analyzeImage(uploadedImage)}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                {analyzing ? "Analyzing..." : "Re-analyze Chart"}
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            💡 Upload screenshots of your charts and I'll provide detailed technical analysis, 
            entry/exit points, and trading recommendations based on what I see.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
