
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
    console.log('🧠 GROQ EVALUATION STARTING - Institutional AI Analysis');
    
    // CRITICAL: No fallback to auto-approval
    if (!groqService.isConfigured()) {
      console.error('❌ GROQ NOT CONFIGURED - BLOCKING SIGNAL GENERATION');
      throw new Error('GROQ AI validation service not configured - cannot generate signals');
    }

    try {
      const prompt = this.buildEvaluationPrompt(signalData);
      
      console.log('🧠 SENDING TO GROQ AI - Institutional analysis in progress...');
      const response = await groqService.generateResponse(prompt, {
        model: 'mixtral-8x7b-32768',
        temperature: 0.1, // Very low temperature for consistent institutional decisions
        max_tokens: 500
      });

      console.log('🧠 GROQ RESPONSE RECEIVED - Parsing institutional decision...');
      const judgment = this.parseGroqResponse(response);
      
      console.log(`🧠 GROQ DECISION: ${judgment.decision.toUpperCase()} - ${judgment.reason}`);
      return judgment;
      
    } catch (error) {
      console.error('❌ GROQ EVALUATION CRITICAL FAILURE:', error);
      // STRICT: NO fallback approval - must have GROQ validation
      throw new Error(`GROQ AI validation failed: ${error.message}`);
    }
  }

  private buildEvaluationPrompt(data: SignalValidationData): string {
    return `
🏛️ INSTITUTIONAL TRADING SIGNAL EVALUATION - GROQ AI ANALYSIS

SIGNAL PARAMETERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Symbol: ${data.symbol}
📈 Direction: ${data.direction}
💰 Entry Price: ${data.entry}
🛡️ Stop Loss: ${data.stop}
🎯 Take Profit: ${data.target}
⚖️ Risk:Reward Ratio: ${((Math.abs(data.target - data.entry) / Math.abs(data.entry - data.stop))).toFixed(2)}:1
🕐 Trading Session: ${data.session}
📈 RSI Level: ${data.rsi || 'N/A'}
📊 Volume: ${data.volume || 'N/A'}
🎯 Confluence Score: ${data.confluence}/6
💪 Base Confidence: ${data.confidence}%

TECHNICAL FRAMEWORK ANALYSIS:
${data.frameworks.map(f => `✅ ${f}`).join('\n')}

ADDITIONAL CONTEXT:
${data.context || 'Standard institutional setup'}

🔍 INSTITUTIONAL EVALUATION CRITERIA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 📊 ENTRY TIMING ANALYSIS
   - Reject mid-push entries (>70% of move completed)
   - Verify optimal entry positioning
   - Check for liquidity hunt completion

2. 🕐 SESSION STRENGTH VALIDATION
   - Assess current session volatility
   - Verify institutional participation levels
   - Reject dead session without catalyst

3. 🎯 CONFLUENCE QUALITY CHECK
   - Validate confluence authenticity
   - Detect manipulated/weak setups
   - Ensure multi-timeframe alignment

4. 🏗️ STRUCTURE ALIGNMENT AUDIT
   - Check against major structural levels
   - Verify institutional flow direction
   - Assess liquidity pool positioning

5. 🎣 LIQUIDITY TRAP DETECTION
   - Identify obvious trap setups
   - Verify genuine breakout/breakdown
   - Check for stop hunt completion

6. ⚖️ RISK:REWARD SUSTAINABILITY
   - Minimum 2.0:1 requirement
   - Realistic target achievability
   - Optimal stop loss placement

MANDATORY RESPONSE FORMAT (JSON ONLY):
{
  "decision": "approve|reject|adjust",
  "reason": "Detailed institutional reasoning (max 100 chars)",
  "new_entry": optional_adjusted_entry_price,
  "new_stop": optional_adjusted_stop_loss,
  "new_target": optional_adjusted_take_profit,
  "suggested_direction": optional_direction_correction,
  "confidence_adjustment": optional_confidence_boost_or_reduction
}

🚨 INSTITUTIONAL MANDATE: Apply STRICT institutional standards. Reject weak setups mercilessly. Only approve signals that meet professional trading criteria. No mercy for marginal setups.

EVALUATE NOW:`;
  }

  private parseGroqResponse(response: string): GroqJudgment {
    try {
      console.log('🧠 PARSING GROQ RESPONSE:', response.substring(0, 200) + '...');
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ NO JSON FOUND IN GROQ RESPONSE');
        throw new Error('Invalid GROQ response: No JSON structure found');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.decision || !parsed.reason) {
        console.error('❌ INVALID GROQ RESPONSE STRUCTURE');
        throw new Error('Invalid GROQ response: Missing required fields');
      }

      // Ensure decision is valid
      if (!['approve', 'reject', 'adjust'].includes(parsed.decision)) {
        console.error('❌ INVALID GROQ DECISION VALUE:', parsed.decision);
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
    console.log('🧠 GROQ INSTITUTIONAL VALIDATION STARTING...');
    
    const groqResult = await this.evaluateSignal(signalData);

    switch (groqResult.decision) {
      case 'reject':
        this.logRejectedSignal(signalData, groqResult.reason);
        console.log(`🚫 GROQ INSTITUTIONAL REJECTION: ${signalData.symbol} - ${groqResult.reason}`);
        return null; // Signal completely blocked

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
        
        console.log('✅ GROQ ADJUSTMENTS APPLIED - Signal optimized by institutional AI');
        return adjustedSignal;

      case 'approve':
      default:
        console.log(`✅ GROQ INSTITUTIONAL APPROVAL: ${signalData.symbol} - ${groqResult.reason}`);
        
        // Apply confidence boost if suggested
        if (groqResult.confidence_adjustment) {
          const boostedSignal = {
            ...signalData,
            confidence: Math.min(95, Math.max(60, signalData.confidence + groqResult.confidence_adjustment))
          };
          console.log(`📈 GROQ CONFIDENCE BOOST APPLIED: +${groqResult.confidence_adjustment}%`);
          return boostedSignal;
        }
        
        return signalData; // Signal approved as-is
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
}

export const groqSignalJudge = new GroqSignalJudge();
export type { SignalValidationData, GroqJudgment };
