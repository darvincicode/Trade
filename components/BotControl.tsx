import React from 'react';
import { BotStatus, BotConfig } from '../types';
import { IconPlay, IconPause, IconDatabase, IconActivity, IconZap } from './Icons';
import { SUPPORTED_PAIRS } from '../services/mockMarket';

interface BotControlProps {
  status: BotStatus;
  config: BotConfig;
  onToggle: () => void;
  onConfigChange: (newConfig: BotConfig) => void;
}

export const BotControl: React.FC<BotControlProps> = ({ status, config, onToggle, onConfigChange }) => {
  const isRunning = status === BotStatus.RUNNING;
  const isLive = config.tradingMode === 'live';

  return (
    <div className={`p-6 rounded-lg border shadow-xl relative transition-colors duration-300 ${isLive ? 'bg-[#1a0505] border-red-900/50' : 'bg-crypto-panel border-gray-800'}`}>
      
      {/* TRADING MODE SELECTOR */}
      <div className="flex bg-[#0b0e11] p-1 rounded-lg border border-gray-700 mb-6">
        <button
          onClick={() => !isRunning && onConfigChange({ ...config, tradingMode: 'paper' })}
          disabled={isRunning}
          className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            !isLive 
              ? 'bg-gray-700 text-white shadow' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <IconActivity className="w-4 h-4" />
          PAPER TRADING (DEMO)
        </button>
        <button
          onClick={() => !isRunning && onConfigChange({ ...config, tradingMode: 'live' })}
          disabled={isRunning}
          className={`flex-1 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            isLive 
              ? 'bg-crypto-red text-white shadow shadow-red-900/50' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <IconZap className="w-4 h-4" />
          LIVE TRADING (MEXC)
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Bot Status: 
          <span className={`${isRunning ? (isLive ? 'text-crypto-red animate-pulse' : 'text-crypto-green') : 'text-gray-500'} font-mono`}>
             {status}
             {isRunning && isLive && " (REAL MONEY)"}
          </span>
        </h2>
        
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-6 py-2 rounded font-bold transition-all ${
            isRunning 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : isLive
                ? 'bg-crypto-red text-white hover:bg-red-600 shadow-lg shadow-red-900/20'
                : 'bg-crypto-green text-black hover:bg-green-400'
          }`}
        >
          {isRunning ? <><IconPause className="w-4 h-4" /> STOP BOT</> : <><IconPlay className="w-4 h-4" /> {isLive ? 'START LIVE BOT' : 'START DEMO BOT'}</>}
        </button>
      </div>

      <div className="space-y-4">
        {/* API Credentials Section */}
        <div className={`p-4 border rounded-lg mb-4 transition-colors ${isLive ? 'bg-red-900/10 border-red-900/30' : 'bg-[#0b0e11] border-gray-800'}`}>
          <div className="flex justify-between items-center mb-3">
             <h3 className={`text-xs uppercase tracking-wider font-semibold ${isLive ? 'text-red-400' : 'text-gray-500'}`}>
               MEXC API Configuration {isLive && '(REQUIRED)'}
             </h3>
             {isLive && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded">REAL TRADING ACTIVE</span>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-gray-400 text-xs mb-1">API Key</label>
               <input 
                 type="text" 
                 value={config.apiKey}
                 disabled={isRunning}
                 onChange={(e) => onConfigChange({...config, apiKey: e.target.value})}
                 className="w-full bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none placeholder-gray-600 font-mono text-sm"
                 placeholder="mx0..."
               />
             </div>
             <div>
               <label className="block text-gray-400 text-xs mb-1">Secret Key</label>
               <input 
                 type="password" 
                 value={config.apiSecret}
                 disabled={isRunning}
                 onChange={(e) => onConfigChange({...config, apiSecret: e.target.value})}
                 className="w-full bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none placeholder-gray-600 font-mono text-sm"
                 placeholder="••••••••••••••••"
               />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-gray-400 text-xs mb-1">Trading Pair (MEXC Top 100)</label>
             <input 
               list="supported-pairs"
               type="text" 
               value={config.pair}
               disabled={isRunning}
               onChange={(e) => onConfigChange({...config, pair: e.target.value})}
               className="w-full bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
               placeholder="Select or type..."
             />
             <datalist id="supported-pairs">
               {SUPPORTED_PAIRS.map(pair => (
                 <option key={pair} value={pair} />
               ))}
             </datalist>
           </div>
           <div>
             <label className="block text-gray-400 text-xs mb-1">Amount per Trade (USDT)</label>
             <input 
               type="number" 
               value={config.amountPerTrade}
               disabled={isRunning}
               onChange={(e) => onConfigChange({...config, amountPerTrade: Number(e.target.value)})}
               className="w-full bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
             />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-gray-400 text-xs mb-1">Stop Loss (%)</label>
             <input 
               type="number" 
               step="0.1"
               value={config.stopLoss}
               disabled={isRunning}
               onChange={(e) => onConfigChange({...config, stopLoss: Number(e.target.value)})}
               className="w-full bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
             />
           </div>
           <div>
             <label className="block text-gray-400 text-xs mb-1">Take Profit (%)</label>
             <input 
               type="number" 
               step="0.1"
               value={config.takeProfit}
               disabled={isRunning}
               onChange={(e) => onConfigChange({...config, takeProfit: Number(e.target.value)})}
               className="w-full bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
             />
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-gray-400 text-xs mb-1">AI Strategy</label>
             <select 
                value={config.riskTolerance}
                disabled={isRunning}
                onChange={(e) => onConfigChange({...config, riskTolerance: e.target.value as any})}
                className="w-full bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
             >
               <option value="conservative">Conservative (Low Risk)</option>
               <option value="aggressive">Aggressive (High Frequency)</option>
             </select>
           </div>
           <div>
              <label className="block text-gray-400 text-xs mb-1">AI Analysis Interval (sec)</label>
              <input 
               type="number" 
               value={config.aiInterval}
               disabled={isRunning}
               onChange={(e) => onConfigChange({...config, aiInterval: Number(e.target.value)})}
               className="w-full bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
             />
           </div>
        </div>

        <div className="pt-2 border-t border-gray-800 mt-4 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-xs text-gray-500">API Status</span>
              <span className={`text-xs font-bold ${config.apiKey && config.apiSecret ? 'text-crypto-green' : 'text-orange-500'}`}>
                {config.apiKey && config.apiSecret ? 'Connected' : 'Missing Keys'}
              </span>
           </div>
           <div className="flex items-center gap-1 text-[10px] text-gray-500">
             <IconDatabase className="w-3 h-3" />
             <span>Auto-sync to DB active</span>
           </div>
        </div>
      </div>
    </div>
  );
};