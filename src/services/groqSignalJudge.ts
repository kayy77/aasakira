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
    try {
      const prompt = this.buildEvaluationPrompt(signalData);
      
      const response = await groqService.generateResponse(prompt, {
        model: 'mixtral-8x7b-32768',
        temperature: 0.1, // Low temperature for consistent decisions
        max_tokens: 500
      });

      return this.parseGroqResponse(response);
    } catch (error) {
      console.error('❌ Groq signal evaluation failed:', error);
      // Fallback: approve signal if Groq fails
      return {
        decision: 'approve',
        reason: 'Groq evaluation unavailable - passing through original signal'
      };
    }
  }

  private buildEvaluationPrompt(data: SignalValidationData): string {
    return `
🧠 INSTITUTIONAL SIGNAL EVALUATION REQUIRED

Market Context:
- Symbol: ${data.symbol}
- Direction: ${data.direction}
- Entry: ${data.entry}
- Stop Loss: ${data.stop}
- Take Profit: ${data.target}
- Risk:Reward: ${((Math.abs(data.target - data.entry) / Math.abs(data.entry - data.stop))).toFixed(1)}:1
- Session: ${data.session}
- Confluence Score: ${data.confluence}/6
- Confidence: ${data.confidence}%

Technical Framework Analysis:
${data.frameworks.map(f => `✅ ${f}`).join('\n')}

${data.rsi ? `RSI: ${data.rsi}` : ''}
${data.volume ? `Volume: ${data.volume}` : ''}
${data.context ? `Additional Context: ${data.context}` : ''}

EVALUATION CRITERIA:
🔍 Check for mid-push entries (reject if entering after 70% of move completed)
🔍 Validate session strength (reject if dead session without volatility spike)
🔍 Assess confluence quality (reject if confluence is weak/manipulated)
🔍 Verify structure alignment (reject if against major structure)
🔍 Check for liquidity hunt potential (reject if obvious trap setup)
🔍 Validate risk:reward sustainability (reject if <2.0:1 or unrealistic targets)

RESPONSE FORMAT (JSON only):
{
  "decision": "approve|reject|adjust",
  "reason": "Brief institutional reasoning",
  "new_entry": optional_adjusted_entry,
  "new_stop": optional_adjusted_stop, 
  "new_target": optional_adjusted_target,
  "suggested_direction": optional_direction_if_wrong,
  "confidence_adjustment": optional_boost_or_reduction
}

Evaluate this signal with institutional precision. Reject weak setups mercilessly.`;
  }

  private parseGroqResponse(response: string): GroqJudgment {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Groq response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!parsed.decision || !parsed.reason) {
        throw new Error('Invalid Groq response format');
      }

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
      console.error('❌ Failed to parse Groq response:', error);
      // Default to approval if parsing fails
      return {
        decision: 'approve',
        reason: 'Groq response parsing failed - approving original signal'
      };
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

    console.log(`🚫 GROQ REJECTED SIGNAL: ${data.symbol} ${data.direction} - ${reason}`);
  }

  async validateAndAdjustSignal(signalData: SignalValidationData): Promise<SignalValidationData | null> {
    const groqResult = await this.evaluateSignal(signalData);

    switch (groqResult.decision) {
      case 'reject':
        this.logRejectedSignal(signalData, groqResult.reason);
        return null; // Signal blocked

      case 'adjust':
        console.log(`🛠️ GROQ ADJUSTED SIGNAL: ${signalData.symbol} - ${groqResult.reason}`);
        
        return {
          ...signalData,
          entry: groqResult.new_entry ?? signalData.entry,
          stop: groqResult.new_stop ?? signalData.stop,
          target: groqResult.new_target ?? signalData.target,
          direction: groqResult.suggested_direction ?? signalData.direction,
          confidence: groqResult.confidence_adjustment ? 
            Math.min(95, Math.max(60, signalData.confidence + groqResult.confidence_adjustment)) : 
            signalData.confidence
        };

      case 'approve':
      default:
        // Apply confidence boost if suggested
        if (groqResult.confidence_adjustment) {
          return {
            ...signalData,
            confidence: Math.min(95, Math.max(60, signalData.confidence + groqResult.confidence_adjustment))
          };
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

  // Advanced enhancement: Session strength analyzer
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
