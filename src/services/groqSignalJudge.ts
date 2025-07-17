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
  decision: 'approve' | 'reject' | 'adjust' | 'requires_further_analysis';
  reason: string;
  new_entry?: number;
  new_stop?: number;
  new_target?: number;
  suggested_direction?: 'BUY' | 'SELL';
  confidence_adjustment?: number;
  risk_assessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    factors: string[];
    mitigation_required: boolean;
  };
  institutional_grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'FAIL';
  interrogation_notes: string[];
}

interface RejectedSignalLog {
  reason: string;
  frameworks: string[];
  direction: string;
  timestamp: number;
  symbol: string;
  interrogation_depth: number;
  failure_points: string[];
}

class GroqSignalJudge {
  private rejectedSignals: RejectedSignalLog[] = [];
  private interrogationCount = 0;

  async evaluateSignal(signalData: SignalValidationData): Promise<GroqJudgment> {
    this.interrogationCount++;
    console.log(`🏛️ GROQ INSTITUTIONAL INTERROGATION #${this.interrogationCount} INITIATED`);
    console.log('🔍 DEEP ANALYSIS MODE: Maximum scrutiny applied');
    console.log('📊 Signal Under Review:', {
      symbol: signalData.symbol,
      direction: signalData.direction,
      entry: signalData.entry,
      confidence: signalData.confidence,
      confluence: signalData.confluence,
      riskReward: ((Math.abs(signalData.target - signalData.entry) / Math.abs(signalData.entry - signalData.stop))).toFixed(2)
    });
    
    // MANDATORY: Ensure GROQ is configured
    if (!groqService.isConfigured()) {
      console.error('❌ GROQ NOT CONFIGURED - BLOCKING ALL SIGNALS INDEFINITELY');
      throw new Error('GROQ AI validation service not configured - ZERO signals allowed without institutional analysis');
    }

    try {
      // PHASE 1: Initial Intensive Interrogation
      console.log('🔥 PHASE 1: Initial Intensive Analysis Starting...');
      const initialPrompt = this.buildIntensiveInterrogationPrompt(signalData);
      
      const initialResponse = await groqService.generateResponse(initialPrompt, {
        model: 'llama3-8b-8192',
        temperature: 0.05, // Even lower temperature for maximum precision
        max_tokens: 800
      });

      console.log('📥 PHASE 1 GROQ RESPONSE received - Parsing institutional verdict...');
      const initialJudgment = this.parseGroqResponse(initialResponse);
      
      // PHASE 2: If signal passes initial screening, conduct DEEP interrogation
      if (initialJudgment.decision === 'approve' || initialJudgment.decision === 'adjust') {
        console.log('🔍 PHASE 2: DEEP INSTITUTIONAL INTERROGATION Required...');
        console.log('⚡ Signal passed initial screening - Conducting advanced analysis...');
        
        const deepPrompt = this.buildDeepInterrogationPrompt(signalData, initialJudgment);
        
        const deepResponse = await groqService.generateResponse(deepPrompt, {
          model: 'llama3-8b-8192',
          temperature: 0.03, // Ultra-low temperature for final analysis
          max_tokens: 1000
        });

        console.log('📥 PHASE 2 DEEP ANALYSIS COMPLETE - Final institutional verdict...');
        const finalJudgment = this.parseGroqResponse(deepResponse);
        
        console.log('🎯 DUAL-PHASE GROQ INSTITUTIONAL DECISION:', {
          phase1: initialJudgment.decision,
          phase2: finalJudgment.decision,
          finalGrade: finalJudgment.institutional_grade,
          riskLevel: finalJudgment.risk_assessment.level
        });
        
        return finalJudgment;
      } else {
        console.log('🚫 PHASE 1 REJECTION - Signal failed initial institutional screening');
        return initialJudgment;
      }
      
    } catch (error) {
      console.error('❌ GROQ INSTITUTIONAL INTERROGATION CRITICAL FAILURE:', error);
      // ABSOLUTE ZERO TOLERANCE - No signals without GROQ approval
      throw new Error(`GROQ AI institutional interrogation failed: ${error.message} - Signal generation BLOCKED`);
    }
  }

  private buildIntensiveInterrogationPrompt(data: SignalValidationData): string {
    const prompt = `
🏛️ INSTITUTIONAL SIGNAL INTERROGATION PROTOCOL - PHASE 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ MAXIMUM SCRUTINY REQUIRED ⚠️
This signal MUST undergo BRUTAL institutional analysis before ANY approval consideration.

SIGNAL PARAMETERS UNDER INVESTIGATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Symbol: ${data.symbol}
📈 Direction: ${data.direction}
💰 Entry Price: ${data.entry}
🛡️ Stop Loss: ${data.stop}
🎯 Take Profit: ${data.target}
⚖️ Risk:Reward Ratio: ${((Math.abs(data.target - data.entry) / Math.abs(data.entry - data.stop))).toFixed(2)}:1
🕐 Trading Session: ${data.session}
📈 RSI Level: ${data.rsi || 'N/A'}
📊 Volume Status: ${data.volume || 'N/A'}
🎯 Confluence Score: ${data.confluence}/6
💪 Initial Confidence: ${data.confidence}%

TECHNICAL FRAMEWORKS: ${data.frameworks.join(', ')}
MARKET CONTEXT: ${data.context || 'Standard institutional setup'}

INSTITUTIONAL INTERROGATION CRITERIA (ZERO TOLERANCE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ENTRY TIMING VALIDATION: Is this entry at optimal institutional level? Any signs of retail trap?
2. SESSION STRENGTH ANALYSIS: Is institutional participation confirmed for this session?
3. CONFLUENCE AUTHENTICITY: Are these confluences genuine or manufactured?
4. STRUCTURE INTEGRITY: Does this align with major institutional support/resistance?
5. LIQUIDITY TRAP DETECTION: Any signs this is a liquidity grab setup against retail?
6. RISK:REWARD SUSTAINABILITY: Can this RR ratio be maintained under market stress?
7. VOLUME CONFIRMATION: Does volume support institutional participation?
8. MARKET CONTEXT VALIDATION: Does broader market context support this direction?

INSTITUTIONAL GRADING SYSTEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• A+ Grade: Perfect institutional setup, zero concerns
• A Grade: Strong institutional setup, minor concerns
• B+ Grade: Good setup with manageable risks
• B Grade: Acceptable setup with notable risks
• C Grade: Marginal setup, high risk
• FAIL: Unacceptable for institutional standards

MANDATORY ANALYSIS REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Minimum 85% confidence required for any approval consideration
- Minimum 2.5:1 risk-reward ratio mandatory
- Active session participation essential
- Strong confluence validation required
- Zero tolerance for obvious retail traps
- Volume confirmation mandatory for approval

RESPONSE FORMAT (STRICT JSON ONLY):
{
  "decision": "approve|reject|adjust|requires_further_analysis",
  "reason": "Detailed institutional reasoning with specific concerns",
  "new_entry": optional_adjusted_price,
  "new_stop": optional_adjusted_price,
  "new_target": optional_adjusted_price,
  "confidence_adjustment": optional_percentage_change,
  "risk_assessment": {
    "level": "LOW|MEDIUM|HIGH|EXTREME",
    "factors": ["specific risk factors identified"],
    "mitigation_required": true/false
  },
  "institutional_grade": "A+|A|B+|B|C|FAIL",
  "interrogation_notes": ["specific analysis points", "concerns identified", "validation results"]
}

🔥 CONDUCT INSTITUTIONAL INTERROGATION NOW - APPLY MAXIMUM SCRUTINY:`;

    console.log('📝 INTENSIVE GROQ INTERROGATION PROMPT PREPARED:', prompt.length, 'characters');
    return prompt;
  }

  private buildDeepInterrogationPrompt(data: SignalValidationData, initialJudgment: GroqJudgment): string {
    const prompt = `
🏛️ INSTITUTIONAL SIGNAL INTERROGATION PROTOCOL - PHASE 2 DEEP ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ SIGNAL PASSED INITIAL SCREENING - CONDUCTING FINAL INSTITUTIONAL VERIFICATION ⚡

PHASE 1 RESULTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Initial Decision: ${initialJudgment.decision}
Initial Grade: ${initialJudgment.institutional_grade}
Risk Level: ${initialJudgment.risk_assessment.level}
Initial Concerns: ${initialJudgment.reason}

DEEP INTERROGATION FOCUS AREAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. EXECUTION PRECISION: Can this trade be executed at stated levels in current market?
2. SLIPPAGE ANALYSIS: What's the realistic slippage expectation during execution?
3. SPREAD IMPACT: How will spread affect the actual risk:reward ratio?
4. MARKET DEPTH: Is there sufficient liquidity at these levels?
5. TIME DECAY: How will signal quality degrade over time?
6. CORRELATION RISKS: What correlated instruments could impact this trade?
7. NEWS EVENT RISKS: Are there upcoming events that could invalidate setup?
8. INSTITUTIONAL COMPETITION: Are other institutions likely positioned similarly?

FINAL VALIDATION CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Entry timing optimal for institutional execution
✓ Stop loss placement protects against institutional stops hunting
✓ Take profit realistic given current market structure
✓ Risk:reward ratio maintains integrity under execution conditions
✓ Signal maintains edge over retail positioning
✓ Setup aligns with broader institutional flow

INSTITUTIONAL FINAL VERDICT REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Must achieve minimum A- grade for approval
- Risk assessment must be MEDIUM or below
- All execution concerns must be addressed
- Signal must maintain institutional edge

PROVIDE FINAL INSTITUTIONAL VERDICT (STRICT JSON):
{
  "decision": "approve|reject|adjust",
  "reason": "Final institutional verdict with execution considerations",
  "new_entry": optional_final_adjustment,
  "new_stop": optional_final_adjustment,
  "new_target": optional_final_adjustment,
  "confidence_adjustment": optional_final_adjustment,
  "risk_assessment": {
    "level": "LOW|MEDIUM|HIGH|EXTREME",
    "factors": ["final risk factors"],
    "mitigation_required": true/false
  },
  "institutional_grade": "A+|A|B+|B|C|FAIL",
  "interrogation_notes": ["final analysis points", "execution considerations", "institutional verdict reasoning"]
}

🔥 DELIVER FINAL INSTITUTIONAL VERDICT NOW:`;

    console.log('📝 DEEP GROQ INTERROGATION PROMPT PREPARED:', prompt.length, 'characters');
    return prompt;
  }

  private parseGroqResponse(response: string): GroqJudgment {
    try {
      console.log('🔍 PARSING GROQ INSTITUTIONAL VERDICT...');
      console.log('📄 Response preview:', response.substring(0, 400) + '...');
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ NO VALID JSON FOUND IN GROQ INSTITUTIONAL RESPONSE');
        throw new Error('Invalid GROQ institutional response: No JSON structure found');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields with enhanced structure
      if (!parsed.decision || !parsed.reason || !parsed.institutional_grade || !parsed.risk_assessment) {
        console.error('❌ INVALID GROQ INSTITUTIONAL RESPONSE STRUCTURE:', parsed);
        throw new Error('Invalid GROQ institutional response: Missing required institutional analysis fields');
      }

      // Ensure decision is valid
      if (!['approve', 'reject', 'adjust', 'requires_further_analysis'].includes(parsed.decision)) {
        console.error('❌ INVALID GROQ INSTITUTIONAL DECISION:', parsed.decision);
        throw new Error(`Invalid GROQ institutional decision: ${parsed.decision}`);
      }

      // Validate institutional grade
      if (!['A+', 'A', 'B+', 'B', 'C', 'FAIL'].includes(parsed.institutional_grade)) {
        console.error('❌ INVALID INSTITUTIONAL GRADE:', parsed.institutional_grade);
        parsed.institutional_grade = 'FAIL'; // Default to fail for invalid grades
      }

      console.log('✅ GROQ INSTITUTIONAL RESPONSE PARSED SUCCESSFULLY');
      console.log('🏆 Institutional Grade:', parsed.institutional_grade);
      console.log('⚠️ Risk Level:', parsed.risk_assessment.level);
      
      return {
        decision: parsed.decision,
        reason: parsed.reason,
        new_entry: parsed.new_entry,
        new_stop: parsed.new_stop,
        new_target: parsed.new_target,
        suggested_direction: parsed.suggested_direction,
        confidence_adjustment: parsed.confidence_adjustment,
        risk_assessment: parsed.risk_assessment || {
          level: 'HIGH',
          factors: ['Unknown risk factors'],
          mitigation_required: true
        },
        institutional_grade: parsed.institutional_grade,
        interrogation_notes: parsed.interrogation_notes || ['Standard institutional analysis']
      };
    } catch (error) {
      console.error('❌ GROQ INSTITUTIONAL RESPONSE PARSING FAILED:', error);
      console.error('📄 Raw response that failed:', response);
      throw new Error(`GROQ institutional response parsing failed: ${error.message}`);
    }
  }

  private logRejectedSignal(data: SignalValidationData, reason: string, interrogationDepth: number = 2): void {
    const rejectedLog: RejectedSignalLog = {
      reason,
      frameworks: data.frameworks,
      direction: data.direction,
      timestamp: Date.now(),
      symbol: data.symbol,
      interrogation_depth: interrogationDepth,
      failure_points: [
        `Confidence: ${data.confidence}% (Required: 85%+)`,
        `Risk:Reward: ${((Math.abs(data.target - data.entry) / Math.abs(data.entry - data.stop))).toFixed(2)}:1 (Required: 2.5:1+)`,
        `Confluence: ${data.confluence}/6 (Required: 4+/6)`,
        `Session: ${data.session}`
      ]
    };

    this.rejectedSignals.push(rejectedLog);
    
    // Keep only last 200 rejections for analysis
    if (this.rejectedSignals.length > 200) {
      this.rejectedSignals.shift();
    }

    console.log(`🚫 GROQ INSTITUTIONAL REJECTION #${this.rejectedSignals.length}: ${data.symbol} ${data.direction}`);
    console.log(`📋 Failure Points:`, rejectedLog.failure_points);
  }

  async validateAndAdjustSignal(signalData: SignalValidationData): Promise<SignalValidationData | null> {
    console.log('🏛️ GROQ INSTITUTIONAL DUAL-PHASE VALIDATION STARTING...');
    console.log('🔥 MAXIMUM INTERROGATION PROTOCOL ENGAGED');
    
    const groqResult = await this.evaluateSignal(signalData);
    console.log('🎯 GROQ FINAL INSTITUTIONAL DECISION:', groqResult.decision);
    console.log('🏆 INSTITUTIONAL GRADE ACHIEVED:', groqResult.institutional_grade);
    console.log('⚠️ RISK ASSESSMENT:', groqResult.risk_assessment.level);

    // Log interrogation notes
    if (groqResult.interrogation_notes && groqResult.interrogation_notes.length > 0) {
      console.log('📝 GROQ INTERROGATION FINDINGS:');
      groqResult.interrogation_notes.forEach((note, index) => {
        console.log(`   ${index + 1}. ${note}`);
      });
    }

    switch (groqResult.decision) {
      case 'reject':
        this.logRejectedSignal(signalData, groqResult.reason, 2);
        console.log(`🚫 GROQ INSTITUTIONAL REJECTION: ${signalData.symbol} - Grade: ${groqResult.institutional_grade}`);
        console.log(`🔍 Rejection Reason: ${groqResult.reason}`);
        return null;

      case 'requires_further_analysis':
        this.logRejectedSignal(signalData, `Requires further analysis: ${groqResult.reason}`, 2);
        console.log(`⏸️ GROQ REQUIRES FURTHER ANALYSIS: ${signalData.symbol} - Insufficient data for institutional approval`);
        return null;

      case 'adjust':
        console.log(`🛠️ GROQ INSTITUTIONAL ADJUSTMENT: ${signalData.symbol} - Grade: ${groqResult.institutional_grade}`);
        console.log(`🔧 Adjustment Reason: ${groqResult.reason}`);
        
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
        
        console.log('✅ GROQ INSTITUTIONAL ADJUSTMENTS APPLIED:', {
          originalEntry: signalData.entry,
          newEntry: adjustedSignal.entry,
          originalConfidence: signalData.confidence,
          newConfidence: adjustedSignal.confidence,
          institutionalGrade: groqResult.institutional_grade
        });
        return adjustedSignal;

      case 'approve':
      default:
        // Additional check: Only approve A- grade or better
        if (['C', 'FAIL'].includes(groqResult.institutional_grade)) {
          console.log(`🚫 GROQ APPROVAL OVERRIDDEN: Grade ${groqResult.institutional_grade} insufficient for institutional standards`);
          this.logRejectedSignal(signalData, `Grade ${groqResult.institutional_grade} below institutional threshold`, 2);
          return null;
        }

        console.log(`✅ GROQ INSTITUTIONAL APPROVAL: ${signalData.symbol} - Grade: ${groqResult.institutional_grade}`);
        console.log(`🏆 Approval Reason: ${groqResult.reason}`);
        
        if (groqResult.confidence_adjustment) {
          const boostedSignal = {
            ...signalData,
            confidence: Math.min(95, Math.max(60, signalData.confidence + groqResult.confidence_adjustment))
          };
          console.log(`📈 GROQ CONFIDENCE ENHANCEMENT: ${signalData.confidence}% → ${boostedSignal.confidence}%`);
          return boostedSignal;
        }
        
        return signalData;
    }
  }

  getRejectionStats(): { 
    total: number; 
    recent: RejectedSignalLog[];
    interrogationCount: number;
    averageInterrogationDepth: number;
  } {
    const avgDepth = this.rejectedSignals.length > 0 
      ? this.rejectedSignals.reduce((sum, log) => sum + log.interrogation_depth, 0) / this.rejectedSignals.length
      : 0;

    return {
      total: this.rejectedSignals.length,
      recent: this.rejectedSignals.slice(-15), // Last 15 rejections with more detail
      interrogationCount: this.interrogationCount,
      averageInterrogationDepth: Math.round(avgDepth * 100) / 100
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
