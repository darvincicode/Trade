import React from 'react';
import { BotStatus, BotConfig } from '../types';
import { IconPlay, IconPause } from './Icons';

interface BotControlProps {
  status: BotStatus;
  config: BotConfig;
  onToggle: () => void;
  onConfigChange: (newConfig: BotConfig) => void;
}

export const BotControl: React.FC<BotControlProps> = ({ status, config, onToggle, onConfigChange }) => {
  const isRunning = status === BotStatus.RUNNING;

  return (
    <div className="bg-crypto-panel p-6 rounded-lg border border-gray-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Bot Status: 
          <span className={`${isRunning ? 'text-crypto-green' : 'text-gray-500'} font-mono`}>
             {status}
          </span>
        </h2>
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-6 py-2 rounded font-bold transition-all ${
            isRunning 
              ? 'bg-crypto-red/10 text-crypto-red hover:bg-crypto-red/20' 
              : 'bg-crypto-green text-black hover:bg-green-400'
          }`}
        >
          {isRunning ? <><IconPause className="w-4 h-4" /> STOP BOT</> : <><IconPlay className="w-4 h-4" /> START BOT</>}
        </button>
      </div>

      <div className="space-y-4">
        {/* API Credentials Section */}
        <div className="p-4 bg-[#0b0e11] border border-gray-800 rounded-lg mb-4">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">MEXC API Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-gray-400 text-xs mb-1">API Key</label>
               <input 
                 type="text" 
                 value={config.apiKey}
                 disabled={isRunning}
                 onChange={(e) => onConfigChange({...config, apiKey: e.target.value})}
                 className="w-full bg-crypto-panel border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none placeholder-gray-600 font-mono text-sm"
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
                 className="w-full bg-crypto-panel border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none placeholder-gray-600 font-mono text-sm"
                 placeholder="••••••••••••••••"
               />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="block text-gray-400 text-xs mb-1">Trading Pair (MEXC)</label>
             <input 
               type="text" 
               value={config.pair}
               disabled={isRunning}
               onChange={(e) => onConfigChange({...config, pair: e.target.value})}
               className="w-full bg-[#0b0e11] border border-gray-700 rounded p-2 text-white focus:border-crypto-accent outline-none"
             />
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

        <div className="pt-2 border-t border-gray-800 mt-4">
           <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">API Connection Status</span>
              <span className={`text-xs ${config.apiKey && config.apiSecret ? 'text-crypto-green' : 'text-orange-500'}`}>
                {config.apiKey && config.apiSecret ? 'Credentials Set' : 'Missing Credentials'}
              </span>
           </div>
           <p className="text-[10px] text-gray-600 mt-1">
             * To run 24/7 when this tab is closed, deploy this logic to a Node.js server. 
             This dashboard simulates the behavior in real-time.
           </p>
        </div>
      </div>
    </div>
  );
};