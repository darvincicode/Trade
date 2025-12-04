import { Candle, MarketNews } from '../types';

// Initial Price
let currentPrice = 96500;

export const generateNextCandle = (lastCandle: Candle | null): Candle => {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  const basePrice = lastCandle ? lastCandle.close : currentPrice;
  const volatility = basePrice * 0.002; // 0.2% volatility
  
  const change = (Math.random() - 0.5) * volatility;
  const close = basePrice + change;
  const high = Math.max(basePrice, close) + Math.random() * (volatility * 0.5);
  const low = Math.min(basePrice, close) - Math.random() * (volatility * 0.5);
  
  // Update global current price for continuity
  currentPrice = close;

  return {
    time,
    open: basePrice,
    high,
    low,
    close,
    volume: Math.floor(Math.random() * 100) + 10
  };
};

export const MOCK_NEWS: MarketNews[] = [
  { id: '1', headline: "SEC considers new crypto regulations for DeFi protocols", source: "CryptoWire", timestamp: Date.now() - 3600000 },
  { id: '2', headline: "Bitcoin breaks $96k resistance level amid institutional inflows", source: "CoinDesk", timestamp: Date.now() - 7200000 },
  { id: '3', headline: "MEXC announces new listing of AI-themed tokens", source: "Exchange News", timestamp: Date.now() - 10800000 },
  { id: '4', headline: "Federal Reserve signals potential rate cut next quarter", source: "Bloomberg", timestamp: Date.now() - 14400000 },
  { id: '5', headline: "Whale alert: 5000 BTC moved to cold storage", source: "WhaleAlert", timestamp: Date.now() - 18000000 },
];

export const getLatestPrice = () => currentPrice;