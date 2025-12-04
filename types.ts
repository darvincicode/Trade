
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
  slPrice?: number;
  tpPrice?: number;
  closeReason?: 'TP' | 'SL' | 'SIGNAL' | 'MANUAL';
  executionMode: 'PAPER' | 'LIVE'; // NEW field
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
  stopLoss: number; // percentage
  takeProfit: number; // percentage
  tradingMode: 'paper' | 'live'; // NEW field
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string; // Or username for admin
  password?: string; // Only used internally in mock service, never exposed in real app
  role: UserRole;
  createdAt: number;
}
