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

class EnhancedMultiAIConsensus {
  private readonly API_KEYS = {
    gemini: 'AIzaSyBds1Zg7DCF9RcCbL-YC23pj2rUs2FMfJA',
    openrouter: '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',
    cohere: 'wTX42tk4eKfBGoXNmRVIPrIukl01yKCn0VsaCjjf',
    together: '8b0103657b0290f0a815723af49c8ed66af6f5df882de5acc1de32e02311bb79'
  };

  private buildInstitutionalPrompt(pair: string, livePrice: number): string {
    return `You are a top-level institutional-grade AI signal engine.

Analyzing ${pair} at live price: ${livePrice}

Use institutional strategies:
- Smart Money Concepts (SMC): structure shifts, liquidity sweeps, FVGs
- Volume Spike Analysis
- RSI + Momentum Divergence  
- Session Logic (NY/London/Asian)
- Pattern Recognition
- Price Action Levels

CRITICAL: Only return valid signals if confidence > 70% AND at least 2 strategies align.

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

  async scanForHighQualitySignals(pair: string = 'EURUSD', livePrice: number = 1.0850): Promise<ConsensusSignalResult> {
    console.log(`🧠 Enhanced AI Consensus: Scanning ${pair} at ${livePrice}`);
    
    const prompt = this.buildInstitutionalPrompt(pair, livePrice);
    const failedModels: string[] = [];
    
    // Call all AI models with proper error handling
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
          return response;
        } else {
          console.error(`${modelName} AI returned invalid response:`, response);
          if (!failedModels.includes(modelName)) {
            failedModels.push(modelName);
          }
          return this.getFallbackResponse(modelName);
        }
      } else {
        console.error(`${modelName} AI failed:`, result.status === 'rejected' ? result.reason : 'No response');
        if (!failedModels.includes(modelName)) {
          failedModels.push(modelName);
        }
        return this.getFallbackResponse(modelName);
      }
    });

    // FIXED: Only count Strong signals with proper thresholds
    const strongSignals = aiResponses.filter(response => 
      response.valid && 
      response.confidence >= 60 && // Minimum professional threshold
      response.expected_value >= 1.0 && // Minimum EV requirement
      response.direction !== 'NO_TRADE' &&
      response.signal_strength === 'Strong' && // ONLY Strong signals count
      response.model !== 'FALLBACK' // Don't count fallback responses
    );

    const totalModels = 5;
    const strongVoteCount = strongSignals.length; // This is the real consensus count
    const successfulModels = aiResponses.filter(r => r.model !== 'FALLBACK').length;

    console.log(`📊 AI Results: ${successfulModels}/${totalModels} responded, ${strongVoteCount} STRONG signals`);

    // FIXED: Proper consensus logic based on strong votes only
    let hasConsensus = false;
    let signalStrength: 'ELITE' | 'STRONG' | 'WEAK' | 'NO_CONSENSUS' = 'NO_CONSENSUS';
    
    if (strongVoteCount === 0) {
      signalStrength = 'NO_CONSENSUS';
      hasConsensus = false;
      console.log(`❌ No consensus: 0 strong signals - all responses were Medium/Weak/Failed`);
    } else {
      const avgExpectedValue = strongSignals.reduce((sum, s) => sum + s.expected_value, 0) / strongSignals.length;
      const avgRiskReward = strongSignals.reduce((sum, s) => sum + s.rr_ratio, 0) / strongSignals.length;
      const avgConfidence = strongSignals.reduce((sum, s) => sum + s.confidence, 0) / strongSignals.length;

      // FIXED: Institutional-grade consensus thresholds
      if (strongVoteCount >= 4 && avgConfidence >= 85 && avgExpectedValue >= 1.5) {
        signalStrength = 'ELITE';
        hasConsensus = true;
      } else if (strongVoteCount >= 3 && avgConfidence >= 75 && avgExpectedValue >= 1.0) {
        signalStrength = 'STRONG';
        hasConsensus = true;
      } else if (strongVoteCount >= 2 && avgConfidence >= 65 && avgExpectedValue >= 0.8) {
        signalStrength = 'WEAK';
        hasConsensus = false; // Weak signals don't qualify as true consensus
      } else {
        signalStrength = 'NO_CONSENSUS';
        hasConsensus = false;
      }

      console.log(`✅ Consensus evaluation: ${strongVoteCount}/${totalModels} STRONG AIs - ${signalStrength} signal`);
      
      if (!hasConsensus) {
        console.log(`❌ No institutional consensus: Only ${strongVoteCount} strong signals (need 3+ for STRONG, 4+ for ELITE)`);
        return {
          hasConsensus: false,
          consensusCount: strongVoteCount,
          totalModels,
          avgExpectedValue: avgExpectedValue || 0,
          avgRiskReward: avgRiskReward || 0,
          avgConfidence: avgConfidence || 0,
          signalStrength,
          aiResponses,
          scanDetails: {
            successfulModels,
            failedModels,
            timestamp: new Date().toISOString()
          }
        };
      }

      const bestSignal = strongSignals.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      return {
        hasConsensus: true,
        consensusCount: strongVoteCount,
        totalModels,
        avgExpectedValue,
        avgRiskReward,
        avgConfidence,
        signalStrength,
        aiResponses,
        finalSignal: {
          entry: bestSignal.entry,
          stopLoss: bestSignal.stop_loss,
          takeProfit: bestSignal.take_profit,
          confidence: Math.round(avgConfidence),
          strategies: bestSignal.strategies,
          analysis: `${strongVoteCount}/${totalModels} Strong AI Consensus: ${bestSignal.analysis}`,
          direction: bestSignal.direction as 'BUY' | 'SELL'
        },
        scanDetails: {
          successfulModels,
          failedModels,
          timestamp: new Date().toISOString()
        }
      };
    }

    return {
      hasConsensus: false,
      consensusCount: strongVoteCount,
      totalModels,
      avgExpectedValue: 0,
      avgRiskReward: 0,
      avgConfidence: 0,
      signalStrength: 'NO_CONSENSUS',
      aiResponses,
      scanDetails: {
        successfulModels,
        failedModels,
        timestamp: new Date().toISOString()
      }
    };
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
