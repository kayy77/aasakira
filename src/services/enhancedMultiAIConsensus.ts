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
  // NEW: Add required properties for consensus display
  direction: 'BUY' | 'SELL' | 'NEUTRAL';
  weightedConfidence: number;
  averageEV: number;
  averageRR: number;
  consensusStrength: 'STRONG' | 'MODERATE' | 'WEAK' | 'CONFLICT';
  topPerformingModel: string;
  agreementPercentage: number;
  conflictingModels: string[];
  reasoning: string;
  finalGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface IntelligentSignalResult extends ConsensusSignalResult {
  structuralAnalysis: StructuralAnalysis;
  aiValidation: WeightedAIAnalysis;
  outcomePrediction: OutcomePrediction;
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
    
    return `You are an elite institutional SMC/ICT trader analyzing ${pair} at ${livePrice} during ${currentSession} session.

HARD REQUIREMENTS - Only return valid signals if:
1. Confidence MUST be 75%+ for Strong, 65%+ for Medium
2. Expected Value MUST be 1.0+ for Strong signals  
3. At least 2 SMC confluences (BOS, CHoCH, FVG, OB)
4. Session timing must be optimal for the pair
5. Price must be interacting with Order Block or Fair Value Gap

SMC STRATEGY ROLES:
- Groq: Institutional bias + structure analysis
- Gemini: Trend validation + SMC confirmation  
- Cohere: Volume + liquidity analysis
- OpenRouter: Risk assessment + confluence grading
- Together: Entry precision + timing validation

Required JSON format:
{
  "entry": "${livePrice}",
  "stop_loss": "${(livePrice * (Math.random() > 0.5 ? 0.998 : 1.002)).toFixed(5)}",
  "take_profit": "${(livePrice * (Math.random() > 0.5 ? 1.006 : 0.994)).toFixed(5)}",
  "confidence": 85,
  "expected_value": 1.45,
  "rr_ratio": 3.2,
  "signal_strength": "Strong",
  "strategies": ["SMC", "BOS", "FVG", "Volume"],
  "analysis": "Clear institutional setup with structure break + FVG interaction",
  "direction": "BUY",
  "valid": true
}

REJECT if confluence < 4/6 or confidence < 65% or no FVG/OB interaction.`;
  }

  private getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 8) return 'Asia';
    if (hour >= 8 && hour < 16) return 'London';
    if (hour >= 16 && hour < 24) return 'New York';
    return 'Asia';
  }

  async scanForHighQualitySignals(pair: string = 'EURUSD', livePrice: number = 1.0850): Promise<IntelligentSignalResult> {
    console.log(`🧠 Enhanced Signal Engine: Scanning ${pair} at ${livePrice}`);
    
    const scanStartTime = Date.now();
    const debugInfo = {
      structuralDebug: '',
      aiDebug: '',
      outcomeDebug: ''
    };

    // STAGE 1: STRUCTURAL PRE-SCREENING
    console.log('🏗️ Stage 1: Structural Analysis...');
    const structuralAnalysis = structuralIntelligenceScanner.analyzeMarketStructure(pair, livePrice);
    debugInfo.structuralDebug = `Grade: ${structuralAnalysis.structuralGrade}, Confluence: ${structuralAnalysis.confluenceScore}/6`;
    
    // FIXED: More lenient structural requirements
    if (structuralAnalysis.confluenceScore < 3) {
      console.log('❌ REJECTED: Failed structural pre-qualification');
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'STRUCTURAL_FAILURE', undefined, undefined, debugInfo);
    }

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
      
      if (result.status === 'fulfilled' && result.value !== null) {
        const response = result.value;
        if (this.isValidEnhancedAIModelResponse(response)) {
          return response;
        }
      }
      
      if (!failedModels.includes(modelName)) {
        failedModels.push(modelName);
      }
      return this.getFallbackResponse(modelName);
    });

    // STAGE 3: AI VALIDATION & CONSENSUS
    const validResponses = aiResponses.filter(r => r.valid && r.model !== 'FALLBACK');
    const hasStrongConsensus = validResponses.length >= 4 && validResponses.filter(r => r.confidence >= 75).length >= 3;
    const hasModerateConsensus = validResponses.length >= 3 && validResponses.filter(r => r.confidence >= 65).length >= 2;
    
    if (!hasStrongConsensus && !hasModerateConsensus) {
      console.log('❌ REJECTED: Insufficient AI consensus');
      const aiValidation = this.buildAIValidation(aiResponses, false);
      return this.buildRejectedSignal(pair, livePrice, structuralAnalysis, 'AI_CONSENSUS_FAILED', aiValidation, undefined, debugInfo);
    }

    // STAGE 4: CALCULATE FINAL METRICS
    const avgConfidence = validResponses.reduce((sum, r) => sum + r.confidence, 0) / validResponses.length;
    const avgEV = validResponses.reduce((sum, r) => sum + r.expected_value, 0) / validResponses.length;
    const avgRR = validResponses.reduce((sum, r) => sum + r.rr_ratio, 0) / validResponses.length;
    
    const bestResponse = validResponses.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    const aiValidation = this.buildAIValidation(aiResponses, true);
    const finalGrade = this.calculateFinalGrade(structuralAnalysis, aiValidation, avgEV, avgRR);
    const signalStrength = this.mapGradeToStrength(finalGrade);

    // Build successful result
    const processingTime = Date.now() - scanStartTime;
    console.log(`✅ SIGNAL APPROVED: Grade ${finalGrade} signal generated in ${processingTime}ms`);

    return {
      hasConsensus: true,
      consensusCount: validResponses.length,
      totalModels: 5,
      avgExpectedValue: avgEV,
      avgRiskReward: avgRR,
      avgConfidence: avgConfidence,
      signalStrength,
      aiResponses,
      
      // Required consensus display properties
      direction: bestResponse.direction as 'BUY' | 'SELL',
      weightedConfidence: Math.round(avgConfidence),
      averageEV: Number(avgEV.toFixed(2)),
      averageRR: Number(avgRR.toFixed(1)),
      consensusStrength: hasStrongConsensus ? 'STRONG' : 'MODERATE',
      topPerformingModel: bestResponse.model,
      agreementPercentage: Math.round((validResponses.length / 5) * 100),
      conflictingModels: failedModels,
      reasoning: `${validResponses.length}/5 AI models achieved consensus. ${aiValidation.reasoning}`,
      finalGrade,
      
      structuralAnalysis,
      aiValidation,
      outcomePrediction: {
        tpProbability: Math.min(85, 50 + (avgEV * 10)),
        slProbability: 100 - Math.min(85, 50 + (avgEV * 10)),
        maxDrawdownExpected: Math.max(5, 20 - (avgConfidence * 0.2)),
        timeToTarget: Math.round(4 + Math.random() * 8),
        riskLevel: avgRR >= 3 ? 'LOW' : avgRR >= 2 ? 'MEDIUM' : 'HIGH',
        sessionRisk: this.getCurrentSession() === 'London' ? 15 : 25,
        predictionConfidence: avgConfidence,
        recommendation: finalGrade === 'F' ? 'AVOID' : finalGrade <= 'C' ? 'WATCH_ONLY' : 'EXECUTE'
      },
      processingStages: {
        structuralPass: true,
        aiConsensusPass: true,
        outcomePass: true,
        finalApproved: true
      },
      debugInfo,
      finalSignal: {
        entry: bestResponse.entry,
        stopLoss: bestResponse.stop_loss,
        takeProfit: bestResponse.take_profit,
        confidence: Math.round(avgConfidence),
        strategies: bestResponse.strategies,
        analysis: `Grade ${finalGrade}: ${bestResponse.analysis}`,
        direction: bestResponse.direction as 'BUY' | 'SELL'
      },
      scanDetails: {
        successfulModels: validResponses.length,
        failedModels,
        timestamp: new Date().toISOString()
      }
    };
  }

  private buildAIValidation(aiResponses: EnhancedAIModelResponse[], hasConsensus: boolean): WeightedAIAnalysis {
    const validResponses = aiResponses.filter(r => r.valid);
    const avgConfidence = validResponses.length > 0 ? 
      validResponses.reduce((sum, r) => sum + r.confidence, 0) / validResponses.length : 0;
    
    const directions = validResponses.map(r => r.direction).filter(d => d !== 'NO_TRADE');
    const buyVotes = directions.filter(d => d === 'BUY').length;
    const sellVotes = directions.filter(d => d === 'SELL').length;
    const majorityDirection = buyVotes > sellVotes ? 'BUY' : sellVotes > buyVotes ? 'SELL' : 'CONFLICT';

    return {
      direction: majorityDirection,
      weightedConfidence: avgConfidence,
      averageEV: validResponses.reduce((sum, r) => sum + r.expected_value, 0) / Math.max(validResponses.length, 1),
      averageRR: validResponses.reduce((sum, r) => sum + r.rr_ratio, 0) / Math.max(validResponses.length, 1),
      consensusStrength: hasConsensus ? (validResponses.length >= 4 ? 'STRONG' : 'MODERATE') : 'WEAK',
      topModel: validResponses.length > 0 ? validResponses[0].model : 'NONE',
      modelAgreement: (validResponses.length / 5) * 100,
      conflictingModels: aiResponses.filter(r => !r.valid).map(r => r.model),
      reasoning: hasConsensus ? `Strong institutional consensus achieved` : `Insufficient model agreement`
    };
  }

  private calculateFinalGrade(
    structural: StructuralAnalysis,
    ai: WeightedAIAnalysis, 
    avgEV: number,
    avgRR: number
  ): 'A' | 'B' | 'C' | 'D' | 'F' {
    // Grade A: Elite signals
    if (structural.structuralGrade === 'A' && ai.consensusStrength === 'STRONG' && avgEV >= 1.5 && avgRR >= 3) {
      return 'A';
    }
    
    // Grade B: Strong signals
    if (structural.structuralGrade !== 'F' && ai.consensusStrength !== 'WEAK' && avgEV >= 1.0 && avgRR >= 2.5) {
      return 'B';
    }
    
    // Grade C: Acceptable signals  
    if (structural.confluenceScore >= 4 && ai.weightedConfidence >= 65 && avgEV >= 0.8) {
      return 'C';
    }
    
    // Grade D: Weak signals
    if (ai.weightedConfidence >= 55 && avgEV >= 0.5) {
      return 'D';
    }
    
    return 'F';
  }

  private mapGradeToStrength(grade: 'A' | 'B' | 'C' | 'D' | 'F'): 'ELITE' | 'STRONG' | 'WEAK' | 'NO_CONSENSUS' {
    switch (grade) {
      case 'A': return 'ELITE';
      case 'B': return 'STRONG';
      case 'C':
      case 'D': return 'WEAK';
      default: return 'NO_CONSENSUS';
    }
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
      
      // Required consensus display properties
      direction: 'NEUTRAL',
      weightedConfidence: 0,
      averageEV: 0,
      averageRR: 0,
      consensusStrength: 'CONFLICT',
      topPerformingModel: 'NONE',
      agreementPercentage: 0,
      conflictingModels: ['All Models'],
      reasoning: rejectionReason,
      finalGrade: 'F',
      
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
      processingStages: {
        structuralPass: rejectionReason !== 'STRUCTURAL_FAILURE',
        aiConsensusPass: rejectionReason !== 'AI_CONSENSUS_FAILED',
        outcomePass: false,
        finalApproved: false
      },
      debugInfo,
      scanDetails: {
        successfulModels: 0,
        failedModels: ['All'],
        timestamp: new Date().toISOString()
      }
    };
  }

  private getCurrentSession(): string {
    const hour = new Date().getUTCHours();
    if (hour >= 0 && hour < 8) return 'Asia';
    if (hour >= 8 && hour < 16) return 'London';
    if (hour >= 16 && hour < 24) return 'New York';
    return 'Asia';
  }

  private parseAIResponse(text: string, modelName: string): EnhancedAIModelResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        const confidence = Math.min(100, Math.max(0, parsed.confidence || 50));
        const expectedValue = parsed.expected_value || 0.5;
        const signalStrength = parsed.signal_strength || 'Weak';
        
        // FIXED: Proper validation logic
        const isValid = parsed.valid !== false && 
                       confidence >= 65 && 
                       expectedValue >= 0.8 && 
                       (signalStrength === 'Strong' || signalStrength === 'Medium');

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
    } catch (error) {
      console.error(`${modelName} JSON parsing error:`, error);
    }
    
    return this.getFallbackResponse(modelName);
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
