// 🔒 USER ACCESS CONTROLLER - Free vs Premium Logic
// Implements usage limits and asset restrictions per user tier

export interface UserTier {
  tier: 'FREE' | 'PREMIUM';
  dailySignalLimit: number;
  allowedAssets: string[];
  features: {
    groqReasoning: boolean;
    allAssets: boolean;
    unlimitedSignals: boolean;
    priorityExecution: boolean;
  };
}

export interface UserUsage {
  signalsToday: number;
  lastSignalTime: number;
  resetTime: number; // Next 24h reset
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  remainingSignals?: number;
  upgradeRequired?: boolean;
  restrictedAssets?: string[];
}

export class UserAccessController {
  private static instance: UserAccessController;
  private userUsageMap = new Map<string, UserUsage>();

  static getInstance(): UserAccessController {
    if (!this.instance) {
      this.instance = new UserAccessController();
    }
    return this.instance;
  }

  /**
   * Get user tier configuration
   */
  getUserTier(isPremium: boolean = false): UserTier {
    if (isPremium) {
      return {
        tier: 'PREMIUM',
        dailySignalLimit: -1, // Unlimited
        allowedAssets: [
          'NAS100', 'US30', // All indices
          'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD' // All FX majors
        ],
        features: {
          groqReasoning: true,
          allAssets: true,
          unlimitedSignals: true,
          priorityExecution: true
        }
      };
    }

    return {
      tier: 'FREE',
      dailySignalLimit: 1, // 1 signal per 24h
      allowedAssets: ['EURUSD', 'GBPUSD'], // Major FX only
      features: {
        groqReasoning: false,
        allAssets: false,
        unlimitedSignals: false,
        priorityExecution: false
      }
    };
  }

  /**
   * Check if user can receive a signal
   */
  checkSignalAccess(userId: string, isPremium: boolean = false, requestedAsset?: string): AccessCheckResult {
    const userTier = this.getUserTier(isPremium);
    const usage = this.getUserUsage(userId);

    // Check daily limit for free users
    if (userTier.tier === 'FREE') {
      if (usage.signalsToday >= userTier.dailySignalLimit) {
        const hoursUntilReset = Math.ceil((usage.resetTime - Date.now()) / (1000 * 60 * 60));
        return {
          allowed: false,
          reason: `DAILY_LIMIT_REACHED: ${usage.signalsToday}/${userTier.dailySignalLimit} signals used. Reset in ${hoursUntilReset}h`,
          remainingSignals: 0,
          upgradeRequired: true
        };
      }

      // Check asset restrictions for free users
      if (requestedAsset && !userTier.allowedAssets.includes(requestedAsset.toUpperCase())) {
        return {
          allowed: false,
          reason: `ASSET_RESTRICTED: ${requestedAsset} requires Premium. Free users limited to: ${userTier.allowedAssets.join(', ')}`,
          upgradeRequired: true,
          restrictedAssets: userTier.allowedAssets
        };
      }

      return {
        allowed: true,
        remainingSignals: userTier.dailySignalLimit - usage.signalsToday
      };
    }

    // Premium users have unlimited access
    return {
      allowed: true,
      remainingSignals: -1 // Unlimited
    };
  }

  /**
   * Record signal usage for user
   */
  recordSignalUsage(userId: string): void {
    const usage = this.getUserUsage(userId);
    usage.signalsToday += 1;
    usage.lastSignalTime = Date.now();
    this.userUsageMap.set(userId, usage);
  }

  /**
   * Get user's current usage stats
   */
  getUserUsage(userId: string): UserUsage {
    const now = Date.now();
    let usage = this.userUsageMap.get(userId);

    // Initialize or reset if 24h passed
    if (!usage || now >= usage.resetTime) {
      usage = {
        signalsToday: 0,
        lastSignalTime: 0,
        resetTime: now + (24 * 60 * 60 * 1000) // 24h from now
      };
      this.userUsageMap.set(userId, usage);
    }

    return usage;
  }

  /**
   * Get filtered assets for user tier
   */
  getFilteredAssetsForUser(allAssets: string[], isPremium: boolean = false): string[] {
    const userTier = this.getUserTier(isPremium);
    
    if (userTier.features.allAssets) {
      return allAssets; // Premium gets all assets
    }

    // Free users get restricted assets only
    return allAssets.filter(asset => 
      userTier.allowedAssets.includes(asset.toUpperCase())
    );
  }

  /**
   * Format signal output based on user tier
   */
  formatSignalForUser(signal: any, isPremium: boolean = false): any {
    const userTier = this.getUserTier(isPremium);

    // Base signal structure
    const formattedSignal = {
      pair: signal.symbol,
      direction: signal.direction,
      entry: signal.entry,
      stopLoss: signal.stopLoss,
      tp1: signal.dynamicLevels?.tp1 || signal.takeProfit,
      tp2: signal.dynamicLevels?.tp2 || signal.takeProfit,
      confidence: signal.signalGrade || (signal.filtersPassedCount >= 5 ? 'STRONG' : 'WEAK'),
      timeframe: signal.timeframe || '15M'
    };

    // Add premium features if user has access
    if (userTier.features.groqReasoning && signal.groqValidation) {
      (formattedSignal as any).groqReasoning = signal.groqValidation.reasoning;
      (formattedSignal as any).groqConfidence = signal.groqValidation.confidence;
    }

    // Add confluence breakdown for premium users
    if (userTier.tier === 'PREMIUM' && signal.confluenceFilters) {
      (formattedSignal as any).confluenceBreakdown = signal.confluenceFilters;
      (formattedSignal as any).filtersPassedCount = signal.filtersPassedCount;
    }

    return formattedSignal;
  }

  /**
   * Get user access summary
   */
  getUserAccessSummary(userId: string, isPremium: boolean = false) {
    const userTier = this.getUserTier(isPremium);
    const usage = this.getUserUsage(userId);

    return {
      tier: userTier.tier,
      dailyLimit: userTier.dailySignalLimit,
      used: usage.signalsToday,
      remaining: userTier.dailySignalLimit === -1 ? -1 : userTier.dailySignalLimit - usage.signalsToday,
      resetTime: new Date(usage.resetTime).toISOString(),
      allowedAssets: userTier.allowedAssets,
      features: userTier.features,
      upgradeRequired: userTier.tier === 'FREE' && usage.signalsToday >= userTier.dailySignalLimit
    };
  }

  /**
   * Clear user usage (for testing or admin functions)
   */
  clearUserUsage(userId: string): void {
    this.userUsageMap.delete(userId);
  }

  /**
   * Get all user stats (admin function)
   */
  getAllUserStats(): Array<{userId: string; usage: UserUsage}> {
    return Array.from(this.userUsageMap.entries()).map(([userId, usage]) => ({
      userId,
      usage
    }));
  }
}

export const userAccessController = UserAccessController.getInstance();