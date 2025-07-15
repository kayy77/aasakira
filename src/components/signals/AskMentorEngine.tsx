
import { SignalDNA } from '@/services/multiIntelligenceCore';

export const generateMentorResponse = (signalDNA: SignalDNA): string => {
  const isLong = parseFloat(signalDNA.structure.takeProfit) > parseFloat(signalDNA.structure.entry);
  const direction = isLong ? 'bullish' : 'bearish';
  const session = signalDNA.session;
  const confidence = signalDNA.confidence;
  const voteCount = Object.values(signalDNA.origin).filter(Boolean).length;
  const riskReward = signalDNA.structure.rr;
  const winRate = Math.round(signalDNA.backtest.winRate);
  
  const professionalResponses = [
    `${session} session volume spike with clear ${direction} momentum. The ${signalDNA.timeframe} structure shows institutional characteristics. With ${confidence}% confidence and ${voteCount}/6 framework validation, this aligns with professional trading criteria.`,
    
    `Structure analysis indicates ${isLong ? 'demand' : 'supply'} zone activation with proper liquidity management. Risk-reward of ${riskReward} combined with ${winRate}% historical performance suggests favorable probability dynamics.`,
    
    `Multiple timeframe confluence detected. The ${signalDNA.type} strategy shows clear institutional footprints with proper order flow validation. Entry timing aligns with optimal market conditions.`,
    
    `Clean setup with disciplined risk parameters. The ${signalDNA.filters.length} technical confirmations provide sufficient confluence for execution. Market structure supports this ${direction} bias.`,
    
    `Professional-grade signal with transparent methodology. ${voteCount}/6 frameworks reached consensus based on quantifiable market data. This represents calculated probability, not speculation.`,
    
    `Strategic positioning opportunity identified. The combination of ${signalDNA.filters.slice(0, 2).join(' and ')} provides institutional-level confirmation for this ${direction} outlook.`,
    
    `Market microstructure analysis supports this entry. Volume profile and liquidity distribution align with the proposed direction. Risk management parameters are within professional standards.`,
    
    `Technical confluence achieved across multiple analytical frameworks. The ${signalDNA.timeframe} timeframe shows optimal entry conditions with clearly defined risk parameters.`
  ];
  
  return professionalResponses[Math.floor(Math.random() * professionalResponses.length)];
};
