// 🚨 MAIN SIGNAL ENGINE - Confluence + User Access Integration
// Routes through ConfluenceSignalEngine with user tier validation

import { confluenceSignalEngine, ConfluenceResult } from './core/ConfluenceSignalEngine';
import { userAccessController, AccessCheckResult } from './core/UserAccessController';
import { RestrictedAssetFilter } from './core/RestrictedAssetFilter';
import type { BaseSignal } from '@/types/signalTypes';

// New streamlined signal result interface
export interface EnhancedSignalResult {
  status: 'APPROVED' | 'REJECTED' | 'ACCESS_DENIED';
  signal?: any; // Formatted for user tier
  reason?: string;
  userTier: 'FREE' | 'PREMIUM';
  accessInfo: {
    remainingSignals: number;
    upgradeRequired: boolean;
    restrictedAssets?: string[];
  };
  sessionActive: string;
  scannedAssets: string[];
  engineStats: {
    filtersUsed: number;
    confluenceMethod: 'GROQ_VALIDATED';
    sessionRestriction: 'NY_LONDON_ONLY';
  };
}

/**
 * MAIN SIGNAL ENGINE CLASS - Integrates Confluence + User Access
 */
export class SignalEngine {
  private static instance: SignalEngine;

  static getInstance(): SignalEngine {
    if (!this.instance) {
      this.instance = new SignalEngine();
    }
    return this.instance;
  }

  /**
   * Generate signal with user access control and confluence validation
   */
  async generateSignal(userId: string = 'anonymous', isPremium: boolean = false): Promise<EnhancedSignalResult> {
    console.log(`🎯 SIGNAL ENGINE: Generating signal for ${isPremium ? 'PREMIUM' : 'FREE'} user ${userId}`);

    // 1. Check user access permissions
    const accessCheck = userAccessController.checkSignalAccess(userId, isPremium);
    if (!accessCheck.allowed) {
      return {
        status: 'ACCESS_DENIED',
        reason: accessCheck.reason,
        userTier: isPremium ? 'PREMIUM' : 'FREE',
        accessInfo: {
          remainingSignals: accessCheck.remainingSignals || 0,
          upgradeRequired: accessCheck.upgradeRequired || false,
          restrictedAssets: accessCheck.restrictedAssets
        },
        sessionActive: 'UNKNOWN',
        scannedAssets: [],
        engineStats: {
          filtersUsed: 6,
          confluenceMethod: 'GROQ_VALIDATED',
          sessionRestriction: 'NY_LONDON_ONLY'
        }
      };
    }

    // 2. Get user-filtered assets
    const allAssets = RestrictedAssetFilter.getAllowedAssetsByPriority();
    const userAssets = userAccessController.getFilteredAssetsForUser(allAssets, isPremium);
    
    console.log(`📊 User assets: ${userAssets.join(', ')}`);

    // 3. Generate confluence signal
    const confluenceResult = await confluenceSignalEngine.generateConfluenceSignal();
    
    // 4. Check if signal asset is allowed for user
    if (confluenceResult.status === 'APPROVED' && confluenceResult.signal) {
      const assetCheck = userAccessController.checkSignalAccess(userId, isPremium, confluenceResult.signal.symbol);
      if (!assetCheck.allowed) {
        return {
          status: 'ACCESS_DENIED',
          reason: assetCheck.reason,
          userTier: isPremium ? 'PREMIUM' : 'FREE',
          accessInfo: {
            remainingSignals: assetCheck.remainingSignals || 0,
            upgradeRequired: assetCheck.upgradeRequired || false,
            restrictedAssets: assetCheck.restrictedAssets
          },
          sessionActive: confluenceResult.sessionActive,
          scannedAssets: confluenceResult.scannedAssets,
          engineStats: {
            filtersUsed: 6,
            confluenceMethod: 'GROQ_VALIDATED',
            sessionRestriction: 'NY_LONDON_ONLY'
          }
        };
      }

      // 5. Record usage and format signal for user tier
      userAccessController.recordSignalUsage(userId);
      const formattedSignal = userAccessController.formatSignalForUser(confluenceResult.signal, isPremium);

      return {
        status: 'APPROVED',
        signal: formattedSignal,
        userTier: isPremium ? 'PREMIUM' : 'FREE',
        accessInfo: {
          remainingSignals: accessCheck.remainingSignals || 0,
          upgradeRequired: false
        },
        sessionActive: confluenceResult.sessionActive,
        scannedAssets: confluenceResult.scannedAssets,
        engineStats: {
          filtersUsed: confluenceResult.signal.filtersPassedCount || 6,
          confluenceMethod: 'GROQ_VALIDATED',
          sessionRestriction: 'NY_LONDON_ONLY'
        }
      };
    }

    // 6. Signal rejected by confluence engine
    return {
      status: 'REJECTED',
      reason: confluenceResult.rejectionReasons.join(' | '),
      userTier: isPremium ? 'PREMIUM' : 'FREE',
      accessInfo: {
        remainingSignals: accessCheck.remainingSignals || 0,
        upgradeRequired: false
      },
      sessionActive: confluenceResult.sessionActive,
      scannedAssets: confluenceResult.scannedAssets,
      engineStats: {
        filtersUsed: 6,
        confluenceMethod: 'GROQ_VALIDATED',
        sessionRestriction: 'NY_LONDON_ONLY'
      }
    };
  }

  /**
   * Get user access summary
   */
  getUserAccessSummary(userId: string, isPremium: boolean = false) {
    return userAccessController.getUserAccessSummary(userId, isPremium);
  }

  /**
   * Get engine configuration and status
   */
  getEngineStatus() {
    const confluenceStatus = confluenceSignalEngine.getEngineStatus();
    return {
      confluence: confluenceStatus,
      userTiers: {
        free: userAccessController.getUserTier(false),
        premium: userAccessController.getUserTier(true)
      },
      restrictions: {
        allowedAssets: RestrictedAssetFilter.getAllowedAssetsByPriority(),
        allowedSessions: ['London', 'NewYork'],
        filtersRequired: 4,
        groqValidation: true
      }
    };
  }
}

// Export singleton instance
export const signalEngine = SignalEngine.getInstance();

// Legacy compatibility exports (keep existing integrations working)
export const getSignal = (userId?: string, isPremium?: boolean) => 
  signalEngine.generateSignal(userId, isPremium);

export const getEngineStatus = () => signalEngine.getEngineStatus();
export const getUserAccessSummary = (userId: string, isPremium?: boolean) => 
  signalEngine.getUserAccessSummary(userId, isPremium);

// 🚨 IMPLEMENTATION COMPLETE 
// All legacy classes removed and replaced with new Confluence + User Access system
// The new system is now active and handles:
// ✅ 6-filter confluence validation
// ✅ Groq final verification  
// ✅ Free vs Premium user logic
// ✅ NY + London session restriction
// ✅ Multi-timeframe alignment
// ✅ Dynamic TP/SL with proper buffers
// ✅ Entry confirmation (wait for candle close)
// ✅ Asset restrictions (indices + major FX only)
