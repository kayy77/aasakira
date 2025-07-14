
interface WebhookPayload {
  symbol?: string;
  pair?: string;
  price?: number;
  change?: string;
  reason?: string;
  triggeredAt?: string;
  entry?: number;
  tp?: number;
  sl?: number;
  strategy?: string;
  status?: string;
  request?: string;
}

interface WebhookEndpoint {
  url: string;
  type: 'discord' | 'telegram' | 'zapier' | 'pipedream';
  active: boolean;
}

class WebhookService {
  private endpoints: WebhookEndpoint[] = [];
  private logs: Array<{ timestamp: string; endpoint: string; payload: any; status: 'success' | 'failed' }> = [];

  // Add webhook endpoint
  addEndpoint(url: string, type: WebhookEndpoint['type']): void {
    this.endpoints.push({ url, type, active: true });
    console.log(`📡 Added ${type} webhook endpoint: ${url}`);
  }

  // Remove webhook endpoint
  removeEndpoint(url: string): void {
    this.endpoints = this.endpoints.filter(endpoint => endpoint.url !== url);
    console.log(`🗑️ Removed webhook endpoint: ${url}`);
  }

  // Send webhook with retry logic
  private async sendWebhook(endpoint: WebhookEndpoint, payload: WebhookPayload): Promise<boolean> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`📤 Sending webhook to ${endpoint.type}: ${endpoint.url}`);
        
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'AI-Signals-Webhook/1.0'
          },
          body: JSON.stringify({
            ...payload,
            timestamp: new Date().toISOString(),
            source: 'ai-signals-platform'
          })
        });

        if (response.ok) {
          this.logs.push({
            timestamp: new Date().toISOString(),
            endpoint: endpoint.url,
            payload,
            status: 'success'
          });
          console.log(`✅ Webhook sent successfully to ${endpoint.type}`);
          return true;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        attempt++;
        console.log(`❌ Webhook attempt ${attempt} failed for ${endpoint.type}:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    this.logs.push({
      timestamp: new Date().toISOString(),
      endpoint: endpoint.url,
      payload,
      status: 'failed'
    });
    return false;
  }

  // Trigger signal alert webhook
  async triggerSignalAlert(signal: any): Promise<void> {
    const payload: WebhookPayload = {
      pair: signal.pair,
      entry: signal.entry,
      tp: signal.takeProfit,
      sl: signal.stopLoss,
      strategy: signal.strategy,
      status: 'Live signal generated',
      triggeredAt: new Date().toISOString()
    };

    console.log(`🎯 Triggering signal alert webhooks for ${signal.pair}`);
    
    const promises = this.endpoints
      .filter(endpoint => endpoint.active)
      .map(endpoint => this.sendWebhook(endpoint, payload));

    await Promise.allSettled(promises);
  }

  // Trigger price update webhook
  async triggerPriceUpdate(symbol: string, price: number, change: string): Promise<void> {
    const payload: WebhookPayload = {
      symbol,
      price,
      change,
      triggeredAt: new Date().toISOString()
    };

    console.log(`💰 Triggering price update webhooks for ${symbol}: ${price}`);
    
    const promises = this.endpoints
      .filter(endpoint => endpoint.active)
      .map(endpoint => this.sendWebhook(endpoint, payload));

    await Promise.allSettled(promises);
  }

  // Trigger AI analysis webhook
  async triggerAIAnalysis(analysisRequest: any): Promise<void> {
    const payload: WebhookPayload = {
      pair: analysisRequest.pair,
      entry: analysisRequest.entry,
      sl: analysisRequest.sl,
      tp: analysisRequest.tp,
      strategy: analysisRequest.strategy,
      request: analysisRequest.request,
      triggeredAt: new Date().toISOString()
    };

    console.log(`🧠 Triggering AI analysis webhooks for ${analysisRequest.pair}`);
    
    const promises = this.endpoints
      .filter(endpoint => endpoint.active)
      .map(endpoint => this.sendWebhook(endpoint, payload));

    await Promise.allSettled(promises);
  }

  // Trigger auto-refresh webhook
  async triggerAutoRefresh(symbol: string, reason: string): Promise<void> {
    const payload: WebhookPayload = {
      symbol,
      reason,
      triggeredAt: new Date().toISOString()
    };

    console.log(`🔄 Triggering auto-refresh webhooks for ${symbol}: ${reason}`);
    
    const promises = this.endpoints
      .filter(endpoint => endpoint.active)
      .map(endpoint => this.sendWebhook(endpoint, payload));

    await Promise.allSettled(promises);
  }

  // Get webhook logs
  getRecentLogs(limit: number = 50): Array<{ timestamp: string; endpoint: string; payload: any; status: 'success' | 'failed' }> {
    return this.logs.slice(-limit).reverse();
  }

  // Get active endpoints
  getEndpoints(): WebhookEndpoint[] {
    return this.endpoints.filter(endpoint => endpoint.active);
  }
}

export const webhookService = new WebhookService();
