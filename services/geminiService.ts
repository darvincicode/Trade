import { GoogleGenAI, Type } from "@google/genai";
import { Candle, MarketNews, AIAnalysisResult, BotConfig } from '../types';

let genAI: GoogleGenAI | null = null;

// HARDCODED KEY FOR DEMO PURPOSES
// In production, use process.env.API_KEY via a secure backend proxy
const HARDCODED_KEY = "AIzaSyCBcqvrdjXtr5bCL19LFNR0uhUdum8axw0";

// Safe access to environment variable or hardcoded key
const getApiKey = () => {
  try {
    // 1. Check if process is defined (node/bundled env)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Environment access error:", e);
  }
  
  // 2. Return the provided key if env var is missing
  return HARDCODED_KEY;
};

const getAIClient = () => {
  if (genAI) return genAI;
  
  const key = getApiKey();
  if (!key) return null; // Graceful failure if key is missing

  genAI = new GoogleGenAI({ apiKey: key });
  return genAI;
};

// Fallback algorithm when AI is unavailable
const fallbackAnalysis = (candles: Candle[]): AIAnalysisResult => {
  // Need at least 2 candles to compare
  if (candles.length < 2) {
      return { action: 'HOLD', confidence: 0, reasoning: "Insufficient data", riskLevel: 'LOW' };
  }

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  
  // Simple Momentum Strategy Fallback
  // If price is closing higher than previous high = Bullish
  const isBullish = last.close > prev.high;
  // If price is closing lower than previous low = Bearish
  const isBearish = last.close < prev.low;
  
  if (isBullish) {
    return {
      action: 'BUY',
      confidence: 65,
      reasoning: "Simulated Strategy (Gemini Key Missing): Bullish momentum detected.",
      riskLevel: 'MEDIUM'
    };
  } else if (isBearish) {
    return {
      action: 'SELL',
      confidence: 65,
      reasoning: "Simulated Strategy (Gemini Key Missing): Bearish breakdown detected.",
      riskLevel: 'MEDIUM'
    };
  }
  
  return {
    action: 'HOLD',
    confidence: 50,
    reasoning: "Simulated Strategy (Gemini Key Missing): Consolidation phase.",
    riskLevel: 'LOW'
  };
};

export const analyzeMarket = async (
  candles: Candle[], 
  news: MarketNews[], 
  config: BotConfig
): Promise<AIAnalysisResult> => {
  const client = getAIClient();
  
  // 1. Fallback if client cannot be created (Missing Key)
  if (!client) {
    console.warn("Gemini API Key missing - Using Fallback Simulation");
    // Delay slightly to simulate "thinking"
    await new Promise(resolve => setTimeout(resolve, 800));
    return fallbackAnalysis(candles);
  }

  // Format data for the prompt
  const recentCandles = candles.slice(-10); // Analyze last 10 candles
  const recentNews = news.slice(0, 3); // Analyze top 3 news items
  
  const prompt = `
    You are an expert crypto trading bot. Analyze the following market data for ${config.pair}.
    
    Strategy: ${config.riskTolerance}
    
    Recent Price Action (OHLC):
    ${JSON.stringify(recentCandles.map(c => ({ o: c.open, h: c.high, l: c.low, c: c.close, v: c.volume })))}
    
    Recent News Headlines:
    ${recentNews.map(n => `- ${n.headline}`).join('\n')}
    
    Based on this, determine the immediate trading action.
    Respond in JSON format.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, enum: ["BUY", "SELL", "HOLD"] },
            confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 100" },
            reasoning: { type: Type.STRING, description: "Short explanation of the decision (max 20 words)" },
            riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
          },
          required: ["action", "confidence", "reasoning", "riskLevel"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback in case of API error (e.g. quota exceeded or network issue)
    return {
      ...fallbackAnalysis(candles),
      reasoning: "Analysis failed (API Error) - Using fallback technicals."
    };
  }
};