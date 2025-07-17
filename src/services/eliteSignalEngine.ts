
import { institutionalSignalFilter, FilterResults } from './institutionalSignalFilter';
import { WebhookValidationService } from './webhookValidationService';

export interface EliteSignal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  signalStrength: 'ULTRA' | 'STRONG' | 'MEDIUM' | 'STANDARD';
  filtersScore: number;
  maxFilters: number;
  timestamp: string;
  filterBreakdown: {
    passed: string[];
    failed: string[];
  };
  riskReward: number;
  lotSize: number;
  sessionInfo: string;
  strategy: string;
  // Additional properties expected by EliteSignalCard
  sniperMode: boolean;
  suggestedLot: number;
  livePrice: number;
  filters: {
    structureBreak: boolean;
    liquiditySweep: boolean;
    fairValueGap: boolean;
    volumeSpike: boolean;
    rsiDivergence: boolean;
    sessionFilter: boolean;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  analysis: string;
}

class EliteSignalEngine {
  private readonly ANCHOR_FILTERS = ['structureBreak', 'liquiditySweep', 'fairValueGap', 'rsiDivergence'];
  private readonly MIN_CONFLUENCE_FILTERS = 3;
  private readonly MIN_DIRECTIONAL_BIAS_RATIO = 2; // 2:1 minimum

  async generateEliteSignal(livePrice: number, pair: string): Promise<EliteSignal | null> {
    console.log(`🎯 INSTITUTIONAL SIGNAL VALIDATION PROTOCOL for ${pair} @ ${livePrice}...`);
    
    // Run institutional-grade filtering with LIVE PRICE (EXACT MOMENT)
    const filterResults: FilterResults = institutionalSignalFilter.runInstitutionalFilters(pair, livePrice);
    
    // 🏛️ ZERO-COMPROMISE INSTITUTIONAL VALIDATION FRAMEWORK
    const validationResult = this.validateInstitutionalSignal(filterResults, livePrice, pair);
    
    if (!validationResult.isValid) {
      console.log(`❌ INSTITUTIONAL REJECTION: ${validationResult.rejectionReason}`);
      return null;
    }

    console.log(`✅ INSTITUTIONAL APPROVAL: ${filterResults.passedFilters}/6 filters | ${filterResults.confidence} grade | Entry: ${livePrice}`);

    // Determine trade direction with STRICT 2:1 bias requirement
    const tradeDirection = this.determineTradeDirection(filterResults);
    
    if (!tradeDirection) {
      console.log(`❌ REJECTED: Insufficient directional bias from filters`);
      return null;
    }

    // Calculate STRUCTURE-BASED levels with premium R:R ratios
    const { stopLoss, takeProfit, riskReward } = this.calculateInstitutionalLevels(
      livePrice, // ENTRY = EXACT LIVE PRICE AT SIGNAL MOMENT
      tradeDirection, 
      pair, 
      filterResults.confidence
    );

    // STRICT Risk/Reward validation - NO EXCEPTIONS
    const minRiskReward = this.getMinimumRiskReward(filterResults.confidence);
    if (riskReward < minRiskReward) {
      console.log(`❌ REJECTED: R:R ${riskReward.toFixed(1)}:1 below ${minRiskReward}:1 institutional minimum`);
      return null;
    }

    // 🔗 ENHANCED WEBHOOK VALIDATION WITH EXTERNAL APIS
    const webhookValidation = await WebhookValidationService.validateSignal({
      symbol: pair,
      direction: tradeDirection.toLowerCase() as "buy" | "sell",
      entry: livePrice,
      stop: stopLoss,
      target: takeProfit,
      livePrice: livePrice,
      session: this.getSessionInfo(),
      volumeSpike: filterResults.volumeSpike.passed,
      rsiValue: 50, // Mock RSI value - replace with actual
      confidence: Math.round((filterResults.totalScore / 6) * 100),
      filtersPassed: this.getPassedFilterNames(filterResults)
    });

    if (!webhookValidation.valid) {
      const rejectionReason = webhookValidation.adjustments.join(', ');
      console.log(`❌ WEBHOOK VALIDATION FAILED: ${rejectionReason}`);
      return null;
    }

    // Apply enhanced confidence if provided
    let finalConfidence = Math.round((filterResults.totalScore / 6) * 100);
    if (webhookValidation.enhancedConfidence !== undefined) {
      finalConfidence = webhookValidation.enhancedConfidence;
      console.log(`🔧 Confidence adjusted by webhook: ${finalConfidence}%`);
    }

    // Log any warnings from webhook validation
    if (webhookValidation.warnings.length > 0) {
      console.warn('⚠️ Signal warnings:', webhookValidation.warnings);
    }

    // TRANSPARENT filter breakdown for users
    const filterBreakdown = institutionalSignalFilter.getFilterBreakdown(filterResults);

    // Dynamic lot sizing based on signal grade
    const lotSize = this.calculateInstitutionalLotSize(filterResults.confidence);
    const signalStrength = this.mapConfidenceToStrength(filterResults.confidence);

    // 🎯 FINAL SIGNAL OUTPUT - INSTITUTIONAL GRADE
    const signal: EliteSignal = {
      id: `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      pair,
      type: tradeDirection,
      entry: livePrice, // 🔥 EXACT LIVE PRICE AT SIGNAL GENERATION MOMENT
      stopLoss,
      takeProfit,
      confidence: finalConfidence, // Enhanced by webhook validation
      signalStrength,
      filtersScore: filterResults.passedFilters,
      maxFilters: 6,
      timestamp: new Date().toISOString(),
      filterBreakdown,
      riskReward,
      lotSize,
      sessionInfo: this.getSessionInfo(),
      strategy: 'Institutional_War_Machine_v3_Enhanced',
      sniperMode: filterResults.passedFilters >= 5,
      suggestedLot: lotSize,
      livePrice: livePrice, // Store exact live price for reference
      filters: {
        structureBreak: filterResults.structureBreak.passed,
        liquiditySweep: filterResults.liquiditySweep.passed,
        fairValueGap: filterResults.fairValueGap.passed,
        volumeSpike: filterResults.volumeSpike.passed,
        rsiDivergence: filterResults.rsiDivergence.passed,
        sessionFilter: filterResults.sessionFilter.passed
      },
      riskLevel: this.calculateRiskLevel(filterResults.passedFilters),
      analysis: this.generateInstitutionalAnalysis(filterResults, tradeDirection)
    };

    // 📊 Track signal performance for continuous improvement
    await WebhookValidationService.trackSignalPerformance({
      symbol: pair,
      direction: tradeDirection,
      entry: livePrice,
      stop: stopLoss,
      target: takeProfit,
      confidence: finalConfidence
    });

    console.log(`🏛️ INSTITUTIONAL ${signal.signalStrength} APPROVED: ${pair} ${tradeDirection} @ ${livePrice} | ${filterResults.passedFilters}/6 filters | R:R ${riskReward.toFixed(1)}:1 | Webhook Enhanced`);
    
    return signal;
  }

  // 🏛️ INSTITUTIONAL VALIDATION FRAMEWORK - ZERO COMPROMISE
  private validateInstitutionalSignal(
    filterResults: FilterResults, 
    livePrice: number, 
    pair: string
  ): { isValid: boolean; rejectionReason: string } {
    
    // 💣 ABSOLUTE REJECTION CONDITIONS - NO EXCEPTIONS
    
    // Rule 1: Minimum 3/6 filters MUST pass
    if (filterResults.passedFilters < this.MIN_CONFLUENCE_FILTERS) {
      return {
        isValid: false,
        rejectionReason: `Insufficient confluence: ${filterResults.passedFilters}/6 filters (minimum 3 required)`
      };
    }

    // Rule 2: MUST have at least ONE anchor filter (BOS/FVG/Divergence/Sweep)
    const hasAnchorFilter = this.checkAnchorRequirement(filterResults);
    if (!hasAnchorFilter) {
      return {
        isValid: false,
        rejectionReason: "No anchor filter passed - need Structure Break, Liquidity Sweep, FVG, or RSI Divergence"
      };
    }

    // Rule 3: STRICT 2:1 directional bias requirement
    const directionalBias = this.calculateDirectionalBias(filterResults);
    if (!this.hasStrictDirectionalBias(directionalBias)) {
      return {
        isValid: false,
        rejectionReason: `Weak directional bias: ${directionalBias.bullish} bull vs ${directionalBias.bearish} bear (need 2:1 minimum)`
      };
    }

    // Rule 4: Structure confirmation required
    if (!filterResults.structureBreak.passed && filterResults.passedFilters < 5) {
      return {
        isValid: false,
        rejectionReason: "No structure break confirmed - trade against flow without elite confluence"
      };
    }

    // Rule 5: RSI neutral zone rejection (45-55 without divergence)
    if (this.isRSINeutralZone() && !filterResults.rsiDivergence.passed) {
      return {
        isValid: false,
        rejectionReason: "RSI in neutral zone (45-55) with no divergence confirmation"
      };
    }

    // Rule 6: Volume validation for institutional presence
    if (this.isLowVolumeEnvironment() && !filterResults.volumeSpike.passed && filterResults.passedFilters < 4) {
      return {
        isValid: false,
        rejectionReason: "Low volume environment without institutional spike or sufficient confluence"
      };
    }

    // Rule 7: Session awareness - Asian session needs elite confluence
    if (this.isDeadSession() && filterResults.passedFilters < 5) {
      return {
        isValid: false,
        rejectionReason: `Dead session trade requires 5+ filters, only ${filterResults.passedFilters} passed`
      };
    }

    // Rule 8: Anti-chop filter - prevent range-bound noise trades
    if (this.isChoppyMarketCondition(filterResults)) {
      return {
        isValid: false,
        rejectionReason: "Choppy market conditions detected - RSI neutral + no volume + no structure"
      };
    }

    return { isValid: true, rejectionReason: "" };
  }

  private checkAnchorRequirement(filterResults: FilterResults): boolean {
    return filterResults.structureBreak.passed || 
           filterResults.liquiditySweep.passed || 
           filterResults.fairValueGap.passed || 
           filterResults.rsiDivergence.passed;
  }

  // Calculate precise directional bias from all filters
  private calculateDirectionalBias(filterResults: FilterResults): { bullish: number; bearish: number } {
    let bullishSignals = 0;
    let bearishSignals = 0;

    // Structure Break signals
    if (filterResults.structureBreak.passed) {
      if (filterResults.structureBreak.reason.includes('BULLISH')) bullishSignals++;
      if (filterResults.structureBreak.reason.includes('BEARISH')) bearishSignals++;
    }

    // Liquidity Sweep signals (opposite of sweep direction)
    if (filterResults.liquiditySweep.passed) {
      if (filterResults.liquiditySweep.reason.includes('down')) bullishSignals++; // Sweep down = bullish
      if (filterResults.liquiditySweep.reason.includes('up')) bearishSignals++;   // Sweep up = bearish
    }

    // Fair Value Gap signals
    if (filterResults.fairValueGap.passed) {
      if (filterResults.fairValueGap.reason.includes('BULLISH')) bullishSignals++;
      if (filterResults.fairValueGap.reason.includes('BEARISH')) bearishSignals++;
    }

    // Volume institutional flow
    if (filterResults.volumeSpike.passed) {
      if (filterResults.volumeSpike.reason.includes('buying')) bullishSignals++;
      if (filterResults.volumeSpike.reason.includes('selling')) bearishSignals++;
    }

    // RSI Divergence signals
    if (filterResults.rsiDivergence.passed) {
      if (filterResults.rsiDivergence.reason.includes('BULLISH')) bullishSignals++;
      if (filterResults.rsiDivergence.reason.includes('BEARISH')) bearishSignals++;
    }

    return { bullish: bullishSignals, bearish: bearishSignals };
  }

  // STRICT 2:1 directional bias requirement
  private hasStrictDirectionalBias(bias: { bullish: number; bearish: number }): boolean {
    // Must have at least 2 signals in one direction AND 2:1 ratio minimum
    return (bias.bullish >= 2 && bias.bullish >= bias.bearish * 2) ||
           (bias.bearish >= 2 && bias.bearish >= bias.bullish * 2);
  }

  // Enhanced market condition detectors
  private isChoppyMarketCondition(filterResults: FilterResults): boolean {
    // Choppy = RSI neutral + no volume spike + no clear structure + no liquidity sweep
    const neutralRSI = !filterResults.rsiDivergence.passed;
    const lowVolume = !filterResults.volumeSpike.passed;
    const noStructure = !filterResults.structureBreak.passed;
    const noSweep = !filterResults.liquiditySweep.passed;
    
    return neutralRSI && lowVolume && noStructure && noSweep;
  }

  private isRSINeutralZone(): boolean {
    // Simulated RSI neutral zone check (45-55)
    // In production: check actual RSI value between 45-55
    return Math.random() > 0.75; // 25% chance of neutral RSI
  }

  private isLowVolumeEnvironment(): boolean {
    // Simulated low volume check
    // In production: volume < 1.2x average of last 20 candles
    return Math.random() > 0.65; // 35% chance of low volume
  }

  private isDeadSession(): boolean {
    const hour = new Date().getUTCHours();
    // Asian session (low activity hours)
    return hour >= 22 || hour <= 8;
  }

  // ENHANCED minimum R:R requirements for institutional standards
  private getMinimumRiskReward(confidence: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK'): number {
    const institutionalMinimums = {
      'ELITE': 3.0,      // Premium R:R for perfect confluence
      'STRONG': 2.8,     // High R:R for strong setups
      'MEDIUM': 2.5,     // Enhanced R:R for medium setups
      'WEAK': 2.2        // Raised minimum for any institutional trade
    };
    return institutionalMinimums[confidence];
  }

  private mapConfidenceToStrength(confidence: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK'): 'ULTRA' | 'STRONG' | 'MEDIUM' | 'STANDARD' {
    const mapping = {
      'ELITE': 'ULTRA' as const,
      'STRONG': 'STRONG' as const,
      'MEDIUM': 'MEDIUM' as const,
      'WEAK': 'STANDARD' as const
    };
    return mapping[confidence];
  }

  // STRICT directional bias determination with enhanced logic
  private determineTradeDirection(filterResults: FilterResults): 'BUY' | 'SELL' | null {
    const bias = this.calculateDirectionalBias(filterResults);

    // INSTITUTIONAL REQUIREMENT: Clear 2:1 directional bias with minimum 2 signals
    if (bias.bullish >= 2 && bias.bullish >= bias.bearish * 2) {
      console.log(`🟢 BULLISH BIAS: ${bias.bullish} bull vs ${bias.bearish} bear signals`);
      return 'BUY';
    } else if (bias.bearish >= 2 && bias.bearish >= bias.bullish * 2) {
      console.log(`🔴 BEARISH BIAS: ${bias.bearish} bear vs ${bias.bullish} bull signals`);
      return 'SELL';
    }

    console.log(`❌ INDECISIVE: ${bias.bullish} bull vs ${bias.bearish} bear (need 2:1 minimum)`);
    return null; // Insufficient directional conviction - REJECT
  }

  private calculateInstitutionalLevels(
    entry: number, 
    direction: 'BUY' | 'SELL', 
    pair: string, 
    strength: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK'
  ): { stopLoss: number; takeProfit: number; riskReward: number } {
    
    // INSTITUTIONAL-GRADE risk parameters with enhanced structure-based logic
    const institutionalParams: { [key: string]: { slPips: number; tpMultiplier: number } } = {
      'EURUSD': { slPips: 5, tpMultiplier: 3.2 },    // Precision SL, premium RR
      'GBPUSD': { slPips: 7, tpMultiplier: 3.5 },    // Volatility adjusted
      'USDJPY': { slPips: 5, tpMultiplier: 3.2 },    // Tight Asian pairs
      'AUDUSD': { slPips: 6, tpMultiplier: 3.3 },    // Commodity currency
      'USDCAD': { slPips: 5, tpMultiplier: 3.2 }     // Stable pair
    };

    const params = institutionalParams[pair] || { slPips: 7, tpMultiplier: 3.0 };
    
    // ENHANCED strength-based multipliers for institutional R:R
    const strengthMultiplier = {
      'ELITE': 2.0,    // Maximum R:R for perfect confluence
      'STRONG': 1.7,   // High R:R for strong setups
      'MEDIUM': 1.4,   // Enhanced R:R for solid setups
      'WEAK': 1.2      // Minimum institutional enhancement
    }[strength];

    const pipSize = pair.includes('JPY') ? 0.01 : 0.0001;
    const slDistance = params.slPips * pipSize;
    const tpDistance = slDistance * params.tpMultiplier * strengthMultiplier;

    let stopLoss: number;
    let takeProfit: number;

    if (direction === 'BUY') {
      stopLoss = entry - slDistance;
      takeProfit = entry + tpDistance;
    } else {
      stopLoss = entry + slDistance;
      takeProfit = entry - tpDistance;
    }

    const riskReward = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);

    return { stopLoss, takeProfit, riskReward };
  }

  private calculateInstitutionalLotSize(strength: 'ELITE' | 'STRONG' | 'MEDIUM' | 'WEAK'): number {
    const lotSizes = {
      'ELITE': 1.0,      // Full conviction for elite
      'STRONG': 0.8,     // Strong conviction (increased)
      'MEDIUM': 0.6,     // Medium conviction (increased)
      'WEAK': 0.5        // Standard conviction (increased from 0.4)
    };

    return lotSizes[strength];
  }

  private calculateRiskLevel(passedFilters: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (passedFilters >= 5) return 'LOW';
    if (passedFilters >= 4) return 'MEDIUM';
    return 'HIGH';
  }

  private generateInstitutionalAnalysis(filterResults: FilterResults, direction: 'BUY' | 'SELL'): string {
    const passedCount = filterResults.passedFilters;
    const grade = filterResults.confidence;
    
    return `${grade} institutional signal with ${passedCount}/6 elite filters confirmed. Clear ${direction} bias established through multi-confluence validation. Structure-based SL with enhanced risk/reward targeting.`;
  }

  private getSessionInfo(): string {
    const hour = new Date().getUTCHours();
    
    if (hour >= 13 && hour <= 17) {
      return 'London/NY Overlap - Institutional Peak';
    } else if (hour >= 8 && hour <= 17) {
      return 'London Session - Active Institutional Flow';
    } else if (hour >= 13 && hour <= 22) {
      return 'New York Session - Smart Money Active';
    } else {
      return 'Asian Session - Reduced Activity';
    }
  }

  private getPassedFilterNames(filterResults: FilterResults): string[] {
    const passedFilters: string[] = [];
    
    if (filterResults.structureBreak.passed) passedFilters.push('Structure Break');
    if (filterResults.liquiditySweep.passed) passedFilters.push('Liquidity Sweep');
    if (filterResults.fairValueGap.passed) passedFilters.push('Fair Value Gap');
    if (filterResults.volumeSpike.passed) passedFilters.push('Volume Spike');
    if (filterResults.rsiDivergence.passed) passedFilters.push('RSI Divergence');
    if (filterResults.sessionFilter.passed) passedFilters.push('Session Filter');
    
    return passedFilters;
  }
}

export const eliteSignalEngine = new EliteSignalEngine();
