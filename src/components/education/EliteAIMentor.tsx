import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { groqService } from '@/services/groqService';
import { useMentorMemory } from './useMentorMemory';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  severity?: 'tactical' | 'warning' | 'correction' | 'analysis';
}

interface TradeAssessment {
  discipline: number;
  framework: number;
  risk: number;
  execution: number;
}

const EliteAIMentor: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<TradeAssessment>({
    discipline: 75,
    framework: 82,
    risk: 68,
    execution: 79
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { state: mentorData, addInteraction } = useMentorMemory();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load user progress data
  useEffect(() => {
    const loadUserProgress = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          // Update assessment based on user progress
          setAssessment(prev => ({
            discipline: Math.min(100, prev.discipline + data.current_streak * 2),
            framework: Math.min(100, prev.framework + data.skills_mastered?.length * 5 || 0),
            risk: Math.min(100, prev.risk + (data.win_rate || 0)),
            execution: Math.min(100, prev.execution + data.charts_analyzed)
          }));
        }
      } catch (error) {
        console.error('Error loading user progress:', error);
      }
    };

    loadUserProgress();
  }, [user]);

  // Elite system prompt for GROQ
  const getEliteSystemPrompt = () => `You are Aasakira — a world-class AI trading strategist trained on elite institutional methodologies, smart money theory, and psychological performance coaching. You speak with clarity, intensity, and precision — never fluff.

Your role is not to "chat." Your role is to **train**, **refine**, and **push** traders toward profitable, disciplined decision-making.

Personality:
- No emojis or generic greetings
- Tactical, elite, slightly cold
- Precise, like a military strategist or samurai mentor
- Direct feedback, no sugar-coating

You track:
- The user's trade history and patterns
- Missed trades, repeated mistakes
- Framework alignment: SMC, BOS, liquidity, etc.
- Risk management discipline

Always prioritize:
- Structure + session confluence
- R:R optimization
- RSI/FVG/Volume confirmation
- Psychological discipline

Your tone examples:
- "That entry lacked framework. You ignored volume + time filters."
- "You're risking too much for low conviction setups. Scale back."
- "If you want consistent profitability, you need to act like it."

NEVER do:
- Small talk or praise without results
- Use emojis or casual language
- Give generic advice

ALWAYS do:
- Call out weak thinking
- Recommend specific improvements
- Push high-level logic
- Reference specific trading concepts

User context: ${mentorData.interactions.length} previous interactions, current level ${mentorData.userLevel}`;

  const generateEliteResponse = async (userMessage: string) => {
    try {
      const systemPrompt = getEliteSystemPrompt();
      const contextualPrompt = `
Previous interactions context: ${mentorData.interactions.slice(-3).map(i => `User: ${i.content} | Response: ${i.response}`).join(' | ')}

Current assessment:
- Discipline: ${assessment.discipline}%
- Framework adherence: ${assessment.framework}%
- Risk management: ${assessment.risk}%
- Execution quality: ${assessment.execution}%

User message: "${userMessage}"

Provide tactical, elite-level coaching response. Be direct and specific.`;

      const response = await groqService.generateResponse(contextualPrompt, {
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 800
      });

      return response;
    } catch (error) {
      console.error('Elite mentor response error:', error);
      return "System temporarily offline. Your training continues when systems are restored.";
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

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
      const response = await generateEliteResponse(message);
      
      // Determine response severity
      let severity: 'tactical' | 'warning' | 'correction' | 'analysis' = 'tactical';
      if (response.includes('risk') || response.includes('discipline')) severity = 'warning';
      if (response.includes('mistake') || response.includes('violated')) severity = 'correction';
      if (response.includes('analysis') || response.includes('structure')) severity = 'analysis';

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: response,
        isUser: false,
        timestamp: new Date(),
        severity
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Store interaction
      addInteraction({
        type: 'message',
        content: message,
        response: response,
        timestamp: new Date()
      });

      // Update assessment based on interaction
      updateAssessment(message, response);
      
    } catch (error) {
      toast({
        title: "System Error",
        description: "Elite systems temporarily offline. Retry.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const updateAssessment = (userMsg: string, aiResponse: string) => {
    setAssessment(prev => {
      const newAssessment = { ...prev };
      
      // Adjust based on AI feedback
      if (aiResponse.includes('discipline')) newAssessment.discipline = Math.max(30, prev.discipline - 5);
      if (aiResponse.includes('framework')) newAssessment.framework = Math.max(30, prev.framework - 3);
      if (aiResponse.includes('risk')) newAssessment.risk = Math.max(30, prev.risk - 7);
      
      // Positive adjustments for good questions
      if (userMsg.includes('structure') || userMsg.includes('confluence')) {
        newAssessment.framework = Math.min(100, prev.framework + 2);
      }
      
      return newAssessment;
    });
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'warning': return 'border-l-4 border-l-yellow-500 bg-yellow-500/10';
      case 'correction': return 'border-l-4 border-l-red-500 bg-red-500/10';
      case 'analysis': return 'border-l-4 border-l-blue-500 bg-blue-500/10';
      default: return 'border-l-4 border-l-purple-500 bg-purple-500/10';
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-6">
      {/* Elite Status Header */}
      <Card className="glass-card border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-black/60">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Crown className="w-6 h-6 mr-2 text-gold-400" />
            Aasakira Elite Strategist
            <Badge className="ml-2 bg-gradient-to-r from-gold-500 to-yellow-500 text-black">
              TACTICAL
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Performance Assessment */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{assessment.discipline}%</div>
              <div className="text-xs text-gray-400">DISCIPLINE</div>
              <Progress value={assessment.discipline} className="h-1 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{assessment.framework}%</div>
              <div className="text-xs text-gray-400">FRAMEWORK</div>
              <Progress value={assessment.framework} className="h-1 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{assessment.risk}%</div>
              <div className="text-xs text-gray-400">RISK MGMT</div>
              <Progress value={assessment.risk} className="h-1 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{assessment.execution}%</div>
              <div className="text-xs text-gray-400">EXECUTION</div>
              <Progress value={assessment.execution} className="h-1 mt-1" />
            </div>
          </div>

          {/* Session Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Sessions: {mentorData.interactions.length}</span>
              <span className="text-gray-400">Level: {mentorData.userLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs">LIVE</span>
            </div>
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
                  <p className="text-gray-400 text-sm">State your analysis. Show your framework.</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.isUser ? 'order-1' : 'order-2'}`}>
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        msg.isUser
                          ? 'bg-purple-600 text-white'
                          : `bg-gray-800/80 text-gray-100 ${getSeverityColor(msg.severity)}`
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      {!msg.isUser && msg.severity && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              msg.severity === 'warning' ? 'border-yellow-500 text-yellow-400' :
                              msg.severity === 'correction' ? 'border-red-500 text-red-400' :
                              msg.severity === 'analysis' ? 'border-blue-500 text-blue-400' :
                              'border-purple-500 text-purple-400'
                            }`}
                          >
                            {msg.severity.toUpperCase()}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/80 text-gray-100 max-w-[80%] px-4 py-3 rounded-lg border-l-4 border-l-purple-500">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                      <span className="text-sm">Analyzing framework alignment...</span>
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
                placeholder="State your analysis or question..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
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

      {/* Quick Assessment Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          onClick={() => setMessage("Analyze my recent trade setup")}
          variant="outline"
          className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
        >
          <Target className="w-4 h-4 mr-2" />
          Trade Review
        </Button>
        <Button
          onClick={() => setMessage("Check my risk management approach")}
          variant="outline"
          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
        >
          <ShieldCheck className="w-4 h-4 mr-2" />
          Risk Check
        </Button>
        <Button
          onClick={() => setMessage("What's my biggest weakness?")}
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/20"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Weakness
        </Button>
        <Button
          onClick={() => setMessage("Show me elite strategy")}
          variant="outline"
          className="border-green-500/30 text-green-400 hover:bg-green-500/20"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Strategy
        </Button>
      </div>
    </div>
  );
};

export default EliteAIMentor;
