
export type TradeType = 'scalp' | 'intraday' | 'swing' | 'position';
export type RiskLevel = 'conservative' | 'moderate' | 'aggressive';
export type AssetClass = 'forex' | 'crypto' | 'commodities' | 'indices';
export type StrategyType = 'SMC' | 'Institutional' | 'Hybrid';

export interface SignalConfig {
  strategyType: StrategyType;
  tradeType: TradeType;
  confidenceThreshold: number;
  riskLevel: RiskLevel;
  minFilters: number;
  assetClass: AssetClass;
  pairFilter: 'all' | 'majors' | 'eurusd';
  timeValidity?: string;
}

export interface SavedPreset {
  id: string;
  name: string;
  config: SignalConfig;
  createdAt: Date;
}

export interface StrategyBreakdown {
  smc: boolean;
  liquidity: boolean;
  fvg: boolean;
  volume: boolean;
  session: boolean;
  rsiEma: boolean;
}
