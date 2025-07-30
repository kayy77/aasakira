
export interface AIModelResponse {
  rating: number;
  verdict: 'Elite' | 'Strong' | 'Moderate' | 'Weak' | 'Avoid';
  summary: string;
  key_confluences: string[];
  concerns: string[];
  recommendation: string;
}

export interface AIVotes {
  groq: AIModelResponse;
  gemini: AIModelResponse;
  cohere: AIModelResponse;
  openrouter: AIModelResponse;
  together: AIModelResponse;
  [key: string]: AIModelResponse;
}

export interface ConsensusResult {
  approved: boolean;
  confidence_score: number;
  ai_votes: AIVotes;
  verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS';
  label: string;
  reasoning: string[];
  final_rating: number;
}

interface SignalContext {
  pair: string;
  timeframe: string;
  direction: 'BUY' | 'SELL';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  structure_desc: string;
  liquidity_zone_info: string;
  fvg_info: string;
  rsi_data: string;
  volume_snapshot: string;
  session_info: string;
  time: string;
  news_context: string;
  confluences_list: string[];
}

class MultiAIConsensusEngine {
  private readonly API_KEYS = {
    gemini: 'AIzaSyBds1Zg7DCF9RcCbL-YC23pj2rUs2FMfJA',
    openrouter: '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',
    cohere: 'wTX42tk4eKfBGoXNmRVIPrIukl01yKCn0VsaCjjf',
    together: '8b0103657b0290f0a815723af49c8ed66af6f5df882de5acc1de32e02311bb79'
  };

  private buildMasterPrompt(context: SignalContext): string {
    return `You are a professional institutional-grade trading analyst using Smart Money Concepts, Order Flow, Liquidity Theory, Risk Management, and Volume Behavior to analyze trade setups.

A trade idea is being reviewed by a panel of AI analysts. Your role is to independently evaluate the trade, determine its quality, and return a structured, professional response.

===============================
📊 Trade Setup:
- Pair: ${context.pair}
- Timeframe: ${context.timeframe}
- Trade Direction: ${context.direction}
- Entry Price: ${context.entry_price}
- Stop Loss: ${context.stop_loss}
- Take Profit: ${context.take_profit}

===============================
🧠 Market Context:
- Market Structure: ${context.structure_desc}
- Liquidity Context: ${context.liquidity_zone_info}
- Fair Value Gaps (FVG): ${context.fvg_info}
- RSI/Divergence: ${context.rsi_data}
- Volume Data: ${context.volume_snapshot}
- Session: ${context.session_info}
- Time of Entry: ${context.time}
- News Events: ${context.news_context}
- Confluences Present: ${context.confluences_list.join(', ')}

===============================
✅ Instructions:
1. Determine if this is a **valid institutional-grade trade setup**.
2. Rate this trade from 1 to 10 based on:
   - Confluence of SMC, volume, and time session
   - Clean entry logic (based on imbalances, liquidity sweep, inducement zones)
   - Risk-to-reward quality
   - Likelihood of the trade reaching TP without SL hit

3. Give a **verdict** in one of these exact labels:
   - \`Elite\` (9-10)
   - \`Strong\` (8-9)
   - \`Moderate\` (6-7)
   - \`Weak\` (4-5)
   - \`Avoid\` (1-3)

4. Return your answer in **this exact JSON format**:

{
  "rating": 9,
  "verdict": "Strong",
  "summary": "Brief analysis summary",
  "key_confluences": ["confluence1", "confluence2"],
  "concerns": ["concern1"],
  "recommendation": "Action recommendation"
}

Return only the JSON. No other text.`;
  }

  private async callGeminiAI(prompt: string): Promise<AIModelResponse> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.API_KEYS.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        })
      });
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Gemini AI error:', error);
      return this.getFallbackResponse();
    }
  }

  private async callCohereAI(prompt: string): Promise<AIModelResponse> {
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
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      const text = data.generations?.[0]?.text || '';
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Cohere AI error:', error);
      return this.getFallbackResponse();
    }
  }

  private async callOpenRouterAI(prompt: string): Promise<AIModelResponse> {
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
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('OpenRouter AI error:', error);
      return this.getFallbackResponse();
    }
  }

  private async callTogetherAI(prompt: string): Promise<AIModelResponse> {
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
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Together AI error:', error);
      return this.getFallbackResponse();
    }
  }

  private parseAIResponse(text: string): AIModelResponse {
    try {
      // Extract JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          rating: parsed.rating || 5,
          verdict: parsed.verdict || 'Moderate',
          summary: parsed.summary || 'Analysis unavailable',
          key_confluences: parsed.key_confluences || [],
          concerns: parsed.concerns || [],
          recommendation: parsed.recommendation || 'Review setup'
        };
      }
    } catch (error) {
      console.error('JSON parsing error:', error);
    }
    
    return this.getFallbackResponse();
  }

  private getFallbackResponse(): AIModelResponse {
    return {
      rating: 5,
      verdict: 'Moderate',
      summary: 'AI analysis unavailable',
      key_confluences: [],
      concerns: ['AI response error'],
      recommendation: 'Manual review required'
    };
  }

  async analyzeSignalConsensus(context: SignalContext): Promise<ConsensusResult> {
    console.log('🧠 Multi-AI Consensus Analysis Starting...');
    
    const prompt = this.buildMasterPrompt(context);
    
    // Call all AI models in parallel
    const [groqResponse, geminiResponse, cohereResponse, openrouterResponse, togetherResponse] = await Promise.allSettled([
      this.callGroqAI(prompt),
      this.callGeminiAI(prompt),
      this.callCohereAI(prompt),
      this.callOpenRouterAI(prompt),
      this.callTogetherAI(prompt)
    ]);

    const aiVotes: AIVotes = {
      groq: groqResponse.status === 'fulfilled' ? groqResponse.value : this.getFallbackResponse(),
      gemini: geminiResponse.status === 'fulfilled' ? geminiResponse.value : this.getFallbackResponse(),
      cohere: cohereResponse.status === 'fulfilled' ? cohereResponse.value : this.getFallbackResponse(),
      openrouter: openrouterResponse.status === 'fulfilled' ? openrouterResponse.value : this.getFallbackResponse(),
      together: togetherResponse.status === 'fulfilled' ? togetherResponse.value : this.getFallbackResponse()
    };

    // Calculate consensus
    const responses = Object.values(aiVotes);
    const highRatingCount = responses.filter(r => r.rating >= 8).length;
    const strongVerdictCount = responses.filter(r => ['Elite', 'Strong'].includes(r.verdict)).length;
    
    const averageRating = responses.reduce((sum, r) => sum + r.rating, 0) / responses.length;
    const confidenceScore = Math.max(highRatingCount, strongVerdictCount);
    
    // Determine final verdict
    let verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS' = 'REJECTED';
    let label = '❌ Rejected Signal';
    
    if (confidenceScore >= 4) {
      verdict = 'APPROVED';
      label = '🔥 Multi-AI Verified';
    } else if (confidenceScore >= 2) {
      verdict = 'LOW_CONSENSUS';
      label = '⚠️ Low Consensus';
    }

    const reasoning = [
      `${confidenceScore}/5 AI models voted Strong or Elite`,
      `Average rating: ${averageRating.toFixed(1)}/10`,
      `Consensus level: ${verdict.toLowerCase().replace('_', ' ')}`
    ];

    console.log(`✅ Multi-AI Analysis Complete: ${verdict} (${confidenceScore}/5 votes)`);

    return {
      approved: verdict === 'APPROVED',
      confidence_score: confidenceScore,
      ai_votes: aiVotes,
      verdict,
      label,
      reasoning,
      final_rating: Math.round(averageRating)
    };
  }

  private async callGroqAI(prompt: string): Promise<AIModelResponse> {
    try {
      // Use existing groqService
      const { groqService } = await import('./groqService');
      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 1000
      });
      
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Groq AI error:', error);
      return this.getFallbackResponse();
    }
  }
}

export const multiAIConsensusEngine = new MultiAIConsensusEngine();
