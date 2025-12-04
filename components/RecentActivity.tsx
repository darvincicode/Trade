import React from 'react';
import { Trade, AIAnalysisResult } from '../types';

interface RecentActivityProps {
  logs: { time: string; result: AIAnalysisResult }[];
  trades: Trade[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ logs, trades }) => {
  return (
    <div className="bg-crypto-panel rounded-lg border border-gray-800 shadow-xl h-full flex flex-col">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-white font-bold">AI Decision Log</h3>
        <span className="text-xs text-gray-500 animate-pulse">● Live Monitoring</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
        {logs.length === 0 && <div className="text-center text-gray-600 text-sm mt-10">Waiting for first analysis...</div>}
        {logs.map((log, idx) => (
          <div key={idx} className="bg-[#0b0e11] p-3 rounded border border-gray-800 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400 text-xs">{log.time}</span>
              <span className={`text-xs font-bold px-1.5 rounded ${
                log.result.action === 'BUY' ? 'bg-crypto-green/20 text-crypto-green' :
                log.result.action === 'SELL' ? 'bg-crypto-red/20 text-crypto-red' :
                'bg-gray-700 text-gray-300'
              }`}>
                {log.result.action}
              </span>
            </div>
            <p className="text-gray-300 mb-1">{log.result.reasoning}</p>
            <div className="flex gap-4 mt-2 text-xs">
               <span className="text-gray-500">Confidence: <span className="text-white">{log.result.confidence}%</span></span>
               <span className="text-gray-500">Risk: <span className="text-white">{log.result.riskLevel}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};