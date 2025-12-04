export enum BotStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR'
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  price: number;
  amount: number;
  timestamp: number;
  profit?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface MarketNews {
  id: string;
  headline: string;
  source: string;
  timestamp: number;
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface AIAnalysisResult {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface BotConfig {
  apiKey: string;
  apiSecret: string;
  pair: string;
  amountPerTrade: number;
  riskTolerance: 'conservative' | 'aggressive';
  aiInterval: number; // in seconds
}