
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Download, Copy, Twitter, MessageCircle } from 'lucide-react';
import { SignalDNA } from '@/services/multiIntelligenceCore';
import { useToast } from '@/hooks/use-toast';

interface ShareableSignalCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  signal: SignalDNA | null;
}

const ShareableSignalCard: React.FC<ShareableSignalCardProps> = ({
  open,
  onOpenChange,
  signal
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  if (!signal) return null;

  const generateShareText = (includeResults = false) => {
    const frameworks = Object.values(signal.origin).filter(Boolean).length;
    const entry = typeof signal.structure.entry === 'number' ? signal.structure.entry : parseFloat(signal.structure.entry.toString());
    const baseText = `📈 ${signal.symbol} ${signal.type} (${frameworks}/6) – Hybrid Strategy – Confidence: ${signal.confidence}%`;
    
    if (includeResults) {
      // Simulate P/L for demo
      const pips = Math.floor(Math.random() * 50 + 10);
      return `${baseText} – +${pips} pips 💰\nPowered by Aasakira AI`;
    }
    
    return `${baseText}\nPowered by Aasakira AI`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateShareText());
    toast({
      title: "Copied to Clipboard",
      description: "Signal card text copied successfully",
    });
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    const url = `https://twitter.com/intent/tweet?text=${text}&hashtags=TradingSignals,ForexTrading,AasakiraAI`;
    window.open(url, '_blank');
  };

  const downloadAsImage = async () => {
    if (!cardRef.current) return;
    
    // For demo purposes, we'll create a simple download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 400;
    canvas.height = 600;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);
    
    // Add text content
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⛩️ AASAKIRA AI', 200, 50);
    
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`${signal.symbol} ${signal.type}`, 200, 120);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#8b5cf6';
    const frameworks = Object.values(signal.origin).filter(Boolean).length;
    ctx.fillText(`${frameworks}/6 Confluence`, 200, 160);
    
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`${signal.confidence}% Confidence`, 200, 190);
    
    ctx.fillStyle = '#ffffff';
    const entry = typeof signal.structure.entry === 'number' ? signal.structure.entry : parseFloat(signal.structure.entry.toString());
    const stopLoss = typeof signal.structure.stopLoss === 'number' ? signal.structure.stopLoss : parseFloat(signal.structure.stopLoss.toString());
    const takeProfit = typeof signal.structure.takeProfit === 'number' ? signal.structure.takeProfit : parseFloat(signal.structure.takeProfit.toString());
    
    ctx.fillText(`Entry: ${entry}`, 200, 240);
    ctx.fillText(`SL: ${stopLoss}`, 200, 270);
    ctx.fillText(`TP: ${takeProfit}`, 200, 300);
    ctx.fillText(`R/R: ${signal.structure.rr.toFixed(1)}:1`, 200, 330);
    
    // Simulate P/L
    const pips = Math.floor(Math.random() * 50 + 10);
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`+${pips} pips 💰`, 200, 400);
    
    ctx.font = '14px Arial';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Powered by Aasakira AI', 200, 520);
    
    // Download the image
    const link = document.createElement('a');
    link.download = `aasakira-signal-${signal.symbol}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Signal Card Downloaded",
      description: "Your shareable signal card has been saved",
    });
  };

  const frameworks = Object.values(signal.origin).filter(Boolean).length;
  const entry = typeof signal.structure.entry === 'number' ? signal.structure.entry : parseFloat(signal.structure.entry.toString());
  const stopLoss = typeof signal.structure.stopLoss === 'number' ? signal.structure.stopLoss : parseFloat(signal.structure.stopLoss.toString());
  const takeProfit = typeof signal.structure.takeProfit === 'number' ? signal.structure.takeProfit : parseFloat(signal.structure.takeProfit.toString());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-950 border-blue-500/30">
        <DialogHeader>
          <DialogTitle className="text-blue-400 text-xl flex items-center gap-2">
            <Share2 className="w-6 h-6" />
            🎮 Shareable Signal Card
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview Card */}
          <div ref={cardRef} className="relative">
            <Card className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-blue-500/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
              <CardContent className="relative z-10 p-6 text-center space-y-4">
                {/* Header */}
                <div className="text-xs text-blue-400 font-bold tracking-wide">
                  ⛩️ AASAKIRA AI SIGNAL
                </div>
                
                {/* Main Signal */}
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">
                    {signal.symbol} {signal.type}
                  </div>
                  <div className="flex justify-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-400">
                      {frameworks}/6 Confluence
                    </Badge>
                    <Badge className="bg-orange-500/20 text-orange-400">
                      {signal.confidence}% Confidence
                    </Badge>
                  </div>
                </div>
                
                {/* Trade Details */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Entry:</span>
                    <span className="font-mono">{entry}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Stop Loss:</span>
                    <span className="font-mono">{stopLoss}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Take Profit:</span>
                    <span className="font-mono">{takeProfit}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Risk/Reward:</span>
                    <span className="font-bold text-green-400">{signal.structure.rr.toFixed(1)}:1</span>
                  </div>
                </div>
                
                {/* Performance (Simulated) */}
                <div className="py-3 border-t border-gray-700/50">
                  <div className="text-2xl font-bold text-green-400">
                    +{Math.floor(Math.random() * 50 + 10)} pips 💰
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Hypothetical result for demonstration
                  </div>
                </div>
                
                {/* Footer */}
                <div className="text-xs text-gray-500 border-t border-gray-700/50 pt-3">
                  Powered by Aasakira AI
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </Button>
            
            <Button
              onClick={downloadAsImage}
              variant="outline"
              size="sm"
              className="border-green-500/30 text-green-400 hover:bg-green-500/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button
              onClick={shareOnTwitter}
              variant="outline"
              size="sm"
              className="border-blue-400/30 text-blue-300 hover:bg-blue-500/20"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
              onClick={() => {
                const text = generateShareText(true);
                if (navigator.share) {
                  navigator.share({ text });
                } else {
                  copyToClipboard();
                }
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          
          {/* Preview Text */}
          <div className="p-3 bg-gray-900/50 rounded border border-gray-700/30">
            <div className="text-xs text-gray-400 mb-2">Share Text Preview:</div>
            <div className="text-sm text-gray-300 font-mono">
              {generateShareText(true)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareableSignalCard;
