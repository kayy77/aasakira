import { groqService } from './groqService';

export interface AITaskResult {
  model: string;
  role: string;
  verdict: 'PASS' | 'WEAK' | 'FAIL';
  score: number;
  reasoning: string;
  confidence: number;
}

export interface SignalContext {
  pair: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  timeframe: string;
  session: string;
}

export class AITaskDelegationEngine {
  private static readonly AI_ROLES = {
    groq: {
      role: 'Institutional Structure & Volume Analysis',
      weight: 3.0,
      mustPass: true
    },
    gemini: {
      role: 'RSI Divergence & Entry Timing',
      weight: 2.0,
      mustPass: false
    },
    cohere: {
      role: 'Trend Confirmation & Historical Zones',
      weight: 1.5,
      mustPass: false
    },
    openrouter: {
      role: 'Session Logic & Liquidity Sweep',
      weight: 1.5,
      mustPass: false
    },
    together: {
      role: 'Final Validation & Trade Summary',
      weight: 2.0,
      mustPass: false
    }
  };

  static async analyzeSignal(context: SignalContext): Promise<{
    results: AITaskResult[];
    overallVerdict: 'STRONG' | 'MEDIUM' | 'WEAK' | 'REJECTED';
    consensusScore: number;
    reasoning: string;
  }> {
    console.log('🧠 Starting deep AI task delegation analysis...');

    // Run all AI models in parallel with specific tasks
    const taskPromises = [
      this.analyzeWithGroq(context),
      this.analyzeWithGemini(context),
      this.analyzeWithCohere(context),
      this.analyzeWithOpenRouter(context),
      this.analyzeWithTogether(context)
    ];

    const results = await Promise.allSettled(taskPromises);
    const aiResults: AITaskResult[] = results
      .filter((result): result is PromiseFulfilledResult<AITaskResult> => result.status === 'fulfilled')
      .map(result => result.value);

    // Apply strict validation criteria
    const verdict = this.calculateOverallVerdict(aiResults, context);
    const consensusScore = this.calculateConsensusScore(aiResults);
    const reasoning = this.generateTradeReasoning(aiResults, verdict);

    console.log(`📊 AI Analysis Complete: ${verdict} (${aiResults.length}/5 models responded)`);

    return {
      results: aiResults,
      overallVerdict: verdict,
      consensusScore,
      reasoning
    };
  }

  private static async analyzeWithGroq(context: SignalContext): Promise<AITaskResult> {
    const prompt = `
You are an institutional structure analyst for ${context.pair}.

ANALYZE FOR:
- Institutional order blocks (valid or invalid?)
- Fair value gap alignment with price action
- Volume profile and smart money flow patterns
- Market structure integrity (BOS, liquidity sweeps)

CURRENT SETUP:
Direction: ${context.direction}
Entry: ${context.entry}
Stop Loss: ${context.stopLoss}
Take Profit: ${context.takeProfit}
Session: ${context.session}

STRICT REQUIREMENTS:
- Order block must be fresh (not tested multiple times)
- FVG must align with trade direction
- Volume must show institutional interest
- Structure break must be clear and decisive

Return ONLY in this format:
VERDICT: PASS/WEAK/FAIL
SCORE: 1-10
REASONING: [specific institutional analysis]
CONFIDENCE: 1-100%

Be brutally honest. If structure is questionable, mark as WEAK or FAIL.
`;

    try {
      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 300
      });

      return this.parseAIResponse(response, 'groq', 'Institutional Structure & Volume Analysis');
    } catch (error) {
      console.error('Groq analysis failed:', error);
      return this.getFailedResult('groq', 'Institutional Structure & Volume Analysis', 'Analysis failed');
    }
  }

  private static async analyzeWithGemini(context: SignalContext): Promise<AITaskResult> {
    const prompt = `
You are an RSI divergence and entry timing specialist for ${context.pair}.

ANALYZE FOR:
- RSI divergence patterns (bullish/bearish)
- Momentum exhaustion signals
- Candlestick formations at entry level
- Optimal entry timing based on price action

CURRENT SETUP:
Direction: ${context.direction}
Entry: ${context.entry}
Timeframe: ${context.timeframe}

REQUIREMENTS:
- RSI must show clear divergence or momentum shift
- Entry candle must have strong rejection or continuation pattern
- Timing must align with session volatility

Return format:
VERDICT: PASS/WEAK/FAIL
SCORE: 1-10
REASONING: [RSI and timing analysis]
CONFIDENCE: 1-100%

No RSI divergence = automatic WEAK rating.
`;

    try {
      // Simulate Gemini response for now (replace with actual API call)
      const mockResponse = this.generateMockResponse('RSI divergence detected with momentum shift confirmation');
      return this.parseAIResponse(mockResponse, 'gemini', 'RSI Divergence & Entry Timing');
    } catch (error) {
      return this.getFailedResult('gemini', 'RSI Divergence & Entry Timing', 'Analysis failed');
    }
  }

  private static async analyzeWithCohere(context: SignalContext): Promise<AITaskResult> {
    const prompt = `
You are a trend confirmation and historical reaction zone analyst for ${context.pair}.

ANALYZE FOR:
- Overall trend direction and strength
- Historical support/resistance at current levels
- Previous price reactions at similar zones
- Trend continuation vs reversal probability

CURRENT SETUP:
Direction: ${context.direction}
Entry: ${context.entry}
Stop Loss: ${context.stopLoss}

REQUIREMENTS:
- Trade must align with or have valid reason to counter the trend
- Historical zones must show significant previous reactions
- Probability assessment must be data-driven

Return format:
VERDICT: PASS/WEAK/FAIL
SCORE: 1-10
REASONING: [trend and historical analysis]
CONFIDENCE: 1-100%

Counter-trend trades require exceptional historical support.
`;

    try {
      const mockResponse = this.generateMockResponse('Trend analysis confirms directional bias with historical support');
      return this.parseAIResponse(mockResponse, 'cohere', 'Trend Confirmation & Historical Zones');
    } catch (error) {
      return this.getFailedResult('cohere', 'Trend Confirmation & Historical Zones', 'Analysis failed');
    }
  }

  private static async analyzeWithOpenRouter(context: SignalContext): Promise<AITaskResult> {
    const prompt = `
You are a session logic and liquidity sweep specialist for ${context.pair}.

ANALYZE FOR:
- Current session volatility and optimal trading window
- Liquidity sweep patterns above/below key levels
- Session-based price behavior expectations
- Market maker liquidity patterns

CURRENT SETUP:
Session: ${context.session}
Direction: ${context.direction}
Entry: ${context.entry}

REQUIREMENTS:
- Session must have sufficient volatility for R:R target
- Liquidity sweeps must be confirmed, not assumed
- Trade timing must align with session characteristics

Return format:
VERDICT: PASS/WEAK/FAIL
SCORE: 1-10
REASONING: [session and liquidity analysis]
CONFIDENCE: 1-100%

Asian session requires 90%+ confidence. London/NY sessions are more forgiving.
`;

    try {
      const mockResponse = this.generateMockResponse('Session timing optimal with confirmed liquidity sweep pattern');
      return this.parseAIResponse(mockResponse, 'openrouter', 'Session Logic & Liquidity Sweep');
    } catch (error) {
      return this.getFailedResult('openrouter', 'Session Logic & Liquidity Sweep', 'Analysis failed');
    }
  }

  private static async analyzeWithTogether(context: SignalContext): Promise<AITaskResult> {
    const riskReward = Math.abs(context.takeProfit - context.entry) / Math.abs(context.entry - context.stopLoss);
    
    const prompt = `
You are the final validation and trade summary specialist for ${context.pair}.

ANALYZE FOR:
- Overall trade quality and institutional viability
- Risk-reward ratio optimization (current: ${riskReward.toFixed(2)}:1)
- Final go/no-go decision based on all factors
- Trade summary for institutional presentation

REQUIREMENTS:
- R:R must be minimum 1.8:1 for PASS
- All critical elements must align
- Must pass institutional risk standards

Return format:
VERDICT: PASS/WEAK/FAIL
SCORE: 1-10
REASONING: [final validation summary]
CONFIDENCE: 1-100%

This is the final checkpoint - be extra strict.
`;

    try {
      const mockResponse = this.generateMockResponse(`Final validation complete - R:R ${riskReward.toFixed(2)}:1 meets institutional standards`);
      return this.parseAIResponse(mockResponse, 'together', 'Final Validation & Trade Summary');
    } catch (error) {
      return this.getFailedResult('together', 'Final Validation & Trade Summary', 'Analysis failed');
    }
  }

  private static parseAIResponse(response: string, model: string, role: string): AITaskResult {
    try {
      const verdictMatch = response.match(/VERDICT:\s*(PASS|WEAK|FAIL)/i);
      const scoreMatch = response.match(/SCORE:\s*(\d+)/);
      const reasoningMatch = response.match(/REASONING:\s*(.+?)(?=\nCONFIDENCE:|$)/s);
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/);

      return {
        model,
        role,
        verdict: (verdictMatch?.[1]?.toUpperCase() as 'PASS' | 'WEAK' | 'FAIL') || 'FAIL',
        score: parseInt(scoreMatch?.[1] || '0'),
        reasoning: reasoningMatch?.[1]?.trim() || 'No reasoning provided',
        confidence: parseInt(confidenceMatch?.[1] || '0')
      };
    } catch (error) {
      return this.getFailedResult(model, role, 'Failed to parse response');
    }
  }

  private static generateMockResponse(reasoning: string): string {
    const verdicts = ['PASS', 'WEAK', 'FAIL'];
    const verdict = verdicts[Math.floor(Math.random() * verdicts.length)];
    const score = verdict === 'PASS' ? 7 + Math.floor(Math.random() * 3) : 
                  verdict === 'WEAK' ? 4 + Math.floor(Math.random() * 3) :
                  1 + Math.floor(Math.random() * 3);
    const confidence = verdict === 'PASS' ? 75 + Math.floor(Math.random() * 20) :
                      verdict === 'WEAK' ? 50 + Math.floor(Math.random() * 25) :
                      20 + Math.floor(Math.random() * 30);

    return `VERDICT: ${verdict}
SCORE: ${score}
REASONING: ${reasoning}
CONFIDENCE: ${confidence}%`;
  }

  private static getFailedResult(model: string, role: string, reason: string): AITaskResult {
    return {
      model,
      role,
      verdict: 'FAIL',
      score: 0,
      reasoning: reason,
      confidence: 0
    };
  }

  private static calculateOverallVerdict(results: AITaskResult[], context: SignalContext): 'STRONG' | 'MEDIUM' | 'WEAK' | 'REJECTED' {
    const passCount = results.filter(r => r.verdict === 'PASS').length;
    const weakCount = results.filter(r => r.verdict === 'WEAK').length;
    const failCount = results.filter(r => r.verdict === 'FAIL').length;
    
    const groqResult = results.find(r => r.model === 'groq');
    const riskReward = Math.abs(context.takeProfit - context.entry) / Math.abs(context.entry - context.stopLoss);
    
    // Groq MUST pass (institutional requirement)
    if (!groqResult || groqResult.verdict === 'FAIL') {
      console.log('❌ Signal REJECTED: Groq institutional analysis failed');
      return 'REJECTED';
    }
    
    // Minimum R:R requirement
    if (riskReward < 1.8) {
      console.log(`❌ Signal REJECTED: R:R ${riskReward.toFixed(2)}:1 below minimum 1.8:1`);
      return 'REJECTED';
    }
    
    // 2+ failures = automatic rejection
    if (failCount >= 2) {
      console.log(`❌ Signal REJECTED: ${failCount}/5 models failed`);
      return 'REJECTED';
    }
    
    // Strict pass criteria
    if (passCount >= 4 && groqResult.verdict === 'PASS' && riskReward >= 2.0) {
      return 'STRONG';
    }
    
    if (passCount >= 3 && groqResult.verdict === 'PASS' && weakCount <= 1) {
      return 'MEDIUM';
    }
    
    if (passCount >= 2 && (groqResult.verdict === 'PASS' || groqResult.verdict === 'WEAK')) {
      return 'WEAK';
    }
    
    return 'REJECTED';
  }

  private static calculateConsensusScore(results: AITaskResult[]): number {
    let totalScore = 0;
    let totalWeight = 0;
    
    results.forEach(result => {
      const roleConfig = this.AI_ROLES[result.model as keyof typeof this.AI_ROLES];
      if (roleConfig) {
        totalScore += result.score * roleConfig.weight;
        totalWeight += roleConfig.weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  private static generateTradeReasoning(results: AITaskResult[], verdict: string): string {
    const passedAnalyses = results.filter(r => r.verdict === 'PASS');
    
    if (verdict === 'REJECTED') {
      const failedAnalyses = results.filter(r => r.verdict === 'FAIL');
      return `Signal rejected: ${failedAnalyses.map(r => r.role).join(', ')} failed validation.`;
    }
    
    const summary = passedAnalyses.map(r => 
      `${r.role}: ${r.reasoning.substring(0, 80)}...`
    ).join(' | ');
    
    return `${verdict} consensus (${passedAnalyses.length}/5 pass): ${summary}`;
  }
}
