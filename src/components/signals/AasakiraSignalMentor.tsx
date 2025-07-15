
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  TrendingDown,
  X,
  Play,
  Pause,
  BarChart3,
  Target,
  Lightbulb,
  Eye
} from 'lucide-react';
import TradingViewChart from '@/components/features/TradingViewChart';
import { motion, AnimatePresence } from 'framer-motion';

interface AasakiraSignalMentorProps {
  signal: any;
  isOpen: boolean;
  onClose: () => void;
}

const AasakiraSignalMentor: React.FC<AasakiraSignalMentorProps> = ({
  signal,
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [explanationSteps, setExplanationSteps] = useState<any[]>([]);

  const isBuy = signal?.type === 'BUY' || signal?.structure?.takeProfit > signal?.structure?.entry;

  useEffect(() => {
    if (signal) {
      generateExplanationSteps();
    }
  }, [signal]);

  const generateExplanationSteps = () => {
    const steps = [
      {
        title: "📊 Market Setup Overview",
        content: `Hey there! I'm Aasakira, and I'm excited to walk you through this ${isBuy ? 'BUY' : 'SELL'} signal on ${signal.pair || signal.symbol}. Let me show you exactly what I'm seeing in the charts and why this setup caught my attention.`,
        chartFocus: "overview",
        annotations: []
      },
      {
        title: "🎯 Entry Point Analysis", 
        content: `Look at this entry level at ${signal.entry || signal.structure?.entry}. This isn't random - notice how price previously rejected from this area? That's called a 'key level' and it's where smart money tends to position themselves.`,
        chartFocus: "entry",
        annotations: [
          { price: signal.entry || signal.structure?.entry, type: "entry", label: "ENTRY ZONE" }
        ]
      },
      {
        title: "🛡️ Risk Management",
        content: `Your stop loss is at ${signal.stopLoss || signal.structure?.stopLoss}. This protects you if the trade goes against us. Notice how it's placed beyond the previous structure? That's institutional-level risk management right there!`,
        chartFocus: "risk",
        annotations: [
          { price: signal.stopLoss || signal.structure?.stopLoss, type: "stop", label: "STOP LOSS" },
          { price: signal.entry || signal.structure?.entry, type: "entry", label: "ENTRY" }
        ]
      },
      {
        title: "💰 Profit Target",
        content: `Our take profit is set at ${signal.takeProfit || signal.structure?.takeProfit}. This level is based on previous price action and gives us a risk-to-reward ratio of ${signal.riskReward || signal.structure?.rr || '2.5'}:1. This means for every $1 we risk, we could make $${signal.riskReward || signal.structure?.rr || '2.5'}!`,
        chartFocus: "target",
        annotations: [
          { price: signal.takeProfit || signal.structure?.takeProfit, type: "target", label: "TAKE PROFIT" },
          { price: signal.entry || signal.structure?.entry, type: "entry", label: "ENTRY" },
          { price: signal.stopLoss || signal.structure?.stopLoss, type: "stop", label: "STOP LOSS" }
        ]
      },
      {
        title: "🧠 Why This Setup Works",
        content: `This setup has a ${signal.confidence || '85'}% confidence because multiple factors align: ${signal.reasons?.join(', ') || 'market structure, volume confirmation, and institutional patterns'}. It's like having multiple experts agree - much more reliable than a single indicator!`,
        chartFocus: "confluence",
        annotations: []
      },
      {
        title: "⚡ Next Steps",
        content: `Remember: Never risk more than 1-2% of your account on any single trade. Set your stop loss BEFORE entering, and stick to it! This is how professional traders protect their capital and stay profitable long-term.`,
        chartFocus: "summary",
        annotations: []
      }
    ];
    
    setExplanationSteps(steps);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= explanationSteps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 5000);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  if (!signal) return null;

  const currentExplanation = explanationSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="gradient-text text-xl">Ask Aasakira</span>
              <div className="flex items-center gap-2 mt-1">
                {isBuy ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm text-gray-400">
                  {signal.pair || signal.symbol} • {isBuy ? 'BUY' : 'SELL'} Signal Analysis
                </span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Live Chart Analysis
              </h3>
              <div className="flex gap-2">
                {!isPlaying ? (
                  <Button onClick={handlePlay} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-1" />
                    Auto Explain
                  </Button>
                ) : (
                  <Button onClick={handlePause} size="sm" className="bg-red-600 hover:bg-red-700">
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </Button>
                )}
              </div>
            </div>
            
            <div className="relative">
              <TradingViewChart
                symbol={`FX:${signal.pair || signal.symbol}`}
                width="100%"
                height="400"
                interval="15"
                theme="dark"
                container_id={`chart_${signal.id || Date.now()}`}
              />
              
              {/* Chart Annotations Overlay */}
              {currentExplanation?.annotations && (
                <div className="absolute inset-0 pointer-events-none">
                  {currentExplanation.annotations.map((annotation, index) => (
                    <div
                      key={index}
                      className={`absolute right-4 px-2 py-1 rounded text-xs font-bold ${
                        annotation.type === 'entry' ? 'bg-blue-500/80 text-white' :
                        annotation.type === 'stop' ? 'bg-red-500/80 text-white' :
                        annotation.type === 'target' ? 'bg-green-500/80 text-white' :
                        'bg-gray-500/80 text-white'
                      }`}
                      style={{ 
                        top: `${20 + (index * 40)}px`,
                        transform: 'translateY(-50%)'
                      }}
                    >
                      {annotation.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Step Navigation */}
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
              <Button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                size="sm"
                variant="outline"
                className="border-gray-600"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Step {currentStep + 1} of {explanationSteps.length}
                </span>
                <div className="flex gap-1">
                  {explanationSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentStep ? 'bg-purple-500' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <Button
                onClick={() => setCurrentStep(Math.min(explanationSteps.length - 1, currentStep + 1))}
                disabled={currentStep === explanationSteps.length - 1}
                size="sm"
                variant="outline"
                className="border-gray-600"
              >
                Next
              </Button>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {currentExplanation && (
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="text-purple-400 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        {currentExplanation.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        {currentExplanation.content}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Signal Details */}
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Signal Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Pair:</span>
                            <span className="text-white font-bold">{signal.pair || signal.symbol}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Direction:</span>
                            <Badge className={`${isBuy ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border-0`}>
                              {isBuy ? 'BUY' : 'SELL'}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Confidence:</span>
                            <span className="text-purple-400 font-bold">{signal.confidence || '85'}%</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Entry:</span>
                            <span className="text-blue-400 font-mono">{signal.entry || signal.structure?.entry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Stop Loss:</span>
                            <span className="text-red-400 font-mono">{signal.stopLoss || signal.structure?.stopLoss}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Take Profit:</span>
                            <span className="text-green-400 font-mono">{signal.takeProfit || signal.structure?.takeProfit}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Brain className="w-4 h-4 mr-2" />
                Got It, Thanks Aasakira!
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AasakiraSignalMentor;
