// 🔥 SETUP CONTRACT - Every setup MUST have these fields to be valid

/**
 * Setup Type Enum - Categories of trading setups
 */
export type SetupType = 
  | 'breakout_retest'
  | 'liquidity_sweep'
  | 'fvg_entry'
  | 'order_block'
  | 'displacement'
  | 'bos_choch'
  | 'range_break';

/**
 * Market Structure State
 */
export type MarketStructure = 'bullish' | 'bearish' | 'ranging' | 'transition';

/**
 * Trading Session
 */
export type TradingSession = 'asia' | 'london' | 'newyork' | 'london_ny_overlap' | 'off_hours';

/**
 * HTF Bias
 */
export type HTFBias = 'bullish' | 'bearish' | 'neutral';

/**
 * Liquidity Sweep Status
 */
export type LiquiditySweepStatus = 'confirmed' | 'anticipated' | 'none';

/**
 * Setup Freshness - Time decay state
 */
export type SetupFreshness = 'fresh' | 'aging' | 'stale' | 'expired';

/**
 * Setup Grade
 */
export type SetupGrade = 'A+' | 'A' | 'B' | 'C' | 'D';

/**
 * Price Zone - Entry, SL, TP zones (not single prices)
 */
export interface PriceZone {
  min: number;
  max: number;
}

/**
 * TP Level with probability
 */
export interface TPLevel {
  level: number;
  price: number;
  probability: string; // e.g., '70%', '50%', '35%'
}

/**
 * THE SETUP CONTRACT
 * Every setup MUST have ALL of these fields or it's NOISE, not a setup
 */
export interface SetupContract {
  // Core Identity
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  timeframe: string;
  
  // Setup Classification
  setupType: SetupType;
  
  // Price Levels (ZONES, not single prices)
  entryZone: PriceZone;
  stopLossZone: PriceZone;
  tpLadder: TPLevel[];
  
  // Invalidation (CRITICAL - when is this setup dead?)
  invalidationRule: string;
  invalidationPrice: number;
  
  // Market Context
  marketStructure: MarketStructure;
  htfBias: HTFBias;
  session: TradingSession;
  liquiditySweep: LiquiditySweepStatus;
  
  // Grading
  grade: SetupGrade;
  confidenceScore: number; // 0-100
  reasons: string[];
  
  // Time Decay
  detectedAt: Date;
  freshness: SetupFreshness;
  timeDecayPercent: number; // 0-100, higher = fresher
  
  // Warnings
  warnings: SetupWarning[];
  
  // Risk Metrics
  riskRewardRatio: number;
  estimatedRiskPips: number;
  estimatedRewardPips: number;
}

/**
 * Setup Warning
 */
export interface SetupWarning {
  type: 'htf_trend' | 'volume' | 'news' | 'session' | 'spread' | 'volatility' | 'proximity' | 'structure';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

/**
 * User Scanner Preferences - Connects scanner to user
 */
export interface UserScannerPreferences {
  userId: string;
  
  // Asset Preferences
  preferredAssets: string[];
  excludedAssets: string[];
  assetClass: ('forex' | 'crypto' | 'indices' | 'commodities')[];
  
  // Session Preferences
  preferredSessions: TradingSession[];
  autoDetectSession: boolean;
  
  // Risk Tolerance
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  minRiskReward: number;
  maxRiskPercent: number;
  
  // Setup Type Preferences
  allowedSetupTypes: SetupType[];
  
  // Quality Filters
  minGrade: SetupGrade;
  minConfidence: number;
  
  // Display Preferences
  maxSetupsDisplayed: number;
  hideStaleSetups: boolean;
  showWarnings: boolean;
}

/**
 * Scanner Output - What the scanner returns
 */
export interface ScannerOutput {
  setups: SetupContract[];
  scannedAt: Date;
  assetsScanned: number;
  setupsFound: number;
  setupsRejected: number;
  rejectionReasons: string[];
  scanDurationMs: number;
  userPreferencesApplied: boolean;
}

/**
 * Calculate freshness from detected time
 */
export function calculateFreshness(detectedAt: Date): { freshness: SetupFreshness; percent: number } {
  const now = new Date();
  const ageMinutes = (now.getTime() - detectedAt.getTime()) / (1000 * 60);
  
  if (ageMinutes <= 10) {
    return { freshness: 'fresh', percent: 100 - (ageMinutes * 2) };
  }
  if (ageMinutes <= 30) {
    return { freshness: 'fresh', percent: 80 - ((ageMinutes - 10) * 1.5) };
  }
  if (ageMinutes <= 60) {
    return { freshness: 'aging', percent: 50 - ((ageMinutes - 30) * 0.5) };
  }
  if (ageMinutes <= 120) {
    return { freshness: 'stale', percent: 35 - ((ageMinutes - 60) * 0.25) };
  }
  
  return { freshness: 'expired', percent: Math.max(0, 20 - ((ageMinutes - 120) * 0.1)) };
}

/**
 * Validate a setup against the contract
 * Returns true if valid, or array of missing fields
 */
export function validateSetupContract(setup: Partial<SetupContract>): { valid: boolean; missing: string[] } {
  const requiredFields: (keyof SetupContract)[] = [
    'id', 'symbol', 'direction', 'timeframe', 'setupType',
    'entryZone', 'stopLossZone', 'tpLadder', 'invalidationRule',
    'marketStructure', 'htfBias', 'session', 'grade', 'confidenceScore'
  ];
  
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (setup[field] === undefined || setup[field] === null) {
      missing.push(field);
    }
  }
  
  // Validate zones have both min and max
  if (setup.entryZone && (setup.entryZone.min === undefined || setup.entryZone.max === undefined)) {
    missing.push('entryZone.min/max');
  }
  if (setup.stopLossZone && (setup.stopLossZone.min === undefined || setup.stopLossZone.max === undefined)) {
    missing.push('stopLossZone.min/max');
  }
  
  // Validate TP ladder has at least one level
  if (!setup.tpLadder || setup.tpLadder.length === 0) {
    missing.push('tpLadder (at least 1 level)');
  }
  
  return { valid: missing.length === 0, missing };
}

/**
 * Get grade order for filtering
 */
export function getGradeOrder(grade: SetupGrade): number {
  const order: Record<SetupGrade, number> = {
    'A+': 0,
    'A': 1,
    'B': 2,
    'C': 3,
    'D': 4
  };
  return order[grade];
}

/**
 * Check if a setup meets minimum grade requirement
 */
export function meetsMinGrade(setupGrade: SetupGrade, minGrade: SetupGrade): boolean {
  return getGradeOrder(setupGrade) <= getGradeOrder(minGrade);
}
