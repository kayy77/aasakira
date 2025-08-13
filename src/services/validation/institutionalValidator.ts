// Institutional Trade Validator - Bulletproof Signal Validation
// Prevents catastrophic trades like UJ instant SL hits

export type Side = 'BUY' | 'SELL';

export interface RawSignal {
  symbol: string;
  side: Side;
  entry: number;
  sl: number;
  tp: number;
  rr: number;
  spread: number;        // from live quotes
  atrPips: number;       // ATR(14) on execution TF in pips
  session: 'ASIA' | 'LONDON' | 'NY';
  newsRisk: 'LOW' | 'MED' | 'HIGH';
  priceAgeMs: number;    // ms since last price tick
  nearestOppLiquidityPips: number; // distance to nearest opposing liquidity
  structureAlignedTFs: number;     // count of aligned timeframes
  confluenceScore: number; // 0-100 from SMC/ICT stack
  confirmationState: 'NONE' | 'POST_SWEEP_CLOSE' | 'RETEST_CONFIRMED';
  liquiditySweepDetected: boolean;
  ifvgRetestConfirmed: boolean;
  microTriggerConfirmed: boolean;
}

export interface ValidationResult {
  ok: boolean;
  reasons: string[];
  hardened?: {
    sl: number;
    entry?: number;
  };
  adjustedRR?: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

export class InstitutionalValidator {
  private static readonly MIN_RR = 1.8;
  private static readonly MIN_CONFLUENCE = 72;
  private static readonly MIN_ALIGNED_TFS = 3;
  private static readonly MAX_PRICE_AGE_MS = 1500;
  private static readonly MIN_SL_PIPS = 6;

  // Session-based spread tolerances
  private static readonly SPREAD_LIMITS: Record<string, Record<string, number>> = {
    'EURUSD': { 'ASIA': 1.2, 'LONDON': 0.8, 'NY': 0.6 },
    'GBPUSD': { 'ASIA': 1.8, 'LONDON': 1.2, 'NY': 0.8 },
    'USDJPY': { 'ASIA': 1.0, 'LONDON': 0.6, 'NY': 0.4 },
    'AUDUSD': { 'ASIA': 1.5, 'LONDON': 1.0, 'NY': 0.8 },
    'USDCAD': { 'ASIA': 1.4, 'LONDON': 0.9, 'NY': 0.7 },
    'NZDUSD': { 'ASIA': 1.8, 'LONDON': 1.3, 'NY': 1.0 }
  };

  static validateInstitutional(raw: RawSignal): ValidationResult {
    console.log(`🏛️ INSTITUTIONAL VALIDATION: ${raw.symbol} ${raw.side} | Entry: ${raw.entry} | SL: ${raw.sl} | RR: ${raw.rr}:1`);
    
    const result: ValidationResult = { 
      ok: true, 
      reasons: [], 
      riskLevel: 'LOW',
      recommendation: 'APPROVED'
    };

    // GATE 1: Price Data Quality
    this.validatePriceQuality(raw, result);
    
    // GATE 2: Direction & Structure Sanity
    this.validateDirectionSanity(raw, result);
    
    // GATE 3: Risk-Reward & Distance Logic
    this.validateRiskReward(raw, result);
    
    // GATE 4: Liquidity Protection (CRITICAL)
    this.validateLiquidityProtection(raw, result);
    
    // GATE 5: Market Regime & Session
    this.validateMarketRegime(raw, result);
    
    // GATE 6: News & Event Risk
    this.validateNewsRisk(raw, result);
    
    // GATE 7: Confluence & Confirmation
    this.validateConfluence(raw, result);
    
    // GATE 8: Auto-Hardening (if possible)
    this.attemptAutoHardening(raw, result);
    
    // Calculate final risk level
    result.riskLevel = this.calculateRiskLevel(result.reasons, raw);
    
    console.log(`🏛️ Validation: ${result.ok ? 'PASS' : 'FAIL'} | Risk: ${result.riskLevel} | Issues: ${result.reasons.length}`);
    
    return result;
  }

  private static validatePriceQuality(raw: RawSignal, result: ValidationResult): void {
    if (raw.priceAgeMs > this.MAX_PRICE_AGE_MS) {
      result.ok = false;
      result.reasons.push('STALE_PRICE');
    }

    const maxSpread = this.SPREAD_LIMITS[raw.symbol]?.[raw.session] || 1.0;
    if (raw.spread > maxSpread) {
      result.ok = false;
      result.reasons.push('SPREAD_TOO_WIDE');
    }
  }

  private static validateDirectionSanity(raw: RawSignal, result: ValidationResult): void {
    const dirOk = raw.side === 'BUY'
      ? (raw.sl < raw.entry && raw.tp > raw.entry)
      : (raw.sl > raw.entry && raw.tp < raw.entry);
    
    if (!dirOk) {
      result.ok = false;
      result.reasons.push('DIRECTION_MISMATCH');
    }

    // Check for SL = Entry (instant loss bug)
    if (Math.abs(raw.entry - raw.sl) < 0.000001) {
      result.ok = false;
      result.reasons.push('SL_EQUALS_ENTRY');
    }
  }

  private static validateRiskReward(raw: RawSignal, result: ValidationResult): void {
    if (raw.rr < this.MIN_RR) {
      result.ok = false;
      result.reasons.push(`RR_TOO_LOW (${raw.rr.toFixed(2)} < ${this.MIN_RR})`);
    }

    const minSLPips = Math.max(
      1.2 * raw.spread,
      0.6 * raw.atrPips,
      this.MIN_SL_PIPS
    );

    const actualSLPips = this.getSlDistanceInPips(raw);
    if (actualSLPips < minSLPips) {
      result.ok = false;
      result.reasons.push(`SL_TOO_TIGHT (${actualSLPips.toFixed(1)} < ${minSLPips.toFixed(1)} pips)`);
    }
  }

  private static validateLiquidityProtection(raw: RawSignal, result: ValidationResult): void {
    // CRITICAL: SL must be BEYOND nearest opposing liquidity + ATR buffer
    const requiredBeyond = Math.max(
      raw.nearestOppLiquidityPips + (0.3 * raw.atrPips),
      8 // minimum 8 pips beyond liquidity
    );

    const actualSLPips = this.getSlDistanceInPips(raw);
    if (actualSLPips < requiredBeyond) {
      result.ok = false;
      result.reasons.push(`SL_INSIDE_LIQUIDITY (${actualSLPips.toFixed(1)} < ${requiredBeyond.toFixed(1)} pips beyond)`);
      
      // Mark for potential auto-hardening
      const pipFactor = this.getPipFactor(raw.symbol);
      const targetSLPips = requiredBeyond;
      const delta = (targetSLPips / pipFactor) * (raw.side === 'BUY' ? -1 : 1);
      result.hardened = { sl: raw.entry + delta };
    }
  }

  private static validateMarketRegime(raw: RawSignal, result: ValidationResult): void {
    // Session-specific filters
    if (raw.session === 'ASIA' && raw.symbol.includes('GBP') && raw.atrPips < 15) {
      result.ok = false;
      result.reasons.push('LOW_VOL_SESSION_MISMATCH');
    }

    // Weekend gap risk
    const hour = new Date().getUTCHours();
    if ((hour >= 22 || hour <= 2) && raw.session !== 'ASIA') {
      result.reasons.push('OFF_HOURS_RISK');
    }
  }

  private static validateNewsRisk(raw: RawSignal, result: ValidationResult): void {
    if (raw.newsRisk === 'HIGH') {
      result.ok = false;
      result.reasons.push('HIGH_IMPACT_NEWS_WINDOW');
    }
  }

  private static validateConfluence(raw: RawSignal, result: ValidationResult): void {
    if (raw.structureAlignedTFs < this.MIN_ALIGNED_TFS) {
      result.ok = false;
      result.reasons.push(`WEAK_TF_ALIGNMENT (${raw.structureAlignedTFs} < ${this.MIN_ALIGNED_TFS})`);
    }

    if (raw.confluenceScore < this.MIN_CONFLUENCE) {
      result.ok = false;
      result.reasons.push(`LOW_CONFLUENCE (${raw.confluenceScore} < ${this.MIN_CONFLUENCE})`);
    }

    // CRITICAL: Require proper confirmation sequence
    if (raw.confirmationState !== 'RETEST_CONFIRMED') {
      result.ok = false;
      result.reasons.push('NO_POST_SWEEP_CONFIRMATION');
    }

    if (!raw.liquiditySweepDetected) {
      result.ok = false;
      result.reasons.push('NO_LIQUIDITY_SWEEP');
    }

    if (!raw.ifvgRetestConfirmed) {
      result.ok = false;
      result.reasons.push('NO_IFVG_RETEST');
    }

    if (!raw.microTriggerConfirmed) {
      result.ok = false;
      result.reasons.push('NO_MICRO_TRIGGER');
    }
  }

  private static attemptAutoHardening(raw: RawSignal, result: ValidationResult): void {
    // Only auto-harden if the only issue is liquidity protection
    const liquidityIssues = result.reasons.filter(r => r.includes('SL_INSIDE_LIQUIDITY'));
    
    if (liquidityIssues.length === 1 && result.reasons.length === 1 && result.hardened) {
      // Recalculate RR with hardened SL
      const tpDistance = Math.abs(raw.tp - raw.entry);
      const hardenedSlDistance = Math.abs(result.hardened.sl - raw.entry);
      result.adjustedRR = tpDistance / hardenedSlDistance;
      
      if (result.adjustedRR >= this.MIN_RR) {
        result.recommendation = 'AUTO_HARDENED';
        console.log(`🔧 Auto-hardened SL: ${raw.sl} → ${result.hardened.sl} | New RR: ${result.adjustedRR.toFixed(2)}:1`);
      }
    }
  }

  private static calculateRiskLevel(reasons: string[], raw: RawSignal): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalIssues = reasons.filter(r => 
      r.includes('DIRECTION_MISMATCH') || 
      r.includes('SL_EQUALS_ENTRY') || 
      r.includes('HIGH_IMPACT_NEWS')
    );

    if (criticalIssues.length > 0) return 'CRITICAL';
    if (reasons.length >= 3) return 'HIGH';
    if (reasons.length >= 2 || raw.rr < 2.0 || raw.confluenceScore < 80) return 'MEDIUM';
    return 'LOW';
  }

  private static getSlDistanceInPips(raw: RawSignal): number {
    const pipFactor = this.getPipFactor(raw.symbol);
    return Math.abs(raw.entry - raw.sl) * pipFactor;
  }

  private static getPipFactor(symbol: string): number {
    // JPY pairs use different pip calculation
    return symbol.includes('JPY') ? 100 : 10000;
  }

  // Utility method for quick validation
  static quickValidate(symbol: string, side: Side, entry: number, sl: number, tp: number): boolean {
    const slDistance = Math.abs(entry - sl);
    
    // Critical checks only
    if (slDistance < 0.000001) return false; // SL = Entry
    if (side === 'BUY' && (sl >= entry || tp <= entry)) return false;
    if (side === 'SELL' && (sl <= entry || tp >= entry)) return false;
    
    const rr = Math.abs(tp - entry) / slDistance;
    return rr >= this.MIN_RR;
  }
}

export const institutionalValidator = InstitutionalValidator;
export const validateInstitutional = InstitutionalValidator.validateInstitutional;