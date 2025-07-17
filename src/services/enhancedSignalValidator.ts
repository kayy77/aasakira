
import { groqService } from './groqService';

interface SignalValidationInput {
  pair: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  rrr: number;
  confluenceScore: number;
  filtersPassed: string[];
  session: string;
  timeframe: string;
}

interface ValidationResult {
  isValid: boolean;
  reason: string;
  adjustments?: {
    entry?: number;
    stopLoss?: number;
    takeProfit?: number;
    confidence?: number;
  };
}

class EnhancedSignalValidator {
  // STEP 1: Local Validation Logic
  private isValidSignal(signal: SignalValidationInput): boolean {
    const slDistance = Math.abs(signal.entry - signal.stopLoss);
    const tpDistance = Math.abs(signal.takeProfit - signal.entry);

    const validationChecks = [
      signal.confidence >= 75,
      signal.rrr >= 2,
      signal.confluenceScore >= 5,
      slDistance > 0.001,
      tpDistance > slDistance,
      signal.filtersPassed.includes("BOS") || signal.filtersPassed.includes("Break of Structure"),
      signal.filtersPassed.includes("FVG") || signal.filtersPassed.includes("Fair Value Gap")
    ];

    console.log('🔍 Local Validation Checks:', {
      confidence: signal.confidence >= 75,
      rrr: signal.rrr >= 2,
      confluence: signal.confluenceScore >= 5,
      slDistance: slDistance > 0.001,
      tpDistance: tpDistance > slDistance,
      hasBOS: signal.filtersPassed.includes("BOS") || signal.filtersPassed.includes("Break of Structure"),
      hasFVG: signal.filtersPassed.includes("FVG") || signal.filtersPassed.includes("Fair Value Gap")
    });

    return validationChecks.every(check => check === true);
  }

  // STEP 2: Groq Institutional Reasoning Prompt
  private buildGroqPrompt(signal: SignalValidationInput): string {
    return `
You are an elite institutional AI signal validator for ${signal.pair}.

SIGNAL ANALYSIS:
Entry: ${signal.entry}
Stop Loss: ${signal.stopLoss}
Take Profit: ${signal.takeProfit}
R:R: ${signal.rrr}:1
Confidence: ${signal.confidence}%
Session: ${signal.session}
Timeframe: ${signal.timeframe}
Filters passed: ${signal.filtersPassed.join(", ")}

INSTITUTIONAL VALIDATION CHECKLIST:
1. Smart Money Concept structure (BOS, FVG, liquidity sweep)?
2. Entry positioned logically (Order Block/FVG or sweep)?
3. Stop loss protected by structure, not exposed?
4. R:R realistic for institutional standards?
5. Would a hedge fund trader take this trade?

DECISION RULES:
- If ANY core element is missing, respond with "REJECT"
- If valid, respond with "APPROVE" and explain why
- Include specific reasoning about market structure

Respond with either:
"APPROVE: [reason]" or "REJECT: [reason]"
`;
  }

  // STEP 3 & 4: Call Groq API and parse response
  async validateSignal(signal: SignalValidationInput): Promise<ValidationResult> {
    try {
      // Local validation first
      if (!this.isValidSignal(signal)) {
        console.log('❌ Signal failed local validation checks');
        return {
          isValid: false,
          reason: "Rejected: Signal failed local validation checks (confidence <75%, R:R <2:1, confluence <5, missing BOS/FVG)"
        };
      }

      console.log('✅ Signal passed local validation, sending to Groq...');

      // Groq institutional validation
      const groqPrompt = this.buildGroqPrompt(signal);
      
      if (!groqService.isConfigured()) {
        console.log('⚠️ Groq not configured, falling back to local validation only');
        return {
          isValid: true,
          reason: "Approved by local validation (Groq not configured)"
        };
      }

      const groqResponse = await groqService.generateResponse(groqPrompt, {
        model: 'llama3-8b-8192',
        temperature: 0.1,
        max_tokens: 300
      });

      console.log('🧠 Groq Response:', groqResponse);

      // Parse Groq decision
      const isApproved = groqResponse.toLowerCase().includes('approve');
      
      if (!isApproved) {
        console.log('🚫 Rejected by Groq: Institutional logic not satisfied');
        return {
          isValid: false,
          reason: `Rejected by Groq AI: ${groqResponse}`
        };
      }

      console.log('✅ Final Signal Approved by both local and Groq validation');
      return {
        isValid: true,
        reason: `Approved by institutional AI validation: ${groqResponse}`
      };

    } catch (error) {
      console.error('❌ Validation error:', error);
      return {
        isValid: false,
        reason: `Validation failed: ${error.message}`
      };
    }
  }

  // Enhanced validation with session-specific requirements
  async validateWithSessionContext(signal: SignalValidationInput): Promise<ValidationResult> {
    const hour = new Date().getUTCHours();
    const isActiveSession = (hour >= 6 && hour <= 16); // London + NY sessions
    
    // Stricter requirements during quiet sessions
    if (!isActiveSession) {
      signal.confidence = Math.max(signal.confidence, 80); // Boost minimum confidence
      signal.confluenceScore = Math.max(signal.confluenceScore, 6); // Require more confluence
    }

    return this.validateSignal(signal);
  }
}

export const enhancedSignalValidator = new EnhancedSignalValidator();
export type { SignalValidationInput, ValidationResult };
