// News & Holiday Filter - Prevents trading during low liquidity periods
// NO MORE GBPUSD ON UK BANK HOLIDAYS

export interface MarketSession {
  name: 'ASIAN' | 'LONDON' | 'NY' | 'SYDNEY';
  isActive: boolean;
  liquidityScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

export interface NewsEvent {
  time: Date;
  currency: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  event: string;
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface HolidayInfo {
  date: Date;
  country: string;
  market: string;
  name: string;
  affectedPairs: string[];
}

export interface MarketConditionCheck {
  tradingAllowed: boolean;
  reason: string;
  currentSession: MarketSession;
  upcomingNews: NewsEvent[];
  activeHolidays: HolidayInfo[];
  riskWarnings: string[];
}

export class NewsHolidayFilter {
  
  // 🔑 KNOWN HOLIDAYS - Major market holidays that kill liquidity
  private static readonly MAJOR_HOLIDAYS = [
    // US Holidays
    { date: '2024-01-01', country: 'US', market: 'NYSE', name: 'New Year\'s Day', pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD'] },
    { date: '2024-01-15', country: 'US', market: 'NYSE', name: 'Martin Luther King Jr. Day', pairs: ['EURUSD', 'GBPUSD', 'USDJPY'] },
    { date: '2024-02-19', country: 'US', market: 'NYSE', name: 'Presidents Day', pairs: ['EURUSD', 'GBPUSD', 'USDJPY'] },
    { date: '2024-05-27', country: 'US', market: 'NYSE', name: 'Memorial Day', pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD'] },
    { date: '2024-07-04', country: 'US', market: 'NYSE', name: 'Independence Day', pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD'] },
    { date: '2024-09-02', country: 'US', market: 'NYSE', name: 'Labor Day', pairs: ['EURUSD', 'GBPUSD', 'USDJPY'] },
    { date: '2024-11-28', country: 'US', market: 'NYSE', name: 'Thanksgiving', pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD'] },
    { date: '2024-12-25', country: 'US', market: 'NYSE', name: 'Christmas Day', pairs: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD'] },
    
    // UK Holidays
    { date: '2024-01-01', country: 'UK', market: 'LSE', name: 'New Year\'s Day', pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
    { date: '2024-03-29', country: 'UK', market: 'LSE', name: 'Good Friday', pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
    { date: '2024-04-01', country: 'UK', market: 'LSE', name: 'Easter Monday', pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
    { date: '2024-05-06', country: 'UK', market: 'LSE', name: 'Early May Bank Holiday', pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
    { date: '2024-05-27', country: 'UK', market: 'LSE', name: 'Spring Bank Holiday', pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
    { date: '2024-08-26', country: 'UK', market: 'LSE', name: 'Summer Bank Holiday', pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
    { date: '2024-12-25', country: 'UK', market: 'LSE', name: 'Christmas Day', pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
    { date: '2024-12-26', country: 'UK', market: 'LSE', name: 'Boxing Day', pairs: ['GBPUSD', 'EURGBP', 'GBPJPY'] },
    
    // EU Holidays
    { date: '2024-01-01', country: 'EU', market: 'ECB', name: 'New Year\'s Day', pairs: ['EURUSD', 'EURGBP', 'EURJPY'] },
    { date: '2024-03-29', country: 'EU', market: 'ECB', name: 'Good Friday', pairs: ['EURUSD', 'EURGBP', 'EURJPY'] },
    { date: '2024-04-01', country: 'EU', market: 'ECB', name: 'Easter Monday', pairs: ['EURUSD', 'EURGBP', 'EURJPY'] },
    { date: '2024-05-01', country: 'EU', market: 'ECB', name: 'Labour Day', pairs: ['EURUSD', 'EURGBP', 'EURJPY'] },
    { date: '2024-12-25', country: 'EU', market: 'ECB', name: 'Christmas Day', pairs: ['EURUSD', 'EURGBP', 'EURJPY'] },
    { date: '2024-12-26', country: 'EU', market: 'ECB', name: 'Boxing Day', pairs: ['EURUSD', 'EURGBP', 'EURJPY'] },
    
    // Japan Holidays
    { date: '2024-01-01', country: 'JP', market: 'TSE', name: 'New Year\'s Day', pairs: ['USDJPY', 'EURJPY', 'GBPJPY'] },
    { date: '2024-01-08', country: 'JP', market: 'TSE', name: 'Coming of Age Day', pairs: ['USDJPY', 'EURJPY', 'GBPJPY'] },
    { date: '2024-02-11', country: 'JP', market: 'TSE', name: 'National Foundation Day', pairs: ['USDJPY', 'EURJPY', 'GBPJPY'] },
    { date: '2024-02-23', country: 'JP', market: 'TSE', name: 'Emperor\'s Birthday', pairs: ['USDJPY', 'EURJPY', 'GBPJPY'] },
    { date: '2024-03-20', country: 'JP', market: 'TSE', name: 'Vernal Equinox Day', pairs: ['USDJPY', 'EURJPY', 'GBPJPY'] }
  ];
  
  // 🔑 HIGH-IMPACT NEWS EVENTS - Mock data (in real system, would come from economic calendar API)
  private static simulateUpcomingNews(): NewsEvent[] {
    const now = new Date();
    const events: NewsEvent[] = [];
    
    // Simulate random high-impact events in the next 4 hours
    const eventTypes = [
      { currency: 'USD', event: 'FOMC Meeting', impact: 'HIGH' as const },
      { currency: 'USD', event: 'Non-Farm Payrolls', impact: 'HIGH' as const },
      { currency: 'USD', event: 'CPI Data', impact: 'HIGH' as const },
      { currency: 'EUR', event: 'ECB Interest Rate Decision', impact: 'HIGH' as const },
      { currency: 'GBP', event: 'BOE Interest Rate Decision', impact: 'HIGH' as const },
      { currency: 'JPY', event: 'BOJ Policy Meeting', impact: 'HIGH' as const },
      { currency: 'USD', event: 'GDP Data', impact: 'MEDIUM' as const },
      { currency: 'EUR', event: 'PMI Manufacturing', impact: 'MEDIUM' as const }
    ];
    
    // Random chance of upcoming high-impact news
    if (Math.random() > 0.8) { // 20% chance
      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const eventTime = new Date(now.getTime() + Math.random() * 4 * 60 * 60 * 1000); // Next 4 hours
      
      events.push({
        time: eventTime,
        currency: randomEvent.currency,
        impact: randomEvent.impact,
        event: randomEvent.event,
        forecast: 'TBD',
        previous: 'N/A'
      });
    }
    
    return events;
  }
  
  // 🔑 GET CURRENT MARKET SESSION
  static getCurrentMarketSession(): MarketSession {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const day = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
    
    // Weekend check
    if (day === 0 || day === 6) {
      return {
        name: 'ASIAN',
        isActive: false,
        liquidityScore: 10,
        riskLevel: 'EXTREME'
      };
    }
    
    // Determine active session
    let session: MarketSession['name'] = 'ASIAN';
    let liquidityScore = 30;
    let riskLevel: MarketSession['riskLevel'] = 'HIGH';
    
    if (utcHour >= 0 && utcHour < 8) {
      // Asian Session (00:00 - 08:00 UTC)
      session = 'ASIAN';
      liquidityScore = 40;
      riskLevel = 'MEDIUM';
    } else if (utcHour >= 8 && utcHour < 13) {
      // London Session (08:00 - 13:00 UTC)
      session = 'LONDON';
      liquidityScore = 90;
      riskLevel = 'LOW';
    } else if (utcHour >= 13 && utcHour < 17) {
      // London-NY Overlap (13:00 - 17:00 UTC) - BEST LIQUIDITY
      session = 'NY';
      liquidityScore = 100;
      riskLevel = 'LOW';
    } else if (utcHour >= 17 && utcHour < 22) {
      // NY Session (17:00 - 22:00 UTC)
      session = 'NY';
      liquidityScore = 80;
      riskLevel = 'LOW';
    } else {
      // Late NY / Early Asian (22:00 - 00:00 UTC)
      session = 'ASIAN';
      liquidityScore = 35;
      riskLevel = 'MEDIUM';
    }
    
    return {
      name: session,
      isActive: true,
      liquidityScore,
      riskLevel
    };
  }
  
  // 🔑 CHECK MARKET CONDITIONS - Main function
  static checkMarketConditions(pair: string): MarketConditionCheck {
    console.log(`🌍 MARKET CONDITIONS CHECK: ${pair}`);
    
    const currentSession = this.getCurrentMarketSession();
    const upcomingNews = this.simulateUpcomingNews();
    const activeHolidays = this.getTodaysHolidays(pair);
    
    const riskWarnings: string[] = [];
    let tradingAllowed = true;
    let reason = '✅ Market conditions favorable';
    
    // 1. CHECK WEEKEND
    const now = new Date();
    const day = now.getUTCDay();
    if (day === 0 || day === 6) {
      tradingAllowed = false;
      reason = '🚫 Weekend: Markets closed';
      riskWarnings.push('Weekend trading not allowed');
    }
    
    // 2. CHECK HOLIDAYS
    if (activeHolidays.length > 0) {
      tradingAllowed = false;
      reason = `🏖️ Holiday: ${activeHolidays[0].name} (${activeHolidays[0].country})`;
      riskWarnings.push(`${activeHolidays[0].country} market holiday affects ${pair}`);
    }
    
    // 3. CHECK HIGH-IMPACT NEWS
    const highImpactNews = upcomingNews.filter(news => news.impact === 'HIGH');
    if (highImpactNews.length > 0) {
      const nextEvent = highImpactNews[0];
      const minutesToEvent = (nextEvent.time.getTime() - now.getTime()) / (1000 * 60);
      
      if (minutesToEvent < 60) { // Within 1 hour
        tradingAllowed = false;
        reason = `📰 High-impact news in ${Math.floor(minutesToEvent)} min: ${nextEvent.event}`;
        riskWarnings.push(`High-impact ${nextEvent.currency} news approaching`);
      }
    }
    
    // 4. CHECK SESSION LIQUIDITY
    if (currentSession.liquidityScore < 50) {
      if (pair.includes('GBP') || pair.includes('EUR')) {
        riskWarnings.push(`Low liquidity during ${currentSession.name} session for ${pair}`);
        if (currentSession.liquidityScore < 30) {
          tradingAllowed = false;
          reason = `🌙 Low liquidity: ${currentSession.name} session (${currentSession.liquidityScore}% liquidity)`;
        }
      }
    }
    
    // 5. SPECIAL PAIR CHECKS
    if (pair === 'GBPUSD' && activeHolidays.some(h => h.country === 'UK')) {
      tradingAllowed = false;
      reason = '🇬🇧 UK Bank Holiday: GBPUSD trading suspended';
    }
    
    if (pair.includes('JPY') && activeHolidays.some(h => h.country === 'JP')) {
      tradingAllowed = false;
      reason = '🇯🇵 Japan Holiday: JPY pairs trading suspended';
    }
    
    console.log(`🌍 ${pair} Market Check: ${tradingAllowed ? 'ALLOWED' : 'BLOCKED'} - ${reason}`);
    
    return {
      tradingAllowed,
      reason,
      currentSession,
      upcomingNews,
      activeHolidays,
      riskWarnings
    };
  }
  
  // Get today's holidays affecting a specific pair
  private static getTodaysHolidays(pair: string): HolidayInfo[] {
    const today = new Date().toISOString().split('T')[0];
    
    return this.MAJOR_HOLIDAYS
      .filter(holiday => holiday.date === today && holiday.pairs.includes(pair))
      .map(holiday => ({
        date: new Date(holiday.date),
        country: holiday.country,
        market: holiday.market,
        name: holiday.name,
        affectedPairs: holiday.pairs
      }));
  }
  
  // 🔑 GET MARKET STATUS DASHBOARD
  static getMarketStatusDashboard(): {
    currentSession: MarketSession;
    tradingAllowed: boolean;
    activeHolidays: number;
    upcomingHighImpactNews: number;
    riskLevel: string;
  } {
    const session = this.getCurrentMarketSession();
    const news = this.simulateUpcomingNews();
    const holidays = this.MAJOR_HOLIDAYS.filter(h => h.date === new Date().toISOString().split('T')[0]);
    
    return {
      currentSession: session,
      tradingAllowed: session.isActive && holidays.length === 0,
      activeHolidays: holidays.length,
      upcomingHighImpactNews: news.filter(n => n.impact === 'HIGH').length,
      riskLevel: session.riskLevel
    };
  }
}