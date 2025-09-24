
export interface EconomicEvent {
  event_id?: string;
  title: string;
  country?: string;
  currency?: string;
  impact: "Low" | "Medium" | "High";
  forecast?: string | null;
  actual?: string | null;
  previous?: string | null;
  event_time?: string | null; // ISO
  relevance?: number;
  source?: string;
}

export interface NewsImpact {
  hasImpact: boolean;
  impactLevel: "Low" | "Medium" | "High" | "Critical";
  economicEvents: EconomicEvent[];
  recommendation: "Proceed" | "Caution" | "Delay" | "Cancel";
  volatilityWarning?: string;
  nextEvents?: EconomicEvent[];
}

export class NewsImpactAnalyzer {
  // analyzer no longer holds API keys; it accepts events as input
  analyze(events: EconomicEvent[], pair: string): NewsImpact {
    const base = pair.substring(0, 3);
    const quote = pair.substring(3, 6);
    const targetCurrencies = [base, quote];

    // filter relevant events by currency OR country mapping (keep flexible)
    const relevant = events.filter(e => {
      if (!e) return false;
      if (e.currency && targetCurrencies.includes(e.currency)) return true;
      if (e.country && this.countryToCurrency(e.country) && targetCurrencies.includes(this.countryToCurrency(e.country))) return true;
      // allow certain high-impact global events
      const t = (e.title || "").toLowerCase();
      const globalKeywords = ["fomc", "cpi", "inflation", "gdp", "non-farm", "nfp"];
      if (globalKeywords.some(k => t.includes(k))) return true;
      return false;
    });

    if (relevant.length === 0) {
      return { hasImpact: false, impactLevel: "Low", economicEvents: [], recommendation: "Proceed" };
    }

    // compute metrics
    const avgRelevance = (relevant.reduce((s, r) => s + (r.relevance || 0.5), 0) / relevant.length);
    const highCount = relevant.filter(r => r.impact === "High").length;

    let impactLevel: NewsImpact["impactLevel"] = "Low";
    if (highCount >= 3 || avgRelevance > 0.9) impactLevel = "Critical";
    else if (highCount >= 2 || avgRelevance > 0.7) impactLevel = "High";
    else if (avgRelevance > 0.5) impactLevel = "Medium";

    const recommendation = this.mapImpactToRecommendation(impactLevel);
    const volatilityWarning = this.buildVolatilityWarning(impactLevel, highCount);

    // upcoming events (next 24h)
    const now = Date.now();
    const next24 = new Date(now + 24*60*60*1000).toISOString();
    const upcoming = relevant.filter(e => e.event_time && e.event_time > new Date().toISOString() && e.event_time <= next24)
                              .sort((a,b) => (a.event_time||"").localeCompare(b.event_time||""))
                              .slice(0,5);

    return {
      hasImpact: true,
      impactLevel,
      economicEvents: relevant.slice(0, 10), // trimmed
      recommendation,
      volatilityWarning,
      nextEvents: upcoming
    };
  }

  private mapImpactToRecommendation(level: string): NewsImpact["recommendation"] {
    switch (level) {
      case "Critical": return "Cancel";
      case "High": return "Delay";
      case "Medium": return "Caution";
      default: return "Proceed";
    }
  }

  private buildVolatilityWarning(level: string, highCount: number) {
    if (level === "Critical") return `🚨 CRITICAL: ${highCount} high-impact releases expected — expect extreme volatility.`;
    if (level === "High") return `⚠️ HIGH: ${highCount} high-impact releases — increased volatility likely.`;
    if (level === "Medium") return `📊 MEDIUM: Market-moving events expected.`;
    return undefined;
  }

  private countryToCurrency(country?: string) {
    if (!country) return null;
    const map: { [k: string]: string } = {
      "United States": "USD", "US": "USD", "USA": "USD",
      "Eurozone": "EUR", "Euro Area": "EUR", "Germany": "EUR", "France": "EUR",
      "United Kingdom": "GBP", "UK": "GBP", "Great Britain": "GBP",
      "Japan": "JPY", "Australia": "AUD",
      "Canada": "CAD"
    };
    return map[country] || null;
  }
}

export const newsImpactAnalyzer = new NewsImpactAnalyzer();
