
export interface AIModelResponse {
  rating: number;
  verdict: 'Elite' | 'Strong' | 'Moderate' | 'Weak' | 'Avoid';
  summary: string;
  key_confluences: string[];
  concerns: string[];
  recommendation: string;
  // Enhanced institutional analysis fields
  ai_analysis: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  setup_type: string;
  market_phase: string;
  justification: string[];
  conviction_strength: number; // 1-10
  risk_assessment: string;
  news_impact: string;
  // New enhanced fields for deeper analysis
  expected_value: number; // -2 to +2 scale
  quality_grade: 'Elite' | 'Smart_Risk' | 'Standard' | 'Questionable' | 'Reject';
  institutional_reasoning: string;
  risk_reward_analysis: string;
  market_context: string;
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
  consensus_strength: string;
  multi_ai_verdict: string;
  // Enhanced consensus fields
  expected_value: number;
  quality_tier: 'INSTITUTIONAL' | 'PROFESSIONAL' | 'STANDARD' | 'SPECULATIVE';
  ai_agreement_level: string;
  institutional_grade: string;
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
    together: '8b0103657b0290f0a815723af49c8ed66af6f5df882de5acc1de32e02311bb79',
    newsdata: 'pub_5cf95a64279c4e63b30a66fc9f2518fa',
    fcs: 'y4xERka7Pi3Flz3a87NnA'
  };

  private buildInstitutionalPrompt(context: SignalContext, modelRole: string): string {
    const riskReward = Math.abs(context.take_profit - context.entry_price) / Math.abs(context.entry_price - context.stop_loss);
    
    const rolePrompts = {
      'institutional': `You are a senior quant analyst at Citadel Securities. Your job is to evaluate trades with institutional precision and macro awareness.`,
      'technical': `You are a professional Smart Money Concepts trader with 10+ years experience. Focus on structure, order flow, and price action.`,
      'risk': `You are a risk management specialist at a hedge fund. Your primary focus is expected value optimization and R:R analysis.`,
      'pattern': `You are a pattern recognition expert. Look for clean setups and identify any structural flaws or conflicting signals.`,
      'contrarian': `You are a contrarian analyst. Your job is to find potential red flags and reasons this trade might fail.`
    };

    return `${rolePrompts[modelRole] || rolePrompts['institutional']}

CRITICAL SETUP ANALYSIS:
- Pair: ${context.pair}
- Direction: ${context.direction}
- Entry: ${context.entry_price}
- Stop Loss: ${context.stop_loss}
- Take Profit: ${context.take_profit}
- Risk:Reward Ratio: ${riskReward.toFixed(2)}:1

MARKET INTELLIGENCE:
- Market Structure: ${context.structure_desc}
- Liquidity Context: ${context.liquidity_zone_info}
- Fair Value Gaps: ${context.fvg_info}
- RSI/Momentum: ${context.rsi_data}
- Volume Profile: ${context.volume_snapshot}
- Session: ${context.session_info}
- News Environment: ${context.news_context}
- Confluences: ${context.confluences_list.join(', ')}

YOUR ANALYSIS MISSION:
1. Rate the EXPECTED VALUE of this trade (-2 to +2 scale):
   -2 = High probability loss
   -1 = Slight negative expectancy
    0 = Neutral/coin flip
   +1 = Positive expectancy
   +2 = High probability winner

2. Assign QUALITY GRADE:
   - Elite: Institutional-grade setup with multiple confluences
   - Smart_Risk: Good setup with manageable risk
   - Standard: Basic setup meeting minimum criteria
   - Questionable: Weak setup with concerns
   - Reject: Should not be traded

3. Provide INSTITUTIONAL REASONING:
   - Why would/wouldn't a hedge fund take this trade?
   - What's the logical basis for the setup?
   - How does this fit current market regime?

4. Give CONFIDENCE (0-100%):
   Based on your experience and analysis quality

RESPONSE FORMAT (JSON only):
{
  "rating": 8,
  "verdict": "Strong",
  "summary": "High-conviction institutional setup with multi-timeframe confluence",
  "key_confluences": ["confluence1", "confluence2"],
  "concerns": ["any concerns"],
  "recommendation": "Execute with full institutional parameters",
  "ai_analysis": "Detailed analysis with specific reasoning",
  "confidence_level": "High",
  "setup_type": "Momentum/Reversal/Breakout",
  "market_phase": "Expansion/Accumulation/Distribution",
  "justification": ["Primary reason", "Supporting evidence", "Risk management"],
  "conviction_strength": 8,
  "risk_assessment": "Risk vs reward evaluation",
  "news_impact": "News context impact",
  "expected_value": 1.5,
  "quality_grade": "Elite",
  "institutional_reasoning": "Why a hedge fund would/wouldn't take this trade",
  "risk_reward_analysis": "Detailed R:R breakdown and probability assessment",
  "market_context": "How this fits current market conditions"
}

Be brutally honest. If it's a weak setup, grade it accordingly. Focus on LOGIC over hype.`;
  }

  private async getLiveNews(pair: string): Promise<string> {
    try {
      const baseCurrency = pair.substring(0, 3);
      const quoteCurrency = pair.substring(3, 6);
      
      // Fetch economic events from FCS API
      const response = await fetch(
        `https://fcsapi.com/api-v3/forex/economic_calendar?access_key=${this.API_KEYS.fcs}&country=${this.getCurrencyCountry(baseCurrency)},${this.getCurrencyCountry(quoteCurrency)}&period=today`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        return 'Economic calendar data unavailable.';
      }

      const data = await response.json();
      
      if (!data.response || data.response.length === 0) {
        return 'No significant economic events affecting this pair currently.';
      }

      const events = data.response.slice(0, 3).map((event: any) => {
        const impact = this.mapImpact(event.impact);
        return `${event.event} (${event.country}) - Impact: ${impact}, Forecast: ${event.forecast || 'N/A'}, Previous: ${event.previous || 'N/A'}`;
      }).join(' | ');

      return `Economic events: ${events}`;
    } catch (error) {
      console.log('Economic data fetch failed:', error);
      return 'Economic calendar unavailable.';
    }
  }

  private getCurrencyCountry(currency: string): string {
    const currencyMap: { [key: string]: string } = {
      'USD': 'us',
      'EUR': 'eu', 
      'GBP': 'gb',
      'JPY': 'jp',
      'AUD': 'au',
      'CAD': 'ca',
      'CHF': 'ch',
      'NZD': 'nz'
    };
    return currencyMap[currency] || 'us';
  }

  private mapImpact(impact: string | number): string {
    if (typeof impact === 'number') {
      return impact >= 3 ? 'High' : impact >= 2 ? 'Medium' : 'Low';
    }
    return impact || 'Medium';
  }

  private async callGroqAI(prompt: string): Promise<AIModelResponse> {
    try {
      const { groqService } = await import('./groqService');
      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-70b-8192',
        temperature: 0.2, // Lower temperature for more consistent analysis
        max_tokens: 1500
      });
      
      return this.parseAIResponse(response, 'Groq-Institutional');
    } catch (error) {
      console.error('Groq AI error:', error);
      return this.getFallbackResponse('Groq');
    }
  }

  private async callGeminiAI(prompt: string): Promise<AIModelResponse> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.API_KEYS.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1500 }
        })
      });
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return this.parseAIResponse(text, 'Gemini-Technical');
    } catch (error) {
      console.error('Gemini AI error:', error);
      return this.getFallbackResponse('Gemini');
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
          temperature: 0.2,
          max_tokens: 1500
        })
      });
      
      const data = await response.json();
      const text = data.generations?.[0]?.text || '';
      return this.parseAIResponse(text, 'Cohere-Risk');
    } catch (error) {
      console.error('Cohere AI error:', error);
      return this.getFallbackResponse('Cohere');
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
          temperature: 0.2,
          max_tokens: 1500
        })
      });
      
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return this.parseAIResponse(text, 'Claude-Pattern');
    } catch (error) {
      console.error('OpenRouter AI error:', error);
      return this.getFallbackResponse('Claude');
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
          temperature: 0.2,
          max_tokens: 1500
        })
      });
      
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return this.parseAIResponse(text, 'Mixtral-Contrarian');
    } catch (error) {
      console.error('Together AI error:', error);
      return this.getFallbackResponse('Mixtral');
    }
  }

  private parseAIResponse(text: string, modelName: string): AIModelResponse {
    try {
      // Extract JSON from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          rating: parsed.rating || 5,
          verdict: parsed.verdict || 'Moderate',
          summary: parsed.summary || parsed.ai_analysis || 'Analysis from ' + modelName,
          key_confluences: parsed.key_confluences || [],
          concerns: parsed.concerns || [],
          recommendation: parsed.recommendation || 'Review setup carefully',
          ai_analysis: parsed.ai_analysis || parsed.summary || 'Institutional analysis from ' + modelName,
          confidence_level: parsed.confidence_level || 'Medium',
          setup_type: parsed.setup_type || 'Standard',
          market_phase: parsed.market_phase || 'Analysis',
          justification: parsed.justification || ['AI analysis completed'],
          conviction_strength: parsed.conviction_strength || parsed.rating || 5,
          risk_assessment: parsed.risk_assessment || 'Standard risk parameters',
          news_impact: parsed.news_impact || 'No major news impact detected',
          expected_value: parsed.expected_value || 0,
          quality_grade: parsed.quality_grade || 'Standard',
          institutional_reasoning: parsed.institutional_reasoning || 'Standard institutional analysis',
          risk_reward_analysis: parsed.risk_reward_analysis || 'Standard risk-reward evaluation',
          market_context: parsed.market_context || 'Current market conditions analysis'
        };
      }
    } catch (error) {
      console.error(`${modelName} JSON parsing error:`, error);
    }
    
    return this.getFallbackResponse(modelName);
  }

  // Timeout utility for parallel processing with fallbacks
  private async withTimeout<T>(promise: Promise<T>, ms: number, fallbackValue?: T): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
      )
    ]).catch(() => {
      if (fallbackValue !== undefined) return fallbackValue;
      throw new Error(`Operation timed out after ${ms}ms`);
    });
  }

  private getFallbackResponse(modelName: string): AIModelResponse {
    return {
      rating: 5,
      verdict: 'Moderate',
      summary: `${modelName} analysis: Standard setup with moderate conviction`,
      key_confluences: ['Multi-timeframe analysis'],
      concerns: [`${modelName} response error`],
      recommendation: 'Proceed with standard risk management',
      ai_analysis: `${modelName} institutional analysis: Moderate setup with standard parameters`,
      confidence_level: 'Medium',
      setup_type: 'Standard',
      market_phase: 'Analysis',
      justification: [`${modelName} model provided standard assessment`],
      conviction_strength: 5,
      risk_assessment: 'Moderate risk with standard R:R expectations',
      news_impact: 'News impact assessment unavailable',
      expected_value: 0,
      quality_grade: 'Standard',
      institutional_reasoning: 'Standard institutional parameters applied',
      risk_reward_analysis: 'Standard risk-reward calculation',
      market_context: 'Standard market conditions'
    };
  }

  private calculateEnhancedConsensus(responses: AIModelResponse[]): {
    avgExpectedValue: number;
    qualityTier: 'INSTITUTIONAL' | 'PROFESSIONAL' | 'STANDARD' | 'SPECULATIVE';
    agreementLevel: string;
    institutionalGrade: string;
  } {
    const avgEV = responses.reduce((sum, r) => sum + r.expected_value, 0) / responses.length;
    const avgConfidence = responses.reduce((sum, r) => sum + r.conviction_strength, 0) / responses.length;
    const eliteCount = responses.filter(r => r.quality_grade === 'Elite').length;
    const strongCount = responses.filter(r => r.quality_grade === 'Smart_Risk' || r.quality_grade === 'Elite').length;
    
    let qualityTier: 'INSTITUTIONAL' | 'PROFESSIONAL' | 'STANDARD' | 'SPECULATIVE' = 'SPECULATIVE';
    let institutionalGrade = 'Standard';
    
    if (eliteCount >= 3 && avgEV >= 1.2 && avgConfidence >= 80) {
      qualityTier = 'INSTITUTIONAL';
      institutionalGrade = 'Elite Institutional';
    } else if (strongCount >= 4 && avgEV >= 0.8 && avgConfidence >= 70) {
      qualityTier = 'PROFESSIONAL';
      institutionalGrade = 'Professional Grade';
    } else if (strongCount >= 2 && avgEV >= 0.3 && avgConfidence >= 60) {
      qualityTier = 'STANDARD';
      institutionalGrade = 'Standard Trading';
    }
    
    const agreementLevel = `${strongCount}/5 AI Models Recommend - Avg EV: ${avgEV.toFixed(2)}`;
    
    return { avgExpectedValue: avgEV, qualityTier, agreementLevel, institutionalGrade };
  }

  async analyzeSignalConsensus(context: SignalContext): Promise<ConsensusResult> {
    console.log('🧠 Enhanced Multi-AI Institutional Analysis Starting...');
    
    // Get live news context with timeout
    const liveNews = await this.withTimeout(this.getLiveNews(context.pair), 2000, 'No major news events detected');
    const enhancedContext = {
      ...context,
      news_context: liveNews
    };
    
    // Build specialized prompts for each AI model
    const institutionalPrompt = this.buildInstitutionalPrompt(enhancedContext, 'institutional');
    const technicalPrompt = this.buildInstitutionalPrompt(enhancedContext, 'technical');
    const riskPrompt = this.buildInstitutionalPrompt(enhancedContext, 'risk');
    const patternPrompt = this.buildInstitutionalPrompt(enhancedContext, 'pattern');
    const contrarianPrompt = this.buildInstitutionalPrompt(enhancedContext, 'contrarian');
    
    // Call all AI models in parallel with hard timeouts (3s each)
    const [groqResponse, geminiResponse, cohereResponse, openrouterResponse, togetherResponse] = await Promise.allSettled([
      this.withTimeout(this.callGroqAI(institutionalPrompt), 3000),
      this.withTimeout(this.callGeminiAI(technicalPrompt), 3000),
      this.withTimeout(this.callCohereAI(riskPrompt), 3000),
      this.withTimeout(this.callOpenRouterAI(patternPrompt), 3000),
      this.withTimeout(this.callTogetherAI(contrarianPrompt), 3000)
    ]);

    const aiVotes: AIVotes = {
      groq: groqResponse.status === 'fulfilled' ? groqResponse.value : this.getFallbackResponse('Groq'),
      gemini: geminiResponse.status === 'fulfilled' ? geminiResponse.value : this.getFallbackResponse('Gemini'),
      cohere: cohereResponse.status === 'fulfilled' ? cohereResponse.value : this.getFallbackResponse('Cohere'),
      openrouter: openrouterResponse.status === 'fulfilled' ? openrouterResponse.value : this.getFallbackResponse('Claude'),
      together: togetherResponse.status === 'fulfilled' ? togetherResponse.value : this.getFallbackResponse('Mixtral')
    };

    // Enhanced consensus calculation
    const responses = Object.values(aiVotes);
    const { avgExpectedValue, qualityTier, agreementLevel, institutionalGrade } = this.calculateEnhancedConsensus(responses);
    
    const averageRating = responses.reduce((sum, r) => sum + r.rating, 0) / responses.length;
    const avgConviction = responses.reduce((sum, r) => sum + r.conviction_strength, 0) / responses.length;
    const approvedCount = responses.filter(r => r.expected_value > 0 && r.conviction_strength >= 60).length;
    
    // Enhanced verdict logic based on expected value and institutional analysis
    let verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS' = 'REJECTED';
    let label = '❌ AI Consensus Rejected';
    let consensusStrength = 'Weak Consensus';
    let multiAIVerdict = 'Rejected by AI Analysis';
    
    if (qualityTier === 'INSTITUTIONAL' && avgExpectedValue >= 1.0) {
      verdict = 'APPROVED';
      label = '🏛️ INSTITUTIONAL GRADE - Elite AI Consensus';
      consensusStrength = 'Elite Institutional';
      multiAIVerdict = `${approvedCount}/5 AI Models - Institutional Grade (EV: +${avgExpectedValue.toFixed(2)})`;
    } else if (qualityTier === 'PROFESSIONAL' && avgExpectedValue >= 0.6) {
      verdict = 'APPROVED';
      label = '✅ PROFESSIONAL GRADE - Strong AI Consensus';
      consensusStrength = 'Professional Grade';
      multiAIVerdict = `${approvedCount}/5 AI Models - Professional Setup (EV: +${avgExpectedValue.toFixed(2)})`;
    } else if (approvedCount >= 3 && avgExpectedValue >= 0.3) {
      verdict = 'LOW_CONSENSUS';
      label = '⚠️ MIXED CONSENSUS - Use Caution';
      consensusStrength = 'Mixed Analysis';
      multiAIVerdict = `${approvedCount}/5 AI Models - Limited Agreement (EV: ${avgExpectedValue >= 0 ? '+' : ''}${avgExpectedValue.toFixed(2)})`;
    }

    const reasoning = [
      `${approvedCount}/5 AI models approved with positive expected value`,
      `Average Expected Value: ${avgExpectedValue >= 0 ? '+' : ''}${avgExpectedValue.toFixed(2)}`,
      `Quality Tier: ${qualityTier}`,
      `Institutional Grade: ${institutionalGrade}`,
      `Average Conviction: ${avgConviction.toFixed(1)}/10`
    ];

    console.log(`✅ Enhanced Analysis Complete: ${verdict} (${qualityTier}, EV: ${avgExpectedValue.toFixed(2)})`);

    return {
      approved: verdict === 'APPROVED',
      confidence_score: Math.round(avgConviction),
      ai_votes: aiVotes,
      verdict,
      label,
      reasoning,
      final_rating: Math.round(averageRating),
      consensus_strength: consensusStrength,
      multi_ai_verdict: multiAIVerdict,
      expected_value: avgExpectedValue,
      quality_tier: qualityTier,
      ai_agreement_level: agreementLevel,
      institutional_grade: institutionalGrade
    };
  }
}

export const multiAIConsensusEngine = new MultiAIConsensusEngine();
