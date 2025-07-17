
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  Send, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  Crown,
  Activity,
  Eye,
  Sword,
  Shield,
  Flame
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { enhancedEliteGroqService, type AggressionMode, type EliteResponse } from '@/services/enhancedEliteGroqService';
import { eliteTradeMemory } from '@/services/eliteTradeMemory';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  severity?: 'tactical' | 'warning' | 'brutal' | 'correction';
  tradeAdvice?: string;
}

const UltimateEliteAIMentor: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aggressionMode, setAggressionMode] = useState<AggressionMode>('brutal');
  const [userStats, setUserStats] = useState({
    winRate: 0,
    avgRR: 0,
    frameworkAdherence: 0,
    totalTrades: 0
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserStats = async () => {
    if (!user) return;
    
    try {
      const patterns = await eliteTradeMemory.analyzeUserPatterns(user.id);
      const trades = await eliteTradeMemory.getUserTradeHistory(user.id);
      
      setUserStats({
        winRate: patterns.winRate,
        avgRR: patterns.averageRR,
        frameworkAdherence: patterns.frameworkAdherence,
        totalTrades: trades.length
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response: EliteResponse = await enhancedEliteGroqService.generateEliteResponse(
        message,
        user.id,
        aggressionMode
      );
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response.response,
        isUser: false,
        timestamp: new Date(),
        severity: response.severity,
        tradeAdvice: response.tradeAdvice
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Reload stats after interaction
      await loadUserStats();
      
    } catch (error) {
      toast({
        title: "System Error",
        description: "Elite systems temporarily offline. Retry.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const getModeIcon = (mode: AggressionMode) => {
    switch (mode) {
      case 'precision': return <Eye className="w-4 h-4" />;
      case 'brutal': return <Flame className="w-4 h-4" />;
      case 'samurai': return <Sword className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: AggressionMode) => {
    switch (mode) {
      case 'precision': return 'from-blue-500 to-cyan-500';
      case 'brutal': return 'from-red-500 to-orange-500';
      case 'samurai': return 'from-purple-500 to-pink-500';
    }
  };

  const getSeverityStyle = (severity?: string) => {
    switch (severity) {
      case 'brutal': return 'border-l-4 border-l-red-500 bg-red-500/10';
      case 'correction': return 'border-l-4 border-l-orange-500 bg-orange-500/10';
      case 'warning': return 'border-l-4 border-l-yellow-500 bg-yellow-500/10';
      default: return 'border-l-4 border-l-purple-500 bg-purple-500/10';
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'brutal':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">BRUTAL</Badge>;
      case 'correction':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">CORRECTION</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">WARNING</Badge>;
      default:
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">TACTICAL</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Elite Control Panel */}
      <Card className="glass-card border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-black/60">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <Crown className="w-6 h-6 mr-2 text-gold-400" />
              Aasakira Elite Command Center
            </div>
            <div className="flex items-center gap-3">
              <Select value={aggressionMode} onValueChange={(value: AggressionMode) => setAggressionMode(value)}>
                <SelectTrigger className={`w-40 bg-gradient-to-r ${getModeColor(aggressionMode)} text-white border-none`}>
                  <div className="flex items-center gap-2">
                    {getModeIcon(aggressionMode)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="precision">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Precision Mode
                    </div>
                  </SelectItem>
                  <SelectItem value="brutal">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      Brutal Mode
                    </div>
                  </SelectItem>
                  <SelectItem value="samurai">
                    <div className="flex items-center gap-2">
                      <Sword className="w-4 h-4" />
                      Samurai Mode
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{userStats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-400">WIN RATE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{userStats.avgRR.toFixed(2)}</div>
              <div className="text-xs text-gray-400">AVG R:R</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{userStats.frameworkAdherence.toFixed(0)}%</div>
              <div className="text-xs text-gray-400">DISCIPLINE</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{userStats.totalTrades}</div>
              <div className="text-xs text-gray-400">TRADES</div>
            </div>
          </div>

          {/* Mode Description */}
          <div className="text-center">
            <Badge className={`bg-gradient-to-r ${getModeColor(aggressionMode)} text-white px-4 py-1`}>
              {aggressionMode === 'brutal' && "NO MERCY • ELITE STANDARDS ONLY"}
              {aggressionMode === 'precision' && "TACTICAL PRECISION • INSTITUTIONAL LOGIC"}
              {aggressionMode === 'samurai' && "DISCIPLINED MASTERY • WARRIOR'S PATH"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Elite Chat Interface */}
      <Card className="glass-card border-purple-500/20 h-96">
        <CardContent className="p-0 h-full flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-lg font-bold text-white mb-2">Elite Strategic Assessment</h3>
                  <p className="text-gray-400 text-sm">
                    {aggressionMode === 'brutal' && "State your position. Expect brutal honesty."}
                    {aggressionMode === 'precision' && "Present your analysis. Precision demanded."}
                    {aggressionMode === 'samurai' && "Share your strategy. Honor through discipline."}
                  </p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] ${msg.isUser ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        msg.isUser
                          ? `bg-gradient-to-r ${getModeColor(aggressionMode)} text-white`
                          : `bg-gray-800/80 text-gray-100 ${getSeverityStyle(msg.severity)}`
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      {!msg.isUser && (
                        <div className="mt-3 pt-2 border-t border-gray-600 flex items-center justify-between">
                          {getSeverityBadge(msg.severity)}
                          {msg.tradeAdvice && (
                            <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-500/30">
                              TRADE ADVICE
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/80 text-gray-100 max-w-[85%] px-4 py-3 rounded-lg border-l-4 border-l-purple-500">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-sm">
                        {aggressionMode === 'brutal' && "Analyzing... preparing brutal assessment..."}
                        {aggressionMode === 'precision' && "Processing tactical framework..."}
                        {aggressionMode === 'samurai' && "Contemplating strategic wisdom..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          
          {/* Elite Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  aggressionMode === 'brutal' ? "State your trade. Be ready for truth." :
                  aggressionMode === 'precision' ? "Present your technical analysis..." :
                  "Share your trading discipline..."
                }
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className={`bg-gradient-to-r ${getModeColor(aggressionMode)} text-white px-6`}
              >
                {isLoading ? (
                  <Zap className="w-4 h-4 animate-pulse" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          onClick={() => setMessage("Analyze my last 5 trades")}
          variant="outline"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
        >
          <Target className="w-4 h-4 mr-2" />
          Trade Review
        </Button>
        <Button
          onClick={() => setMessage("What are my biggest weaknesses?")}
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/20"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Weaknesses
        </Button>
        <Button
          onClick={() => setMessage("Rate my framework discipline")}
          variant="outline"
          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
        >
          <Shield className="w-4 h-4 mr-2" />
          Discipline
        </Button>
        <Button
          onClick={() => setMessage("Show me elite strategies")}
          variant="outline"
          className="border-green-500/30 text-green-400 hover:bg-green-500/20"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Elite Strategy
        </Button>
      </div>
    </div>
  );
};

export default UltimateEliteAIMentor;
