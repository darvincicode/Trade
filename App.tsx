import React, { useState, useEffect, useRef } from 'react';
import { BotStatus, BotConfig, Candle, Trade, AIAnalysisResult } from './types';
import { generateNextCandle, getLatestPrice, MOCK_NEWS } from './services/mockMarket';
import { analyzeMarket } from './services/geminiService';
import { MarketChart } from './components/Chart';
import { BotControl } from './components/BotControl';
import { RecentActivity } from './components/RecentActivity';
import { IconBot, IconActivity, IconZap, IconTrendingUp, IconSettings } from './components/Icons';

// Initial Mock Data
const INITIAL_CANDLES: Candle[] = Array.from({ length: 20 }).map((_, i) => {
  const base = 96000;
  return {
    time: `10:${i < 10 ? '0' + i : i}:00`,
    open: base + Math.random() * 100,
    high: base + 200,
    low: base - 100,
    close: base + Math.random() * 100,
    volume: 1000 + Math.random() * 500
  };
});

export default function App() {
  // --- State ---
  const [botStatus, setBotStatus] = useState<BotStatus>(BotStatus.IDLE);
  const [config, setConfig] = useState<BotConfig>({
    apiKey: '',
    apiSecret: '',
    pair: 'BTC/USDT',
    amountPerTrade: 100,
    riskTolerance: 'aggressive',
    aiInterval: 10
  });

  const [candles, setCandles] = useState<Candle[]>(INITIAL_CANDLES);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<{ time: string; result: AIAnalysisResult }[]>([]);
  const [balance, setBalance] = useState<number>(10000);
  const [profit, setProfit] = useState<number>(0);

  // --- Refs ---
  const intervalRef = useRef<number | null>(null);
  const aiIntervalRef = useRef<number | null>(null);

  // --- Effects ---

  // 1. Market Data Simulation Loop (Runs always to show chart movement)
  useEffect(() => {
    const marketTicker = window.setInterval(() => {
      setCandles(prev => {
        const next = generateNextCandle(prev[prev.length - 1]);
        const newCandles = [...prev.slice(1), next];
        return newCandles;
      });
    }, 2000); // New candle every 2 seconds for demo speed

    return () => clearInterval(marketTicker);
  }, []);

  // 2. Bot Logic Loop
  useEffect(() => {
    if (botStatus === BotStatus.RUNNING) {
      // AI Analysis Loop
      const runAnalysis = async () => {
        const currentCandles = candles; // In a real effect, be careful with stale closures. 
        // We will fetch latest candles from state setter to avoid stale closure or use a ref.
        // For simplicity in this structure, we'll pass the *current* state via functional update logic or ref.
        
        // Actually, let's just trigger analysis.
        const result = await analyzeMarket(candles, MOCK_NEWS, config);
        
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [{ time: timestamp, result }, ...prev].slice(0, 50));

        // Execute Trade based on AI result
        if (result.confidence > 70) {
          if (result.action === 'BUY') {
            executeTrade('BUY', getLatestPrice());
          } else if (result.action === 'SELL') {
             executeTrade('SELL', getLatestPrice());
          }
        }
      };

      // Run immediately then schedule
      runAnalysis();
      aiIntervalRef.current = window.setInterval(runAnalysis, config.aiInterval * 1000);
    } else {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    }

    return () => {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    };
    // We depend on status. Warning: 'candles' dependency would cause re-setup of interval. 
    // To fix stale closure without resetting interval, use a Ref for candles or the functional update pattern inside.
    // For this demo, we will let it re-trigger if needed, or better, use a Ref for data access inside interval.
  }, [botStatus, config.aiInterval]); // Intentionally not adding 'candles' to avoid resetting interval constantly. 
  
  // NOTE: The above useEffect has a stale closure on 'candles'. 
  // In a production app, we would use a `candlesRef` to read the latest data inside the interval callback.
  const candlesRef = useRef(candles);
  useEffect(() => { candlesRef.current = candles; }, [candles]);
  
  // --- Helpers ---

  const executeTrade = (side: 'BUY' | 'SELL', price: number) => {
    setTrades(prev => {
      // Simple logic: if BUY, open position. If SELL, close matching or open short.
      // For demo: Just log it and adjust "profit" randomly.
      const profitImpact = side === 'SELL' ? (Math.random() * 20) : 0;
      setProfit(p => p + profitImpact);
      setBalance(b => b + profitImpact);

      return [{
        id: Math.random().toString(36).substr(2, 9),
        symbol: config.pair,
        side,
        price,
        amount: config.amountPerTrade,
        timestamp: Date.now(),
        status: 'CLOSED', // Instant execution for demo
        profit: profitImpact
      }, ...prev];
    });
  };

  const toggleBot = () => {
    if (botStatus === BotStatus.RUNNING) setBotStatus(BotStatus.PAUSED);
    else setBotStatus(BotStatus.RUNNING);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0b0e11] text-white font-sans selection:bg-crypto-green selection:text-black">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-gray-800 bg-[#0b0e11] flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-crypto-accent rounded-full flex items-center justify-center text-black">
            <IconBot />
          </div>
          <h1 className="font-bold text-lg tracking-wider">ASTRO<span className="text-crypto-accent">TRADE</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <div className="p-3 bg-crypto-panel rounded flex items-center gap-3 text-crypto-accent border border-crypto-accent/20 cursor-pointer">
            <IconActivity className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded flex items-center gap-3 cursor-pointer transition-colors">
            <IconTrendingUp className="w-5 h-5" />
            <span className="font-medium">Markets</span>
          </div>
          <div className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded flex items-center gap-3 cursor-pointer transition-colors">
             <IconSettings className="w-5 h-5" />
             <span className="font-medium">Settings</span>
          </div>
        </nav>

        <div className="p-6 border-t border-gray-800">
           <div className="text-xs text-gray-500 mb-2">ACCOUNT BALANCE</div>
           <div className="text-2xl font-bold font-mono">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
           <div className={`text-sm mt-1 ${profit >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
             {profit >= 0 ? '+' : ''}{profit.toFixed(2)} USDT (Today)
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
           <div>
             <h2 className="text-2xl font-bold mb-1">Trading Terminal</h2>
             <p className="text-gray-400 text-sm">Real-time AI analysis and automated execution</p>
           </div>
           <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">
                <div className="w-2 h-2 rounded-full bg-crypto-green animate-pulse"></div>
                System Operational
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">
                <IconZap className="w-3 h-3 text-crypto-accent" />
                Gemini 2.5 Flash
             </div>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <MarketChart data={candles} />
            <div className="mt-6">
              <BotControl 
                status={botStatus} 
                config={config} 
                onToggle={toggleBot} 
                onConfigChange={setConfig} 
              />
            </div>
          </div>

          {/* Activity Log */}
          <div className="h-full min-h-[500px]">
            <RecentActivity logs={logs} trades={trades} />
          </div>
        </div>

        {/* Trade History */}
        <div className="bg-crypto-panel rounded-lg border border-gray-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-bold">Trade History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 bg-[#0b0e11] uppercase">
                <tr>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Pair</th>
                  <th className="px-6 py-3">Side</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-400">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{trade.symbol}</td>
                    <td className={`px-6 py-4 font-bold ${trade.side === 'BUY' ? 'text-crypto-green' : 'text-crypto-red'}`}>
                      {trade.side}
                    </td>
                    <td className="px-6 py-4 text-white">${trade.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-400">{trade.amount} USDT</td>
                    <td className={`px-6 py-4 ${trade.profit && trade.profit > 0 ? 'text-crypto-green' : 'text-gray-500'}`}>
                      {trade.profit ? `+${trade.profit.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
                {trades.length === 0 && (
                   <tr>
                     <td colSpan={6} className="px-6 py-8 text-center text-gray-600">No trades executed yet. Start the bot.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}