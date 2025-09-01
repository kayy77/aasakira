// 🚨 RESTRICTED ASSET FILTER - Only High-Conviction Assets
// Blocks everything except proven performers at source level

export class RestrictedAssetFilter {
  // ONLY these assets are allowed - everything else blocked
  // NASDAQ prioritized, others only if NASDAQ has no opportunity
  private static readonly ALLOWED_ASSETS = new Set([
    'NASDAQ'   // Primary focus - NASDAQ only for now
  ]);

  // Asset-specific tolerance gates (pips/points)
  private static readonly PRICE_TOLERANCE = {
    'NASDAQ': 0.75  // 0.75 points max deviation for NASDAQ
  } as const;

  // Asset priority weights - NASDAQ only for now
  private static readonly ASSET_WEIGHTS = {
    'NASDAQ': 1.0  // Maximum priority
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
    const normalized = symbol.toUpperCase() as keyof typeof this.ASSET_WEIGHTS;
    return this.ASSET_WEIGHTS[normalized] || 0; // Block unknown assets
  }

  /**
   * Filter asset list to only allowed assets
   */
  static filterAllowedAssets(assets: string[]): string[] {
    return assets.filter(asset => this.isAssetAllowed(asset));
  }

  /**
   * Get all allowed assets sorted by priority
   */
  static getAllowedAssetsByPriority(): string[] {
    return Array.from(this.ALLOWED_ASSETS)
      .sort((a, b) => this.getAssetWeight(b) - this.getAssetWeight(a));
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
        // No trading during Asian session
        return false;
        
      case 'London':
      case 'NewYork':
        // NASDAQ only during main sessions
        return normalized === 'NASDAQ';
        
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
  static getAssetClass(symbol: string): 'INDEX' | 'FX' | 'METAL' | 'UNKNOWN' {
    const normalized = symbol.toUpperCase();
    
    if (normalized === 'NASDAQ') return 'INDEX';
    
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
    
    // Metals get full sizing
    if (assetClass === 'METAL') return Math.min(1.1 * weight, 1.0);
    
    // FX pairs get standard or reduced sizing
    return Math.max(0.8 * weight, 0.3);
  }
}