
import { structuralIntelligenceScanner, StructuralAnalysis } from './structuralIntelligenceScanner';
import { aiSignalValidator, WeightedAIAnalysis } from './aiSignalValidator';
import { predictiveOutcomeModel, OutcomePrediction, SignalInputData } from './predictiveOutcomeModel';

export interface EnhancedAIModelResponse {
  entry: string;
  stop_loss: string;
  take_profit: string;
  confidence: number;
  expected_value: number;
  rr_ratio: number;
  signal_strength: 'Strong' | 'Medium' | 'Weak';
  strategies: string[];
  analysis: string;
  direction: 'BUY' | 'SELL' | 'NO_TRADE';
  valid: boolean;
  model: string;
}

export interface ConsensusSignalResult {
  hasConsensus: boolean;
  consensusCount: number;
  totalModels: number;
  avgExpectedValue: number;
  avgRiskReward: number;
  avgConfidence: number;
  signalStrength: 'ELITE' | 'STRONG' | 'WEAK' | 'NO_CONSENSUS';
  aiResponses: EnhancedAIModelResponse[];
  finalSignal?: {
    entry: string;
    stopLoss: string;
    takeProfit: string;
    confidence: number;
    strategies: string[];
    analysis: string;
    direction: 'BUY' | 'SELL';
  };
  scanDetails: {
    successfulModels: number;
    failedModels: string[];
    timestamp: string;
  };
}

export interface IntelligentSignalResult extends ConsensusSignalResult {
  structuralAnalysis: StructuralAnalysis;
  aiValidation: WeightedAIAnalysis;
  outcomePrediction: OutcomePrediction;
  finalGrade: 'A' | 'B' | 'C' | 'F';
  processingStages: {
    structuralPass: boolean;
    aiConsensusPass: boolean;
    outcomePass: boolean;
    finalApproved: boolean;
  };
  debugInfo?: {
    structuralDebug: string;
    aiDebug: string;
    outcomeDebug: string;
  };
}

class EnhancedMultiAIConsensus {
  private readonly API_KEYS = {
    gemini: 'AIzaSyBds1Zg7DCF9RcCbL-YC23pj2rUs2FMfJA',
    openrouter: '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',
    cohere: 'wTX42tk4eKfBGoXNmRVIPrIukl01yKCn0VsaCjjf',
    together: '8b0103657b0290f0a815723af49c8ed66af6f5df882de5acc1de32e02311bb79'
  };

  private applySessionAdjustments(pair: string, confidence: number, session: string): number {
    const currentHour = new Date().getUTCHours();
    let adjustedConfidence = confidence;
    
    if (pair === 'USDCAD' && session === 'Asia') {
      adjustedConfidence = Math.max(confidence - 15, 45); // Reduced penalty
      console.log(`🔄 ${pair} in Asia session: confidence reduced from ${confidence}% to ${adjustedConfidence}%`);
    }
    
    if (currentHour >= 0 && currentHour <= 6 && !['USDJPY', 'AUDUSD'].includes(pair)) {
      adjustedConfidence = Math.max(confidence - 10, 50); // Reduced penalty
      console.log(`🔄 Low volatility hours for ${pair}: confidence reduced to ${adjustedConfidence}%`);
    }
    
    return adjustedConfidence;
  }

  private buildInstitutionalPrompt(pair: string, livePrice: number): string {
    const currentSession = this.getCurrentSession();
    
    return `You are a top-level institutional-grade AI signal engine.

Analyzing ${pair} at live price: ${livePrice} during ${currentSession} session

Use institutional strategies:
- Smart Money Concepts (SMC): structure shifts, liquidity sweeps, FVGs
- Volume Spike Analysis
- RSI + Momentum Divergence  
- Session Logic (NY/London/Asian)
- Pattern Recognition
- Price Action Levels

UPDATED CRITERIA: Only return valid signals if confidence > 60% AND at least 1 strong strategy aligns.
SESSION AWARENESS: Consider ${currentSession} session volatility for ${pair}

Required JSON format:
{
  "entry": "${livePrice}",
  "stop_loss": "${(livePrice * (Math.random() > 0.5 ? 0.998 : 1.002)).toFixed(5)}",
  "take_profit": "${(livePrice * (Math.random() > 0.5 ? 1.006 : 0.994)).toFixed(5)}",
  "confidence": 85,
  "expected_value": 1.45,
  "rr_ratio": 3.2,
  "signal_strength": "Strong",
  "strategies": ["SMC", "Volume Spike"],
  "analysis": "Clear institutional setup with structure break + volume confirmation",
  "direction": "BUY",
  "valid": true
}

Return ONLY valid JSON.`;
  }

  private getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 8) return 'Asia';
    if (hour >= 8 && hour < 16) return 'London';
    if (hour >= 16 && hour < 24) return 'New York';
    return 'Asia';
  }

  async scanForHighQualitySignals(pair: string = 'EURUSD', livePrice: number = 1.0850): Promise<IntelligentSignalResult> {
    console.log(`🧠 Intelligent Signal Fusion Engine: Scanning ${pair} at ${livePrice}`);
    
    const scanStartTime = Date.now();
    const debugInfo = {
      structuralDebug: '',
      aiDebug: '',
      outcomeDebug: ''
    };

    // STAGE 1: STRUCTURAL INTELLIGENCE PRE-SCREENING
    console.log('🏗️ Stage 1: Structural Intelligence Analysis...');
    const structuralAnalysis = structuralIntelligenceScanner.analyzeMarketStructure(pair, livePrice);
    debugInfo.structuralDebug = `Grade: ${structuralAnalysis.structuralGrade}, Confluence: ${structuralAnalysis.confluenceScore}/6`;
    
    // More lenient pre-qualification 
    if (!structuralIntelligenceScanner.isStructurallyQualified(structuralAnalysis)) {
      console.log('❌ REJECTED: Failed structural pre-qualification');
      debugInfo.structuralDebug += ' - FAILED pre-qualification';
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'STRUCTURAL_FAILURE', undefined, undefined, debugInfo);
    }

    console.log('✅ Stage 1 PASSED: Structural analysis qualified for AI review');
    debugInfo.structuralDebug += ' - PASSED';

    // STAGE 2: AI MULTI-MODEL ANALYSIS
    console.log('🤖 Stage 2: AI Multi-Model Analysis...');
    const prompt = this.buildInstitutionalPrompt(pair, livePrice);
    const failedModels: string[] = [];
    
    const aiCalls = [
      this.callWithTimeout(this.callGroqAI.bind(this), prompt, 'Groq', failedModels),
      this.callWithTimeout(this.callGeminiAI.bind(this), prompt, 'Gemini', failedModels),
      this.callWithTimeout(this.callCohereAI.bind(this), prompt, 'Cohere', failedModels),
      this.callWithTimeout(this.callOpenRouterAI.bind(this), prompt, 'OpenRouter', failedModels),
      this.callWithTimeout(this.callTogetherAI.bind(this), prompt, 'Together', failedModels)
    ];

    const results = await Promise.allSettled(aiCalls);
    const modelNames = ['Groq', 'Gemini', 'Cohere', 'OpenRouter', 'Together'];
    
    const aiResponses: EnhancedAIModelResponse[] = results.map((result, index): EnhancedAIModelResponse => {
      const modelName = modelNames[index];
      
      if (result.status === 'fulfilled' && result.value !== null && result.value !== undefined) {
        const response = result.value;
        if (this.isValidEnhancedAIModelResponse(response)) {
          const currentSession = this.getCurrentSession();
          response.confidence = this.applySessionAdjustments(pair, response.confidence, currentSession);
          return response;
        }
      }
      
      if (!failedModels.includes(modelName)) {
        failedModels.push(modelName);
      }
      return this.getFallbackResponse(modelName);
    });

    debugInfo.aiDebug = `Valid responses: ${aiResponses.filter(r => r.valid).length}/5, Failed: ${failedModels.join(',')}`;

    // STAGE 3: AI SIGNAL VALIDATION & WEIGHTED CONSENSUS
    console.log('⚖️ Stage 3: AI Signal Validation...');
    const aiValidation = aiSignalValidator.validateAIConsensus(aiResponses);
    debugInfo.aiDebug += ` - Consensus: ${aiValidation.consensusStrength}`;
    
    if (!aiSignalValidator.resolveAIConflicts(aiValidation)) {
      console.log('❌ REJECTED: AI consensus insufficient or conflicted');
      debugInfo.aiDebug += ' - FAILED consensus';
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'AI_CONSENSUS_FAILED', aiValidation, undefined, debugInfo);
    }

    console.log('✅ Stage 3 PASSED: AI consensus achieved');
    debugInfo.aiDebug += ' - PASSED';

    // STAGE 4: PREDICTIVE OUTCOME MODELING (More lenient)
    console.log('🔮 Stage 4: Predictive Outcome Analysis...');
    const signalInputData: SignalInputData = {
      pair,
      riskReward: aiValidation.averageRR,
      confidence: aiValidation.weightedConfidence,
      expectedValue: aiValidation.averageEV,
      session: this.getCurrentSession(),
      structuralAnalysis,
      aiAnalysis: aiValidation,
      timeOfDay: new Date().getUTCHours()
    };

    const outcomePrediction = predictiveOutcomeModel.predictSignalOutcome(signalInputData);
    debugInfo.outcomeDebug = `TP: ${outcomePrediction.tpProbability.toFixed(1)}%, Risk: ${outcomePrediction.riskLevel}, Rec: ${outcomePrediction.recommendation}`;
    
    // MORE LENIENT: Accept REDUCE_SIZE and WATCH_ONLY signals too
    if (outcomePrediction.recommendation === 'AVOID' || outcomePrediction.tpProbability < 45) { // Lowered from 55
      console.log('❌ REJECTED: Predictive model recommends avoidance');
      debugInfo.outcomeDebug += ' - FAILED prediction';
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'PREDICTIVE_MODEL_REJECTION', aiValidation, outcomePrediction, debugInfo);
    }

    console.log('✅ Stage 4 PASSED: Outcome prediction favorable');
    debugInfo.outcomeDebug += ' - PASSED';

    // STAGE 5: FINAL SIGNAL GRADING & APPROVAL (More lenient)
    console.log('🎯 Stage 5: Final Signal Grading...');
    const finalGrade = this.calculateFinalGrade(structuralAnalysis, aiValidation, outcomePrediction);
    
    // Accept Grade C signals too
    if (finalGrade === 'F') {
      console.log('❌ REJECTED: Final grading resulted in F grade');
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'FINAL_GRADE_FAILURE', aiValidation, outcomePrediction, debugInfo);
    }

    // Generate final signal
    const bestSignal = this.findBestAIResponse(aiResponses);
    const processingTime = Date.now() - scanStartTime;
    
    console.log(`✅ SIGNAL APPROVED: Grade ${finalGrade} signal generated in ${processingTime}ms`);
    console.log(`🔍 Debug Info - Structural: ${debugInfo.structuralDebug}, AI: ${debugInfo.aiDebug}, Outcome: ${debugInfo.outcomeDebug}`);

    return {
      hasConsensus: true,
      consensusCount: aiValidation.consensusStrength === 'STRONG' ? 5 : aiValidation.consensusStrength === 'MODERATE' ? 4 : 3,
      totalModels: 5,
      avgExpectedValue: aiValidation.averageEV,
      avgRiskReward: aiValidation.averageRR,
      avgConfidence: aiValidation.weightedConfidence,
      signalStrength: this.mapConsensusToSignalStrength(aiValidation.consensusStrength, finalGrade),
      aiResponses,
      structuralAnalysis,
      aiValidation,
      outcomePrediction,
      finalGrade,
      processingStages: {
        structuralPass: true,
        aiConsensusPass: true,
        outcomePass: true,
        finalApproved: true
      },
      debugInfo,
      finalSignal: {
        entry: bestSignal.entry,
        stopLoss: bestSignal.stop_loss,
        takeProfit: bestSignal.take_profit,
        confidence: Math.round(aiValidation.weightedConfidence),
        strategies: bestSignal.strategies,
        analysis: `Grade ${finalGrade} Institutional Signal: ${aiValidation.reasoning}. ${outcomePrediction.tpProbability.toFixed(1)}% TP probability.`,
        direction: aiValidation.direction as 'BUY' | 'SELL'
      },
      scanDetails: {
        successfulModels: aiResponses.filter(r => r.model !== 'FALLBACK').length,
        failedModels,
        timestamp: new Date().toISOString()
      }
    };
  }

  private buildRejectedSignal(
    pair: string, 
    livePrice: number, 
    structuralAnalysis: StructuralAnalysis,
    rejectionReason: string,
    aiValidation?: WeightedAIAnalysis,
    outcomePrediction?: OutcomePrediction,
    debugInfo?: any
  ): IntelligentSignalResult {
    return {
      hasConsensus: false,
      consensusCount: 0,
      totalModels: 5,
      avgExpectedValue: 0,
      avgRiskReward: 0,
      avgConfidence: 0,
      signalStrength: 'NO_CONSENSUS',
      aiResponses: [],
      structuralAnalysis,
      aiValidation: aiValidation || {
        direction: 'CONFLICT',
        weightedConfidence: 0,
        averageEV: 0,
        averageRR: 0,
        consensusStrength: 'CONFLICT',
        topModel: 'NONE',
        modelAgreement: 0,
        conflictingModels: [],
        reasoning: rejectionReason
      },
      outcomePrediction: outcomePrediction || {
        tpProbability: 0,
        slProbability: 100,
        maxDrawdownExpected: 100,
        timeToTarget: 0,
        riskLevel: 'CRITICAL',
        sessionRisk: 100,
        predictionConfidence: 0,
        recommendation: 'AVOID'
      },
      finalGrade: 'F',
      processingStages: {
        structuralPass: rejectionReason !== 'STRUCTURAL_FAILURE',
        aiConsensusPass: rejectionReason !== 'AI_CONSENSUS_FAILED',
        outcomePass: rejectionReason !== 'PREDICTIVE_MODEL_REJECTION',
        finalApproved: false
      },
      debugInfo,
      scanDetails: {
        successfulModels: 0,
        failedModels: ['Structural Analysis', 'AI Consensus', 'Predictive Model'],
        timestamp: new Date().toISOString()
      }
    };
  }

  private parseAIResponse(text: string, modelName: string): EnhancedAIModelResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // SPECIAL GROQ HANDLING - Much more lenient
        if (modelName === 'Groq') {
          const confidence = Math.min(100, Math.max(0, parsed.confidence || 60));
          const expectedValue = parsed.expected_value || 0.8;
          const signalStrength = parsed.signal_strength || 'Medium';
          
          // For Groq, accept almost any signal with basic metrics
          const isValid = parsed.valid !== false && 
                         confidence >= 50 && // Much lower for Groq
                         expectedValue >= 0.5 && // Much lower for Groq
                         (signalStrength === 'Strong' || signalStrength === 'Medium' || signalStrength === 'Weak');

          return {
            entry: parsed.entry || '1.0850',
            stop_loss: parsed.stop_loss || '1.0830',
            take_profit: parsed.take_profit || '1.0890',
            confidence,
            expected_value: expectedValue,
            rr_ratio: parsed.rr_ratio || 2.0,
            signal_strength: signalStrength,
            strategies: parsed.strategies || ['SMC Analysis'],
            analysis: parsed.analysis || `${modelName} institutional analysis`,
            direction: parsed.direction || 'BUY',
            valid: isValid,
            model: modelName
          };
        }
        
        // Standard handling for other models
        const confidence = Math.min(100, Math.max(0, parsed.confidence || 50));
        const expectedValue = parsed.expected_value || 0.5;
        const signalStrength = parsed.signal_strength || 'Weak';
        
        const isValid = parsed.valid !== false && 
                       confidence >= 55 && // Lowered from 60
                       expectedValue >= 0.7 && // Lowered from 1.0
                       (signalStrength === 'Strong' || signalStrength === 'Medium');

        return {
          entry: parsed.entry || '1.0850',
          stop_loss: parsed.stop_loss || '1.0830',
          take_profit: parsed.take_profit || '1.0890',
          confidence,
          expected_value: expectedValue,
          rr_ratio: parsed.rr_ratio || 2.0,
          signal_strength: signalStrength,
          strategies: parsed.strategies || ['Technical Analysis'],
          analysis: parsed.analysis || `${modelName} institutional analysis`,
          direction: parsed.direction || 'BUY',
          valid: isValid,
          model: modelName
        };
      }
    } catch (error) {
      console.error(`${modelName} JSON parsing error:`, error);
    }
    
    return this.getFallbackResponse(modelName);
  }

  private calculateFinalGrade(
    structural: any,
    ai: WeightedAIAnalysis,
    outcome: any
  ): 'A' | 'B' | 'C' | 'F' {
    // GROQ EXCEPTIONAL OVERRIDE - Automatic Grade A
    if (ai.groqOverride && ai.reasoning?.toLowerCase().includes('exceptional')) {
      console.log('🔥 GROQ EXCEPTIONAL - Automatic Grade A');
      return 'A';
    }
    
    // GROQ OVERRIDE - If Groq says exceptional or elite, it's automatically Grade A
    if (ai.groqOverride) {
      const groqResponse = ai.reasoning?.toLowerCase();
      if (groqResponse?.includes('exceptional') || groqResponse?.includes('elite')) {
        console.log('🔥 GROQ EXCEPTIONAL/ELITE - Automatic Grade A');
        return 'A';
      }
      console.log('🔥 GROQ OVERRIDE - Automatic Grade B');
      return 'B';
    }

    // More lenient grading system
    
    // Grade A: Elite signals
    if (
      structural.structuralGrade === 'A' &&
      (ai.consensusStrength === 'STRONG' || ai.groqOverride) &&
      outcome.riskLevel === 'LOW' &&
      outcome.tpProbability >= 70 // Lowered from 75
    ) {
      return 'A';
    }

    // Grade B: High quality signals (more lenient)
    if (
      structural.structuralGrade !== 'F' &&
      (ai.consensusStrength === 'STRONG' || ai.consensusStrength === 'MODERATE' || ai.groqOverride) &&
      outcome.riskLevel !== 'CRITICAL' &&
      outcome.tpProbability >= 60 // Lowered from 65
    ) {
      return 'B';
    }

    // Grade C: Acceptable signals (much more lenient)
    if (
      structural.structuralGrade !== 'F' &&
      ai.consensusStrength !== 'CONFLICT' &&
      outcome.tpProbability >= 50 && // Lowered from 55
      outcome.recommendation !== 'AVOID'
    ) {
      return 'C';
    }

    return 'F';
  }

  private mapConsensusToSignalStrength(
    aiStrength: string, 
    finalGrade: string
  ): 'ELITE' | 'STRONG' | 'WEAK' | 'NO_CONSENSUS' {
    if (finalGrade === 'A' && aiStrength === 'STRONG') return 'ELITE';
    if (finalGrade === 'B' && (aiStrength === 'STRONG' || aiStrength === 'MODERATE')) return 'STRONG';
    if (finalGrade === 'C' || aiStrength === 'WEAK') return 'WEAK'; // Accept WEAK signals
    return 'NO_CONSENSUS';
  }

  private findBestAIResponse(aiResponses: EnhancedAIModelResponse[]): EnhancedAIModelResponse {
    const validSignals = aiResponses.filter(r => r.valid && r.model !== 'FALLBACK');
    
    if (validSignals.length === 0) {
      return this.getFallbackResponse('SYSTEM');
    }

    return validSignals.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  private isValidEnhancedAIModelResponse(obj: any): obj is EnhancedAIModelResponse {
    return obj && 
           typeof obj === 'object' &&
           typeof obj.entry === 'string' &&
           typeof obj.stop_loss === 'string' &&
           typeof obj.take_profit === 'string' &&
           typeof obj.confidence === 'number' &&
           typeof obj.expected_value === 'number' &&
           typeof obj.rr_ratio === 'number' &&
           typeof obj.signal_strength === 'string' &&
           Array.isArray(obj.strategies) &&
           typeof obj.analysis === 'string' &&
           typeof obj.direction === 'string' &&
           typeof obj.valid === 'boolean' &&
           typeof obj.model === 'string';
  }

  private async callWithTimeout<T>(
    fn: (prompt: string) => Promise<T>, 
    prompt: string, 
    modelName: string, 
    failedModels: string[]
  ): Promise<T | null> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 15000)
      );
      
      return await Promise.race([fn(prompt), timeoutPromise]);
    } catch (error) {
      console.error(`${modelName} timeout or error:`, error);
      failedModels.push(modelName);
      return null;
    }
  }

  private async callGroqAI(prompt: string): Promise<EnhancedAIModelResponse> {
    try {
      const { groqService } = await import('./groqService');
      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 800
      });
      
      return this.parseAIResponse(response, 'Groq');
    } catch (error) {
      console.error('Groq AI error:', error);
      throw error;
    }
  }

  private async callGeminiAI(prompt: string): Promise<EnhancedAIModelResponse> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEYS.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return this.parseAIResponse(text, 'Gemini');
    } catch (error) {
      console.error('Gemini AI error:', error);
      throw error;
    }
  }

  private async callCohereAI(prompt: string): Promise<EnhancedAIModelResponse> {
    try {
      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEYS.cohere}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'command-r-plus',
          prompt: prompt,
          temperature: 0.3,
          max_tokens: 800
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const text = data.generations?.[0]?.text || '';
      return this.parseAIResponse(text, 'Cohere');
    } catch (error) {
      console.error('Cohere AI error:', error);
      throw error;
    }
  }

  private async callOpenRouterAI(prompt: string): Promise<EnhancedAIModelResponse> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEYS.openrouter}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 800
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return this.parseAIResponse(text, 'Claude');
    } catch (error) {
      console.error('OpenRouter AI error:', error);
      throw error;
    }
  }

  private async callTogetherAI(prompt: string): Promise<EnhancedAIModelResponse> {
    try {
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.API_KEYS.together}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 800
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return this.parseAIResponse(text, 'Mixtral');
    } catch (error) {
      console.error('Together AI error:', error);
      throw error;
    }
  }

  private getFallbackResponse(modelName: string): EnhancedAIModelResponse {
    return {
      entry: '1.0850',
      stop_loss: '1.0830',
      take_profit: '1.0890',
      confidence: 40,
      expected_value: 0.3,
      rr_ratio: 2.0,
      signal_strength: 'Weak',
      strategies: [`${modelName} Fallback`],
      analysis: `${modelName} unavailable - using fallback`,
      direction: 'NO_TRADE',
      valid: false,
      model: 'FALLBACK'
    };
  }
}

export const enhancedMultiAIConsensus = new EnhancedMultiAIConsensus();
