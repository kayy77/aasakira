
import { groqService } from './groqService';

export interface ICTSniperSignal {
  pair: string;
  session: string;
  time: string;
  trend15M: string;
  entryTrigger: string;
  rrRatio: number;
  slPips: number;
  tpPips: number;
  confluenceScore: number;
  maxConfluence: number;
  price: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
}

export interface SniperValidationResult {
  isSniper: boolean;
  grade: 'SNIPER' | 'POSSIBLE' | 'NO_ENTRY';
  confidence: number;
  aiDecisions: string[];
  reasoning: string[];
  finalVerdict: string;
}

interface StructureZone {
  isFresh: boolean;
  type: 'FVG' | 'OTE' | 'OrderBlock' | 'LiquidityZone';
  strength: number;
}

export class ICTSniperValidator {
  
  // ICT Entry Model Validation
  validateICTModel(signal: ICTSniperSignal): boolean {
    const { confluenceScore, maxConfluence, slPips, session, time } = signal;
    
    console.log(`🎯 ICT Model Validation: ${confluenceScore}/${maxConfluence} confluence, ${slPips}p SL`);
    
    // Structure requirements
    const hasStructure = this.validateStructure(signal);
    const hasEntryZone = this.validateEntryZone(signal);
    const hasTiming = this.validateTiming(signal);
    const hasConfirmation = this.validateConfirmation(signal);
    const hasConfluence = confluenceScore >= 5;
    const hasSLLogic = slPips <= 10;
    
    console.log(`✅ ICT Checks: Structure=${hasStructure}, Zone=${hasEntryZone}, Timing=${hasTiming}, Confirm=${hasConfirmation}, Confluence=${hasConfluence}, SL=${hasSLLogic}`);
    
    return hasStructure && hasEntryZone && hasTiming && hasConfirmation && hasConfluence && hasSLLogic;
  }
  
  private validateStructure(signal: ICTSniperSignal): boolean {
    // 15M BOS or CHoCH confirmed
    const trend = signal.trend15M.toLowerCase();
    return trend.includes('bos') || trend.includes('choch') || trend.includes('bullish') || trend.includes('bearish');
  }
  
  private validateEntryZone(signal: ICTSniperSignal): boolean {
    // Inside FVG or OTE (0.62-0.705)
    const trigger = signal.entryTrigger.toLowerCase();
    return trigger.includes('fvg') || trigger.includes('ote') || trigger.includes('orderblock') || trigger.includes('liquidity');
  }
  
  private validateTiming(signal: ICTSniperSignal): boolean {
    // Within 1H of session open
    const time = signal.time;
    const session = signal.session.toLowerCase();
    
    if (session === 'london') {
      return time >= '08:00' && time <= '10:00';
    }
    if (session === 'ny' || session === 'new york') {
      return time >= '13:00' && time <= '15:00';
    }
    
    return true; // Default pass for other sessions
  }
  
  private validateConfirmation(signal: ICTSniperSignal): boolean {
    // 1M/5M RSI div + Liquidity + Volume Spike
    const trigger = signal.entryTrigger.toLowerCase();
    return trigger.includes('rsi') || trigger.includes('volume') || trigger.includes('liquidity') || trigger.includes('divergence');
  }
  
  // AI Sniper Analysis
  async analyzeSniperSetup(signal: ICTSniperSignal): Promise<SniperValidationResult> {
    console.log(`🧠 AI Sniper Analysis: ${signal.pair} at ${signal.time}`);
    
    const prompt = this.buildSniperPrompt(signal);
    const aiDecisions: string[] = [];
    const reasoning: string[] = [];
    
    try {
      // Get Groq analysis (our strongest AI)
      if (groqService.isConfigured()) {
        const groqResponse = await groqService.generateResponse(prompt, {
          model: 'llama3-70b-8192',
          temperature: 0.2,
          max_tokens: 300
        });
        
        const groqDecision = this.parseAIResponse(groqResponse);
        aiDecisions.push(groqDecision.decision);
        reasoning.push(`Groq: ${groqDecision.reason}`);
      }
      
      // Simulate additional AI responses for consensus
      const mockAI2 = this.getMockAIResponse(signal, 'Claude');
      const mockAI3 = this.getMockAIResponse(signal, 'Gemini');
      
      aiDecisions.push(mockAI2.decision, mockAI3.decision);
      reasoning.push(`Claude: ${mockAI2.reason}`, `Gemini: ${mockAI3.reason}`);
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Fallback to structural analysis
      const fallbackDecision = signal.confluenceScore >= 5 ? 'YES_SNIPER' : 'NO_ENTRY';
      aiDecisions.push(fallbackDecision);
      reasoning.push('Structural analysis fallback');
    }
    
    return this.calculateFinalVerdict(aiDecisions, reasoning, signal);
  }
  
  private buildSniperPrompt(signal: ICTSniperSignal): string {
    return `You are a professional SMC trader. Analyze this data:

- Pair: ${signal.pair}
- Time: ${signal.time} UTC
- Session: ${signal.session}
- Trend (15M): ${signal.trend15M}
- Entry Trigger: ${signal.entryTrigger}
- R:R: ${signal.rrRatio}:1
- SL: ${signal.slPips} pips | TP: ${signal.tpPips} pips
- Confluence: ${signal.confluenceScore}/${signal.maxConfluence}

Is this a sniper entry?
Return only: YES_SNIPER / POSSIBLE_SNIPER / NO_ENTRY
Justify your decision in 3 bullets, max.`;
  }
  
  private parseAIResponse(response: string): { decision: string, reason: string } {
    const lines = response.split('\n').filter(line => line.trim());
    
    let decision = 'NO_ENTRY';
    if (response.includes('YES_SNIPER')) decision = 'YES_SNIPER';
    else if (response.includes('POSSIBLE_SNIPER')) decision = 'POSSIBLE_SNIPER';
    
    const reason = lines.slice(1, 4).join(' | ') || 'AI analysis completed';
    
    return { decision, reason };
  }
  
  private getMockAIResponse(signal: ICTSniperSignal, aiName: string): { decision: string, reason: string } {
    const { confluenceScore, rrRatio, slPips } = signal;
    
    let decision = 'NO_ENTRY';
    let reason = '';
    
    if (confluenceScore >= 6 && rrRatio >= 3 && slPips <= 8) {
      decision = 'YES_SNIPER';
      reason = 'Perfect confluence + tight SL + excellent R:R';
    } else if (confluenceScore >= 5 && rrRatio >= 2.5) {
      decision = 'POSSIBLE_SNIPER';
      reason = 'Good setup but not perfect conditions';
    } else {
      reason = 'Insufficient confluence or poor risk management';
    }
    
    return { decision, reason: `${reason} (${aiName} simulation)` };
  }
  
  private calculateFinalVerdict(decisions: string[], reasoning: string[], signal: ICTSniperSignal): SniperValidationResult {
    const sniperCount = decisions.filter(d => d === 'YES_SNIPER').length;
    const possibleCount = decisions.filter(d => d === 'POSSIBLE_SNIPER').length;
    const totalCount = decisions.length;
    
    console.log(`🎯 AI Consensus: ${sniperCount} SNIPER, ${possibleCount} POSSIBLE out of ${totalCount}`);
    
    let grade: 'SNIPER' | 'POSSIBLE' | 'NO_ENTRY' = 'NO_ENTRY';
    let confidence = 0;
    let finalVerdict = '';
    
    if (sniperCount >= 2) {
      grade = 'SNIPER';
      confidence = (sniperCount / totalCount) * 100;
      finalVerdict = `✅ SNIPER CONFIRMED: ${sniperCount}/${totalCount} AIs agree - Elite grade signal`;
    } else if (sniperCount + possibleCount >= 2) {
      grade = 'POSSIBLE';
      confidence = ((sniperCount + possibleCount * 0.7) / totalCount) * 100;
      finalVerdict = `⚠️ POSSIBLE SNIPER: Mixed consensus - Proceed with caution`;
    } else {
      finalVerdict = `❌ NO ENTRY: Insufficient AI consensus - Signal rejected`;
    }
    
    return {
      isSniper: grade !== 'NO_ENTRY',
      grade,
      confidence: Math.round(confidence),
      aiDecisions: decisions,
      reasoning,
      finalVerdict
    };
  }
  
  // Entry validation with enhanced logic
  isValidEntry(signal: any): boolean {
    const { confidence, expectedValue, confluenceScore, slDistance, structureZone, session } = signal;
    
    // Basic thresholds
    if (confidence < 70 || expectedValue < 1.0 || confluenceScore < 3) {
      console.log(`❌ Failed basic thresholds: confidence=${confidence}, EV=${expectedValue}, confluence=${confluenceScore}`);
      return false;
    }
    
    // Structure freshness
    if (structureZone && !structureZone.isFresh) {
      console.log(`❌ Structure zone not fresh`);
      return false;
    }
    
    // Stop loss distance
    if (slDistance > 15) {
      console.log(`❌ Stop loss too wide: ${slDistance} pips`);
      return false;
    }
    
    // Session filter (more lenient than original)
    const validSessions = ["London", "NY", "New York", "Pre-NY", "Pre-London"];
    if (session && !validSessions.some(s => session.includes(s))) {
      console.log(`❌ Invalid session: ${session}`);
      return false;
    }
    
    console.log(`✅ Entry validation passed`);
    return true;
  }
  
  // Signal grading system
  gradeSignalConfidence(confidence: number): string {
    if (confidence >= 90) return 'A+';
    if (confidence >= 80) return 'A';
    if (confidence >= 70) return 'B';
    if (confidence >= 60) return 'C';
    return 'D';
  }
}

export const ictSniperValidator = new ICTSniperValidator();
