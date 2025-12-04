import { Candle, MarketNews } from '../types';

// Top 100 Assets typically found on MEXC
export const SUPPORTED_PAIRS = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "XRP/USDT", "BNB/USDT", "DOGE/USDT", "ADA/USDT", "TRX/USDT", "AVAX/USDT", "SHIB/USDT", 
  "DOT/USDT", "LTC/USDT", "LINK/USDT", "BCH/USDT", "MATIC/USDT", "XLM/USDT", "ATOM/USDT", "UNI/USDT", "ETC/USDT", "FIL/USDT",
  "HBAR/USDT", "LDO/USDT", "ICP/USDT", "NEAR/USDT", "APT/USDT", "QNT/USDT", "VET/USDT", "MKR/USDT", "AAVE/USDT", "OP/USDT",
  "ARB/USDT", "GRT/USDT", "ALGO/USDT", "STX/USDT", "SAND/USDT", "EOS/USDT", "EGLD/USDT", "THETA/USDT", "XTZ/USDT", "IMX/USDT",
  "AXS/USDT", "MANA/USDT", "FLOW/USDT", "FTM/USDT", "KCS/USDT", "NEO/USDT", "KLAY/USDT", "GALA/USDT", "CHZ/USDT", "CRV/USDT",
  "SNX/USDT", "RUNE/USDT", "ZEC/USDT", "MINA/USDT", "DYDX/USDT", "DASH/USDT", "COMP/USDT", "XEC/USDT", "CAKE/USDT", "FXS/USDT",
  "LUNC/USDT", "PEPE/USDT", "KAVA/USDT", "GMX/USDT", "TWT/USDT", "ONE/USDT", "WOO/USDT", "FET/USDT", "RNDR/USDT", "INJ/USDT",
  "ZIL/USDT", "LRC/USDT", "BAT/USDT", "ENJ/USDT", "QTUM/USDT", "MASK/USDT", "CELO/USDT", "GMT/USDT", "ANKR/USDT", "RVN/USDT",
  "HOT/USDT", "KSM/USDT", "TFUEL/USDT", "WAVES/USDT", "1INCH/USDT", "IOTX/USDT", "GLM/USDT", "JST/USDT", "IOST/USDT",
  "KDA/USDT", "ONT/USDT", "GLMR/USDT", "SXP/USDT", "AUDIO/USDT", "ICX/USDT", "SC/USDT", "FLOKI/USDT", "BONK/USDT", "SUI/USDT", "SEI/USDT", "TIA/USDT", "ORDI/USDT", "BLUR/USDT"
];

const MOCK_PRICES: Record<string, number> = {
  "BTC/USDT": 96500, "ETH/USDT": 2650, "SOL/USDT": 185, "BNB/USDT": 620, "XRP/USDT": 2.40,
  "DOGE/USDT": 0.38, "ADA/USDT": 0.95, "AVAX/USDT": 45, "TRX/USDT": 0.22, "DOT/USDT": 8.5,
  "LINK/USDT": 18, "MATIC/USDT": 0.55, "SHIB/USDT": 0.000025, "LTC/USDT": 85, "UNI/USDT": 12,
  "PEPE/USDT": 0.000012, "BONK/USDT": 0.000035, "FLOKI/USDT": 0.00021, "SUI/USDT": 1.85, "SEI/USDT": 0.65,
  "TIA/USDT": 11, "INJ/USDT": 28, "RNDR/USDT": 7.5, "FET/USDT": 1.4, "NEAR/USDT": 6.2, "APT/USDT": 10
};

// Global simulation state
let currentPrice = 96500;

export const generateInitialCandles = (pair: string = "BTC/USDT"): Candle[] => {
  // Determine base price
  const base = MOCK_PRICES[pair] || (pair.includes("BTC") ? 96500 : pair.includes("ETH") ? 2600 : 10);
  currentPrice = base; // Reset simulation pointer

  const now = new Date();
  return Array.from({ length: 20 }).map((_, i) => {
    const timeDate = new Date(now.getTime() - (19 - i) * 60000); // Back 20 minutes
    const time = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Slight randomization for history
    const close = base + (Math.random() - 0.5) * (base * 0.01);
    const open = close + (Math.random() - 0.5) * (base * 0.005);
    const high = Math.max(open, close) + Math.random() * (base * 0.002);
    const low = Math.min(open, close) - Math.random() * (base * 0.002);

    return {
      time,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 1000) + 100
    };
  });
};

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
  { id: '2', headline: "Bitcoin breaks key resistance level amid institutional inflows", source: "CoinDesk", timestamp: Date.now() - 7200000 },
  { id: '3', headline: "MEXC announces new listing of AI-themed tokens", source: "Exchange News", timestamp: Date.now() - 10800000 },
  { id: '4', headline: "Federal Reserve signals potential rate cut next quarter", source: "Bloomberg", timestamp: Date.now() - 14400000 },
  { id: '5', headline: "Whale alert: Large movement detected on-chain", source: "WhaleAlert", timestamp: Date.now() - 18000000 },
];

export const getLatestPrice = () => currentPrice;