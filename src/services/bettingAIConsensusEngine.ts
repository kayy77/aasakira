export interface BettingAIModelResponse {
  rating: number;
  verdict: 'Elite' | 'Strong' | 'Moderate' | 'Weak' | 'Avoid';
  summary: string;
  key_factors: string[];
  concerns: string[];
  recommendation: string;
  ai_analysis: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  bet_type: string;
  expected_value: number;
  justification: string[];
  conviction_strength: number;
  risk_assessment: string;
  news_impact: string;
}

export interface BettingAIVotes {
  groq: BettingAIModelResponse;
  gemini: BettingAIModelResponse;
  cohere: BettingAIModelResponse;
  openrouter: BettingAIModelResponse;
  together: BettingAIModelResponse;
  [key: string]: BettingAIModelResponse;
}

export interface BettingConsensusResult {
  approved: boolean;
  confidence_score: number;
  ai_votes: BettingAIVotes;
  verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS';
  label: string;
  reasoning: string[];
  final_rating: number;
  consensus_strength: string;
  multi_ai_verdict: string;
  expected_value: number;
}

interface BettingContext {
  sport: string;
  matchup: string;
  bet_type: string;
  odds: number;
  game_time: string;
  team_stats: string;
  injury_report: string;
  recent_form: string;
  head_to_head: string;
  line_movement: string;
  betting_trends: string;
  news_context: string;
  weather_conditions?: string;
}

class BettingAIConsensusEngine {
  private readonly API_KEYS = {
    gemini: 'AIzaSyBds1Zg7DCF9RcCbL-YC23pj2rUs2FMfJA',
    openrouter: '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',
    cohere: 'wTX42tk4eKfBGoXNmRVIPrIukl01yKCn0VsaCjjf',
    together: '8b0103657b0290f0a815723af49c8ed66af6f5df882de5acc1de32e02311bb79',
    newsdata: 'pub_5cf95a64279c4e63b30a66fc9f2518fa',
    // Sports betting API keys
    odds_api_uk: 'sk_live_abc123xyz456',
    odds_api_us: 'ea5ba72a9050a285ba94e46ffbfc95d88c289aa9',
    odds_api_eu: 'PK_467287B5D05A44BA8B5EC8C6DD8E4461',
    odds_api_au: 'pk_52cfe539bd784117a34a04db207a1416',
    football_stats: '0f546627dff52b35548ea2d52c555043',
    basketball_stats: '0f546627dff52b35548ea2d52c555043',
    mma_stats: '0f546627dff52b35548ea2d52c555043'
  };

  private buildBettingMasterPrompt(context: BettingContext): string {
    return `🏟️ SPORTS BETTING AI — ELITE INSTITUTIONAL ANALYSIS

⚠️ CRITICAL: DO NOT fabricate data or games. Use only the provided context. You are enhancing betting analysis ONLY.

You are a hyper-intelligent institutional-grade sports betting analyst embedded into an elite betting scanner. Your role is to validate and powerfully analyze each betting opportunity with deeper insight. Think like a top-level syndicate bettor with elite sports knowledge.

===============================
📊 BETTING OPPORTUNITY DATA:
- Sport: ${context.sport}
- Matchup: ${context.matchup}
- Bet Type: ${context.bet_type}
- Current Odds: ${context.odds}
- Game Time: ${context.game_time}

===============================
🧠 SPORTS INTELLIGENCE DATA:
- Team Statistics: ${context.team_stats}
- Injury Report: ${context.injury_report}
- Recent Form: ${context.recent_form}
- Head-to-Head: ${context.head_to_head}
- Line Movement: ${context.line_movement}
- Betting Trends: ${context.betting_trends}
- News Context: ${context.news_context}
${context.weather_conditions ? `- Weather: ${context.weather_conditions}` : ''}

===============================
🎯 YOUR ANALYSIS MISSION:
You must analyze from multiple betting strategy lenses:
1. Statistical Edge Analysis (team stats, form, matchups)
2. Value Betting (odds vs true probability)
3. Sharp Money Indicators (line movement, reverse line movement)
4. Public Sentiment (fade the public opportunities)
5. Situational Spots (revenge games, rest advantages, travel)
6. Injury Impact Assessment (key player availability)
7. Weather/Venue Factors (home field, conditions)
8. Behavioral Economics (lookahead spots, letdown games)

Rate this bet from 1 to 10 based on:
- Statistical advantage and data support
- Value proposition vs market odds
- Sharp money alignment or contrarian opportunity
- Injury/news impact consideration
- Historical success rate in similar scenarios
- Expected value calculation

🚨 CRITICAL REQUIREMENTS:
✅ Only support a bet if you can make a real statistical argument
❌ Never recommend weak bets without clear edge
🧠 Show both positive and negative factors

Calculate Expected Value using: (Win Probability × Payout) - (Loss Probability × Stake)

===============================
📋 REQUIRED JSON OUTPUT FORMAT:

{
  "rating": 8,
  "verdict": "Strong",
  "summary": "Sharp, condensed reason using top 2-3 strongest factors",
  "key_factors": ["factor1", "factor2"],
  "concerns": ["concern1 if any"],
  "recommendation": "Execute with proper bankroll management",
  "ai_analysis": "Detailed institutional-level betting analysis",
  "confidence_level": "High",
  "bet_type": "Spread/Moneyline/Total/Prop",
  "expected_value": 12.5,
  "justification": [
    "Primary statistical edge",
    "Secondary market inefficiency",
    "Risk management consideration"
  ],
  "conviction_strength": 8,
  "risk_assessment": "Risk evaluation vs expected return",
  "news_impact": "Relevant injury/news factors"
}

Return ONLY the JSON. No other text. Be brutally honest about bet quality while providing elite-level reasoning.`;
  }

  private async getSportsNews(sport: string, teams: string): Promise<string> {
    try {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${this.API_KEYS.newsdata}&q=${teams} OR ${sport}&category=sports&language=en&size=3`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        return 'No major sports news detected';
      }

      const data = await response.json();
      const headlines = (data.results || []).slice(0, 2).map((article: any) => article.title);
      
      return headlines.length > 0 ? 
        `Recent news: ${headlines.join('. ')}` : 
        'Clean news environment - no major sports events';

    } catch (error) {
      console.error('Sports news fetch failed:', error);
      return 'Sports news analysis unavailable';
    }
  }

  async analyzeBettingConsensus(context: BettingContext): Promise<BettingConsensusResult> {
    console.log('🏟️ Sports Betting AI: Multi-AI Consensus Analysis Starting...');
    
    // Get live sports news context
    const sportsNews = await this.getSportsNews(context.sport, context.matchup);
    const enhancedContext = {
      ...context,
      news_context: sportsNews
    };
    
    const prompt = this.buildBettingMasterPrompt(enhancedContext);
    
    // Call all AI models in parallel
    const [groqResponse, geminiResponse, cohereResponse, openrouterResponse, togetherResponse] = await Promise.allSettled([
      this.callGroqAI(prompt),
      this.callGeminiAI(prompt),
      this.callCohereAI(prompt),
      this.callOpenRouterAI(prompt),
      this.callTogetherAI(prompt)
    ]);

    const aiVotes: BettingAIVotes = {
      groq: groqResponse.status === 'fulfilled' ? groqResponse.value : this.getFallbackResponse('Groq'),
      gemini: geminiResponse.status === 'fulfilled' ? geminiResponse.value : this.getFallbackResponse('Gemini'),
      cohere: cohereResponse.status === 'fulfilled' ? cohereResponse.value : this.getFallbackResponse('Cohere'),
      openrouter: openrouterResponse.status === 'fulfilled' ? openrouterResponse.value : this.getFallbackResponse('Claude'),
      together: togetherResponse.status === 'fulfilled' ? togetherResponse.value : this.getFallbackResponse('Mixtral')
    };

    // Calculate betting consensus
    const responses = Object.values(aiVotes);
    const highRatingCount = responses.filter(r => r.rating >= 7).length;
    const strongVerdictCount = responses.filter(r => ['Elite', 'Strong'].includes(r.verdict)).length;
    const avgConviction = responses.reduce((sum, r) => sum + r.conviction_strength, 0) / responses.length;
    const avgExpectedValue = responses.reduce((sum, r) => sum + r.expected_value, 0) / responses.length;
    
    const averageRating = responses.reduce((sum, r) => sum + r.rating, 0) / responses.length;
    const confidenceScore = Math.max(highRatingCount, strongVerdictCount);
    
    // Determine final verdict
    let verdict: 'APPROVED' | 'REJECTED' | 'LOW_CONSENSUS' = 'REJECTED';
    let label = '❌ Multi-AI Rejected';
    let consensusStrength = 'Weak Consensus';
    let multiAIVerdict = 'Rejected';
    
    if (confidenceScore >= 4 && avgConviction >= 7 && avgExpectedValue > 5) {
      verdict = 'APPROVED';
      label = '🔥 Multi-AI Elite Bet';
      consensusStrength = 'Elite Consensus';
      multiAIVerdict = `${confidenceScore}/5 AI Models Agree — Elite Betting Edge`;
    } else if (confidenceScore >= 3 && avgConviction >= 6 && avgExpectedValue > 3) {
      verdict = 'APPROVED';
      label = '✅ Multi-AI Approved';
      consensusStrength = 'Strong Consensus';
      multiAIVerdict = `${confidenceScore}/5 AI Models Agree — Strong Edge`;
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
      `Expected Value: +${avgExpectedValue.toFixed(1)}%`
    ];

    console.log(`✅ Sports Betting Analysis Complete: ${verdict} (${confidenceScore}/5 votes, ${avgConviction.toFixed(1)} conviction, ${avgExpectedValue.toFixed(1)}% EV)`);

    return {
      approved: verdict === 'APPROVED',
      confidence_score: confidenceScore,
      ai_votes: aiVotes,
      verdict,
      label,
      reasoning,
      final_rating: Math.round(averageRating),
      consensus_strength: consensusStrength,
      multi_ai_verdict: multiAIVerdict,
      expected_value: Math.round(avgExpectedValue * 10) / 10
    };
  }

  private async callGeminiAI(prompt: string): Promise<BettingAIModelResponse> {
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

  private async callCohereAI(prompt: string): Promise<BettingAIModelResponse> {
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

  private async callOpenRouterAI(prompt: string): Promise<BettingAIModelResponse> {
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

  private async callTogetherAI(prompt: string): Promise<BettingAIModelResponse> {
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

  private async callGroqAI(prompt: string): Promise<BettingAIModelResponse> {
    try {
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

  private parseAIResponse(text: string, modelName: string): BettingAIModelResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          rating: parsed.rating || 5,
          verdict: parsed.verdict || 'Moderate',
          summary: parsed.summary || parsed.ai_analysis || `Analysis from ${modelName}`,
          key_factors: parsed.key_factors || [],
          concerns: parsed.concerns || [],
          recommendation: parsed.recommendation || 'Review bet carefully',
          ai_analysis: parsed.ai_analysis || parsed.summary || `Betting analysis from ${modelName}`,
          confidence_level: parsed.confidence_level || 'Medium',
          bet_type: parsed.bet_type || 'Standard',
          expected_value: parsed.expected_value || 0,
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

  private getFallbackResponse(modelName: string): BettingAIModelResponse {
    return {
      rating: 5,
      verdict: 'Moderate',
      summary: `${modelName} analysis: Standard betting opportunity with moderate conviction`,
      key_factors: ['Statistical analysis'],
      concerns: [`${modelName} response error`],
      recommendation: 'Proceed with standard bankroll management',
      ai_analysis: `${modelName} betting analysis: Moderate opportunity with standard parameters`,
      confidence_level: 'Medium',
      bet_type: 'Standard',
      expected_value: 0,
      justification: [`${modelName} model provided standard assessment`],
      conviction_strength: 5,
      risk_assessment: 'Moderate risk with standard expectations',
      news_impact: 'News impact assessment unavailable'
    };
  }
}

export const bettingAIConsensusEngine = new BettingAIConsensusEngine();
