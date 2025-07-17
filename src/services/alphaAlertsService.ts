import { whaleTrackingService, WhaleTransaction } from './whaleTrackingService';
import { tokenHealthService, HealthScore } from './tokenHealthService';

interface AlphaAlert {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  alertType: 'volume_spike' | 'whale_buy' | 'stealth_launch' | 'liquidity_event' | 'social_buzz';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  data: any;
  triggered: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  condition: (data: any) => boolean;
  priority: AlphaAlert['priority'];
  alertType: AlphaAlert['alertType'];
  messageTemplate: (data: any) => { title: string; message: string };
}

class AlphaAlertsService {
  private alertRules: AlertRule[] = [
    {
      id: 'volume_spike',
      name: 'Volume Spike Alert',
      condition: (data) => data.volumeChange >= 300 && data.timeframe <= 10,
      priority: 'high',
      alertType: 'volume_spike',
      messageTemplate: (data) => ({
        title: `🚀 Volume Spike: ${data.symbol}`,
        message: `${data.symbol} volume increased ${data.volumeChange}% in ${data.timeframe} minutes!`
      })
    },
    {
      id: 'whale_buy',
      name: 'Whale Purchase Alert',
      condition: (data) => data.whaleTransactions?.some((tx: WhaleTransaction) => 
        tx.type === 'buy' && tx.amountUSD >= 25000 && tx.confidence >= 70
      ),
      priority: 'critical',
      alertType: 'whale_buy',
      messageTemplate: (data) => {
        const biggestBuy = data.whaleTransactions
          ?.filter((tx: WhaleTransaction) => tx.type === 'buy')
          ?.sort((a: WhaleTransaction, b: WhaleTransaction) => b.amountUSD - a.amountUSD)[0];
        return {
          title: `🐋 Whale Alert: ${data.symbol}`,
          message: `Whale bought $${biggestBuy?.amountUSD.toLocaleString()} worth of ${data.symbol}!`
        };
      }
    },
    {
      id: 'stealth_launch',
      name: 'Stealth Launch Detection',
      condition: (data) => 
        data.age < 1 && 
        data.liquidity > 20000 && 
        data.holders < 100 && 
        data.socialMentions < 10,
      priority: 'critical',
      alertType: 'stealth_launch',
      messageTemplate: (data) => ({
        title: `🔕 Stealth Launch: ${data.symbol}`,
        message: `New token ${data.symbol} launched quietly with $${data.liquidity.toLocaleString()} liquidity!`
      })
    },
    {
      id: 'perfect_setup',
      name: 'Perfect Alpha Setup',
      condition: (data) => 
        data.healthScore >= 75 && 
        data.lpLocked && 
        data.whaleActivity > 0 && 
        data.age < 12,
      priority: 'critical',
      alertType: 'liquidity_event',
      messageTemplate: (data) => ({
        title: `⭐ Alpha Setup: ${data.symbol}`,
        message: `${data.symbol} - LP locked, health score ${data.healthScore}, recent whale activity!`
      })
    }
  ];

  private activeAlerts: AlphaAlert[] = [];

  async scanForAlerts(tokens: any[]): Promise<AlphaAlert[]> {
    const newAlerts: AlphaAlert[] = [];
    
    console.log(`🔍 Scanning ${tokens.length} tokens for alpha alerts...`);

    for (const token of tokens) {
      try {
        // Get whale activity
        const whaleTransactions = await whaleTrackingService.trackWhaleActivity(token.address);
        
        // Get health metrics
        const healthMetrics = tokenHealthService.generateMockHealthMetrics();
        const healthScore = tokenHealthService.calculateHealthScore(healthMetrics);
        
        // Prepare data for rule evaluation
        const alertData = {
          symbol: token.symbol,
          address: token.address,
          price: token.price,
          volumeChange: this.calculateVolumeChange(token),
          timeframe: 10, // minutes
          whaleTransactions,
          age: token.pairAge,
          liquidity: token.liquidity,
          holders: token.holders || Math.floor(Math.random() * 1000),
          socialMentions: Math.floor(Math.random() * 100),
          healthScore: healthScore.overall,
          lpLocked: healthScore.breakdown.security > 70,
          whaleActivity: whaleTransactions.length
        };

        // Check each rule
        for (const rule of this.alertRules) {
          if (rule.condition(alertData)) {
            const { title, message } = rule.messageTemplate(alertData);
            
            const alert: AlphaAlert = {
              id: `${rule.id}_${token.address}_${Date.now()}`,
              tokenAddress: token.address,
              tokenSymbol: token.symbol,
              alertType: rule.alertType,
              priority: rule.priority,
              title,
              message,
              timestamp: new Date(),
              data: alertData,
              triggered: true
            };

            newAlerts.push(alert);
            console.log(`🚨 Alert triggered: ${title}`);
          }
        }
      } catch (error) {
        console.error(`Error scanning token ${token.symbol}:`, error);
      }
    }

    // Add to active alerts
    this.activeAlerts.push(...newAlerts);
    
    // Keep only recent alerts (last 24 hours)
    this.activeAlerts = this.activeAlerts.filter(
      alert => Date.now() - alert.timestamp.getTime() < 24 * 60 * 60 * 1000
    );

    console.log(`🚨 Generated ${newAlerts.length} new alerts`);
    return newAlerts;
  }

  private calculateVolumeChange(token: any): number {
    // Mock volume change calculation
    // In real implementation, compare current vs previous period
    return 150 + Math.random() * 300; // 150-450% change
  }

  getActiveAlerts(): AlphaAlert[] {
    return this.activeAlerts.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  getCriticalAlerts(): AlphaAlert[] {
    return this.activeAlerts.filter(alert => alert.priority === 'critical');
  }

  getAlertsByType(type: AlphaAlert['alertType']): AlphaAlert[] {
    return this.activeAlerts.filter(alert => alert.alertType === type);
  }

  dismissAlert(alertId: string): void {
    this.activeAlerts = this.activeAlerts.filter(alert => alert.id !== alertId);
  }

  // Send alerts (in production, integrate with email/Telegram/push notifications)
  async sendAlert(alert: AlphaAlert): Promise<void> {
    console.log(`📧 Sending ${alert.priority} alert:`, alert.title);
    
    // Mock notification sending
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.message,
          icon: '/favicon.ico'
        });
      }
    }
  }
}

export const alphaAlertsService = new AlphaAlertsService();
export type { AlphaAlert, AlertRule };
