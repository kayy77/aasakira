
import { groqService } from './groqService';
import { eliteTradeMemory, type TradeRecord, type UserPattern } from './eliteTradeMemory';

export type AggressionMode = 'precision' | 'brutal' | 'samurai';

export interface ChartSignal {
  pair: string;
  signalType: string;
  confluence: number;
  livePrice: number;
  entry: number;
  stop: number;
  tp: number;
  timeFrame: string;
}

export interface EliteResponse {
  response: string;
  severity: 'tactical' | 'warning' | 'brutal' | 'correction';
  tradeAdvice?: string;
  frameworkViolations?: string[];
}

class EnhancedEliteGroqService {
  private getAggressionPrompt(mode: AggressionMode): string {
    const prompts = {
      precision: `You are Aasakira — precise, analytical, tactical. Provide sharp but balanced feedback. Focus on institutional logic and framework adherence.`,
      
      brutal: `You are Aasakira — absolutely ruthless. No mercy for weak thinking. Call out every violation immediately. Use phrases like "amateur move", "institutional traders would reject this", "you're trading emotion, not structure". Be cold and unforgiving.`,
      
      samurai: `You are Aasakira — disciplined samurai strategist. Strict but honorable. Focus on discipline, patience, and mastery. Use warrior analogies. Push for excellence through discipline, not brutality.`
    };
    
    return prompts[mode];
  }

  async generateEliteResponse(
    userMessage: string,
    userId: string,
    mode: AggressionMode = 'brutal',
    chartSignal?: ChartSignal
  ): Promise<EliteResponse> {
    try {
      // Get user's trade patterns and history
      const userPattern = await eliteTradeMemory.analyzeUserPatterns(userId);
      const recentTrades = await eliteTradeMemory.getUserTradeHistory(userId, 5);
      
      // Build context-aware prompt
      const systemPrompt = this.buildEnhancedPrompt(mode, userPattern, recentTrades, chartSignal);
      
      const response = await groqService.generateResponse(systemPrompt + '\n\nUser: ' + userMessage, {
        model: 'llama3-70b-8192',
        temperature: 0.4,
        max_tokens: 1200
      });

      // Store this interaction
      await eliteTradeMemory.storeMentorInteraction(userId, userMessage, response);

      return {
        response,
        severity: this.analyzeSeverity(response, mode),
        tradeAdvice: this.extractTradeAdvice(response),
        frameworkViolations: this.extractViolations(response)
      };

    } catch (error) {
      console.error('Enhanced Elite GROQ error:', error);
      return {
        response: "Systems temporarily offline. Your elite training continues when operational.",
        severity: 'tactical'
      };
    }
  }

  private buildEnhancedPrompt(
    mode: AggressionMode, 
    userPattern: UserPattern, 
    recentTrades: TradeRecord[],
    chartSignal?: ChartSignal
  ): string {
    const basePrompt = this.getAggressionPrompt(mode);
    
    let contextPrompt = `${basePrompt}

🧠 TRADER PROFILE ANALYSIS:
Win Rate: ${userPattern.winRate.toFixed(1)}%
Average R:R: ${userPattern.averageRR.toFixed(2)}
Framework Adherence: ${userPattern.frameworkAdherence.toFixed(1)}%
Common Mistakes: ${userPattern.commonMistakes.join(', ') || 'None identified'}
Strengths: ${userPattern.strengths.join(', ') || 'Under evaluation'}
Emotional Triggers: ${userPattern.emotionalTriggers.join(', ') || 'Under observation'}

📊 RECENT TRADE HISTORY:`;

    recentTrades.forEach((trade, index) => {
      contextPrompt += `
Trade ${index + 1}: ${trade.pair} ${trade.type} - ${trade.result}
R:R: ${trade.riskReward.toFixed(2)} | Violations: ${trade.violatedFramework.join(', ') || 'None'}`;
    });

    if (chartSignal) {
      const riskReward = ((chartSignal.tp - chartSignal.entry) / (chartSignal.entry - chartSignal.stop)).toFixed(2);
      const priceDistance = Math.abs(chartSignal.livePrice - chartSignal.entry);
      
      contextPrompt += `

🎯 CURRENT SIGNAL ANALYSIS:
${chartSignal.pair} ${chartSignal.signalType} Signal
Confluence: ${chartSignal.confluence}/6
Entry: ${chartSignal.entry} | Live: ${chartSignal.livePrice}
Stop: ${chartSignal.stop} | TP: ${chartSignal.tp}
R:R: ${riskReward} | Distance to Entry: ${priceDistance} pips
Timeframe: ${chartSignal.timeFrame}

Evaluate this setup against institutional standards. Consider entry timing, risk management, and framework compliance.`;
    }

    contextPrompt += `

🎯 RESPONSE REQUIREMENTS:
1. Reference their specific patterns and mistakes
2. Be direct about framework violations
3. Demand higher standards based on their level
4. No generic advice - make it personal and tactical

Respond as Aasakira would:`;

    return contextPrompt;
  }

  private analyzeSeverity(response: string, mode: AggressionMode): 'tactical' | 'warning' | 'brutal' | 'correction' {
    const lowerResponse = response.toLowerCase();
    
    if (mode === 'brutal') return 'brutal';
    
    if (lowerResponse.includes('violation') || lowerResponse.includes('amateur') || lowerResponse.includes('mistake')) {
      return 'correction';
    }
    
    if (lowerResponse.includes('risk') || lowerResponse.includes('careful') || lowerResponse.includes('warning')) {
      return 'warning';
    }
    
    return 'tactical';
  }

  private extractTradeAdvice(response: string): string | undefined {
    const adviceKeywords = ['entry', 'stop', 'target', 'risk', 'position'];
    const sentences = response.split('.');
    
    const adviceSentence = sentences.find(sentence => 
      adviceKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    return adviceSentence?.trim();
  }

  private extractViolations(response: string): string[] {
    const violations: string[] = [];
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('early entry') || lowerResponse.includes('fomo')) {
      violations.push('Early Entry');
    }
    if (lowerResponse.includes('risk') && lowerResponse.includes('too')) {
      violations.push('Risk Management');
    }
    if (lowerResponse.includes('structure') || lowerResponse.includes('framework')) {
      violations.push('Framework Violation');
    }
    
    return violations;
  }

  async evaluateChartSignal(signal: ChartSignal, userId: string, mode: AggressionMode = 'brutal'): Promise<EliteResponse> {
    const evaluationPrompt = `Evaluate this ${signal.pair} setup immediately:

Setup: ${signal.signalType}
Confluence: ${signal.confluence}/6
Entry: ${signal.entry}
Current Price: ${signal.livePrice}
Stop: ${signal.stop}
Target: ${signal.tp}
Timeframe: ${signal.timeFrame}

Rate this setup against institutional standards. Be specific about timing, risk-reward, and execution quality.`;

    return this.generateEliteResponse(evaluationPrompt, userId, mode, signal);
  }
}

export const enhancedEliteGroqService = new EnhancedEliteGroqService();
