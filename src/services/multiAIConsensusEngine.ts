
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
    newsdata: 'pub_5cf95a64279c4e63b30a66fc9f2518fa'
  };

  private buildHedgeFundMasterPrompt(context: SignalContext): string {
    return `🏛️ HEDGE FUND MODE — ELITE AI SIGNAL ANALYSIS

⚠️ CRITICAL: DO NOT EDIT OR ADJUST ENTRY PRICE, TAKE PROFIT, OR STOP LOSS. DO NOT MODIFY CORE SIGNAL LOGIC OR PRICE FEEDS. YOU ARE ENHANCING THE SIGNAL ANALYSIS ONLY.

You are a hyper-intelligent institutional-grade trading assistant embedded into an elite signal engine. Your role is to validate and powerfully reinforce each signal with deeper insight. Think like a top-level hedge fund trader with elite market knowledge.

===============================
📊 PRE-GENERATED TRADE SETUP (DO NOT MODIFY):
- Pair: ${context.pair}
- Timeframe: ${context.timeframe}
- Trade Direction: ${context.direction}
- Entry Price: ${context.entry_price}
- Stop Loss: ${context.stop_loss}
- Take Profit: ${context.take_profit}

===============================
🧠 MARKET INTELLIGENCE DATA:
- Market Structure: ${context.structure_desc}
- Liquidity Context: ${context.liquidity_zone_info}
- Fair Value Gaps: ${context.fvg_info}
- RSI/Divergence: ${context.rsi_data}
- Volume Profile: ${context.volume_snapshot}
- Session Context: ${context.session_info}
- Timestamp: ${context.time}
- News Environment: ${context.news_context}
- Active Confluences: ${context.confluences_list.join(', ')}

===============================
🎯 YOUR ANALYSIS MISSION:
You must analyze from multiple strategy lenses:
1. Smart Money Concepts (internal structure, BOS, POI/FVG)
2. Market Maker Model (liquidity grabs, engineered sell-offs)
3. Classic TA (key levels, trendline breaks, SR flips)
4. Volume Analysis (spikes, divergence)
5. Economic Impact (macro news, FOMC, data prints)
6. Order Flow Behavior (fakeouts, engineered wicks, traps)
7. Risk:Reward balance (Reward must justify risk logically)

Rate this trade from 1 to 10 based on:
- Multi-strategy confluence strength
- Institutional logic and smart money alignment
- Risk-to-reward asymmetric opportunity
- Session timing and volatility context
- News impact and macro environment
- Probability of reaching TP without SL hit

🚨 CRITICAL REQUIREMENTS:
✅ Only support a signal if you can make a real argument for why money could be made
❌ Never hype a weak signal without a reason. Show both sides if it's not ideal
🧠 Keep learning and evolving. Your mission is to get more accurate over time

If this is a weak signal, label it as such but explain exactly why the system picked it and how it could still work (don't BS).

Add advanced context from economic calendar or live market news if relevant.
Mention any conflicting confluences and explain how they were weighed.

===============================
📋 REQUIRED JSON OUTPUT FORMAT:

{
  "rating": 8,
  "verdict": "Strong",
  "summary": "Sharp, condensed reason using top 2-3 strongest justifications",
  "key_confluences": ["confluence1", "confluence2"],
  "concerns": ["concern1 if any"],
  "recommendation": "Execute with institutional risk parameters",
  "ai_analysis": "Detailed hedge-fund level analysis with institutional reasoning",
  "confidence_level": "High",
  "setup_type": "Momentum/Mean Reversion/Liquidity Sweep/Scalp",
  "market_phase": "Expansion/Accumulation/Reversal/Distribution",
  "justification": [
    "Top reason with smart money context",
    "Secondary reason with volume/structure",
    "Risk management justification"
  ],
  "conviction_strength": 8,
  "risk_assessment": "Risk evaluation vs reward potential",
  "news_impact": "Any relevant news or macro factors"
}

Return ONLY the JSON. No other text. Be brutally honest about signal quality while providing elite-level reasoning.`;
  }

  private async getLiveNews(pair: string): Promise<string> {
    try {
      const baseCurrency = pair.substring(0, 3);
      const quoteCurrency = pair.substring(3, 6);
      
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${this.API_KEYS.newsdata}&q=${baseCurrency} OR ${quoteCurrency} OR forex&category=business&language=en&size=3`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        return 'No major news events detected';
      }

      const data = await response.json();
      const headlines = (data.results || []).slice(0, 2).map((article: any) => article.title);
      
      return headlines.length > 0 ? 
        `Recent news: ${headlines.join('. ')}` : 
        'Clean news environment - no major events';

    } catch (error) {
      console.error('News fetch failed:', error);
      return 'News analysis unavailable';
    }
  }

  private async callGeminiAI(prompt: string): Promise<AIModelResponse> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.API_KEYS.gemini}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1200 }
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
          max_tokens: 1200
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
          max_tokens: 1200
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
          max_tokens: 1200
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
          news_impact: parsed.news_impact || 'No major news impact detected'
        };
      }
    } catch (error) {
      console.error(`${modelName} JSON parsing error:`, error);
    }
    
    return this.getFallbackResponse(modelName);
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
      news_impact: 'News impact assessment unavailable'
    };
  }

  async analyzeSignalConsensus(context: SignalContext): Promise<ConsensusResult> {
    console.log('🏛️ Hedge Fund Mode: Multi-AI Consensus Analysis Starting...');
    
    // Get live news context
    const liveNews = await this.getLiveNews(context.pair);
    const enhancedContext = {
      ...context,
      news_context: liveNews
    };
    
    const prompt = this.buildHedgeFundMasterPrompt(enhancedContext);
    
    // Call all AI models in parallel
    const [groqResponse, geminiResponse, cohereResponse, openrouterResponse, togetherResponse] = await Promise.allSettled([
      this.callGroqAI(prompt),
      this.callGeminiAI(prompt),
      this.callCohereAI(prompt),
      this.callOpenRouterAI(prompt),
      this.callTogetherAI(prompt)
    ]);

    const aiVotes: AIVotes = {
      groq: groqResponse.status === 'fulfilled' ? groqResponse.value : this.getFallbackResponse('Groq'),
      gemini: geminiResponse.status === 'fulfilled' ? geminiResponse.value : this.getFallbackResponse('Gemini'),
      cohere: cohereResponse.status === 'fulfilled' ? cohereResponse.value : this.getFallbackResponse('Cohere'),
      openrouter: openrouterResponse.status === 'fulfilled' ? openrouterResponse.value : this.getFallbackResponse('Claude'),
      together: togetherResponse.status === 'fulfilled' ? togetherResponse.value : this.getFallbackResponse('Mixtral')
    };

    // Calculate enhanced consensus
    const responses = Object.values(aiVotes);
    const highRatingCount = responses.filter(r => r.rating >= 7).length;
    const strongVerdictCount = responses.filter(r => ['Elite', 'Strong'].includes(r.verdict)).length;
    const avgConviction = responses.reduce((sum, r) => sum + r.conviction_strength, 0) / responses.length;
    
    const averageRating = responses.reduce((sum, r) => sum + r.rating, 0) / responses.length;
    const confidenceScore = Math.max(highRatingCount, strongVerdictCount);
    
    // Determine final verdict with enhanced logic
    let verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS' = 'REJECTED';
    let label = '❌ Multi-AI Rejected';
    let consensusStrength = 'Weak Consensus';
    let multiAIVerdict = 'Rejected';
    
    if (confidenceScore >= 4 && avgConviction >= 7) {
      verdict = 'APPROVED';
      label = '🔥 Multi-AI Elite Verified';
      consensusStrength = 'Elite Consensus';
      multiAIVerdict = `${confidenceScore}/5 AI Models Agree — Elite Institutional Grade`;
    } else if (confidenceScore >= 3 && avgConviction >= 6) {
      verdict = 'APPROVED';
      label = '✅ Multi-AI Verified';
      consensusStrength = 'Strong Consensus';
      multiAIVerdict = `${confidenceScore}/5 AI Models Agree — Strong Confidence`;
    } else if (confidenceScore >= 2) {
      verdict = 'LOW_CONSENSUS';
      label = '⚠️ Mixed AI Consensus';
      consensusStrength = 'Mixed Consensus';
      multiAIVerdict = `${confidenceScore}/5 AI Models Agree — Use Caution`;
    }

    const reasoning = [
      `${confidenceScore}/5 AI models voted Strong or Elite`,
      `Average rating: ${averageRating.toFixed(1)}/10`,
      `Average conviction: ${avgConviction.toFixed(1)}/10`,
      `Consensus level: ${consensusStrength}`
    ];

    console.log(`✅ Hedge Fund Analysis Complete: ${verdict} (${confidenceScore}/5 votes, ${avgConviction.toFixed(1)} conviction)`);

    return {
      approved: verdict === 'APPROVED',
      confidence_score: confidenceScore,
      ai_votes: aiVotes,
      verdict,
      label,
      reasoning,
      final_rating: Math.round(averageRating),
      consensus_strength: consensusStrength,
      multi_ai_verdict: multiAIVerdict
    };
  }

  private async callGroqAI(prompt: string): Promise<AIModelResponse> {
    try {
      // Use existing groqService
      const { groqService } = await import('./groqService');
      const response = await groqService.generateResponse(prompt, {
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 1200
      });
      
      return this.parseAIResponse(response, 'Groq');
    } catch (error) {
      console.error('Groq AI error:', error);
      return this.getFallbackResponse('Groq');
    }
  }
}

export const multiAIConsensusEngine = new MultiAIConsensusEngine();
