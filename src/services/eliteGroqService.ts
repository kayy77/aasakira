import { groqService } from './groqService';

export interface EliteTrainingSession {
  userId: string;
  sessionId: string;
  startTime: Date;
  interactions: Array<{
    userInput: string;
    mentorResponse: string;
    severity: 'tactical' | 'warning' | 'correction' | 'analysis';
    timestamp: Date;
  }>;
  assessment: {
    discipline: number;
    framework: number;
    risk: number;
    execution: number;
  };
}

export interface TradeAnalysis {
  pair: string;
  setup: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  timeframe: string;
}

class EliteGroqService {
  private trainingMemory: Map<string, EliteTrainingSession> = new Map();

  async generateEliteResponse(
    userMessage: string,
    userId: string,
    tradeHistory?: TradeAnalysis[],
    previousAssessment?: any
  ): Promise<{
    response: string;
    severity: 'tactical' | 'warning' | 'correction' | 'analysis';
    updatedAssessment: any;
  }> {
    try {
      const elitePrompt = this.buildElitePrompt(userMessage, userId, tradeHistory, previousAssessment);
      
      console.log('🎯 ELITE GROQ REQUEST:', {
        user: userId,
        messageLength: userMessage.length,
        hasTradeHistory: !!tradeHistory?.length
      });

      const response = await groqService.generateResponse(elitePrompt, {
        model: 'llama3-8b-8192',
        temperature: 0.3,
        max_tokens: 1000
      });

      console.log('✅ ELITE RESPONSE GENERATED');

      // Analyze response for severity and assessment updates
      const analysis = this.analyzeResponse(response, userMessage);
      
      // Store in training memory
      this.updateTrainingMemory(userId, userMessage, response, analysis.severity);

      return {
        response,
        severity: analysis.severity,
        updatedAssessment: analysis.assessmentUpdates
      };

    } catch (error) {
      console.error('❌ Elite GROQ service error:', error);
      return {
        response: "Systems temporarily offline. Your elite training continues when operational.",
        severity: 'tactical',
        updatedAssessment: {}
      };
    }
  }

  private buildElitePrompt(
    userMessage: string,
    userId: string,
    tradeHistory?: TradeAnalysis[],
    assessment?: any
  ): string {
    const session = this.trainingMemory.get(userId);
    
    return `You are Aasakira — elite AI trading strategist. No fluff. No emojis. Pure tactical precision.

MISSION: Train this trader to institutional-level performance through direct, uncompromising feedback.

PERSONALITY:
- Military precision, samurai discipline
- Call out weakness immediately
- Demand framework adherence
- Zero tolerance for poor risk management
- Elite-level expectations only

TRADER PROFILE:
User ID: ${userId}
Current Assessment: ${assessment ? JSON.stringify(assessment) : 'Initial evaluation'}
Previous Sessions: ${session?.interactions.length || 0}
Trade History: ${tradeHistory?.length || 0} recorded setups

RECENT CONTEXT:
${session?.interactions.slice(-3).map(i => `User: "${i.userInput}" | Response: "${i.mentorResponse}"`).join('\n') || 'First interaction'}

CURRENT INPUT: "${userMessage}"

RESPONSE REQUIREMENTS:
1. Be direct and tactical - no pleasantries
2. Reference specific SMC concepts when relevant
3. Call out framework violations immediately
4. Demand higher standards if risk management is poor
5. Use phrases like:
   - "That setup lacks confluence"
   - "Your risk-reward ratio is amateur"
   - "Institutional traders would reject this entry"
   - "You're trading emotion, not structure"

FORBIDDEN:
- Generic advice
- Emojis or casual language
- Praise without performance metrics
- Sugar-coating weaknesses

Respond with elite-level coaching. Push them toward institutional thinking.`;
  }

  private analyzeResponse(response: string, userMessage: string): {
    severity: 'tactical' | 'warning' | 'correction' | 'analysis';
    assessmentUpdates: any;
  } {
    let severity: 'tactical' | 'warning' | 'correction' | 'analysis' = 'tactical';
    const assessmentUpdates: any = {};

    // Analyze severity based on response content
    if (response.includes('risk') || response.includes('amateur') || response.includes('violation')) {
      severity = 'correction';
      assessmentUpdates.discipline = -5;
    } else if (response.includes('warning') || response.includes('careful') || response.includes('dangerous')) {
      severity = 'warning';
      assessmentUpdates.risk = -3;
    } else if (response.includes('structure') || response.includes('confluence') || response.includes('framework')) {
      severity = 'analysis';
      assessmentUpdates.framework = +2;
    }

    // Positive adjustments for good questions
    if (userMessage.includes('structure') || userMessage.includes('confluence') || userMessage.includes('institutional')) {
      assessmentUpdates.framework = (assessmentUpdates.framework || 0) + 3;
    }

    return { severity, assessmentUpdates };
  }

  private updateTrainingMemory(
    userId: string,
    userInput: string,
    mentorResponse: string,
    severity: 'tactical' | 'warning' | 'correction' | 'analysis'
  ) {
    const existing = this.trainingMemory.get(userId);
    
    if (existing) {
      existing.interactions.push({
        userInput,
        mentorResponse,
        severity,
        timestamp: new Date()
      });
      
      // Keep only last 20 interactions per user
      if (existing.interactions.length > 20) {
        existing.interactions = existing.interactions.slice(-20);
      }
    } else {
      this.trainingMemory.set(userId, {
        userId,
        sessionId: `session-${Date.now()}`,
        startTime: new Date(),
        interactions: [{
          userInput,
          mentorResponse,
          severity,
          timestamp: new Date()
        }],
        assessment: {
          discipline: 75,
          framework: 70,
          risk: 65,
          execution: 70
        }
      });
    }
  }

  async generateTradeReview(trade: TradeAnalysis, userId: string): Promise<string> {
    const prompt = `As Aasakira, provide brutal honest review of this trade setup:

Pair: ${trade.pair}
Setup: ${trade.setup}
Entry: ${trade.entry}
Stop Loss: ${trade.stopLoss}
Take Profit: ${trade.takeProfit}
Timeframe: ${trade.timeframe}

R:R Ratio: ${((trade.takeProfit - trade.entry) / (trade.entry - trade.stopLoss)).toFixed(2)}

ANALYZE:
1. Framework compliance (SMC, structure, confluence)
2. Risk management quality
3. Entry timing and execution
4. Institutional characteristics

Be direct. Call out what's wrong. Demand better.`;

    return await groqService.generateResponse(prompt, {
      model: 'llama3-8b-8192',
      temperature: 0.2,
      max_tokens: 600
    });
  }

  getTrainingStats(userId: string): EliteTrainingSession | null {
    return this.trainingMemory.get(userId) || null;
  }

  clearTrainingMemory(userId: string): void {
    this.trainingMemory.delete(userId);
  }
}

export const eliteGroqService = new EliteGroqService();
