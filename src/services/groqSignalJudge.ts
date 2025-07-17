
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
  confidence_adjustment?: number;
  risk_assessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    factors: string[];
  };
  institutional_grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'FAIL';
  interrogation_notes: string[];
}

class GroqSignalJudge {
  private rejectedSignals: any[] = [];
  private interrogationCount = 0;

  async evaluateSignal(signalData: SignalValidationData): Promise<GroqJudgment> {
    this.interrogationCount++;
    console.log(`🏛️ GROQ INTERROGATION #${this.interrogationCount} INITIATED`);
    
    if (!groqService.isConfigured()) {
      console.error('❌ GROQ NOT CONFIGURED');
      throw new Error('GROQ service not configured');
    }

    try {
      const prompt = this.buildSimplifiedPrompt(signalData);
      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-8b-8192',
        temperature: 0.05,
        max_tokens: 800
      });

      console.log('📥 GROQ RESPONSE received');
      const judgment = this.parseGroqResponse(response);
      
      console.log('🎯 GROQ DECISION:', judgment.decision);
      console.log('🏆 GRADE:', judgment.institutional_grade);
      
      return judgment;
      
    } catch (error) {
      console.error('❌ GROQ INTERROGATION FAILED:', error);
      // Return a default rejection instead of throwing
      return {
        decision: 'reject',
        reason: `GROQ analysis failed: ${error.message}`,
        risk_assessment: {
          level: 'HIGH',
          factors: ['Analysis system unavailable']
        },
        institutional_grade: 'FAIL',
        interrogation_notes: ['System error during analysis']
      };
    }
  }

  private buildSimplifiedPrompt(data: SignalValidationData): string {
    const riskReward = ((Math.abs(data.target - data.entry) / Math.abs(data.entry - data.stop))).toFixed(2);
    
    return `Analyze this trading signal and respond with ONLY valid JSON:

SIGNAL DATA:
- Symbol: ${data.symbol}
- Direction: ${data.direction}
- Entry: ${data.entry}
- Stop: ${data.stop}
- Target: ${data.target}
- Risk:Reward: ${riskReward}:1
- Confidence: ${data.confidence}%
- Session: ${data.session}
- Frameworks: ${data.frameworks.join(', ')}

Evaluate this signal and respond with exactly this JSON format:
{
  "decision": "approve|reject|adjust",
  "reason": "Brief analysis reason",
  "confidence_adjustment": 0,
  "risk_assessment": {
    "level": "LOW|MEDIUM|HIGH",
    "factors": ["risk factor 1", "risk factor 2"]
  },
  "institutional_grade": "A+|A|B+|B|C|FAIL",
  "interrogation_notes": ["analysis point 1", "analysis point 2"]
}

Requirements:
- Minimum 2.5:1 risk-reward for approval
- Minimum 80% confidence for approval
- Strong session participation required
- Respond with ONLY the JSON, no other text`;
  }

  private parseGroqResponse(response: string): GroqJudgment {
    try {
      console.log('🔍 PARSING GROQ RESPONSE...');
      
      // Clean the response to extract JSON
      let cleanResponse = response.trim();
      
      // Try to find JSON in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }
      
      // Try to parse JSON
      const parsed = JSON.parse(cleanResponse);
      
      // Validate required fields
      if (!parsed.decision || !parsed.reason || !parsed.institutional_grade) {
        throw new Error('Invalid response structure');
      }

      // Ensure decision is valid
      if (!['approve', 'reject', 'adjust'].includes(parsed.decision)) {
        parsed.decision = 'reject';
      }

      // Ensure grade is valid
      if (!['A+', 'A', 'B+', 'B', 'C', 'FAIL'].includes(parsed.institutional_grade)) {
        parsed.institutional_grade = 'FAIL';
      }

      // Ensure risk assessment exists
      if (!parsed.risk_assessment) {
        parsed.risk_assessment = {
          level: 'HIGH',
          factors: ['Unknown risk factors']
        };
      }

      // Ensure interrogation notes exist
      if (!parsed.interrogation_notes) {
        parsed.interrogation_notes = ['Standard analysis'];
      }

      console.log('✅ GROQ RESPONSE PARSED SUCCESSFULLY');
      return parsed as GroqJudgment;
      
    } catch (error) {
      console.error('❌ GROQ RESPONSE PARSING FAILED:', error);
      console.error('📄 Raw response:', response);
      
      // Return a default rejection for parsing failures
      return {
        decision: 'reject',
        reason: 'Unable to parse AI analysis response',
        risk_assessment: {
          level: 'HIGH',
          factors: ['Analysis parsing error']
        },
        institutional_grade: 'FAIL',
        interrogation_notes: ['Response parsing failed']
      };
    }
  }

  async validateAndAdjustSignal(signalData: SignalValidationData): Promise<SignalValidationData | null> {
    console.log('🏛️ GROQ VALIDATION STARTING...');
    
    try {
      const groqResult = await this.evaluateSignal(signalData);
      
      switch (groqResult.decision) {
        case 'reject':
          console.log(`🚫 GROQ REJECTION: ${signalData.symbol}`);
          return null;

        case 'adjust':
          console.log(`🛠️ GROQ ADJUSTMENT: ${signalData.symbol}`);
          return {
            ...signalData,
            entry: groqResult.new_entry ?? signalData.entry,
            stop: groqResult.new_stop ?? signalData.stop,
            target: groqResult.new_target ?? signalData.target,
            confidence: groqResult.confidence_adjustment ? 
              Math.min(95, Math.max(60, signalData.confidence + groqResult.confidence_adjustment)) : 
              signalData.confidence
          };

        case 'approve':
        default:
          // Only approve A- grade or better
          if (['C', 'FAIL'].includes(groqResult.institutional_grade)) {
            console.log(`🚫 APPROVAL OVERRIDDEN: Grade ${groqResult.institutional_grade}`);
            return null;
          }

          console.log(`✅ GROQ APPROVAL: ${signalData.symbol}`);
          return signalData;
      }
    } catch (error) {
      console.error('❌ GROQ VALIDATION ERROR:', error);
      return null; // Fail safely - no signal if validation fails
    }
  }

  getRejectionStats(): { 
    total: number; 
    recent: any[];
    interrogationCount: number;
  } {
    return {
      total: this.rejectedSignals.length,
      recent: this.rejectedSignals.slice(-15),
      interrogationCount: this.interrogationCount
    };
  }

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
        context: 'Test signal',
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
