// Risk Management Engine - Prevents account-blowing trades like the -$7k EURUSD disaster
// NO MORE 20 LOT POSITIONS OR 7% RISK PER TRADE

export interface RiskLimits {
  maxRiskPerTrade: number; // Max % of account per trade (e.g., 1.5%)
  maxRiskPerPair: number; // Max % of account exposed to one pair (e.g., 3%)
  maxDailyRisk: number; // Max % of account risk per day (e.g., 5%)
  maxConsecutiveLosses: number; // Stop trading after X losses (e.g., 3)
  maxPositionSize: number; // Max lot size regardless of account size
}

export interface TradeRisk {
  pair: string;
  entryPrice: number;
  stopLoss: number;
  lotSize: number;
  riskAmount: number; // Dollar amount at risk
  riskPercentage: number; // % of account at risk
  timestamp: Date;
}

export interface RiskAssessment {
  approved: boolean;
  recommendedLotSize: number;
  riskReason: string;
  currentExposure: {
    pairRisk: number; // Current % risk on this pair
    dailyRisk: number; // Current % risk today
    consecutiveLosses: number;
  };
  violations: string[];
}

export class RiskManagementEngine {
  
  // 🔑 CONSERVATIVE RISK LIMITS - No more gambling
  private static readonly RISK_LIMITS: RiskLimits = {
    maxRiskPerTrade: 1.5, // Max 1.5% per trade (instead of 7%!)
    maxRiskPerPair: 3.0, // Max 3% total exposure per pair
    maxDailyRisk: 5.0, // Max 5% risk in one day
    maxConsecutiveLosses: 3, // Stop after 3 losses
    maxPositionSize: 2.0 // Max 2 lots regardless of anything
  };

  // Track all active trades and daily risks
  private static activeTrades: Map<string, TradeRisk[]> = new Map();
  private static dailyRisks: { date: string; totalRisk: number; trades: TradeRisk[] }[] = [];
  private static consecutiveLosses: number = 0;
  private static accountBalance: number = 50000; // Default account size

  // 🔑 MAIN FUNCTION - Evaluate if trade passes risk management
  static evaluateTradeRisk(
    pair: string,
    entryPrice: number,
    stopLoss: number,
    proposedLotSize: number,
    accountBalance?: number
  ): RiskAssessment {
    
    if (accountBalance) this.accountBalance = accountBalance;
    
    console.log(`🛡️ RISK MANAGEMENT: Evaluating ${pair} trade...`);
    
    const violations: string[] = [];
    let approved = true;
    
    // Calculate risk metrics
    const pipsAtRisk = Math.abs(entryPrice - stopLoss) * (pair.includes('JPY') ? 100 : 10000);
    const dollarRisk = pipsAtRisk * proposedLotSize * (pair.includes('JPY') ? 10 : 1);
    const riskPercentage = (dollarRisk / this.accountBalance) * 100;
    
    // 1. CHECK CONSECUTIVE LOSSES
    if (this.consecutiveLosses >= this.RISK_LIMITS.maxConsecutiveLosses) {
      violations.push(`🛑 TRADING SUSPENDED: ${this.consecutiveLosses} consecutive losses`);
      approved = false;
    }
    
    // 2. CHECK POSITION SIZE LIMIT
    if (proposedLotSize > this.RISK_LIMITS.maxPositionSize) {
      violations.push(`📏 Position too large: ${proposedLotSize} lots > ${this.RISK_LIMITS.maxPositionSize} max`);
      proposedLotSize = this.RISK_LIMITS.maxPositionSize;
    }
    
    // 3. CHECK RISK PER TRADE
    if (riskPercentage > this.RISK_LIMITS.maxRiskPerTrade) {
      violations.push(`⚠️ Risk too high: ${riskPercentage.toFixed(2)}% > ${this.RISK_LIMITS.maxRiskPerTrade}% max`);
      approved = false;
    }
    
    // 4. CHECK PAIR EXPOSURE
    const currentPairRisk = this.getCurrentPairRisk(pair);
    const totalPairRisk = currentPairRisk + riskPercentage;
    if (totalPairRisk > this.RISK_LIMITS.maxRiskPerPair) {
      violations.push(`🚫 Pair overexposure: ${totalPairRisk.toFixed(2)}% > ${this.RISK_LIMITS.maxRiskPerPair}% max on ${pair}`);
      approved = false;
    }
    
    // 5. CHECK DAILY RISK
    const currentDailyRisk = this.getCurrentDailyRisk();
    const totalDailyRisk = currentDailyRisk + riskPercentage;
    if (totalDailyRisk > this.RISK_LIMITS.maxDailyRisk) {
      violations.push(`📅 Daily risk limit: ${totalDailyRisk.toFixed(2)}% > ${this.RISK_LIMITS.maxDailyRisk}% max`);
      approved = false;
    }
    
    // Calculate safe lot size if violations exist
    let recommendedLotSize = proposedLotSize;
    if (!approved && riskPercentage > this.RISK_LIMITS.maxRiskPerTrade) {
      const maxDollarRisk = (this.RISK_LIMITS.maxRiskPerTrade / 100) * this.accountBalance;
      recommendedLotSize = Math.min(this.RISK_LIMITS.maxPositionSize, maxDollarRisk / pipsAtRisk);
      recommendedLotSize = Math.max(0.01, Math.floor(recommendedLotSize * 100) / 100); // Round down to 0.01
    }
    
    const riskReason = approved 
      ? `✅ Trade approved: ${riskPercentage.toFixed(2)}% risk within limits`
      : `❌ Trade rejected: Risk management violations`;
    
    console.log(`🛡️ ${pair} Risk Assessment: ${approved ? 'APPROVED' : 'REJECTED'}`);
    console.log(`   Proposed: ${proposedLotSize} lots (${riskPercentage.toFixed(2)}% risk)`);
    console.log(`   Recommended: ${recommendedLotSize} lots`);
    
    return {
      approved,
      recommendedLotSize,
      riskReason,
      currentExposure: {
        pairRisk: currentPairRisk,
        dailyRisk: currentDailyRisk,
        consecutiveLosses: this.consecutiveLosses
      },
      violations
    };
  }
  
  // 🔑 RECORD TRADE - Track for ongoing risk management
  static recordTrade(trade: TradeRisk): void {
    const pairTrades = this.activeTrades.get(trade.pair) || [];
    pairTrades.push(trade);
    this.activeTrades.set(trade.pair, pairTrades);
    
    // Add to daily risk tracking
    const today = new Date().toISOString().split('T')[0];
    let todayRisk = this.dailyRisks.find(d => d.date === today);
    if (!todayRisk) {
      todayRisk = { date: today, totalRisk: 0, trades: [] };
      this.dailyRisks.push(todayRisk);
    }
    todayRisk.trades.push(trade);
    todayRisk.totalRisk += trade.riskPercentage;
    
    console.log(`📝 Trade recorded: ${trade.pair} ${trade.lotSize} lots (${trade.riskPercentage.toFixed(2)}% risk)`);
  }
  
  // 🔑 UPDATE TRADE RESULT - Track wins/losses for consecutive loss tracking
  static updateTradeResult(pair: string, entryPrice: number, wasWinner: boolean): void {
    if (wasWinner) {
      this.consecutiveLosses = 0;
      console.log(`✅ ${pair} WIN - Consecutive losses reset to 0`);
    } else {
      this.consecutiveLosses++;
      console.log(`❌ ${pair} LOSS - Consecutive losses: ${this.consecutiveLosses}`);
      
      if (this.consecutiveLosses >= this.RISK_LIMITS.maxConsecutiveLosses) {
        console.log(`🛑 TRADING SUSPENDED after ${this.consecutiveLosses} consecutive losses`);
      }
    }
    
    // Remove from active trades
    const pairTrades = this.activeTrades.get(pair) || [];
    const updatedTrades = pairTrades.filter(t => t.entryPrice !== entryPrice);
    if (updatedTrades.length === 0) {
      this.activeTrades.delete(pair);
    } else {
      this.activeTrades.set(pair, updatedTrades);
    }
  }
  
  // Get current risk exposure for a pair
  private static getCurrentPairRisk(pair: string): number {
    const pairTrades = this.activeTrades.get(pair) || [];
    return pairTrades.reduce((total, trade) => total + trade.riskPercentage, 0);
  }
  
  // Get current daily risk exposure
  private static getCurrentDailyRisk(): number {
    const today = new Date().toISOString().split('T')[0];
    const todayRisk = this.dailyRisks.find(d => d.date === today);
    return todayRisk?.totalRisk || 0;
  }
  
  // 🔑 GET RISK DASHBOARD - For monitoring
  static getRiskDashboard(): {
    consecutiveLosses: number;
    dailyRisk: number;
    pairExposures: { pair: string; risk: number }[];
    tradingStatus: 'ACTIVE' | 'SUSPENDED';
    riskLimits: RiskLimits;
  } {
    const pairExposures = Array.from(this.activeTrades.entries()).map(([pair, trades]) => ({
      pair,
      risk: trades.reduce((total, trade) => total + trade.riskPercentage, 0)
    }));
    
    const tradingStatus = this.consecutiveLosses >= this.RISK_LIMITS.maxConsecutiveLosses ? 'SUSPENDED' : 'ACTIVE';
    
    return {
      consecutiveLosses: this.consecutiveLosses,
      dailyRisk: this.getCurrentDailyRisk(),
      pairExposures,
      tradingStatus,
      riskLimits: this.RISK_LIMITS
    };
  }
  
  // Force reset consecutive losses (for testing or manual override)
  static resetConsecutiveLosses(): void {
    this.consecutiveLosses = 0;
    console.log(`🔄 Consecutive losses manually reset to 0`);
  }
}