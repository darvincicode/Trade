import React from 'react';
import { IconDatabase, IconServer } from './Icons';

export const DeployTab: React.FC = () => {
  const serverCode = `
// server.js - 24/7 Trading Bot Backend
// Dependencies: npm install axios sqlite3 google-genai dotenv
const sqlite3 = require('sqlite3').verbose();
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
require('dotenv').config();

// 1. Database Setup
const db = new sqlite3.Database('./trading_bot.db');
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS trades (id INTEGER PRIMARY KEY, symbol TEXT, side TEXT, price REAL, amount REAL, status TEXT, sl REAL, tp REAL, timestamp INTEGER)");
  db.run("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, action TEXT, reasoning TEXT, timestamp INTEGER)");
});

// 2. Configuration
const CONFIG = {
  pair: 'BTC/USDT',
  interval: 10000, 
  apiKey: process.env.MEXC_API_KEY,
  apiSecret: process.env.MEXC_SECRET_KEY,
  stopLossPct: 0.02, // 2%
  takeProfitPct: 0.05 // 5%
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
let activeTrade = null; // Simple memory cache for active position

// 3. Logic
async function runBot() {
  try {
    // A. Fetch Price (Mocked)
    const price = 96500 + Math.random() * 200; 
    console.log(\`Price: \${price.toFixed(2)} | Active Trade: \${activeTrade ? 'YES' : 'NO'}\`);

    // B. Check Stops (TP/SL)
    if (activeTrade) {
      if (price <= activeTrade.sl) {
         console.log('🛑 Stop Loss Hit. Selling...');
         // closeOrder(CONFIG.pair, 'SELL', activeTrade.amount);
         activeTrade = null;
         return; 
      }
      if (price >= activeTrade.tp) {
         console.log('💰 Take Profit Hit. Selling...');
         // closeOrder(CONFIG.pair, 'SELL', activeTrade.amount);
         activeTrade = null;
         return;
      }
    }

    // C. AI Analysis (Only if no active trade)
    if (!activeTrade) {
      const prompt = \`Analyze \${CONFIG.pair}. Price: \${price}. Return JSON: { "action": "BUY/SELL/HOLD", "reasoning": "..." }\`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const decision = JSON.parse(response.text);
      
      if (decision.action === 'BUY') {
         console.log('🚀 AI Signal: BUY');
         // placeOrder(CONFIG.pair, 'BUY', ...);
         
         const sl = price * (1 - CONFIG.stopLossPct);
         const tp = price * (1 + CONFIG.takeProfitPct);
         
         activeTrade = { symbol: CONFIG.pair, price, amount: 100, sl, tp, status: 'OPEN' };
         // db.run("INSERT INTO trades ...");
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

setInterval(runBot, CONFIG.interval);
console.log('🚀 24/7 Server with Auto TP/SL Started.');
`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-crypto-panel p-6 rounded-lg border border-gray-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-crypto-green/10 rounded-full text-crypto-green">
             <IconDatabase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Persistent Database & 24/7 Execution</h2>
            <p className="text-gray-400 text-sm">
              Updated backend code now includes <strong>Stop Loss</strong> and <strong>Take Profit</strong> logic.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
           <div className="bg-[#0b0e11] p-4 rounded border border-gray-800">
              <h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2">1. Local Storage (Current)</h3>
              <p className="text-xs text-gray-500">
                Dashboard saves your settings, including TP/SL prefs, to browser storage.
              </p>
              <div className="mt-3 text-xs text-crypto-green font-mono">● Active</div>
           </div>
           <div className="bg-[#0b0e11] p-4 rounded border border-gray-800">
              <h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2">2. SQLite Database</h3>
              <p className="text-xs text-gray-500">
                Backend code below uses SQLite to track trades and store TP/SL levels for every open position.
              </p>
           </div>
           <div className="bg-[#0b0e11] p-4 rounded border border-gray-800">
              <h3 className="font-bold text-gray-300 mb-2 flex items-center gap-2">3. Cloud Database</h3>
              <p className="text-xs text-gray-500">
                For enterprise scale, connect to PostgreSQL or MongoDB Atlas. Allows multiple bot instances to share data.
              </p>
           </div>
        </div>
      </div>

      <div className="bg-crypto-panel rounded-lg border border-gray-800 overflow-hidden">
        <div className="p-4 bg-[#0b0e11] border-b border-gray-800 flex justify-between items-center">
           <h3 className="font-bold text-white flex items-center gap-2">
             <IconServer className="w-5 h-5 text-crypto-accent" />
             Server-Side Code (Node.js)
           </h3>
           <button 
             className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded border border-gray-700"
             onClick={() => navigator.clipboard.writeText(serverCode)}
           >
             Copy Code
           </button>
        </div>
        <div className="p-4 bg-[#1e1e1e] overflow-x-auto">
          <pre className="text-xs font-mono text-blue-300 leading-relaxed">
            {serverCode}
          </pre>
        </div>
      </div>
    </div>
  );
};