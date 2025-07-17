import { groqService } from './groqService';

interface SignalValidationData {
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  stop: number;
  target: number;
  frameworks: string[];
  session: string;
  rsi?: number;
  volume?: string;
  context?: string;
  confluence: number;
  confidence: number;
}

interface GroqJudgment {
  decision: 'approve' | 'reject' | 'adjust';
  reason: string;
  new_entry?: number;
  new_stop?: number;
  new_target?: number;
  suggested_direction?: 'BUY' | 'SELL';
  confidence_adjustment?: number;
}

interface RejectedSignalLog {
  reason: string;
  frameworks: string[];
  direction: string;
  timestamp: number;
  symbol: string;
}

class GroqSignalJudge {
  private rejectedSignals: RejectedSignalLog[] = [];

  async evaluateSignal(signalData: SignalValidationData): Promise<GroqJudgment> {
    console.log('🏛️ GROQ INSTITUTIONAL EVALUATION STARTING...');
    console.log('📊 Signal Data:', {
      symbol: signalData.symbol,
      direction: signalData.direction,
      entry: signalData.entry,
      confidence: signalData.confidence,
      confluence: signalData.confluence
    });
    
    // STRICT: Ensure GROQ is configured
    if (!groqService.isConfigured()) {
      console.error('❌ GROQ NOT CONFIGURED - BLOCKING ALL SIGNALS');
      throw new Error('GROQ AI validation service not configured - cannot generate signals');
    }

    try {
      const prompt = this.buildEvaluationPrompt(signalData);
      
      console.log('🔄 SENDING TO GROQ AI for institutional analysis...');
      const response = await groqService.generateResponse(prompt, {
        model: 'mixtral-8x7b-32768',
        temperature: 0.1,
        max_tokens: 500
      });

      console.log('📥 RAW GROQ RESPONSE received');
      const judgment = this.parseGroqResponse(response);
      
      console.log('🎯 GROQ INSTITUTIONAL DECISION:', {
        decision: judgment.decision,
        reason: judgment.reason,
        adjustments: judgment.new_entry ? 'YES' : 'NO'
      });
      
      return judgment;
      
    } catch (error) {
      console.error('❌ GROQ EVALUATION CRITICAL FAILURE:', error);
      // NO FALLBACK - Must have GROQ validation
      throw new Error(`GROQ AI validation failed: ${error.message}`);
    }
  }

  private buildEvaluationPrompt(data: SignalValidationData): string {
    const prompt = `
🏛️ INSTITUTIONAL TRADING SIGNAL EVALUATION

SIGNAL PARAMETERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Symbol: ${data.symbol}
📈 Direction: ${data.direction}
💰 Entry Price: ${data.entry}
🛡️ Stop Loss: ${data.stop}
🎯 Take Profit: ${data.target}
⚖️ Risk:Reward: ${((Math.abs(data.target - data.entry) / Math.abs(data.entry - data.stop))).toFixed(2)}:1
🕐 Session: ${data.session}
📈 RSI: ${data.rsi || 'N/A'}
📊 Volume: ${data.volume || 'N/A'}
🎯 Confluence: ${data.confluence}/6
💪 Confidence: ${data.confidence}%

FRAMEWORKS: ${data.frameworks.join(', ')}
CONTEXT: ${data.context || 'Standard setup'}

EVALUATION CRITERIA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Entry Timing (reject mid-push entries)
2. Session Strength (verify institutional participation)
3. Confluence Quality (validate authenticity)
4. Structure Alignment (check major levels)
5. Liquidity Detection (identify trap setups)
6. Risk:Reward (minimum 2.0:1 required)

STRICT INSTITUTIONAL STANDARDS:
- Minimum 85% confidence required
- Minimum 2.5:1 risk-reward ratio
- Active session required
- Strong confluence validation
- No obvious trap setups

RESPONSE FORMAT (JSON ONLY):
{
  "decision": "approve|reject|adjust",
  "reason": "Brief institutional reasoning",
  "new_entry": optional_price,
  "new_stop": optional_price,
  "new_target": optional_price,
  "confidence_adjustment": optional_number
}

EVALUATE NOW - Apply BRUTAL institutional standards:`;

    console.log('📝 GROQ PROMPT PREPARED:', prompt.length, 'characters');
    return prompt;
  }

  private parseGroqResponse(response: string): GroqJudgment {
    try {
      console.log('🔍 PARSING GROQ RESPONSE...');
      console.log('📄 Response preview:', response.substring(0, 300) + '...');
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ NO VALID JSON FOUND IN GROQ RESPONSE');
        throw new Error('Invalid GROQ response: No JSON structure found');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.decision || !parsed.reason) {
        console.error('❌ INVALID GROQ RESPONSE STRUCTURE:', parsed);
        throw new Error('Invalid GROQ response: Missing required fields');
      }

      // Ensure decision is valid
      if (!['approve', 'reject', 'adjust'].includes(parsed.decision)) {
        console.error('❌ INVALID GROQ DECISION:', parsed.decision);
        throw new Error(`Invalid GROQ decision: ${parsed.decision}`);
      }

      console.log('✅ GROQ RESPONSE PARSED SUCCESSFULLY');
      return {
        decision: parsed.decision,
        reason: parsed.reason,
        new_entry: parsed.new_entry,
        new_stop: parsed.new_stop,
        new_target: parsed.new_target,
        suggested_direction: parsed.suggested_direction,
        confidence_adjustment: parsed.confidence_adjustment
      };
    } catch (error) {
      console.error('❌ GROQ RESPONSE PARSING FAILED:', error);
      console.error('📄 Raw response that failed:', response);
      throw new Error(`GROQ response parsing failed: ${error.message}`);
    }
  }

  private logRejectedSignal(data: SignalValidationData, reason: string): void {
    const rejectedLog: RejectedSignalLog = {
      reason,
      frameworks: data.frameworks,
      direction: data.direction,
      timestamp: Date.now(),
      symbol: data.symbol
    };

    this.rejectedSignals.push(rejectedLog);
    
    // Keep only last 100 rejections
    if (this.rejectedSignals.length > 100) {
      this.rejectedSignals.shift();
    }

    console.log(`🚫 GROQ INSTITUTIONAL REJECTION: ${data.symbol} ${data.direction} - ${reason}`);
  }

  async validateAndAdjustSignal(signalData: SignalValidationData): Promise<SignalValidationData | null> {
    console.log('🏛️ GROQ INSTITUTIONAL VALIDATION PROCESS STARTING...');
    
    const groqResult = await this.evaluateSignal(signalData);
    console.log('🎯 GROQ DECISION RECEIVED:', groqResult.decision);

    switch (groqResult.decision) {
      case 'reject':
        this.logRejectedSignal(signalData, groqResult.reason);
        console.log(`🚫 GROQ INSTITUTIONAL REJECTION: ${signalData.symbol} - ${groqResult.reason}`);
        return null;

      case 'adjust':
        console.log(`🛠️ GROQ INSTITUTIONAL ADJUSTMENT: ${signalData.symbol} - ${groqResult.reason}`);
        
        const adjustedSignal = {
          ...signalData,
          entry: groqResult.new_entry ?? signalData.entry,
          stop: groqResult.new_stop ?? signalData.stop,
          target: groqResult.new_target ?? signalData.target,
          direction: groqResult.suggested_direction ?? signalData.direction,
          confidence: groqResult.confidence_adjustment ? 
            Math.min(95, Math.max(60, signalData.confidence + groqResult.confidence_adjustment)) : 
            signalData.confidence
        };
        
        console.log('✅ GROQ ADJUSTMENTS APPLIED:', {
          originalEntry: signalData.entry,
          newEntry: adjustedSignal.entry,
          originalConfidence: signalData.confidence,
          newConfidence: adjustedSignal.confidence
        });
        return adjustedSignal;

      case 'approve':
      default:
        console.log(`✅ GROQ INSTITUTIONAL APPROVAL: ${signalData.symbol} - ${groqResult.reason}`);
        
        if (groqResult.confidence_adjustment) {
          const boostedSignal = {
            ...signalData,
            confidence: Math.min(95, Math.max(60, signalData.confidence + groqResult.confidence_adjustment))
          };
          console.log(`📈 GROQ CONFIDENCE BOOST: ${signalData.confidence}% → ${boostedSignal.confidence}%`);
          return boostedSignal;
        }
        
        return signalData;
    }
  }

  getRejectionStats(): { total: number; recent: RejectedSignalLog[] } {
    return {
      total: this.rejectedSignals.length,
      recent: this.rejectedSignals.slice(-10) // Last 10 rejections
    };
  }

  // Enhanced session strength analyzer
  analyzeSessionStrength(symbol: string): number {
    const hour = new Date().getUTCHours();
    const day = new Date().getUTCDay();
    
    // London session (8-17 UTC)
    if (hour >= 8 && hour <= 17 && day >= 1 && day <= 5) {
      return 85;
    }
    
    // NY session (13-22 UTC)  
    if (hour >= 13 && hour <= 22 && day >= 1 && day <= 5) {
      return 90;
    }
    
    // London/NY overlap (13-17 UTC)
    if (hour >= 13 && hour <= 17 && day >= 1 && day <= 5) {
      return 95;
    }
    
    // Asian session (22-8 UTC)
    if ((hour >= 22 || hour <= 8) && day >= 1 && day <= 5) {
      return 60;
    }
    
    // Weekend
    return 30;
  }

  // Price context analyzer for enhanced decisions
  generatePriceContext(symbol: string, entry: number, frameworks: string[]): string {
    const contexts = [];
    
    if (frameworks.includes('Fair Value Gap')) {
      contexts.push('approaching premium FVG zone');
    }
    
    if (frameworks.includes('Liquidity Sweep')) {
      contexts.push('recent liquidity grab completed');
    }
    
    if (frameworks.includes('Break of Structure')) {
      contexts.push('structure break confirmed with volume');
    }
    
    if (frameworks.includes('Order Block')) {
      contexts.push('institutional order block touch');
    }
    
    return contexts.join(', ') || 'standard technical setup';
  }

  // Test method to verify GROQ judge is working
  async testGroqJudge(): Promise<boolean> {
    try {
      console.log('🧪 TESTING GROQ SIGNAL JUDGE...');
      
      const testSignal: SignalValidationData = {
        symbol: 'EURUSD',
        direction: 'BUY',
        entry: 1.1000,
        stop: 1.0950,
        target: 1.1100,
        frameworks: ['Order Block', 'Break of Structure'],
        session: 'London',
        rsi: 45,
        volume: 'High',
        context: 'Test signal for GROQ validation',
        confluence: 4,
        confidence: 85
      };

      const result = await this.evaluateSignal(testSignal);
      console.log('🧪 GROQ JUDGE TEST RESULT:', result);
      
      return result.decision !== undefined && result.reason !== undefined;
    } catch (error) {
      console.error('🧪 GROQ JUDGE TEST FAILED:', error);
      return false;
    }
  }
}

export const groqSignalJudge = new GroqSignalJudge();
export type { SignalValidationData, GroqJudgment };
