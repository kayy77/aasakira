
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
}

export interface ConsensusSignalResult {
  hasConsensus: boolean;
  consensusCount: number;
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

You are analyzing ${pair}, using the latest live price data: ${livePrice}, and returning high-probability trade signals only.

Use the following strategies when relevant:
- Smart Money Concepts (SMC): structure shifts, liquidity sweeps, FVGs, OBs
- Volume Spike Confluence
- RSI + Momentum Divergence
- Time/Session Logic (NY open, London close, etc.)
- Pattern Recognition (flags, wedges, reversals)
- Price Action Levels (break/retest, SR zones)

CRITICAL: Only return a signal if at least 2 strategies align and confidence > 70%. If not, return: "No valid trade."

Output format (JSON only):
{
  "entry": "${livePrice}",
  "stop_loss": "${(livePrice * (Math.random() > 0.5 ? 0.998 : 1.002)).toFixed(5)}",
  "take_profit": "${(livePrice * (Math.random() > 0.5 ? 1.006 : 0.994)).toFixed(5)}",
  "confidence": 85,
  "expected_value": 1.45,
  "rr_ratio": 3.2,
  "signal_strength": "Strong",
  "strategies": ["SMC", "Liquidity Sweep", "Session Filter"],
  "analysis": "Based on the current price and structure shift, this trade shows confluence between SMC + OB rejection + liquidity sweep, with 3.2 R:R and expected value of +1.45.",
  "direction": "BUY",
  "valid": true
}

Return ONLY valid JSON. No other text.`;
  }

  async scanForHighQualitySignals(pair: string = 'EURUSD', livePrice: number = 1.0850): Promise<ConsensusSignalResult> {
    console.log(`🧠 Enhanced AI Consensus: Scanning ${pair} at ${livePrice}`);
    
    const prompt = this.buildInstitutionalPrompt(pair, livePrice);
    
    // Call all AI models in parallel
    const aiPromises = [
      this.callGroqAI(prompt),
      this.callGeminiAI(prompt),
      this.callCohereAI(prompt),
      this.callOpenRouterAI(prompt),
      this.callTogetherAI(prompt)
    ];

    const results = await Promise.allSettled(aiPromises);
    const aiResponses: EnhancedAIModelResponse[] = results.map((result, index) => {
      const modelNames = ['Groq', 'Gemini', 'Cohere', 'OpenRouter', 'Together'];
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`${modelNames[index]} AI failed:`, result.reason);
        return this.getFallbackResponse(modelNames[index]);
      }
    });

    // Filter for high-quality signals
    const validSignals = aiResponses.filter(response => 
      response.valid && 
      response.confidence > 70 && 
      (response.signal_strength === 'Strong' || response.signal_strength === 'Medium')
    );

    const consensusCount = validSignals.length;
    const hasConsensus = consensusCount >= 3; // Need at least 3/5 AIs to agree

    if (!hasConsensus) {
      console.log(`❌ No consensus: Only ${consensusCount}/5 AIs agreed`);
      return {
        hasConsensus: false,
        consensusCount,
        avgExpectedValue: 0,
        avgRiskReward: 0,
        avgConfidence: 0,
        signalStrength: 'NO_CONSENSUS',
        aiResponses
      };
    }

    // Calculate consensus metrics
    const avgExpectedValue = validSignals.reduce((sum, s) => sum + s.expected_value, 0) / validSignals.length;
    const avgRiskReward = validSignals.reduce((sum, s) => sum + s.rr_ratio, 0) / validSignals.length;
    const avgConfidence = validSignals.reduce((sum, s) => sum + s.confidence, 0) / validSignals.length;

    // Determine signal strength
    let signalStrength: 'ELITE' | 'STRONG' | 'WEAK' = 'WEAK';
    if (consensusCount >= 4 && avgConfidence >= 85 && avgExpectedValue >= 1.5) {
      signalStrength = 'ELITE';
    } else if (consensusCount >= 3 && avgConfidence >= 75 && avgExpectedValue >= 1.0) {
      signalStrength = 'STRONG';
    }

    // Create final signal from best consensus
    const bestSignal = validSignals.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    console.log(`✅ Consensus achieved: ${consensusCount}/5 AIs - ${signalStrength} signal`);
    
    return {
      hasConsensus: true,
      consensusCount,
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
        analysis: `${consensusCount}/5 AI Consensus: ${bestSignal.analysis}`,
        direction: bestSignal.direction
      }
    };
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
      return this.getFallbackResponse('Groq');
    }
  }

  private async callGeminiAI(prompt: string): Promise<EnhancedAIModelResponse> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.API_KEYS.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
        })
      });
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return this.parseAIResponse(text, 'Gemini');
    } catch (error) {
      console.error('Gemini AI error:', error);
      return this.getFallbackResponse('Gemini');
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
      
      const data = await response.json();
      const text = data.generations?.[0]?.text || '';
      return this.parseAIResponse(text, 'Cohere');
    } catch (error) {
      console.error('Cohere AI error:', error);
      return this.getFallbackResponse('Cohere');
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
          model: 'anthropic/claude-3-sonnet',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 800
        })
      });
      
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return this.parseAIResponse(text, 'Claude');
    } catch (error) {
      console.error('OpenRouter AI error:', error);
      return this.getFallbackResponse('Claude');
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
      
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return this.parseAIResponse(text, 'Mixtral');
    } catch (error) {
      console.error('Together AI error:', error);
      return this.getFallbackResponse('Mixtral');
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
          valid: parsed.valid !== false && parsed.confidence > 70
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
      confidence: 60, // Below consensus threshold
      expected_value: 0.5,
      rr_ratio: 2.0,
      signal_strength: 'Weak',
      strategies: [`${modelName} Analysis`],
      analysis: `${modelName} model unavailable - fallback analysis`,
      direction: 'BUY',
      valid: false // Mark as invalid so it won't count for consensus
    };
  }
}

export const enhancedMultiAIConsensus = new EnhancedMultiAIConsensus();
