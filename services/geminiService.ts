import { GoogleGenAI, Type } from "@google/genai";
import { Candle, MarketNews, AIAnalysisResult, BotConfig } from '../types';

// NOTE: In a real app, this should be a backend call to protect the API key.
// We assume process.env.API_KEY is available.

let genAI: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!genAI) {
    if (!process.env.API_KEY) {
      console.error("API Key is missing!");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const analyzeMarket = async (
  candles: Candle[], 
  news: MarketNews[], 
  config: BotConfig
): Promise<AIAnalysisResult> => {
  const client = getAIClient();
  if (!client) {
    // Fallback if no API key provided for demo purposes
    return {
      action: 'HOLD',
      confidence: 0,
      reasoning: "API Key missing. Please check metadata or environment variables.",
      riskLevel: 'LOW'
    };
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
    return {
      action: 'HOLD',
      confidence: 0,
      reasoning: "AI analysis failed due to technical error.",
      riskLevel: 'HIGH'
    };
  }
};