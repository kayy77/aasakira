// 🚨 RESTRICTED ASSET FILTER - Only High-Conviction Assets
// Blocks everything except proven performers at source level

export class RestrictedAssetFilter {
  // ONLY these assets are allowed - everything else blocked
  private static readonly ALLOWED_ASSETS = new Set([
    // Indices (Primary performers)
    'NAS100',  // NASDAQ - clean momentum moves
    'US30',    // Dow Jones - institutional favorite
    
    // Metals (High-conviction asset)
    'XAUUSD',  // Gold - institutional favorite
    
    // FX Majors (Liquid but selective) 
    'EURUSD',  // Most liquid
    'GBPUSD'   // Volatile but tradeable
  ]);

  // Asset-specific tolerance gates (pips/points)
  private static readonly PRICE_TOLERANCE = {
    // Indices - tighter tolerance due to higher value per point
    'NAS100': 0.75,  // 0.75 points max deviation
    'US30': 1.2,     // 1.2 points max deviation
    
    // Metals - tight tolerance for gold
    'XAUUSD': 0.8,   // 0.8 dollars max deviation
    
    // FX Majors - pip-based tolerance
    'EURUSD': 1.5,   // 1.5 pips max
    'GBPUSD': 1.5    // 1.5 pips max
  } as const;

  // Asset priority weights (indices prioritized)
  private static readonly ASSET_WEIGHTS = {
    // Indices get highest priority
    'NAS100': 1.0,
    'US30': 0.95,
    
    // Metals - high priority
    'XAUUSD': 0.9,
    
    // Major FX pairs - lower priority
    'EURUSD': 0.6,
    'GBPUSD': 0.65
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
        // Limited to indices during Asian session
        return ['NAS100'].includes(normalized);
        
      case 'London':
        // European pairs, gold and indices
        return ['EURUSD', 'GBPUSD', 'XAUUSD', 'US30', 'NAS100'].includes(normalized);
        
      case 'NewYork':
        // All assets tradeable, but indices + gold prioritized
        return true;
        
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
    
    if (['NAS100', 'US30'].includes(normalized)) return 'INDEX';
    if (['XAUUSD'].includes(normalized)) return 'METAL';
    if (['EURUSD', 'GBPUSD'].includes(normalized)) return 'FX';
    
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