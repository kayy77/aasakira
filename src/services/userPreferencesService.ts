// User Preferences Service - Connects scanner output to user preferences
import { supabase } from '@/integrations/supabase/client';
import type { 
  UserScannerPreferences, 
  SetupContract, 
  SetupGrade,
  TradingSession,
  SetupType 
} from '@/types/setupTypes';

const DEFAULT_PREFERENCES: Omit<UserScannerPreferences, 'userId'> = {
  preferredAssets: ['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY'],
  excludedAssets: [],
  assetClass: ['forex', 'commodities'],
  preferredSessions: ['london', 'newyork', 'london_ny_overlap'],
  autoDetectSession: true,
  riskTolerance: 'moderate',
  minRiskReward: 1.5,
  maxRiskPercent: 2.0,
  allowedSetupTypes: ['breakout_retest', 'liquidity_sweep', 'fvg_entry', 'order_block'],
  minGrade: 'B',
  minConfidence: 60,
  maxSetupsDisplayed: 10,
  hideStaleSetups: true,
  showWarnings: true
};

class UserPreferencesService {
  private cache = new Map<string, { prefs: UserScannerPreferences; timestamp: number }>();
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get user preferences, with caching
   */
  async getUserPreferences(userId: string): Promise<UserScannerPreferences> {
    // Check cache
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.prefs;
    }

    // For now, return defaults since scanner_preferences column doesn't exist yet
    // This can be extended once the column is added via migration
    const defaultPrefs = { ...DEFAULT_PREFERENCES, userId };
    this.cache.set(userId, { prefs: defaultPrefs, timestamp: Date.now() });
    return defaultPrefs;
  }

  /**
   * Save user preferences
   */
  async saveUserPreferences(prefs: UserScannerPreferences): Promise<boolean> {
    // For now, just cache locally since scanner_preferences column doesn't exist
    // This can be extended once the column is added via migration
    this.cache.set(prefs.userId, { prefs, timestamp: Date.now() });
    return true;
  }

  /**
   * Filter setups based on user preferences
   */
  filterSetupsByPreferences(
    setups: SetupContract[], 
    prefs: UserScannerPreferences
  ): SetupContract[] {
    return setups.filter(setup => {
      // Asset filter
      if (prefs.excludedAssets.includes(setup.symbol)) return false;
      if (prefs.preferredAssets.length > 0 && !prefs.preferredAssets.includes(setup.symbol)) {
        // Allow if asset class matches
        const assetClass = this.getAssetClass(setup.symbol);
        if (!prefs.assetClass.includes(assetClass)) return false;
      }

      // Session filter (if not auto-detect)
      if (!prefs.autoDetectSession && !prefs.preferredSessions.includes(setup.session)) {
        return false;
      }

      // Grade filter
      if (!this.meetsMinGrade(setup.grade, prefs.minGrade)) return false;

      // Confidence filter
      if (setup.confidenceScore < prefs.minConfidence) return false;

      // Setup type filter
      if (!prefs.allowedSetupTypes.includes(setup.setupType)) return false;

      // R:R filter
      if (setup.riskRewardRatio < prefs.minRiskReward) return false;

      // Stale filter
      if (prefs.hideStaleSetups && setup.freshness === 'stale') return false;

      return true;
    });
  }

  /**
   * Get current session based on time
   */
  getCurrentSession(): TradingSession {
    const now = new Date();
    const utcHour = now.getUTCHours();

    // London: 07:00-16:00 UTC
    // NY: 12:00-21:00 UTC
    // Overlap: 12:00-16:00 UTC
    // Asia: 00:00-09:00 UTC

    if (utcHour >= 12 && utcHour < 16) return 'london_ny_overlap';
    if (utcHour >= 7 && utcHour < 16) return 'london';
    if (utcHour >= 12 && utcHour < 21) return 'newyork';
    if (utcHour >= 0 && utcHour < 9) return 'asia';
    
    return 'off_hours';
  }

  /**
   * Determine asset class from symbol
   */
  private getAssetClass(symbol: string): 'forex' | 'crypto' | 'indices' | 'commodities' {
    if (symbol.includes('XAU') || symbol.includes('XAG') || symbol.includes('OIL')) {
      return 'commodities';
    }
    if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL')) {
      return 'crypto';
    }
    if (symbol.includes('US30') || symbol.includes('NAS') || symbol.includes('SPX')) {
      return 'indices';
    }
    return 'forex';
  }

  /**
   * Check grade ordering
   */
  private meetsMinGrade(setupGrade: SetupGrade, minGrade: SetupGrade): boolean {
    const order: Record<SetupGrade, number> = { 'A+': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
    return order[setupGrade] <= order[minGrade];
  }

  /**
   * Rank setups for user (personalized)
   */
  rankSetupsForUser(
    setups: SetupContract[], 
    prefs: UserScannerPreferences
  ): SetupContract[] {
    return [...setups].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Preferred asset bonus
      if (prefs.preferredAssets.includes(a.symbol)) scoreA += 20;
      if (prefs.preferredAssets.includes(b.symbol)) scoreB += 20;

      // Grade score
      scoreA += (5 - this.gradeOrder(a.grade)) * 15;
      scoreB += (5 - this.gradeOrder(b.grade)) * 15;

      // Confidence score
      scoreA += a.confidenceScore * 0.3;
      scoreB += b.confidenceScore * 0.3;

      // Freshness bonus
      scoreA += a.timeDecayPercent * 0.2;
      scoreB += b.timeDecayPercent * 0.2;

      // Session alignment
      const currentSession = this.getCurrentSession();
      if (a.session === currentSession) scoreA += 10;
      if (b.session === currentSession) scoreB += 10;

      // Risk tolerance adjustment
      if (prefs.riskTolerance === 'conservative') {
        if (a.riskRewardRatio >= 2) scoreA += 15;
        if (b.riskRewardRatio >= 2) scoreB += 15;
      }

      return scoreB - scoreA;
    });
  }

  private gradeOrder(grade: SetupGrade): number {
    const order: Record<SetupGrade, number> = { 'A+': 0, 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
    return order[grade];
  }
}

export const userPreferencesService = new UserPreferencesService();
