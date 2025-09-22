
export interface EconomicEvent {
  event: string;
  country: string;
  impact: 'Low' | 'Medium' | 'High';
  actual?: string;
  forecast?: string;
  previous?: string;
  time: string;
  currency: string;
  relevance: number;
}

export interface NewsImpact {
  hasImpact: boolean;
  impactLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  economicEvents: EconomicEvent[];
  recommendation: 'Proceed' | 'Caution' | 'Delay' | 'Cancel';
  volatilityWarning?: string;
  nextEvents?: EconomicEvent[];
}

class NewsImpactAnalyzer {
  private readonly FCS_API_KEY = 'y4xERka7Pi3Flz3a87NnA';
  private readonly FINNHUB_API_KEY = 'ctm2i11r01qnrp1m8pf0ctm2i11r01qnrp1m8pfg';

  async analyzeNewsImpact(pair: string): Promise<NewsImpact> {
    console.log(`📊 Analyzing economic calendar impact for ${pair}...`);
    
    try {
      const baseCurrency = pair.substring(0, 3);
      const quoteCurrency = pair.substring(3, 6);
      
      // Fetch economic events from multiple sources
      const [fcsEvents, finnhubEvents, fmpEvents] = await Promise.all([
        this.fetchFCSEvents(),
        this.fetchFinnhubEvents(),
        this.fetchFMPEvents()
      ]);

      // Combine and deduplicate events
      const allEvents = [...fcsEvents, ...finnhubEvents, ...fmpEvents];
      const relevantEvents = this.filterRelevantEvents(allEvents, baseCurrency, quoteCurrency);

      if (relevantEvents.length === 0) {
        return {
          hasImpact: false,
          impactLevel: 'Low',
          economicEvents: [],
          recommendation: 'Proceed'
        };
      }

      const impactLevel = this.calculateEconomicImpact(relevantEvents);
      const recommendation = this.getRecommendation(impactLevel);
      const volatilityWarning = this.generateVolatilityWarning(impactLevel, relevantEvents);
      const nextEvents = this.getUpcomingEvents(allEvents, baseCurrency, quoteCurrency);

      console.log(`📊 Economic analysis complete: ${impactLevel} impact level`);

      return {
        hasImpact: true,
        impactLevel,
        economicEvents: relevantEvents,
        recommendation,
        volatilityWarning,
        nextEvents
      };

    } catch (error) {
      console.error('❌ Economic analysis failed:', error);
      return {
        hasImpact: false,
        impactLevel: 'Low',
        economicEvents: [],
        recommendation: 'Proceed'
      };
    }
  }

  private async fetchFCSEvents(): Promise<EconomicEvent[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `https://fcsapi.com/api-v3/forex/economy?country=us,gb,eu,jp,au,ca&access_key=${this.FCS_API_KEY}`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) return [];

      const data = await response.json();
      
      return (data.response || []).map((event: any) => ({
        event: event.event,
        country: this.getCountryCode(event.country),
        impact: this.mapFCSImpact(event.impact),
        actual: event.actual,
        forecast: event.forecast,
        previous: event.previous,
        time: event.date,
        currency: this.getCurrencyFromCountry(event.country),
        relevance: this.calculateEventRelevance(event)
      }));

    } catch (error) {
      console.error('FCS API failed:', error);
      return [];
    }
  }

  private async fetchFinnhubEvents(): Promise<EconomicEvent[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `https://finnhub.io/api/v1/calendar/economic?from=${today}&to=${today}&token=${this.FINNHUB_API_KEY}`
      );

      if (!response.ok) return [];

      const data = await response.json();
      
      return (data.economicCalendar || []).map((event: any) => ({
        event: event.event,
        country: event.country,
        impact: this.mapFinnhubImpact(event.importance),
        actual: event.actual?.toString(),
        forecast: event.forecast?.toString(),
        previous: event.previous?.toString(),
        time: event.time,
        currency: this.getCurrencyFromCountry(event.country),
        relevance: this.calculateEventRelevance(event)
      }));

    } catch (error) {
      console.error('Finnhub API failed:', error);
      return [];
    }
  }

  private async fetchFMPEvents(): Promise<EconomicEvent[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      // Using demo key - would need actual FMP key for production
      const response = await fetch(
        `https://financialmodelingprep.com/api/v3/economic_calendar?from=${today}&to=${today}&apikey=demo`
      );

      if (!response.ok) return [];

      const data = await response.json();
      
      return (data || []).map((event: any) => ({
        event: event.event,
        country: event.country,
        impact: this.mapFMPImpact(event.impact),
        actual: event.actual,
        forecast: event.forecast,
        previous: event.previous,
        time: event.date,
        currency: this.getCurrencyFromCountry(event.country),
        relevance: this.calculateEventRelevance(event)
      }));

    } catch (error) {
      console.error('FMP API failed:', error);
      return [];
    }
  }

  private filterRelevantEvents(events: EconomicEvent[], baseCurrency: string, quoteCurrency: string): EconomicEvent[] {
    const targetCurrencies = [baseCurrency, quoteCurrency];
    
    return events
      .filter(event => targetCurrencies.includes(event.currency))
      .sort((a, b) => {
        // Sort by impact (High > Medium > Low) then by relevance
        const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
        if (impactDiff !== 0) return impactDiff;
        return b.relevance - a.relevance;
      })
      .slice(0, 10); // Limit to top 10 most relevant events
  }

  private getUpcomingEvents(events: EconomicEvent[], baseCurrency: string, quoteCurrency: string): EconomicEvent[] {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const targetCurrencies = [baseCurrency, quoteCurrency];
    
    return events
      .filter(event => {
        const eventTime = new Date(event.time);
        return eventTime > now && eventTime <= next24Hours && targetCurrencies.includes(event.currency);
      })
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .slice(0, 5);
  }

  private calculateEconomicImpact(events: EconomicEvent[]): 'Low' | 'Medium' | 'High' | 'Critical' {
    const highImpactEvents = events.filter(e => e.impact === 'High').length;
    const mediumImpactEvents = events.filter(e => e.impact === 'Medium').length;
    const avgRelevance = events.reduce((sum, e) => sum + e.relevance, 0) / events.length;
    
    if (highImpactEvents >= 3 || avgRelevance > 0.9) return 'Critical';
    if (highImpactEvents >= 2 || (highImpactEvents >= 1 && mediumImpactEvents >= 2)) return 'High';
    if (highImpactEvents >= 1 || mediumImpactEvents >= 2) return 'Medium';
    return 'Low';
  }

  private calculateEventRelevance(event: any): number {
    const highImpactKeywords = ['nfp', 'payroll', 'cpi', 'inflation', 'fomc', 'gdp', 'interest', 'unemployment'];
    const eventName = (event.event || '').toLowerCase();
    
    let relevance = 0.5; // Base relevance
    
    // High impact economic indicators
    if (highImpactKeywords.some(keyword => eventName.includes(keyword))) {
      relevance += 0.4;
    }
    
    // Has actual vs forecast data
    if (event.actual !== undefined && event.forecast !== undefined) {
      relevance += 0.1;
    }
    
    return Math.min(1, relevance);
  }

  private mapFCSImpact(impact: string): 'Low' | 'Medium' | 'High' {
    const normalized = (impact || '').toLowerCase();
    if (normalized.includes('high') || normalized.includes('3')) return 'High';
    if (normalized.includes('medium') || normalized.includes('2')) return 'Medium';
    return 'Low';
  }

  private mapFinnhubImpact(importance: number): 'Low' | 'Medium' | 'High' {
    if (importance >= 3) return 'High';
    if (importance >= 2) return 'Medium';
    return 'Low';
  }

  private mapFMPImpact(impact: string): 'Low' | 'Medium' | 'High' {
    const normalized = (impact || '').toLowerCase();
    if (normalized.includes('high')) return 'High';
    if (normalized.includes('medium')) return 'Medium';
    return 'Low';
  }

  private getCurrencyFromCountry(country: string): string {
    const countryToCurrency: { [key: string]: string } = {
      'US': 'USD', 'USA': 'USD', 'United States': 'USD',
      'EU': 'EUR', 'EUR': 'EUR', 'Eurozone': 'EUR', 'Germany': 'EUR', 'France': 'EUR',
      'GB': 'GBP', 'UK': 'GBP', 'United Kingdom': 'GBP',
      'JP': 'JPY', 'Japan': 'JPY',
      'AU': 'AUD', 'Australia': 'AUD',
      'CA': 'CAD', 'Canada': 'CAD'
    };
    return countryToCurrency[country] || 'USD';
  }

  private getCountryCode(country: string): string {
    const countryMap: { [key: string]: string } = {
      'United States': 'US',
      'Eurozone': 'EU',
      'United Kingdom': 'GB',
      'Japan': 'JP',
      'Australia': 'AU',
      'Canada': 'CA'
    };
    return countryMap[country] || country;
  }

  private getRecommendation(impactLevel: string): 'Proceed' | 'Caution' | 'Delay' | 'Cancel' {
    switch (impactLevel) {
      case 'Critical': return 'Cancel';
      case 'High': return 'Delay';
      case 'Medium': return 'Caution';
      default: return 'Proceed';
    }
  }

  private generateVolatilityWarning(impactLevel: string, events: EconomicEvent[]): string | undefined {
    if (impactLevel === 'Low') return undefined;
    
    const highImpactEvents = events.filter(e => e.impact === 'High').length;
    
    if (impactLevel === 'Critical') {
      return `🚨 CRITICAL: ${highImpactEvents} high-impact economic releases detected. Expect extreme volatility and potential gap movements.`;
    }
    
    if (impactLevel === 'High') {
      return `⚠️ HIGH IMPACT: ${highImpactEvents} high-impact economic events. Monitor for increased volatility and wider spreads.`;
    }
    
    return '📊 MEDIUM IMPACT: Economic events detected. Standard market volatility expected.';
  }
}

export const newsImpactAnalyzer = new NewsImpactAnalyzer();
