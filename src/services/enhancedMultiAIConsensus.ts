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
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`${modelNames[index]} AI failed:`, result.reason);
        if (!failedModels.includes(modelNames[index])) {
          failedModels.push(modelNames[index]);
        }
        return this.getFallbackResponse(modelNames[index]);
      }
    });

    // Filter for high-quality valid signals (not NO_TRADE)
    const validSignals = aiResponses.filter(response => 
      response.valid && 
      response.confidence > 70 && 
      response.direction !== 'NO_TRADE' &&
      (response.signal_strength === 'Strong' || response.signal_strength === 'Medium')
    );

    const totalModels = aiResponses.length;
    const consensusCount = validSignals.length;
    const successfulModels = aiResponses.filter(r => r.model !== 'FALLBACK').length;
    const hasConsensus = consensusCount >= 3; // Need at least 3/5 AIs to agree

    console.log(`📊 AI Results: ${successfulModels}/${totalModels} responded, ${consensusCount} valid signals`);

    if (!hasConsensus) {
      console.log(`❌ No consensus: Only ${consensusCount}/5 AIs agreed (need 3+)`);
      return {
        hasConsensus: false,
        consensusCount,
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

    // Calculate consensus metrics from valid signals
    const avgExpectedValue = validSignals.reduce((sum, s) => sum + s.expected_value, 0) / validSignals.length;
    const avgRiskReward = validSignals.reduce((sum, s) => sum + s.rr_ratio, 0) / validSignals.length;
    const avgConfidence = validSignals.reduce((sum, s) => sum + s.confidence, 0) / validSignals.length;

    // Determine signal strength based on consensus quality
    let signalStrength: 'ELITE' | 'STRONG' | 'WEAK' = 'WEAK';
    if (consensusCount >= 4 && avgConfidence >= 85 && avgExpectedValue >= 1.5) {
      signalStrength = 'ELITE';
    } else if (consensusCount >= 3 && avgConfidence >= 75 && avgExpectedValue >= 1.0) {
      signalStrength = 'STRONG';
    }

    // Create final signal from highest confidence valid response
    const bestSignal = validSignals.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    console.log(`✅ Consensus achieved: ${consensusCount}/5 AIs - ${signalStrength} signal (${successfulModels} models responded)`);
    
    return {
      hasConsensus: true,
      consensusCount,
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
        analysis: `${consensusCount}/${totalModels} AI Consensus (${successfulModels} responded): ${bestSignal.analysis}`,
        direction: bestSignal.direction as 'BUY' | 'SELL'
      },
      scanDetails: {
        successfulModels,
        failedModels,
        timestamp: new Date().toISOString()
      }
    };
  }

  private async callWithTimeout<T>(
    fn: (prompt: string) => Promise<T>, 
    prompt: string, 
    modelName: string, 
    failedModels: string[]
  ): Promise<T> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 15000)
      );
      
      return await Promise.race([fn(prompt), timeoutPromise]);
    } catch (error) {
      console.error(`${modelName} timeout or error:`, error);
      failedModels.push(modelName);
      throw error;
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
        return {
          entry: parsed.entry || '1.0850',
          stop_loss: parsed.stop_loss || '1.0830',
          take_profit: parsed.take_profit || '1.0890',
          confidence: Math.min(100, Math.max(0, parsed.confidence || 75)),
          expected_value: parsed.expected_value || 1.0,
          rr_ratio: parsed.rr_ratio || 2.0,
          signal_strength: parsed.signal_strength || 'Medium',
          strategies: parsed.strategies || ['Technical Analysis'],
          analysis: parsed.analysis || `${modelName} institutional analysis`,
          direction: parsed.direction || 'BUY',
          valid: parsed.valid !== false && parsed.confidence > 70,
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
      confidence: 50, // Below consensus threshold
      expected_value: 0.5,
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
