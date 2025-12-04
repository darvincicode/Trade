import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Candle } from '../types';

interface ChartProps {
  data: Candle[];
}

export const MarketChart: React.FC<ChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[350px] bg-crypto-panel rounded-lg p-4 border border-gray-800 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-400 text-sm font-semibold">BTC/USDT Real-time</h3>
        <div className="flex gap-2">
           <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">1H</span>
           <span className="text-xs px-2 py-1 bg-gray-700 rounded text-white font-bold">4H</span>
           <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">1D</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ecb81" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ecb81" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#848e9c" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#848e9c" 
            tick={{fontSize: 12}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#181a20', border: '1px solid #2b3139', color: '#fff' }}
            itemStyle={{ color: '#0ecb81' }}
          />
          <Area 
            type="monotone" 
            dataKey="close" 
            stroke="#0ecb81" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorClose)" 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};