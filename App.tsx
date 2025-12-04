import React, { useState, useEffect, useRef } from 'react';
import { BotStatus, BotConfig, Candle, Trade, AIAnalysisResult } from './types';
import { generateNextCandle, getLatestPrice, MOCK_NEWS } from './services/mockMarket';
import { analyzeMarket } from './services/geminiService';
import { saveState, loadState } from './services/storage';
import { MarketChart } from './components/Chart';
import { BotControl } from './components/BotControl';
import { RecentActivity } from './components/RecentActivity';
import { DeployTab } from './components/DeployTab';
import { IconBot, IconActivity, IconZap, IconTrendingUp, IconSettings, IconServer } from './components/Icons';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deploy'>('dashboard');
  
  const [botStatus, setBotStatus] = useState<BotStatus>(BotStatus.IDLE);
  const [config, setConfig] = useState<BotConfig>({
    apiKey: '',
    apiSecret: '',
    pair: 'BTC/USDT',
    amountPerTrade: 100,
    riskTolerance: 'aggressive',
    aiInterval: 10,
    stopLoss: 2.0,
    takeProfit: 5.0
  });

  const [candles, setCandles] = useState<Candle[]>(INITIAL_CANDLES);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [logs, setLogs] = useState<{ time: string; result: AIAnalysisResult }[]>([]);
  const [balance, setBalance] = useState<number>(10000);
  const [profit, setProfit] = useState<number>(0);

  // --- Refs ---
  const aiIntervalRef = useRef<number | null>(null);

  // --- Effects ---

  // 1. Load Data from "Database" (LocalStorage)
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (saved.config) setConfig(saved.config);
      if (saved.trades) setTrades(saved.trades);
      if (saved.logs) setLogs(saved.logs);
      if (saved.balance) setBalance(saved.balance);
      if (saved.profit) setProfit(saved.profit);
    }
  }, []);

  // 2. Auto-Save to "Database" (LocalStorage)
  useEffect(() => {
    saveState(config, trades, logs, balance, profit);
  }, [config, trades, logs, balance, profit]);

  // 3. Market Data Simulation & Position Management Loop
  useEffect(() => {
    const marketTicker = window.setInterval(() => {
      setCandles(prev => {
        const lastCandle = prev[prev.length - 1];
        const next = generateNextCandle(lastCandle);
        const currentPrice = next.close;
        
        // --- AUTO TP/SL LOGIC ---
        // Check open trades and close them if limits hit
        setTrades(currentTrades => {
           let updatedTrades = [...currentTrades];
           let balanceChange = 0;
           let profitChange = 0;
           let hasUpdates = false;

           updatedTrades = updatedTrades.map(trade => {
             if (trade.status === 'OPEN' && trade.side === 'BUY') {
               // Check Stop Loss
               if (trade.slPrice && currentPrice <= trade.slPrice) {
                 hasUpdates = true;
                 const pnl = (currentPrice - trade.price) * (trade.amount / trade.price);
                 balanceChange += pnl;
                 profitChange += pnl;
                 return { ...trade, status: 'CLOSED', profit: pnl, closeReason: 'SL' };
               }
               // Check Take Profit
               if (trade.tpPrice && currentPrice >= trade.tpPrice) {
                 hasUpdates = true;
                 const pnl = (currentPrice - trade.price) * (trade.amount / trade.price);
                 balanceChange += pnl;
                 profitChange += pnl;
                 return { ...trade, status: 'CLOSED', profit: pnl, closeReason: 'TP' };
               }
             }
             return trade;
           });

           if (hasUpdates) {
             setBalance(b => b + balanceChange);
             setProfit(p => p + profitChange);
           }
           return updatedTrades;
        });

        const newCandles = [...prev.slice(1), next];
        return newCandles;
      });
    }, 2000);

    return () => clearInterval(marketTicker);
  }, []); // Run setup once, but internal state setters access fresh state

  // 4. Bot Logic Loop
  useEffect(() => {
    if (botStatus === BotStatus.RUNNING) {
      const runAnalysis = async () => {
        const result = await analyzeMarket(candles, MOCK_NEWS, config);
        
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [{ time: timestamp, result }, ...prev].slice(0, 50));

        if (result.confidence > 70) {
          const currentPrice = getLatestPrice();
          if (result.action === 'BUY') {
            openPosition('BUY', currentPrice);
          } else if (result.action === 'SELL') {
            closeAllPositions('SIGNAL', currentPrice);
          }
        }
      };

      runAnalysis();
      aiIntervalRef.current = window.setInterval(runAnalysis, config.aiInterval * 1000);
    } else {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    }

    return () => {
      if (aiIntervalRef.current) clearInterval(aiIntervalRef.current);
    };
  }, [botStatus, config.aiInterval]); // Warning: Stale closure on 'candles' for analysis is a known limitation in this demo.
  
  // --- Helpers ---

  const openPosition = (side: 'BUY' | 'SELL', price: number) => {
    setTrades(prev => {
      // Don't open if already have an open position (Simple Strategy)
      const hasOpen = prev.some(t => t.status === 'OPEN');
      if (hasOpen) return prev;

      const slPrice = side === 'BUY' ? price * (1 - config.stopLoss / 100) : undefined;
      const tpPrice = side === 'BUY' ? price * (1 + config.takeProfit / 100) : undefined;

      const newTrade: Trade = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: config.pair,
        side,
        price,
        amount: config.amountPerTrade,
        timestamp: Date.now(),
        status: 'OPEN',
        slPrice,
        tpPrice
      };
      
      return [newTrade, ...prev];
    });
  };

  const closeAllPositions = (reason: 'SIGNAL' | 'MANUAL', price: number) => {
    setTrades(prev => {
      let balanceChange = 0;
      let profitChange = 0;
      
      const updated = prev.map(t => {
        if (t.status === 'OPEN') {
           const pnl = (price - t.price) * (t.amount / t.price); // Simplified PnL for BUY
           balanceChange += pnl;
           profitChange += pnl;
           return { ...t, status: 'CLOSED' as const, profit: pnl, closeReason: reason };
        }
        return t;
      });
      
      setBalance(b => b + balanceChange);
      setProfit(p => p + profitChange);
      return updated;
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
          <div 
             onClick={() => setActiveTab('dashboard')}
             className={`p-3 rounded flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'bg-crypto-panel text-crypto-accent border border-crypto-accent/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <IconActivity className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </div>
          <div 
             className="p-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded flex items-center gap-3 cursor-pointer transition-colors"
          >
            <IconTrendingUp className="w-5 h-5" />
            <span className="font-medium">Markets</span>
          </div>
          <div 
             onClick={() => setActiveTab('deploy')}
             className={`p-3 rounded flex items-center gap-3 cursor-pointer transition-colors ${activeTab === 'deploy' ? 'bg-crypto-panel text-crypto-accent border border-crypto-accent/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
             <IconServer className="w-5 h-5" />
             <span className="font-medium">Deploy / DB</span>
          </div>
        </nav>

        <div className="p-6 border-t border-gray-800">
           <div className="flex justify-between items-center mb-2">
             <div className="text-xs text-gray-500">DEMO BALANCE</div>
             <button 
               onClick={() => {
                 const newBal = prompt("Set new demo balance amount:", balance.toString());
                 if (newBal && !isNaN(Number(newBal))) setBalance(Number(newBal));
               }}
               className="text-[10px] text-crypto-accent hover:underline cursor-pointer"
             >
               EDIT
             </button>
           </div>
           <div className="text-2xl font-bold font-mono">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
           <div className={`text-sm mt-1 ${profit >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
             {profit >= 0 ? '+' : ''}{profit.toFixed(2)} USDT (Today)
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
           <div>
             <h2 className="text-2xl font-bold mb-1">
               {activeTab === 'dashboard' ? 'Trading Terminal' : 'Backend Deployment'}
             </h2>
             <p className="text-gray-400 text-sm">
               {activeTab === 'dashboard' ? 'Real-time AI analysis and automated execution' : 'Configure database and 24/7 server execution'}
             </p>
           </div>
           <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded text-xs text-yellow-500 border border-yellow-500/20">
                <IconActivity className="w-3 h-3" />
                Paper Trading
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">
                <div className={`w-2 h-2 rounded-full ${botStatus === BotStatus.RUNNING ? 'bg-crypto-green animate-pulse' : 'bg-gray-500'}`}></div>
                {botStatus === BotStatus.RUNNING ? 'System Online' : 'System Idle'}
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded text-xs text-gray-400 border border-gray-700">
                <IconZap className="w-3 h-3 text-crypto-accent" />
                Gemini 2.5 Flash
             </div>
           </div>
        </header>

        {activeTab === 'dashboard' ? (
          <>
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
                <h3 className="text-white font-bold">Trade History (Database: Local)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 bg-[#0b0e11] uppercase">
                    <tr>
                      <th className="px-6 py-3">Time</th>
                      <th className="px-6 py-3">Pair</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3">Status</th>
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
                        <td className="px-6 py-4">
                           {trade.status === 'OPEN' ? (
                             <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs border border-blue-500/30">OPEN</span>
                           ) : (
                             <span className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 text-xs border border-gray-700">
                               {trade.closeReason || 'CLOSED'}
                             </span>
                           )}
                        </td>
                        <td className={`px-6 py-4 ${trade.profit && trade.profit > 0 ? 'text-crypto-green' : trade.profit && trade.profit < 0 ? 'text-crypto-red' : 'text-gray-500'}`}>
                          {trade.profit ? `${trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                    {trades.length === 0 && (
                       <tr>
                         <td colSpan={6} className="px-6 py-8 text-center text-gray-600">No trades recorded in database.</td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <DeployTab />
        )}
      </main>
    </div>
  );
}