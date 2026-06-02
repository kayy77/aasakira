// Lot size calculation utility for forex / metals / indices / crypto.
// All math derived from: lots = (account * risk%) / (stopPips * pipValuePerLot)

export type Instrument = {
  symbol: string;
  label: string;
  // pip size in price units (e.g. 0.0001 for EURUSD, 0.01 for JPY, 0.1 for XAUUSD, 1 for US30)
  pipSize: number;
  // USD value of 1 pip per 1 standard lot (100k notional or contract size equivalent)
  pipValuePerLot: number;
  category: "FX" | "JPY" | "METAL" | "INDEX" | "CRYPTO";
};

export const INSTRUMENTS: Instrument[] = [
  { symbol: "EURUSD", label: "EUR / USD", pipSize: 0.0001, pipValuePerLot: 10, category: "FX" },
  { symbol: "GBPUSD", label: "GBP / USD", pipSize: 0.0001, pipValuePerLot: 10, category: "FX" },
  { symbol: "AUDUSD", label: "AUD / USD", pipSize: 0.0001, pipValuePerLot: 10, category: "FX" },
  { symbol: "NZDUSD", label: "NZD / USD", pipSize: 0.0001, pipValuePerLot: 10, category: "FX" },
  { symbol: "USDCAD", label: "USD / CAD", pipSize: 0.0001, pipValuePerLot: 7.5, category: "FX" },
  { symbol: "USDCHF", label: "USD / CHF", pipSize: 0.0001, pipValuePerLot: 10, category: "FX" },
  { symbol: "USDJPY", label: "USD / JPY", pipSize: 0.01, pipValuePerLot: 6.7, category: "JPY" },
  { symbol: "EURJPY", label: "EUR / JPY", pipSize: 0.01, pipValuePerLot: 6.7, category: "JPY" },
  { symbol: "GBPJPY", label: "GBP / JPY", pipSize: 0.01, pipValuePerLot: 6.7, category: "JPY" },
  { symbol: "XAUUSD", label: "Gold (XAU/USD)", pipSize: 0.1, pipValuePerLot: 10, category: "METAL" },
  { symbol: "XAGUSD", label: "Silver (XAG/USD)", pipSize: 0.01, pipValuePerLot: 5, category: "METAL" },
  { symbol: "US30", label: "US30 (Dow)", pipSize: 1, pipValuePerLot: 1, category: "INDEX" },
  { symbol: "NAS100", label: "NAS100 (Nasdaq)", pipSize: 1, pipValuePerLot: 1, category: "INDEX" },
  { symbol: "SPX500", label: "SPX500 (S&P)", pipSize: 0.1, pipValuePerLot: 1, category: "INDEX" },
  { symbol: "GER40", label: "GER40 (DAX)", pipSize: 1, pipValuePerLot: 1, category: "INDEX" },
  { symbol: "BTCUSD", label: "BTC / USD", pipSize: 1, pipValuePerLot: 1, category: "CRYPTO" },
];

export function getInstrument(symbol: string): Instrument {
  return INSTRUMENTS.find((i) => i.symbol === symbol.toUpperCase()) ?? INSTRUMENTS[0];
}

export type LotSizeInput = {
  accountSize: number;
  riskPercent: number;
  stopPips: number;
  instrument: Instrument;
};

export type LotSizeResult = {
  lots: number;          // standard lots (e.g. 0.25)
  microLots: number;     // for display
  dollarRisk: number;    // USD risked
  pipValue: number;      // USD per pip at recommended lot size
  valid: boolean;
  reason?: string;
};

export function calculateLotSize(input: LotSizeInput): LotSizeResult {
  const { accountSize, riskPercent, stopPips, instrument } = input;

  if (!accountSize || accountSize <= 0)
    return empty("Enter your account size");
  if (!riskPercent || riskPercent <= 0)
    return empty("Risk % must be greater than 0");
  if (!stopPips || stopPips <= 0)
    return empty("Stop loss in pips must be greater than 0");

  const dollarRisk = accountSize * (riskPercent / 100);
  const perLotRisk = stopPips * instrument.pipValuePerLot;
  const lots = dollarRisk / perLotRisk;

  return {
    lots: roundTo(lots, 2),
    microLots: Math.round(lots * 100),
    dollarRisk: roundTo(dollarRisk, 2),
    pipValue: roundTo(lots * instrument.pipValuePerLot, 2),
    valid: true,
  };
}

function empty(reason: string): LotSizeResult {
  return { lots: 0, microLots: 0, dollarRisk: 0, pipValue: 0, valid: false, reason };
}

function roundTo(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}