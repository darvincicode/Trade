import { BotConfig, Trade, AIAnalysisResult } from '../types';

const KEYS = {
  CONFIG: 'astro_config',
  TRADES: 'astro_trades',
  LOGS: 'astro_logs',
  BALANCE: 'astro_balance',
  PROFIT: 'astro_profit'
};

export const saveState = (
  config: BotConfig,
  trades: Trade[],
  logs: { time: string; result: AIAnalysisResult }[],
  balance: number,
  profit: number
) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  localStorage.setItem(KEYS.TRADES, JSON.stringify(trades));
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  localStorage.setItem(KEYS.BALANCE, balance.toString());
  localStorage.setItem(KEYS.PROFIT, profit.toString());
};

export const loadState = () => {
  if (typeof window === 'undefined') return null;
  
  const configStr = localStorage.getItem(KEYS.CONFIG);
  if (!configStr) return null; // Return null if no previous state

  return {
    config: JSON.parse(configStr),
    trades: JSON.parse(localStorage.getItem(KEYS.TRADES) || '[]'),
    logs: JSON.parse(localStorage.getItem(KEYS.LOGS) || '[]'),
    balance: parseFloat(localStorage.getItem(KEYS.BALANCE) || '10000'),
    profit: parseFloat(localStorage.getItem(KEYS.PROFIT) || '0')
  };
};

export const clearState = () => {
    localStorage.removeItem(KEYS.CONFIG);
    localStorage.removeItem(KEYS.TRADES);
    localStorage.removeItem(KEYS.LOGS);
    localStorage.removeItem(KEYS.BALANCE);
    localStorage.removeItem(KEYS.PROFIT);
};