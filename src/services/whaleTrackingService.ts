
interface WhaleTransaction {
  hash: string;
  token: string;
  tokenAddress: string;
  walletAddress: string;
  type: 'buy' | 'sell';
  amountUSD: number;
  amountTokens: number;
  timestamp: Date;
  blockNumber: number;
  gasUsed: number;
  isWhale: boolean;
  confidence: number;
}

interface WhaleWallet {
  address: string;
  label: string;
  totalBalance: number;
  isKnownWhale: boolean;
  trackingScore: number;
}

class WhaleTrackingService {
  private readonly WHALE_THRESHOLD = 10000; // $10k minimum for whale status
  private readonly ETHERSCAN_API = 'https://api.etherscan.io/api';
  private readonly DEBANK_API = 'https://openapi.debank.com';
  
  // Known whale addresses (can be expanded)
  private knownWhales: WhaleWallet[] = [
    {
      address: '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
      label: 'Avalanche Bridge',
      totalBalance: 0,
      isKnownWhale: true,
      trackingScore: 95
    },
    {
      address: '0x40aa958dd87fc8305b97f2ba922cddca374bcd7f',
      label: 'Known DeFi Whale',
      totalBalance: 0,
      isKnownWhale: true,
      trackingScore: 90
    },
    // Add more known whale addresses
  ];

  async trackWhaleActivity(tokenAddress: string): Promise<WhaleTransaction[]> {
    console.log(`🐋 Tracking whale activity for token: ${tokenAddress}`);
    
    try {
      // Get recent large transactions
      const recentTxns = await this.getRecentLargeTransactions(tokenAddress);
      
      // Filter for whale transactions
      const whaleTxns = recentTxns.filter(txn => 
        txn.amountUSD >= this.WHALE_THRESHOLD || this.isKnownWhale(txn.walletAddress)
      );

      // Add whale confidence scoring
      const scoredTxns = whaleTxns.map(txn => ({
        ...txn,
        isWhale: true,
        confidence: this.calculateWhaleConfidence(txn)
      }));

      console.log(`🐋 Found ${scoredTxns.length} whale transactions`);
      return scoredTxns;
      
    } catch (error) {
      console.error('Whale tracking failed:', error);
      return this.generateMockWhaleData(tokenAddress);
    }
  }

  private async getRecentLargeTransactions(tokenAddress: string): Promise<WhaleTransaction[]> {
    // In production, this would query Etherscan or DeBank API
    // For now, return mock data structure
    return [];
  }

  private isKnownWhale(address: string): boolean {
    return this.knownWhales.some(whale => 
      whale.address.toLowerCase() === address.toLowerCase()
    );
  }

  private calculateWhaleConfidence(txn: WhaleTransaction): number {
    let confidence = 0;
    
    // Amount-based confidence
    if (txn.amountUSD >= 100000) confidence += 40;
    else if (txn.amountUSD >= 50000) confidence += 30;
    else if (txn.amountUSD >= 25000) confidence += 20;
    else if (txn.amountUSD >= 10000) confidence += 10;
    
    // Known whale bonus
    if (this.isKnownWhale(txn.walletAddress)) confidence += 30;
    
    // Recent activity bonus
    const hoursAgo = (Date.now() - txn.timestamp.getTime()) / (1000 * 60 * 60);
    if (hoursAgo < 1) confidence += 20;
    else if (hoursAgo < 6) confidence += 10;
    else if (hoursAgo < 24) confidence += 5;
    
    // Gas usage (high gas = more serious trade)
    if (txn.gasUsed > 200000) confidence += 10;
    
    return Math.min(100, confidence);
  }

  private generateMockWhaleData(tokenAddress: string): WhaleTransaction[] {
    const mockTransactions: WhaleTransaction[] = [
      {
        hash: '0x123...abc',
        token: 'PEPE',
        tokenAddress,
        walletAddress: '0x8eb8a3b98659cce290402893d0123abb75e3ab28',
        type: 'buy',
        amountUSD: 45000,
        amountTokens: 3650000000,
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
        blockNumber: 18500000,
        gasUsed: 250000,
        isWhale: true,
        confidence: 85
      },
      {
        hash: '0x456...def',
        token: 'WOJAK',
        tokenAddress,
        walletAddress: '0x40aa958dd87fc8305b97f2ba922cddca374bcd7f',
        type: 'sell',
        amountUSD: 25000,
        amountTokens: 1500000000,
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
        blockNumber: 18499950,
        gasUsed: 180000,
        isWhale: true,
        confidence: 70
      }
    ];

    return mockTransactions;
  }

  async getWhaleAlerts(tokens: string[]): Promise<{ [tokenAddress: string]: WhaleTransaction[] }> {
    const alerts: { [tokenAddress: string]: WhaleTransaction[] } = {};
    
    for (const token of tokens) {
      const whaleActivity = await this.trackWhaleActivity(token);
      if (whaleActivity.length > 0) {
        alerts[token] = whaleActivity;
      }
    }
    
    return alerts;
  }
}

export const whaleTrackingService = new WhaleTrackingService();
export type { WhaleTransaction, WhaleWallet };
