interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface AdvancedDataFeeds {
  orderBookData: {
    bids: Array<{price: number; volume: number; level: string}>;
    asks: Array<{price: number; volume: number; level: string}>;
    liquidityImbalance: number;
    whaleWalls: boolean;
  };
  sentimentAnalysis: {
    newsScore: number;
    socialSentiment: number;
    fearGreedIndex: number;
    riskAppetite: 'risk_on' | 'risk_off' | 'neutral';
  };
  economicCalendar: {
    nextHighImpact: string;
    minutesToEvent: number;
    expectedVolatility: number;
    tradingRecommendation: 'avoid' | 'reduce_size' | 'normal' | 'opportunity';
  };
  multiAssetCorrelation: {
    dxyCorrelation: number;
    equitiesCorrelation: number;
    commoditiesCorrelation: number;
    bondsCorrelation: number;
    correlationStrength: 'strong' | 'moderate' | 'weak';
  };
}

interface MultiPassResult {
  pass: number;
  analysis: string;
  modifications: string[];
  confidence: number;
  shouldContinue: boolean;
  critiques: string[];
}

interface StrategyFramework {
  name: string;
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string;
  timeframe: string;
  conflictingSignals: string[];
}

export class UltraGroqAnalyzer {
  private readonly baseUrl = 'https://api.groq.com/openai/v1';
  private apiKey: string = '';
  
  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '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';
  }
  
  async generateAdvancedDataFeeds(symbol: string, livePrice: number): Promise<AdvancedDataFeeds> {
    // Simulate advanced data feeds - in production, connect to real APIs
    return {
      orderBookData: {
        bids: Array.from({length: 5}, (_, i) => ({
          price: livePrice - (i + 1) * 0.0001,
          volume: 1000 + Math.random() * 5000,
          level: i < 2 ? 'whale' : 'retail'
        })),
        asks: Array.from({length: 5}, (_, i) => ({
          price: livePrice + (i + 1) * 0.0001,
          volume: 1000 + Math.random() * 5000,
          level: i < 2 ? 'whale' : 'retail'
        })),
        liquidityImbalance: (Math.random() - 0.5) * 100, // -50 to +50
        whaleWalls: Math.random() > 0.7
      },
      sentimentAnalysis: {
        newsScore: (Math.random() - 0.5) * 200, // -100 to 100
        socialSentiment: (Math.random() - 0.5) * 200, // -100 to 100
        fearGreedIndex: Math.random() * 100, // 0-100
        riskAppetite: Math.random() > 0.6 ? 'risk_on' : Math.random() > 0.3 ? 'risk_off' : 'neutral'
      },
      economicCalendar: {
        nextHighImpact: this.getNextHighImpactEvent(),
        minutesToEvent: Math.floor(Math.random() * 1440), // 0-24 hours
        expectedVolatility: 20 + Math.random() * 60, // 20-80%
        tradingRecommendation: this.getTradingRecommendation()
      },
      multiAssetCorrelation: {
        dxyCorrelation: (Math.random() - 0.5) * 2, // -1 to 1
        equitiesCorrelation: (Math.random() - 0.5) * 2,
        commoditiesCorrelation: (Math.random() - 0.5) * 2,
        bondsCorrelation: (Math.random() - 0.5) * 2,
        correlationStrength: Math.random() > 0.6 ? 'strong' : Math.random() > 0.3 ? 'moderate' : 'weak'
      }
    };
  }

  async executeMultiPassReasoning(
    symbol: string, 
    livePrice: number, 
    feeds: AdvancedDataFeeds, 
    context: any
  ): Promise<MultiPassResult[]> {
    const results: MultiPassResult[] = [];

    // PASS 1: Raw Scan
    const pass1 = await this.executePass1_RawScan(symbol, livePrice, feeds);
    results.push(pass1);
    console.log('🔍 Pass 1 Complete: Raw Technical Scan');

    if (!pass1.shouldContinue) return results;

    // PASS 2: Self Audit
    const pass2 = await this.executePass2_SelfAudit(symbol, pass1, feeds);
    results.push(pass2);
    console.log('🔍 Pass 2 Complete: Self Audit & Bias Check');

    if (!pass2.shouldContinue) return results;

    // PASS 3: Refinement
    const pass3 = await this.executePass3_Refinement(symbol, livePrice, pass2, feeds);
    results.push(pass3);
    console.log('🔍 Pass 3 Complete: Logic Refinement');

    if (!pass3.shouldContinue) return results;

    // PASS 4: Trade Plan Build
    const pass4 = await this.executePass4_TradePlanBuild(symbol, livePrice, pass3, feeds);
    results.push(pass4);
    console.log('🔍 Pass 4 Complete: Trade Plan Construction');

    if (!pass4.shouldContinue) return results;

    // PASS 5: Stress Test
    const pass5 = await this.executePass5_StressTest(symbol, pass4, feeds);
    results.push(pass5);
    console.log('🔍 Pass 5 Complete: Scenario Stress Testing');

    return results;
  }

  private async executePass1_RawScan(symbol: string, livePrice: number, feeds: AdvancedDataFeeds): Promise<MultiPassResult> {
    const prompt = `
🔍 PASS 1: RAW TECHNICAL SCAN

You are the initial scanner in a 5-pass institutional analysis system. Your job is to run base filters and identify potential setups.

SYMBOL: ${symbol} at ${livePrice}
ORDER BOOK: ${JSON.stringify(feeds.orderBookData)}
SENTIMENT: ${JSON.stringify(feeds.sentimentAnalysis)}

RUN THESE BASE FILTERS:
1. SMC Analysis: BOS, CHoCH, FVG, Order Blocks
2. Liquidity Analysis: Sweeps, stop hunts, whale activity
3. Volume Analysis: Institutional flow, absorption patterns
4. RSI/MACD Divergences: Hidden and regular
5. Session Context: Optimal timing windows

CRITICAL REQUIREMENTS:
- Identify ALL potential setups (bullish AND bearish)
- Note conflicting signals and uncertainties
- Rate initial confidence 1-100 for each setup
- Flag any obvious red flags or deal breakers

Return JSON:
{
  "potential_setups": [
    {
      "direction": "bullish|bearish",
      "setup_type": "specific pattern name",
      "initial_confidence": 1-100,
      "supporting_factors": ["list factors"],
      "concerns": ["list concerns"],
      "timeframe": "optimal TF"
    }
  ],
  "market_context": "current regime analysis",
  "session_quality": "optimal|acceptable|poor",
  "red_flags": ["critical issues found"],
  "should_continue": true|false,
  "overall_assessment": "analysis summary"
}`;

    const response = await this.generateResponse(prompt, {
      model: 'llama3-70b-8192',
      temperature: 0.15,
      max_tokens: 800
    });

    const data = this.parseJsonResponse(response);

    return {
      pass: 1,
      analysis: response,
      modifications: [],
      confidence: Math.max(...(data.potential_setups?.map((s: any) => s.initial_confidence) || [0])),
      shouldContinue: data.should_continue && data.potential_setups?.length > 0,
      critiques: data.red_flags || []
    };
  }

  private async executePass2_SelfAudit(symbol: string, pass1: MultiPassResult, feeds: AdvancedDataFeeds): Promise<MultiPassResult> {
    const prompt = `
🔍 PASS 2: SELF AUDIT & BIAS CHECK

You are auditing the previous analysis for cognitive biases, assumptions, and logical errors.

PREVIOUS ANALYSIS: ${JSON.stringify(this.parseJsonResponse(pass1.analysis))}
SENTIMENT DATA: ${JSON.stringify(feeds.sentimentAnalysis)}
ECONOMIC CALENDAR: ${JSON.stringify(feeds.economicCalendar)}

AUDIT CHECKLIST:
1. Confirmation Bias: Are we cherry-picking data?
2. Recency Bias: Over-weighting recent price action?
3. Anchoring: Stuck on first impression?
4. Risk Assessment: Honest about potential failures?
5. Market Regime: Does setup fit current environment?
6. News Risk: Economic events that could invalidate?

CRITICAL QUESTIONS:
- What could make this analysis completely wrong?
- Are we forcing a signal where none exists?
- Is the risk/reward actually compelling?
- Would you risk your own money on this?

Return JSON:
{
  "bias_assessment": {
    "confirmation_bias": "detected|minor|none",
    "recency_bias": "detected|minor|none", 
    "anchoring_bias": "detected|minor|none",
    "overall_bias_score": 1-10
  },
  "logic_audit": {
    "assumptions_challenged": ["list challenged assumptions"],
    "logic_gaps": ["identified gaps"],
    "conflicting_evidence": ["contradictory data"],
    "strength_rating": 1-10
  },
  "risk_reality_check": {
    "failure_scenarios": ["what could go wrong"],
    "probability_honest": 1-100,
    "risk_reward_realistic": true|false
  },
  "modifications_needed": ["required changes"],
  "should_continue": true|false,
  "audit_conclusion": "continue|revise|reject"
}`;

    const response = await this.generateResponse(prompt, {
      model: 'llama3-70b-8192',
      temperature: 0.1,
      max_tokens: 700
    });

    const data = this.parseJsonResponse(response);

    return {
      pass: 2,
      analysis: response,
      modifications: data.modifications_needed || [],
      confidence: data.logic_audit?.strength_rating * 10 || 50,
      shouldContinue: data.should_continue && data.audit_conclusion !== 'reject',
      critiques: data.logic_audit?.logic_gaps || []
    };
  }

  private async executePass3_Refinement(symbol: string, livePrice: number, pass2: MultiPassResult, feeds: AdvancedDataFeeds): Promise<MultiPassResult> {
    const prompt = `
🔍 PASS 3: LOGIC REFINEMENT & OPTIMIZATION

Based on the audit feedback, refine the analysis with corrected logic and improved entry/exit planning.

AUDIT FEEDBACK: ${JSON.stringify(this.parseJsonResponse(pass2.analysis))}
MODIFICATIONS NEEDED: ${pass2.modifications.join(', ')}
CORRELATION DATA: ${JSON.stringify(feeds.multiAssetCorrelation)}

REFINEMENT OBJECTIVES:
1. Address identified biases and logic gaps
2. Incorporate correlation analysis (DXY, equities, etc.)
3. Optimize entry timing and levels
4. Refine stop loss and take profit levels
5. Adjust for identified risks

ENHANCED ANALYSIS REQUIREMENTS:
- Multi-asset correlation confirmation
- Liquidity sweep timing optimization  
- News event avoidance planning
- Session-specific entry refinement
- Dynamic position sizing based on confluence

Return JSON:
{
  "refined_setup": {
    "direction": "BUY|SELL",
    "entry_strategy": "immediate|wait_for_pullback|break_confirm",
    "optimal_entry": price,
    "stop_loss": price,
    "take_profit_1": price,
    "take_profit_2": price,
    "position_size_recommendation": 0.5-2.0,
    "timeframe": "execution timeframe"
  },
  "correlation_confirmation": {
    "dxy_alignment": true|false,
    "equities_supportive": true|false,
    "bonds_confirming": true|false,
    "overall_correlation_score": 1-100
  },
  "timing_optimization": {
    "session_timing": "optimal|acceptable|poor",
    "news_risk_window": true|false,
    "liquidity_conditions": "high|medium|low",
    "execution_urgency": "immediate|within_hour|wait"
  },
  "refined_confidence": 1-100,
  "should_continue": true|false,
  "refinement_summary": "what was improved"
}`;

    const response = await this.generateResponse(prompt, {
      model: 'llama3-70b-8192',
      temperature: 0.12,
      max_tokens: 800
    });

    const data = this.parseJsonResponse(response);

    return {
      pass: 3,
      analysis: response,
      modifications: [data.refinement_summary || ''],
      confidence: data.refined_confidence || 50,
      shouldContinue: data.should_continue,
      critiques: []
    };
  }

  private async executePass4_TradePlanBuild(symbol: string, livePrice: number, pass3: MultiPassResult, feeds: AdvancedDataFeeds): Promise<MultiPassResult> {
    const prompt = `
🔍 PASS 4: COMPREHENSIVE TRADE PLAN CONSTRUCTION

Build a complete, executable trade plan with precise risk management and exit strategies.

REFINED SETUP: ${JSON.stringify(this.parseJsonResponse(pass3.analysis))}
ORDER BOOK LIQUIDITY: ${JSON.stringify(feeds.orderBookData)}

TRADE PLAN REQUIREMENTS:
1. Precise Entry Strategy: Exact levels, timing, confirmation needed
2. Stop Loss Logic: Based on structure, not arbitrary percentages
3. Take Profit Strategy: Multiple targets, trailing stops
4. Position Sizing: Based on account risk and setup confidence
5. Monitoring Plan: What to watch, early warning signs
6. Exit Strategy: Both winning and losing scenarios

RISK MANAGEMENT CALCULATIONS:
- Maximum account risk: 1-2% per trade
- R:R ratio minimum: 1:2 (prefer 1:3+)
- Drawdown protection: Position size vs confidence
- Correlation risk: Reduce size if multiple correlated positions

Return JSON:
{
  "execution_plan": {
    "entry_method": "market|limit|stop|conditional",
    "entry_price": price,
    "confirmation_required": ["list confirmations needed"],
    "stop_loss_price": price,
    "stop_loss_reasoning": "why this level",
    "take_profit_plan": {
      "tp1": {"price": price, "size": "25%"},
      "tp2": {"price": price, "size": "50%"}, 
      "runner": {"price": price, "size": "25%"}
    },
    "trailing_stop": true|false
  },
  "risk_management": {
    "account_risk_percent": 0.5-2.0,
    "position_size_calculation": "detailed calculation",
    "risk_reward_ratio": "X:Y",
    "maximum_loss": "$amount",
    "correlation_adjustment": "reduce|normal|increase"
  },
  "monitoring_checklist": [
    "what to watch for exit",
    "early warning signals",
    "invalidation triggers"
  ],
  "execution_confidence": 1-100,
  "should_continue": true|false,
  "trade_plan_grade": "A|B|C|D|F"
}`;

    const response = await this.generateResponse(prompt, {
      model: 'llama3-70b-8192',
      temperature: 0.08,
      max_tokens: 900
    });

    const data = this.parseJsonResponse(response);

    return {
      pass: 4,
      analysis: response,
      modifications: [],
      confidence: data.execution_confidence || 50,
      shouldContinue: data.should_continue && data.trade_plan_grade !== 'F',
      critiques: data.monitoring_checklist || []
    };
  }

  private async executePass5_StressTest(symbol: string, pass4: MultiPassResult, feeds: AdvancedDataFeeds): Promise<MultiPassResult> {
    const prompt = `
🔍 PASS 5: COMPREHENSIVE STRESS TEST & SCENARIO ANALYSIS

Run the trade plan through multiple "what if" scenarios to test resilience.

TRADE PLAN: ${JSON.stringify(this.parseJsonResponse(pass4.analysis))}
MARKET CONDITIONS: ${JSON.stringify(feeds)}

STRESS TEST SCENARIOS:
1. News Shock: Sudden high-impact news during trade
2. Liquidity Dry-Up: Thin market conditions, wide spreads
3. Correlation Break: DXY/equities decouple from normal patterns
4. Session Gap: Trade carries over to different session
5. Black Swan: Extreme volatility event
6. Technical Failure: Key level doesn't hold as expected

RESILIENCE TESTING:
- Does stop loss protect in fast markets?
- Can position be exited in thin liquidity?
- How does correlation breakdown affect thesis?
- What if trade takes much longer than expected?
- Is position size appropriate for worst-case scenarios?

FINAL INSTITUTIONAL STANDARDS CHECK:
- Minimum confluence: 65/100
- Minimum R:R: 1:2
- Maximum risk: 2% account
- Stress test grade: C or better

Return JSON:
{
  "stress_test_results": {
    "news_shock_resilience": "pass|concern|fail",
    "liquidity_resilience": "pass|concern|fail", 
    "correlation_resilience": "pass|concern|fail",
    "timing_resilience": "pass|concern|fail",
    "volatility_resilience": "pass|concern|fail",
    "technical_resilience": "pass|concern|fail",
    "overall_stress_grade": "A|B|C|D|F"
  },
  "scenario_analysis": {
    "best_case": "outcome and probability",
    "most_likely": "outcome and probability",
    "worst_case": "outcome and probability",
    "black_swan": "extreme scenario planning"
  },
  "final_recommendation": {
    "decision": "EXECUTE|REDUCE_SIZE|WAIT|REJECT",
    "confidence_final": 1-100,
    "position_adjustment": "normal|reduce_50%|reduce_75%|minimum",
    "execution_urgency": "immediate|within_hour|wait_for_better",
    "institutional_grade": "A|B|C|REJECT"
  },
  "stress_test_passed": true|false,
  "final_justification": "why execute or reject"
}`;

    const response = await this.generateResponse(prompt, {
      model: 'llama3-70b-8192',
      temperature: 0.05,
      max_tokens: 800
    });

    const data = this.parseJsonResponse(response);

    return {
      pass: 5,
      analysis: response,
      modifications: [],
      confidence: data.final_recommendation?.confidence_final || 0,
      shouldContinue: data.stress_test_passed && data.final_recommendation?.decision === 'EXECUTE',
      critiques: [data.final_justification || '']
    };
  }

  async executeStrategyStacking(
    symbol: string, 
    livePrice: number, 
    feeds: AdvancedDataFeeds, 
    multiPassResults: MultiPassResult[]
  ): Promise<StrategyFramework[]> {
    const strategies = [
      'Smart Money Concepts (SMC)',
      'Inner Circle Trader (ICT)', 
      'Wyckoff Accumulation/Distribution',
      'Volume Spread Analysis (VSA)',
      'Trend Continuation Strategy',
      'Breakout with Volatility Confirmation',
      'Session-Based Momentum Trading',
      'Multi-Timeframe Confluence Trading'
    ];

    const results: StrategyFramework[] = [];

    for (const strategy of strategies) {
      const framework = await this.analyzeIndividualStrategy(strategy, symbol, livePrice, feeds, multiPassResults);
      if (framework) results.push(framework);
    }

    return results;
  }

  private async analyzeIndividualStrategy(
    strategy: string,
    symbol: string, 
    livePrice: number,
    feeds: AdvancedDataFeeds,
    multiPassResults: MultiPassResult[]
  ): Promise<StrategyFramework | null> {
    const prompt = `
🎯 INDIVIDUAL STRATEGY ANALYSIS: ${strategy}

Analyze ${symbol} at ${livePrice} using ONLY the ${strategy} framework.

MULTI-PASS CONTEXT: ${JSON.stringify(multiPassResults[multiPassResults.length - 1])}
DATA FEEDS: ${JSON.stringify(feeds)}

${strategy} SPECIFIC ANALYSIS:
${this.getStrategySpecificRules(strategy)}

REQUIREMENTS:
1. Apply ONLY this strategy's rules and concepts
2. Ignore other strategy influences
3. Provide clear bias: bullish/bearish/neutral
4. Calculate confidence based on strategy-specific factors
5. Identify any conflicting signals within this strategy

Return JSON:
{
  "strategy_name": "${strategy}",
  "bias": "bullish|bearish|neutral",
  "confidence": 1-100,
  "entry_level": price,
  "stop_loss": price, 
  "take_profit": price,
  "reasoning": "strategy-specific analysis",
  "timeframe": "optimal TF for this strategy",
  "conflicting_signals": ["any internal conflicts"],
  "strategy_grade": "A|B|C|D|F"
}`;

    const response = await this.generateResponse(prompt, {
      model: 'llama3-8b-8192',
      temperature: 0.2,
      max_tokens: 400
    });

    const data = this.parseJsonResponse(response);

    if (!data || data.strategy_grade === 'F' || data.confidence < 35) {
      return null;
    }

    return {
      name: strategy,
      bias: data.bias,
      confidence: data.confidence,
      entry: data.entry_level,
      stopLoss: data.stop_loss,
      takeProfit: data.take_profit,
      reasoning: data.reasoning,
      timeframe: data.timeframe,
      conflictingSignals: data.conflicting_signals || []
    };
  }

  private getStrategySpecificRules(strategy: string): string {
    const rules: Record<string, string> = {
      'Smart Money Concepts (SMC)': `
- BOS (Break of Structure): Clear breaks of previous highs/lows
- CHoCH (Change of Character): Market structure shifts
- FVG (Fair Value Gaps): Unfilled price gaps from institutional moves
- Order Blocks: Last opposing candle before major moves
- Liquidity Sweeps: Stop hunts with volume confirmation`,
      
      'Inner Circle Trader (ICT)': `
- Kill Zones: London (8-10 GMT), NY (13-15 GMT), Asian (0-2 GMT)
- Silver Bullet: 10-11 GMT and 14-15 GMT optimal entries
- Judas Swing: False moves during session opens
- PD Arrays: Premium/Discount array analysis
- Optimal Trade Entry: Precise timing within kill zones`,
      
      'Wyckoff Accumulation/Distribution': `
- Phase A: Preliminary support/resistance after trend
- Phase B: Building cause through tests and shakeouts  
- Phase C: Final test before markup/markdown
- Phase D: Last point of support/resistance
- Signs of Strength/Weakness: Volume and price analysis`,
      
      'Volume Spread Analysis (VSA)': `
- Effort vs Result: Volume should match price movement
- High Volume + Narrow Spread = Absorption
- Low Volume + Wide Spread = Weakness
- Climax Volume = Potential reversal
- Background Volume = Normal market conditions`,
      
      'Trend Continuation Strategy': `
- Higher highs/higher lows for uptrends
- Pullbacks to 38.2%-61.8% Fibonacci levels
- Flag/pennant consolidations after strong moves
- Volume expansion on continuation moves
- Moving average support/resistance`,
      
      'Breakout with Volatility Confirmation': `
- Volume must exceed 150% of average on breakout
- Clear close above/below key levels
- Volatility expansion confirmation
- No immediate retest of broken level
- Higher timeframe alignment required`,
      
      'Session-Based Momentum Trading': `
- London Open momentum (8-9 GMT)
- NY Open momentum (13-14 GMT)
- Session overlap volatility (13-16 GMT)
- Asian session range trading (23-8 GMT)
- Session transition risks`,
      
      'Multi-Timeframe Confluence Trading': `
- Higher timeframe bias (H4/Daily)
- Medium timeframe structure (H1/M15)
- Lower timeframe precision entry (M5/M1)
- All timeframes must align for entry
- Structure breaks on multiple timeframes`
    };

    return rules[strategy] || 'General technical analysis principles';
  }

  async executeMicroTimeframeConfirmation(
    symbol: string,
    livePrice: number, 
    strategies: StrategyFramework[]
  ): Promise<any> {
    // Filter to strategies that agree
    const bullishStrategies = strategies.filter(s => s.bias === 'bullish');
    const bearishStrategies = strategies.filter(s => s.bias === 'bearish');
    
    if (bullishStrategies.length < 2 && bearishStrategies.length < 2) {
      return { confirmation: 'insufficient_agreement', strategies_agreeing: 0 };
    }

    const dominantBias = bullishStrategies.length > bearishStrategies.length ? 'bullish' : 'bearish';
    const agreeingStrategies = dominantBias === 'bullish' ? bullishStrategies : bearishStrategies;

    const prompt = `
🔬 MICRO-TIMEFRAME CONFIRMATION ANALYSIS

Multiple strategies agree on ${dominantBias} bias. Confirm with micro-timeframe precision.

AGREEING STRATEGIES: ${agreeingStrategies.map(s => `${s.name}: ${s.confidence}%`).join(', ')}
SYMBOL: ${symbol} at ${livePrice}

MICRO-TIMEFRAME REQUIREMENTS:
1. HTF (H4/Daily) Bias Confirmation: Does higher timeframe support direction?
2. MTF (H1/M15) Structure: Is market structure aligned?
3. LTF (M5/M1) Precision: Optimal entry timing and levels?

TIMING PRECISION:
- Wait for pullback to optimal entry?
- Enter on break of structure?
- Scale in on multiple touches?

Return JSON:
{
  "htf_bias_confirmed": true|false,
  "mtf_structure_aligned": true|false, 
  "ltf_entry_optimal": true|false,
  "overall_confirmation": "strong|moderate|weak|failed",
  "optimal_entry_method": "immediate|wait_pullback|break_confirm|scale_in",
  "micro_timeframe_grade": "A|B|C|D|F",
  "strategies_confirmed": ${agreeingStrategies.length},
  "execution_recommendation": "execute|wait|reduce_size|reject"
}`;

    const response = await this.generateResponse(prompt, {
      model: 'llama3-8b-8192',
      temperature: 0.1,
      max_tokens: 300
    });

    return this.parseJsonResponse(response);
  }

  async executeSignalStrengthGrading(
    strategies: StrategyFramework[],
    microConfirmation: any,
    feeds: AdvancedDataFeeds
  ): Promise<any> {
    const agreeingStrategies = strategies.filter(s => 
      s.bias === (strategies.filter(st => st.bias === 'bullish').length > 
                  strategies.filter(st => st.bias === 'bearish').length ? 'bullish' : 'bearish')
    );

    const averageConfidence = agreeingStrategies.reduce((sum, s) => sum + s.confidence, 0) / agreeingStrategies.length;

    const prompt = `
🏆 SIGNAL STRENGTH GRADING SYSTEM

Grade this signal based on institutional standards.

STRATEGY AGREEMENT: ${agreeingStrategies.length}/${strategies.length} strategies agree
AVERAGE CONFIDENCE: ${averageConfidence.toFixed(1)}%
MICRO-TIMEFRAME: ${microConfirmation.overall_confirmation}
SENTIMENT: ${feeds.sentimentAnalysis.riskAppetite}
LIQUIDITY: ${feeds.orderBookData.whaleWalls ? 'Whale walls detected' : 'Normal liquidity'}

GRADING CRITERIA:
- Institutional Grade (A): 4+ strategies, 80%+ confidence, strong micro-confirmation
- Professional Grade (B): 3+ strategies, 65%+ confidence, moderate confirmation  
- Standard Grade (C): 2+ strategies, 50%+ confidence, acceptable conditions
- Below Standard: Reject if insufficient confluence

RISK FACTORS:
- News events within ${feeds.economicCalendar.minutesToEvent} minutes
- Sentiment: ${feeds.sentimentAnalysis.fearGreedIndex} fear/greed index
- Correlation risk: ${feeds.multiAssetCorrelation.correlationStrength}

Return JSON:
{
  "signal_grade": "A|B|C|REJECT",
  "grade_reasoning": "why this grade",
  "confluence_score": 0-100,
  "expected_win_rate": 45-85,
  "institutional_approval": true|false,
  "risk_adjusted_grade": "A|B|C|REJECT",
  "position_size_recommendation": 0.5-2.0,
  "execution_priority": "high|medium|low|avoid"
}`;

    const response = await this.generateResponse(prompt, {
      model: 'llama3-8b-8192',
      temperature: 0.1,
      max_tokens: 300
    });

    return this.parseJsonResponse(response);
  }

  async executeFailSafeBlocking(
    signalGrade: any,
    feeds: AdvancedDataFeeds,
    multiPassResults: MultiPassResult[]
  ): Promise<any> {
    const prompt = `
🚨 FAIL-SAFE SIGNAL BLOCKING SYSTEM

Final institutional quality check before signal release.

SIGNAL GRADE: ${signalGrade.signal_grade}
RISK FACTORS: ${JSON.stringify(feeds.economicCalendar)}
SENTIMENT: ${JSON.stringify(feeds.sentimentAnalysis)}

BLOCKING CONDITIONS CHECK:
1. Conflicting Strategy Bias: Multiple strategies disagreeing?
2. High Spread/Low Liquidity: Execution risk too high?
3. News Risk: High-impact events imminent?
4. Correlation Breakdown: Multi-asset signals conflicting?
5. Market Regime Mismatch: Signal doesn't fit current environment?

INSTITUTIONAL STANDARDS:
- Minimum grade: B or better
- Maximum news risk: 30 minutes to high impact
- Minimum liquidity: Acceptable execution conditions
- Maximum correlation conflict: Moderate disagreement allowed

FINAL DECISION LOGIC:
If ANY blocking condition is met → REJECT signal
If grade is C with high risk → REDUCE SIZE
If grade is B+ with normal conditions → EXECUTE
If grade is A with optimal conditions → FULL SIZE

Return JSON:
{
  "blocking_conditions": {
    "conflicting_bias": true|false,
    "execution_risk": true|false,
    "news_risk": true|false,
    "correlation_conflict": true|false,
    "regime_mismatch": true|false
  },
  "final_decision": "EXECUTE|REDUCE_SIZE|WAIT|BLOCK",
  "blocking_reason": "if blocked, why",
  "final_signal": {
    "approved": true|false,
    "grade": "A|B|C|BLOCKED",
    "position_size": 0.5-2.0,
    "urgency": "immediate|within_hour|wait_for_better",
    "justification": "final reasoning"
  }
}`;

    const response = await this.generateResponse(prompt, {
      model: 'llama3-8b-8192',
      temperature: 0.05,
      max_tokens: 400
    });

    const result = this.parseJsonResponse(response);

    if (result.final_decision === 'BLOCK' || !result.final_signal?.approved) {
      console.log('❌ SIGNAL BLOCKED by fail-safe system:', result.blocking_reason);
      return null;
    }

    console.log('✅ SIGNAL APPROVED by all systems:', result.final_signal.grade);
    return result.final_signal;
  }

  async generateResponse(prompt: string, options: GroqOptions = {}): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      const requestBody = {
        model: options.model || 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.1,
        max_tokens: options.max_tokens || 500,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Groq API call failed:', error);
      throw error;
    }
  }

  parseJsonResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse Groq JSON response:', error);
      return {};
    }
  }

  private getNextHighImpactEvent(): string {
    const events = ['NFP', 'CPI', 'FOMC', 'ECB', 'GDP', 'Unemployment', 'Retail Sales'];
    return events[Math.floor(Math.random() * events.length)];
  }

  private getTradingRecommendation(): 'avoid' | 'reduce_size' | 'normal' | 'opportunity' {
    const rand = Math.random();
    if (rand > 0.8) return 'opportunity';
    if (rand > 0.6) return 'normal';
    if (rand > 0.3) return 'reduce_size';
    return 'avoid';
  }
}

export const ultraGroqAnalyzer = new UltraGroqAnalyzer();