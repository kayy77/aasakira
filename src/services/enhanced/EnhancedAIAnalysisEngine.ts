import { groqService } from '@/services/groqService';

interface EventAnalysisInput {
  id: string;
  title: string;
  country: string;
  currency: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  forecast?: string;
  previous?: string;
  actual?: string;
  date: string;
  consensus_confidence?: number;
  data_conflicts?: string[];
}

interface EnhancedEventAnalysis {
  event_id: string;
  
  // Pre-event analysis
  pre_event_forecast: {
    predicted_actual: string;
    confidence_interval: string;
    surprise_probability: number;
    directional_bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    reasoning: string;
  };
  
  // Market impact analysis
  market_impact: {
    volatility_score: number; // 1-10
    affected_pairs: string[];
    primary_reaction_timeframe: string;
    estimated_pip_move: string;
    session_timing_factor: number;
  };
  
  // Trading intelligence
  trading_analysis: {
    setup_opportunities: Array<{
      pair: string;
      direction: 'BUY' | 'SELL';
      entry_criteria: string;
      risk_reward: string;
      time_horizon: string;
    }>;
    key_levels: Array<{
      pair: string;
      level: number;
      type: 'SUPPORT' | 'RESISTANCE' | 'PIVOT';
    }>;
    risk_warnings: string[];
  };
  
  // Historical context
  historical_context: {
    avg_surprise_magnitude: string;
    last_12_releases_trend: string;
    seasonal_patterns: string;
    correlation_strength: number;
  };
  
  // Real-time factors
  realtime_factors: {
    current_market_sentiment: string;
    positioning_bias: string;
    news_flow_impact: string;
    technical_confluence: string;
  };
  
  // Meta information
  analysis_confidence: number;
  data_quality_score: number;
  conflicts_noted: string[];
  created_at: string;
}

export class EnhancedAIAnalysisEngine {
  
  async analyzeEvent(event: EventAnalysisInput): Promise<EnhancedEventAnalysis> {
    console.log(`🤖 Enhanced analysis for: ${event.title}`);
    
    try {
      // Create comprehensive prompt for pre-event analysis
      const preEventPrompt = this.buildPreEventPrompt(event);
      const preEventResponse = await groqService.generateResponse(preEventPrompt, {
        model: 'mixtral-8x7b-32768',
        temperature: 0.2,
        max_tokens: 1500
      });

      // Create comprehensive prompt for market impact
      const marketImpactPrompt = this.buildMarketImpactPrompt(event);
      const marketResponse = await groqService.generateResponse(marketImpactPrompt, {
        model: 'mixtral-8x7b-32768', 
        temperature: 0.3,
        max_tokens: 1500
      });

      // Create trading analysis prompt
      const tradingPrompt = this.buildTradingAnalysisPrompt(event);
      const tradingResponse = await groqService.generateResponse(tradingPrompt, {
        model: 'mixtral-8x7b-32768',
        temperature: 0.2,
        max_tokens: 2000
      });

      // Parse responses and create structured analysis
      const analysis = await this.parseAndStructureAnalysis(
        event,
        preEventResponse,
        marketResponse, 
        tradingResponse
      );

      return analysis;

    } catch (error) {
      console.error(`❌ Enhanced analysis failed for ${event.title}:`, error);
      
      // Return fallback analysis
      return this.createFallbackAnalysis(event);
    }
  }

  private buildPreEventPrompt(event: EventAnalysisInput): string {
    return `
ECONOMIC EVENT PRE-ANALYSIS

Event: ${event.title}
Country: ${event.country}
Currency: ${event.currency}
Impact Level: ${event.impact}
Scheduled: ${event.date}
Forecast: ${event.forecast || 'N/A'}
Previous: ${event.previous || 'N/A'}
${event.data_conflicts ? `Data Conflicts: ${event.data_conflicts.join(', ')}` : ''}

ANALYZE AND PROVIDE:

1. PREDICTED ACTUAL VALUE
- Based on recent economic trends, what's your prediction for the actual value?
- Confidence interval (range)
- Probability of significant surprise (>0.5 standard deviations from consensus)

2. DIRECTIONAL BIAS
- Will this likely be USD bullish, bearish, or neutral?
- Consider: economic momentum, central bank policy, market positioning

3. REASONING
- Key factors influencing your prediction
- Recent economic data context
- Market sentiment considerations

Respond in JSON format:
{
  "predicted_actual": "your prediction",
  "confidence_interval": "range estimate", 
  "surprise_probability": 0.3,
  "directional_bias": "BULLISH/BEARISH/NEUTRAL",
  "reasoning": "detailed explanation"
}
`;
  }

  private buildMarketImpactPrompt(event: EventAnalysisInput): string {
    return `
MARKET IMPACT ANALYSIS

Event: ${event.title}
Impact: ${event.impact}
Currency: ${event.currency}
Time: ${event.date}

ANALYZE:

1. VOLATILITY SCORING (1-10 scale)
- Historical volatility patterns for this event
- Current market conditions impact
- Session timing effects

2. AFFECTED CURRENCY PAIRS
- Primary pairs most impacted
- Secondary spillover effects
- Cross-currency implications

3. REACTION TIMING
- Immediate (0-5min), Short-term (5-30min), Extended (30min+)
- Estimated pip movement ranges
- Session timing multiplier effects

4. CURRENT MARKET CONDITIONS
- Risk-on vs risk-off sentiment
- Central bank policy backdrop
- Technical positioning factors

Respond in JSON format:
{
  "volatility_score": 7,
  "affected_pairs": ["EUR/USD", "GBP/USD", "DXY"],
  "primary_reaction_timeframe": "0-15 minutes",
  "estimated_pip_move": "20-50 pips average", 
  "session_timing_factor": 0.8,
  "current_sentiment": "description",
  "positioning_bias": "description", 
  "news_flow": "current news context",
  "technical_confluence": "key technical factors"
}
`;
  }

  private buildTradingAnalysisPrompt(event: EventAnalysisInput): string {
    return `
TRADING STRATEGY ANALYSIS

Event: ${event.title}
Currency: ${event.currency}
Impact: ${event.impact}

PROVIDE TRADE-READY ANALYSIS:

1. SETUP OPPORTUNITIES
- Specific currency pairs to watch
- Entry criteria and timing
- Risk/reward ratios
- Time horizons

2. KEY TECHNICAL LEVELS
- Major support/resistance around event
- Pivot points and breakout levels
- Stop loss considerations

3. RISK MANAGEMENT
- Position sizing recommendations
- Volatility adjustments
- Risk warnings and scenarios

4. HISTORICAL PATTERNS
- How similar events performed
- Seasonal/cyclical factors
- Correlation strengths with other assets

Respond in JSON format:
{
  "setup_opportunities": [
    {
      "pair": "EUR/USD",
      "direction": "BUY/SELL",
      "entry_criteria": "specific conditions",
      "risk_reward": "1:2 ratio example",
      "time_horizon": "scalp/day/swing"
    }
  ],
  "key_levels": [
    {
      "pair": "EUR/USD", 
      "level": 1.0850,
      "type": "SUPPORT/RESISTANCE/PIVOT"
    }
  ],
  "risk_warnings": ["warning 1", "warning 2"],
  "historical_context": {
    "avg_surprise_magnitude": "typical surprise size",
    "trend": "recent performance pattern",
    "seasonal": "seasonal considerations",
    "correlation": 0.75
  }
}
`;
  }

  private async parseAndStructureAnalysis(
    event: EventAnalysisInput,
    preEventResponse: string,
    marketResponse: string,
    tradingResponse: string
  ): Promise<EnhancedEventAnalysis> {
    
    let preEvent, market, trading;
    
    try {
      preEvent = JSON.parse(preEventResponse);
    } catch {
      preEvent = this.createFallbackPreEvent(event);
    }

    try {
      market = JSON.parse(marketResponse);
    } catch {
      market = this.createFallbackMarket(event);
    }

    try {
      trading = JSON.parse(tradingResponse);
    } catch {
      trading = this.createFallbackTrading(event);
    }

    // Calculate data quality score
    const dataQualityScore = this.calculateDataQualityScore(event);
    const analysisConfidence = this.calculateAnalysisConfidence(event, preEvent, market);

    return {
      event_id: event.id,
      
      pre_event_forecast: {
        predicted_actual: preEvent.predicted_actual || 'No prediction available',
        confidence_interval: preEvent.confidence_interval || 'Unknown range',
        surprise_probability: preEvent.surprise_probability || 0.5,
        directional_bias: preEvent.directional_bias || 'NEUTRAL',
        reasoning: preEvent.reasoning || 'Analysis not available'
      },
      
      market_impact: {
        volatility_score: market.volatility_score || this.getDefaultVolatilityScore(event.impact),
        affected_pairs: market.affected_pairs || [`${event.currency}/USD`],
        primary_reaction_timeframe: market.primary_reaction_timeframe || '0-15 minutes',
        estimated_pip_move: market.estimated_pip_move || '10-30 pips',
        session_timing_factor: market.session_timing_factor || 1.0
      },
      
      trading_analysis: {
        setup_opportunities: trading.setup_opportunities || [],
        key_levels: trading.key_levels || [],
        risk_warnings: trading.risk_warnings || ['High volatility expected around event time']
      },
      
      historical_context: {
        avg_surprise_magnitude: trading.historical_context?.avg_surprise_magnitude || 'Moderate',
        last_12_releases_trend: trading.historical_context?.trend || 'Mixed',
        seasonal_patterns: trading.historical_context?.seasonal || 'No clear pattern',
        correlation_strength: trading.historical_context?.correlation || 0.6
      },
      
      realtime_factors: {
        current_market_sentiment: market.current_sentiment || 'Neutral sentiment',
        positioning_bias: market.positioning_bias || 'Balanced positioning',
        news_flow_impact: market.news_flow || 'No significant news flow',
        technical_confluence: market.technical_confluence || 'Limited technical setup'
      },
      
      analysis_confidence: analysisConfidence,
      data_quality_score: dataQualityScore,
      conflicts_noted: event.data_conflicts || [],
      created_at: new Date().toISOString()
    };
  }

  private createFallbackPreEvent(event: EventAnalysisInput) {
    return {
      predicted_actual: 'Prediction not available',
      confidence_interval: 'Wide range expected',
      surprise_probability: 0.4,
      directional_bias: (event.impact === 'HIGH' ? 'BULLISH' : 'NEUTRAL') as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
      reasoning: `${event.impact} impact ${event.title} event expected to influence ${event.currency} pairs`
    };
  }

  private createFallbackMarket(event: EventAnalysisInput) {
    const volatility = event.impact === 'HIGH' ? 8 : event.impact === 'MEDIUM' ? 5 : 3;
    
    return {
      volatility_score: volatility,
      affected_pairs: [`${event.currency}/USD`, `EUR/${event.currency}`].filter(p => p !== 'USD/USD'),
      primary_reaction_timeframe: '0-15 minutes',
      estimated_pip_move: event.impact === 'HIGH' ? '30-80 pips' : '10-30 pips',
      session_timing_factor: 1.0
    };
  }

  private createFallbackTrading(event: EventAnalysisInput) {
    return {
      setup_opportunities: [{
        pair: `${event.currency}/USD`,
        direction: 'BUY' as const,
        entry_criteria: 'Wait for initial volatility to settle',
        risk_reward: '1:1.5',
        time_horizon: 'scalp'
      }],
      key_levels: [],
      risk_warnings: ['High volatility expected', 'Wide spreads possible'],
      historical_context: {
        avg_surprise_magnitude: 'Moderate',
        trend: 'Mixed recent performance', 
        seasonal: 'No clear pattern',
        correlation: 0.5
      }
    };
  }

  private createFallbackAnalysis(event: EventAnalysisInput): EnhancedEventAnalysis {
    return {
      event_id: event.id,
      pre_event_forecast: this.createFallbackPreEvent(event),
      market_impact: {
        volatility_score: this.getDefaultVolatilityScore(event.impact),
        affected_pairs: [`${event.currency}/USD`],
        primary_reaction_timeframe: '0-15 minutes',
        estimated_pip_move: '10-30 pips',
        session_timing_factor: 1.0
      },
      trading_analysis: this.createFallbackTrading(event),
      historical_context: {
        avg_surprise_magnitude: 'Moderate',
        last_12_releases_trend: 'Mixed',
        seasonal_patterns: 'No clear pattern',
        correlation_strength: 0.5
      },
      realtime_factors: {
        current_market_sentiment: 'Neutral',
        positioning_bias: 'Balanced',
        news_flow_impact: 'Limited',
        technical_confluence: 'Mixed signals'
      },
      analysis_confidence: 0.6,
      data_quality_score: event.consensus_confidence || 0.7,
      conflicts_noted: event.data_conflicts || [],
      created_at: new Date().toISOString()
    };
  }

  private getDefaultVolatilityScore(impact: string): number {
    switch (impact) {
      case 'HIGH': return 8;
      case 'MEDIUM': return 5;
      case 'LOW': return 3;
      default: return 4;
    }
  }

  private calculateDataQualityScore(event: EventAnalysisInput): number {
    let score = 0.8; // Base score
    
    if (event.forecast) score += 0.1;
    if (event.previous) score += 0.1;
    if (event.consensus_confidence && event.consensus_confidence > 0.8) score += 0.1;
    if (event.data_conflicts && event.data_conflicts.length > 0) score -= 0.2;
    
    return Math.max(0.3, Math.min(1.0, score));
  }

  private calculateAnalysisConfidence(event: EventAnalysisInput, preEvent: any, market: any): number {
    let confidence = 0.7; // Base confidence
    
    if (event.impact === 'HIGH') confidence += 0.1;
    if (event.consensus_confidence && event.consensus_confidence > 0.8) confidence += 0.1;
    if (preEvent.surprise_probability && preEvent.surprise_probability < 0.3) confidence += 0.1;
    if (event.data_conflicts && event.data_conflicts.length > 0) confidence -= 0.15;
    
    return Math.max(0.4, Math.min(1.0, confidence));
  }
}

export const enhancedAIAnalysisEngine = new EnhancedAIAnalysisEngine();