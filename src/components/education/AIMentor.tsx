import React, { useState } from 'react';
import { Send, Bot, User, Lightbulb, BookOpen, Target, TrendingUp, BarChart3, Zap, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { geminiService } from '@/services/geminiService';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isGeminiPowered?: boolean;
}

const AIMentor = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Welcome to Aasakira 2.0 — Your AI Trading Mentor ✨\n\nI'm now powered by Google's Gemini AI for even more intelligent and personalized trading education!\n\nReady to level up your trading skills with advanced AI insights?\n\nAsk me anything about trading, or use our professional tools to practice what you learn.",
      isUser: false,
      timestamp: new Date(),
      isGeminiPowered: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickStartItems = [
    { title: "What is forex trading?", icon: BookOpen },
    { title: "How do I place a trade?", icon: Target },
    { title: "What is risk management?", icon: TrendingUp },
    { title: "Show me smart money concepts", icon: BarChart3 },
    { title: "How do I read candlestick patterns?", icon: Zap },
    { title: "What is leverage in trading?", icon: Lightbulb }
  ];

  const professionalTools = [
    {
      title: "Trading Journal",
      description: "Professional trade tracking & AI analysis",
      icon: BookOpen,
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Strategy Backtesting",
      description: "Test your strategies with historical data",
      icon: BarChart3,
      color: "from-purple-500 to-pink-600"
    }
  ];

  const suggestedQuestions = [
    '"What is forex?" or "How do I place a trade?"',
    '"Can we journal" or "Can we backtest"'
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Use Gemini API for more powerful responses
      const aiResponse = await geminiService.generateTradingResponse(currentMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        isGeminiPowered: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to basic response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBasicResponse(currentMessage),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateBasicResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('forex') || lowerQuestion.includes('trading')) {
      return "Forex trading involves buying and selling currency pairs to profit from exchange rate fluctuations. The forex market is the largest financial market globally, operating 24/5.\n\nKey concepts:\n• Currency pairs (EUR/USD, GBP/USD, etc.)\n• Pip movements and spreads\n• Leverage and margin\n• Market sessions (London, New York, Tokyo)\n\nWould you like me to explain any of these concepts in more detail?";
    }
    
    if (lowerQuestion.includes('risk') || lowerQuestion.includes('management')) {
      return "Risk management is crucial for long-term trading success. Here are the key principles:\n\n🎯 Position Sizing: Never risk more than 1-2% per trade\n📊 Stop Losses: Always set stop losses before entering\n⚖️ Risk-Reward Ratio: Aim for at least 1:2 ratio\n📈 Diversification: Don't put all trades in one basket\n🧠 Psychology: Manage emotions and stick to your plan\n\nRemember: Protecting your capital is more important than making profits!";
    }
    
    if (lowerQuestion.includes('candlestick') || lowerQuestion.includes('patterns')) {
      return "Candlestick patterns reveal market psychology and potential price movements:\n\n🕯️ **Reversal Patterns:**\n• Doji - Indecision\n• Hammer - Bullish reversal\n• Shooting Star - Bearish reversal\n• Engulfing patterns\n\n📈 **Continuation Patterns:**\n• Spinning tops\n• Marubozu candles\n• Three white soldiers\n\nEach candle tells a story of the battle between buyers and sellers. Would you like me to explain any specific pattern?";
    }
    
    if (lowerQuestion.includes('leverage')) {
      return "Leverage allows you to control larger positions with smaller capital, but it's a double-edged sword:\n\n⚡ **How it works:**\n• 1:100 leverage = $1 controls $100\n• Amplifies both profits AND losses\n• Margin requirements vary by broker\n\n⚠️ **Risks:**\n• Can wipe out accounts quickly\n• Margin calls and stop-outs\n• Emotional pressure increases\n\n💡 **Best practices:**\n• Start with low leverage (1:10 or 1:20)\n• Never use maximum leverage\n• Understand margin requirements\n\nRemember: Leverage is a tool, not a strategy!";
    }
    
    if (lowerQuestion.includes('journal') || lowerQuestion.includes('track')) {
      return "A trading journal is your path to consistent profitability! Here's what to track:\n\n📝 **Trade Details:**\n• Entry/exit prices and times\n• Position size and risk amount\n• Stop loss and take profit levels\n• Market conditions and setup\n\n🧠 **Psychology:**\n• Emotions before/during/after trade\n• What you learned from each trade\n• Mistakes and improvements\n\n📊 **Performance Metrics:**\n• Win rate and risk-reward ratios\n• Monthly/weekly performance\n• Drawdown periods\n\nWould you like me to help you set up a trading journal structure?";
    }
    
    if (lowerQuestion.includes('backtest') || lowerQuestion.includes('strategy')) {
      return "Backtesting validates your trading strategies using historical data:\n\n🔍 **What to test:**\n• Entry and exit rules\n• Risk management parameters\n• Different market conditions\n• Various timeframes\n\n📈 **Key metrics to analyze:**\n• Total return and max drawdown\n• Win rate and average win/loss\n• Sharpe ratio and profit factor\n• Number of trades and consistency\n\n⚠️ **Important notes:**\n• Past performance ≠ future results\n• Account for spreads and slippage\n• Test on out-of-sample data\n• Consider market regime changes\n\nReady to backtest a strategy? I can guide you through the process!";
    }
    
    return "That's a great question! I'm here to help you master trading concepts, risk management, technical analysis, and trading psychology.\n\nTry asking me about:\n• Forex basics and currency pairs\n• Risk management strategies\n• Technical analysis and chart patterns\n• Trading psychology and discipline\n• Market structure and smart money concepts\n\nWhat specific area would you like to explore?";
  };

  const handleQuickStart = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-6">
      {/* Header with Back Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="flex items-center space-x-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Start Section */}
        <div className="space-y-6">
          <Card className="glass-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-400">
                <Lightbulb className="w-5 h-5" />
                <span>Quick Start</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickStartItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickStart(item.title)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-500/30 group"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                      <span className="text-gray-300 group-hover:text-white text-sm">{item.title}</span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Professional Tools */}
          <Card className="glass-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-400">
                <Target className="w-5 h-5" />
                <span>Professional Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {professionalTools.map((tool, index) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg bg-gradient-to-r ${tool.color} bg-opacity-20 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="w-6 h-6 text-white mt-1 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="text-white font-semibold">{tool.title}</h3>
                        <p className="text-gray-300 text-sm mt-1">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* AI Mentor Chat */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-purple-500/20 h-[700px] flex flex-col">
            <CardHeader className="border-b border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-pink-400">
                  <Bot className="w-6 h-6" />
                  <span>Ask Aasakira 2.0 — Your AI Mentor</span>
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Gemini Powered</span>
                  </div>
                  <div className="bg-cyan-500 text-white text-xs px-3 py-1 rounded-full">
                    Online
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600'
                  }`}>
                    {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    {message.isGeminiPowered && !message.isUser && (
                      <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
                    )}
                  </div>
                  <div className={`max-w-[80%] p-4 rounded-lg ${
                    message.isUser
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ml-auto'
                      : 'bg-white/10 text-gray-100 border border-white/20'
                  }`}>
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {message.content}
                    </div>
                    {message.isGeminiPowered && !message.isUser && (
                      <div className="flex items-center space-x-1 mt-2 text-xs text-yellow-400">
                        <Sparkles className="w-3 h-3" />
                        <span>Enhanced by Gemini AI</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center relative">
                    <Bot className="w-4 h-4" />
                    <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400" />
                  </div>
                  <div className="bg-white/10 border border-white/20 p-4 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Suggestions */}
            <div className="px-6 py-2 border-t border-white/10">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">Powered by Gemini AI - Try:</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                  <span className="bg-white/5 px-2 py-1 rounded">"What is forex?" or "How do I place a trade?"</span>
                  <span className="bg-white/5 px-2 py-1 rounded">"Create a learning plan for me"</span>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-6 border-t border-white/10">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about trading... (Powered by Gemini AI)"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIMentor;
