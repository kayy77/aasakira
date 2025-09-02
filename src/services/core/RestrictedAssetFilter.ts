// 🚨 RESTRICTED ASSET FILTER - Only High-Conviction Assets
// Blocks everything except proven performers at source level

export class RestrictedAssetFilter {
  // WHITELIST: Only these assets allowed - strict enforcement
  private static readonly ALLOWED_ASSETS = new Set([
    'NAS100', 'US30', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'
  ]);

  // PRIORITY ORDER: Scan in this exact order every cycle
  private static readonly PRIORITY_ORDER = [
    'NAS100', 'US30', 'USDJPY', 'GBPUSD', 'EURUSD', 'AUDUSD', 'USDCAD', 'NZDUSD'
  ];

  // Asset-specific price tolerance (pips/points)
  private static readonly PRICE_TOLERANCE = {
    'NAS100': 0.75,   // 0.75 points max deviation
    'US30': 1.2,      // 1.2 points max deviation  
    'EURUSD': 1.5,    // 1.5 pips max deviation
    'GBPUSD': 1.5,    // 1.5 pips max deviation
    'USDJPY': 1.5,    // 1.5 pips max deviation
    'AUDUSD': 1.5,    // 1.5 pips max deviation
    'USDCAD': 1.5,    // 1.5 pips max deviation
    'NZDUSD': 1.5     // 1.5 pips max deviation
  } as const;

  // Confidence thresholds per asset
  private static readonly CONFIDENCE_THRESHOLDS = {
    'NAS100': 80,     // NAS100/US30: ≥ 80 to publish
    'US30': 80,       
    'EURUSD': 85,     // EURUSD: ≥ 85 (noisy pair)
    'GBPUSD': 80,     // Other FX: ≥ 80
    'USDJPY': 80,
    'AUDUSD': 80,
    'USDCAD': 80,
    'NZDUSD': 80
  } as const;

  /**
   * Check if asset is allowed for trading signals
   */
  static isAssetAllowed(symbol: string): boolean {
    const normalized = symbol.toUpperCase();
    return this.ALLOWED_ASSETS.has(normalized);
  }

  /**
   * Get price tolerance for asset (in pips/points)
   */
  static getPriceTolerance(symbol: string): number {
    const normalized = symbol.toUpperCase() as keyof typeof this.PRICE_TOLERANCE;
    return this.PRICE_TOLERANCE[normalized] || 999; // Block unknown assets
  }

  /**
   * Get asset priority weight (0-1)
   */
  static getAssetWeight(symbol: string): number {
    const normalized = symbol.toUpperCase();
    const index = this.PRIORITY_ORDER.indexOf(normalized);
    return index >= 0 ? (this.PRIORITY_ORDER.length - index) / this.PRIORITY_ORDER.length : 0;
  }

  /**
   * Filter asset list to only allowed assets
   */
  static filterAllowedAssets(assets: string[]): string[] {
    return assets.filter(asset => this.isAssetAllowed(asset));
  }

  /**
   * Get all allowed assets sorted by priority (exact order as specified)
   */
  static getAllowedAssetsByPriority(): string[] {
    return this.PRIORITY_ORDER.filter(asset => this.ALLOWED_ASSETS.has(asset));
  }

  /**
   * Get confidence threshold for asset
   */
  static getConfidenceThreshold(symbol: string): number {
    const normalized = symbol.toUpperCase() as keyof typeof this.CONFIDENCE_THRESHOLDS;
    return this.CONFIDENCE_THRESHOLDS[normalized] || 999; // Block unknown assets
  }

  /**
   * Validate if asset can be traded in current session
   */
  static canTradeAssetInSession(symbol: string, session: 'London' | 'NewYork' | 'Asian'): boolean {
    if (!this.isAssetAllowed(symbol)) return false;

    const normalized = symbol.toUpperCase();
    
    // Session-specific asset availability
    switch (session) {
      case 'Asian':
        // Only USDJPY during Asian session
        return normalized === 'USDJPY';
        
      case 'London':
      case 'NewYork':
        // Indices only during NY session or London-NY overlap  
        if (normalized === 'NAS100' || normalized === 'US30') {
          return session === 'NewYork'; // Indices NY only
        }
        // FX pairs during London or NY
        return ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'].includes(normalized);
        
      default:
        return false;
    }
  }

  /**
   * Block signal if asset not in allowed list
   */
  static validateAssetForSignal(symbol: string): { allowed: boolean; reason?: string } {
    if (!this.isAssetAllowed(symbol)) {
      return {
        allowed: false,
        reason: `ASSET_BLOCKED: ${symbol} not in allowed list. Only trading: ${Array.from(this.ALLOWED_ASSETS).join(', ')}`
      };
    }

    return { allowed: true };
  }

  /**
   * Get asset classification
   */
  static getAssetClass(symbol: string): 'INDEX' | 'FX' | 'UNKNOWN' {
    const normalized = symbol.toUpperCase();
    
    if (['NAS100', 'US30'].includes(normalized)) return 'INDEX';
    if (['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD'].includes(normalized)) return 'FX';
    
    return 'UNKNOWN';
  }

  /**
   * Get recommended position size modifier based on asset
   */
  static getPositionSizeModifier(symbol: string): number {
    const assetClass = this.getAssetClass(symbol);
    const weight = this.getAssetWeight(symbol);
    
    // Indices can handle larger positions due to better R:R
    if (assetClass === 'INDEX') return Math.min(1.2 * weight, 1.0);
    
    // FX pairs get standard or reduced sizing
    return Math.max(0.8 * weight, 0.3);
  }
}