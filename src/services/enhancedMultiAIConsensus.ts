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

// Enhanced result interface
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
}

class EnhancedMultiAIConsensus {
  private readonly API_KEYS = {
    gemini: 'AIzaSyBds1Zg7DCF9RcCbL-YC23pj2rUs2FMfJA',
    openrouter: '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',
    cohere: 'wTX42tk4eKfBGoXNmRVIPrIukl01yKCn0VsaCjjf',
    together: '8b0103657b0290f0a815723af49c8ed66af6f5df882de5acc1de32e02311bb79'
  };

  // NEW: Session-aware confidence adjustments
  private applySessionAdjustments(pair: string, confidence: number, session: string): number {
    const currentHour = new Date().getUTCHours();
    let adjustedConfidence = confidence;
    
    // USDCAD specific logic - reduce confidence in Asia session
    if (pair === 'USDCAD' && session === 'Asia') {
      adjustedConfidence = Math.max(confidence - 20, 40);
      console.log(`🔄 ${pair} in Asia session: confidence reduced from ${confidence}% to ${adjustedConfidence}%`);
    }
    
    // General session volatility adjustments
    if (currentHour >= 0 && currentHour <= 6 && !['USDJPY', 'AUDUSD'].includes(pair)) {
      adjustedConfidence = Math.max(confidence - 15, 45);
      console.log(`🔄 Low volatility hours for ${pair}: confidence reduced to ${adjustedConfidence}%`);
    }
    
    return adjustedConfidence;
  }

  // NEW: Weighted consensus with Groq override logic
  private calculateWeightedConsensus(aiResponses: EnhancedAIModelResponse[], pair: string): {
    consensusCount: number;
    signalStrength: 'ELITE' | 'STRONG' | 'WEAK' | 'NO_CONSENSUS';
    avgConfidence: number;
    avgExpectedValue: number;
    hasConsensus: boolean;
  } {
    // Filter only valid, strong responses
    const strongSignals = aiResponses.filter(response => 
      response.valid && 
      response.confidence >= 60 && 
      response.expected_value >= 0.8 && 
      response.direction !== 'NO_TRADE' &&
      response.model !== 'FALLBACK'
    );

    console.log(`📊 Strong signals found: ${strongSignals.length}/${aiResponses.length}`);

    // Check for Groq "Exceptional" override
    const groqResponse = aiResponses.find(r => r.model === 'Groq');
    const hasGroqExceptional = groqResponse && 
      groqResponse.signal_strength === 'Strong' && 
      groqResponse.confidence >= 85 && 
      groqResponse.expected_value >= 1.5;

    // Apply weighted scoring
    let weightedScore = 0;
    let totalWeight = 0;
    let confidenceSum = 0;
    let expectedValueSum = 0;

    strongSignals.forEach(signal => {
      let weight = 1;
      
      // Groq gets higher weight
      if (signal.model === 'Groq') weight = 2;
      // Gemini and Claude get slightly higher weight
      if (['Gemini', 'Claude'].includes(signal.model)) weight = 1.5;
      
      // Exceptional signals get bonus weight
      if (signal.confidence >= 85 && signal.expected_value >= 1.5) weight *= 1.3;
      
      weightedScore += weight;
      totalWeight += weight;
      confidenceSum += signal.confidence;
      expectedValueSum += signal.expected_value;
    });

    const avgConfidence = strongSignals.length > 0 ? confidenceSum / strongSignals.length : 0;
    const avgExpectedValue = strongSignals.length > 0 ? expectedValueSum / strongSignals.length : 0;
    const consensusStrength = totalWeight > 0 ? (weightedScore / totalWeight) : 0;

    console.log(`🧮 Weighted consensus: ${consensusStrength.toFixed(2)}, Groq exceptional: ${hasGroqExceptional}`);

    // GROQ OVERRIDE LOGIC: If Groq is exceptional + confluence is high, upgrade consensus
    if (hasGroqExceptional && strongSignals.length >= 3) {
      console.log(`🔥 GROQ OVERRIDE: Exceptional signal with ${strongSignals.length} supporting AIs - UPGRADED TO STRONG`);
      return {
        consensusCount: strongSignals.length,
        signalStrength: 'STRONG',
        avgConfidence: Math.max(avgConfidence, 75),
        avgExpectedValue: Math.max(avgExpectedValue, 1.2),
        hasConsensus: true
      };
    }

    // Standard consensus logic with proper thresholds
    let signalStrength: 'ELITE' | 'STRONG' | 'WEAK' | 'NO_CONSENSUS';
    let hasConsensus = false;

    if (strongSignals.length >= 4 && avgConfidence >= 85 && avgExpectedValue >= 1.5) {
      signalStrength = 'ELITE';
      hasConsensus = true;
    } else if (strongSignals.length >= 3 && avgConfidence >= 75 && avgExpectedValue >= 1.0) {
      signalStrength = 'STRONG';
      hasConsensus = true;
    } else if (strongSignals.length >= 2 && avgConfidence >= 65 && avgExpectedValue >= 0.8) {
      signalStrength = 'WEAK';
      hasConsensus = false; // Weak signals don't qualify as consensus
    } else {
      signalStrength = 'NO_CONSENSUS';
      hasConsensus = false;
    }

    console.log(`📈 Final consensus: ${signalStrength} (${strongSignals.length} strong signals)`);

    return {
      consensusCount: strongSignals.length,
      signalStrength,
      avgConfidence,
      avgExpectedValue,
      hasConsensus
    };
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

CRITICAL: Only return valid signals if confidence > 70% AND at least 2 strategies align.
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

    // STAGE 1: STRUCTURAL INTELLIGENCE PRE-SCREENING
    console.log('🏗️ Stage 1: Structural Intelligence Analysis...');
    const structuralAnalysis = structuralIntelligenceScanner.analyzeMarketStructure(pair, livePrice);
    
    // Pre-qualification check - skip AI if structure is inadequate
    if (!structuralIntelligenceScanner.isStructurallyQualified(structuralAnalysis)) {
      console.log('❌ REJECTED: Failed structural pre-qualification');
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'STRUCTURAL_FAILURE');
    }

    console.log('✅ Stage 1 PASSED: Structural analysis qualified for AI review');

    // STAGE 2: AI MULTI-MODEL ANALYSIS (existing logic)
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

    // STAGE 3: AI SIGNAL VALIDATION & WEIGHTED CONSENSUS
    console.log('⚖️ Stage 3: AI Signal Validation...');
    const aiValidation = aiSignalValidator.validateAIConsensus(aiResponses);
    
    if (!aiSignalValidator.resolveAIConflicts(aiValidation)) {
      console.log('❌ REJECTED: AI consensus insufficient or conflicted');
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'AI_CONSENSUS_FAILED', aiValidation);
    }

    console.log('✅ Stage 3 PASSED: AI consensus achieved');

    // STAGE 4: PREDICTIVE OUTCOME MODELING
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
    
    if (outcomePrediction.recommendation === 'AVOID' || outcomePrediction.tpProbability < 55) {
      console.log('❌ REJECTED: Predictive model recommends avoidance');
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'PREDICTIVE_MODEL_REJECTION', aiValidation, outcomePrediction);
    }

    console.log('✅ Stage 4 PASSED: Outcome prediction favorable');

    // STAGE 5: FINAL SIGNAL GRADING & APPROVAL
    console.log('🎯 Stage 5: Final Signal Grading...');
    const finalGrade = this.calculateFinalGrade(structuralAnalysis, aiValidation, outcomePrediction);
    
    if (finalGrade === 'F') {
      console.log('❌ REJECTED: Final grading resulted in F grade');
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'FINAL_GRADE_FAILURE', aiValidation, outcomePrediction);
    }

    // Generate final signal
    const bestSignal = this.findBestAIResponse(aiResponses);
    const processingTime = Date.now() - scanStartTime;
    
    console.log(`✅ SIGNAL APPROVED: Grade ${finalGrade} signal generated in ${processingTime}ms`);

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
    outcomePrediction?: OutcomePrediction
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
      scanDetails: {
        successfulModels: 0,
        failedModels: ['Structural Analysis', 'AI Consensus', 'Predictive Model'],
        timestamp: new Date().toISOString()
      }
    };
  }

  private calculateFinalGrade(
    structural: StructuralAnalysis,
    ai: WeightedAIAnalysis,
    outcome: OutcomePrediction
  ): 'A' | 'B' | 'C' | 'F' {
    // Grade A: Elite signals
    if (
      structural.structuralGrade === 'A' &&
      ai.consensusStrength === 'STRONG' &&
      outcome.riskLevel === 'LOW' &&
      outcome.tpProbability >= 75
    ) {
      return 'A';
    }

    // Grade B: High quality signals
    if (
      structural.structuralGrade >= 'B' &&
      (ai.consensusStrength === 'STRONG' || ai.consensusStrength === 'MODERATE') &&
      outcome.riskLevel !== 'CRITICAL' &&
      outcome.tpProbability >= 65
    ) {
      return 'B';
    }

    // Grade C: Acceptable signals
    if (
      structural.structuralGrade !== 'F' &&
      ai.consensusStrength !== 'CONFLICT' &&
      outcome.tpProbability >= 55 &&
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
    if (finalGrade === 'C') return 'WEAK';
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

  private parseAIResponse(text: string, modelName: string): EnhancedAIModelResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // FIXED: Only mark as valid if meets minimum professional standards
        const confidence = Math.min(100, Math.max(0, parsed.confidence || 50));
        const expectedValue = parsed.expected_value || 0.5;
        const signalStrength = parsed.signal_strength || 'Weak';
        
        const isValid = parsed.valid !== false && 
                       confidence >= 60 && 
                       expectedValue >= 1.0 && 
                       signalStrength === 'Strong';

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

  private getFallbackResponse(modelName: string): EnhancedAIModelResponse {
    return {
      entry: '1.0850',
      stop_loss: '1.0830',
      take_profit: '1.0890',
      confidence: 40, // Below threshold so it won't count
      expected_value: 0.3, // Below threshold so it won't count
      rr_ratio: 2.0,
      signal_strength: 'Weak', // Won't count toward consensus
      strategies: [`${modelName} Fallback`],
      analysis: `${modelName} unavailable - using fallback`,
      direction: 'NO_TRADE',
      valid: false,
      model: 'FALLBACK'
    };
  }
}

export const enhancedMultiAIConsensus = new EnhancedMultiAIConsensus();
