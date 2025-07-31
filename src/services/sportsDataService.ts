
interface LiveMatchData {
  id: string;
  sport: string;
  home_team: string;
  away_team: string;
  commence_time: string;
  odds: {
    home: number;
    away: number;
    draw?: number;
  };
  recent_form: {
    home: string;
    away: string;
  };
  head_to_head: string;
  injuries: string[];
  key_stats: string;
}

interface SportsOddsResponse {
  success: boolean;
  data: any[];
}

class SportsDataService {
  private readonly API_KEYS = {
    odds_api_uk: 'sk_live_abc123xyz456',
    odds_api_us: 'ea5ba72a9050a285ba94e46ffbfc95d88c289aa9',
    odds_api_eu: 'PK_467287B5D05A44BA8B5EC8C6DD8E4461',
    odds_api_au: 'pk_52cfe539bd784117a34a04db207a1416',
    football_stats: '0f546627dff52b35548ea2d52c555043',
    basketball_stats: '0f546627dff52b35548ea2d52c555043',
    mma_stats: '0f546627dff52b35548ea2d52c555043'
  };

  private readonly SPORT_KEYS = {
    football: 'soccer_epl',
    basketball: 'basketball_nba',
    mma: 'mma_mixed_martial_arts',
    boxing: 'boxing_boxing'
  };

  async fetchLiveOdds(sport: string): Promise<SportsOddsResponse> {
    try {
      const sportKey = this.SPORT_KEYS[sport as keyof typeof this.SPORT_KEYS] || sport;
      
      // Using a mock response for now since we need to implement proper odds API
      const mockData = this.generateMockSportsData(sport);
      
      return {
        success: true,
        data: mockData
      };
    } catch (error) {
      console.error('Failed to fetch live odds:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  private generateMockSportsData(sport: string): LiveMatchData[] {
    const mockMatches: Record<string, LiveMatchData[]> = {
      football: [
        {
          id: 'football_1',
          sport: 'Football (Soccer)',
          home_team: 'Liverpool',
          away_team: 'Manchester City',
          commence_time: '2025-08-02T15:00:00Z',
          odds: { home: 2.6, away: 2.2, draw: 3.1 },
          recent_form: { home: 'WWDLW', away: 'WWWDW' },
          head_to_head: 'Liverpool won 2 of last 5 meetings',
          injuries: ['Salah (doubtful)', 'Van Dijk (fit)'],
          key_stats: 'Liverpool: 2.1 goals/game, Man City: 2.4 goals/game'
        }
      ],
      basketball: [
        {
          id: 'basketball_1',
          sport: 'Basketball (NBA)',
          home_team: 'Lakers',
          away_team: 'Warriors',
          commence_time: '2025-08-01T02:30:00Z',
          odds: { home: 1.95, away: 1.85 },
          recent_form: { home: 'LWWLW', away: 'WWLWW' },
          head_to_head: 'Warriors won 3 of last 5 meetings',
          injuries: ['LeBron (questionable)', 'Curry (probable)'],
          key_stats: 'Lakers: 112.5 PPG, Warriors: 115.2 PPG'
        }
      ],
      mma: [
        {
          id: 'mma_1',
          sport: 'MMA',
          home_team: 'Conor McGregor',
          away_team: 'Michael Chandler',
          commence_time: '2025-08-03T04:00:00Z',
          odds: { home: 2.1, away: 1.7 },
          recent_form: { home: 'LLW', away: 'WLW' },
          head_to_head: 'First meeting',
          injuries: ['McGregor (recovered from leg injury)'],
          key_stats: 'McGregor: 6 KOs in last 7 wins, Chandler: Strong wrestling base'
        }
      ],
      boxing: [
        {
          id: 'boxing_1',
          sport: 'Boxing',
          home_team: 'Tyson Fury',
          away_team: 'Anthony Joshua',
          commence_time: '2025-08-04T21:00:00Z',
          odds: { home: 1.8, away: 2.0 },
          recent_form: { home: 'WWW', away: 'WWL' },
          head_to_head: 'First meeting',
          injuries: ['Both fighters cleared'],
          key_stats: 'Fury: 6\'9" reach advantage, Joshua: Higher KO percentage'
        }
      ]
    };

    return mockMatches[sport] || [];
  }

  async fetchTeamStats(sport: string, team: string): Promise<any> {
    try {
      // Mock team stats for now
      return {
        recent_form: 'WWWLW',
        wins: 12,
        losses: 3,
        draws: 1,
        goals_for: 34,
        goals_against: 18,
        home_record: '7-1-1',
        away_record: '5-2-0'
      };
    } catch (error) {
      console.error('Failed to fetch team stats:', error);
      return null;
    }
  }

  async fetchInjuryReport(sport: string, teams: string[]): Promise<string[]> {
    try {
      // Mock injury data for now
      const mockInjuries = [
        'Key player questionable with minor injury',
        'Star player cleared to play',
        'No major injury concerns'
      ];
      
      return mockInjuries;
    } catch (error) {
      console.error('Failed to fetch injury report:', error);
      return [];
    }
  }

  async getUpcomingMatches(sport: string): Promise<LiveMatchData[]> {
    const oddsData = await this.fetchLiveOdds(sport);
    return oddsData.success ? oddsData.data : [];
  }
}

export const sportsDataService = new SportsDataService();
export type { LiveMatchData };
