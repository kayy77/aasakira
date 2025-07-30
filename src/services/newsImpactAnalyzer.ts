
export interface NewsImpact {
  hasImpact: boolean;
  impactLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  newsItems: Array<{
    headline: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    relevance: number;
    publishedAt: string;
  }>;
  recommendation: 'Proceed' | 'Caution' | 'Delay' | 'Cancel';
  volatilityWarning?: string;
}

class NewsImpactAnalyzer {
  private readonly NEWS_API_KEY = 'pub_5cf95a64279c4e63b30a66fc9f2518fa';

  async analyzeNewsImpact(pair: string): Promise<NewsImpact> {
    console.log(`📰 Analyzing news impact for ${pair}...`);
    
    try {
      const baseCurrency = pair.substring(0, 3);
      const quoteCurrency = pair.substring(3, 6);
      
      // Get news for both currencies
      const [baseNews, quoteNews] = await Promise.all([
        this.fetchCurrencyNews(baseCurrency),
        this.fetchCurrencyNews(quoteCurrency)
      ]);

      const allNews = [...baseNews, ...quoteNews];
      const relevantNews = allNews.filter(news => news.relevance > 0.6);

      if (relevantNews.length === 0) {
        return {
          hasImpact: false,
          impactLevel: 'Low',
          newsItems: [],
          recommendation: 'Proceed'
        };
      }

      const impactLevel = this.calculateImpactLevel(relevantNews);
      const recommendation = this.getRecommendation(impactLevel);
      const volatilityWarning = this.generateVolatilityWarning(impactLevel, relevantNews);

      console.log(`📰 News analysis complete: ${impactLevel} impact level`);

      return {
        hasImpact: true,
        impactLevel,
        newsItems: relevantNews,
        recommendation,
        volatilityWarning
      };

    } catch (error) {
      console.error('❌ News analysis failed:', error);
      return {
        hasImpact: false,
        impactLevel: 'Low',
        newsItems: [],
        recommendation: 'Proceed'
      };
    }
  }

  private async fetchCurrencyNews(currency: string): Promise<any[]> {
    try {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${this.NEWS_API_KEY}&q=${currency}&category=business&language=en&size=5`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      
      return (data.results || []).map((article: any) => ({
        headline: article.title,
        sentiment: this.analyzeSentiment(article.title + ' ' + (article.description || '')),
        relevance: this.calculateRelevance(article.title, currency),
        publishedAt: article.pubDate
      }));

    } catch (error) {
      console.error(`Failed to fetch news for ${currency}:`, error);
      return [];
    }
  }

  private analyzeSentiment(text: string): 'Positive' | 'Negative' | 'Neutral' {
    const positiveKeywords = ['rise', 'gain', 'boost', 'strong', 'growth', 'up', 'bullish'];
    const negativeKeywords = ['fall', 'drop', 'decline', 'weak', 'crisis', 'down', 'bearish'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => lowerText.includes(keyword)).length;

    if (positiveCount > negativeCount) return 'Positive';
    if (negativeCount > positiveCount) return 'Negative';
    return 'Neutral';
  }

  private calculateRelevance(headline: string, currency: string): number {
    const lowerHeadline = headline.toLowerCase();
    const currencyKeywords = [currency.toLowerCase(), this.getCurrencyName(currency)];
    const forexKeywords = ['forex', 'currency', 'exchange', 'fed', 'ecb', 'boe', 'interest', 'inflation'];
    
    let relevance = 0;
    
    // Direct currency mention
    if (currencyKeywords.some(keyword => lowerHeadline.includes(keyword))) {
      relevance += 0.8;
    }
    
    // Forex-related keywords
    if (forexKeywords.some(keyword => lowerHeadline.includes(keyword))) {
      relevance += 0.4;
    }
    
    return Math.min(1, relevance);
  }

  private getCurrencyName(code: string): string {
    const names: { [key: string]: string } = {
      'USD': 'dollar',
      'EUR': 'euro',
      'GBP': 'pound',
      'JPY': 'yen',
      'AUD': 'australian',
      'CAD': 'canadian'
    };
    return names[code] || code.toLowerCase();
  }

  private calculateImpactLevel(news: any[]): 'Low' | 'Medium' | 'High' | 'Critical' {
    const avgRelevance = news.reduce((sum, item) => sum + item.relevance, 0) / news.length;
    const highImpactCount = news.filter(item => item.relevance > 0.8).length;
    
    if (highImpactCount >= 2 || avgRelevance > 0.9) return 'Critical';
    if (highImpactCount >= 1 || avgRelevance > 0.7) return 'High';
    if (avgRelevance > 0.5) return 'Medium';
    return 'Low';
  }

  private getRecommendation(impactLevel: string): 'Proceed' | 'Caution' | 'Delay' | 'Cancel' {
    switch (impactLevel) {
      case 'Critical': return 'Cancel';
      case 'High': return 'Delay';
      case 'Medium': return 'Caution';
      default: return 'Proceed';
    }
  }

  private generateVolatilityWarning(impactLevel: string, news: any[]): string | undefined {
    if (impactLevel === 'Low') return undefined;
    
    const negativeNews = news.filter(item => item.sentiment === 'Negative').length;
    const positiveNews = news.filter(item => item.sentiment === 'Positive').length;
    
    if (impactLevel === 'Critical') {
      return '🚨 CRITICAL: Major news events detected. Expect extreme volatility and potential gap movements.';
    }
    
    if (impactLevel === 'High') {
      return '⚠️ HIGH IMPACT: Significant news activity. Monitor for increased volatility and wider spreads.';
    }
    
    return '📰 MEDIUM IMPACT: Some news activity detected. Standard volatility expected.';
  }
}

export const newsImpactAnalyzer = new NewsImpactAnalyzer();
