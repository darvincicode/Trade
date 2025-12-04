import React from 'react';
import { IconDatabase, IconServer } from './Icons';

export const DeployTab: React.FC = () => {
  const serverCode = `
// server.js - 24/7 Trading Bot Backend
// Dependencies: npm install axios @supabase/supabase-js google-genai dotenv
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
require('dotenv').config();

// 1. Supabase Setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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
let activeTrade = null; 

// 3. Logic
async function runBot() {
  try {
    const price = 96500 + Math.random() * 200; 
    console.log(\`Price: \${price.toFixed(2)} | Active Trade: \${activeTrade ? 'YES' : 'NO'}\`);

    // ... (Add your TP/SL Logic here) ...
    // You can save trades to Supabase:
    // await supabase.from('trades').insert({ ... })

  } catch (err) {
    console.error('Error:', err.message);
  }
}

setInterval(runBot, CONFIG.interval);
console.log('🚀 24/7 Server Started.');
`;

  const supabaseSql = `
-- RUN THIS IN SUPABASE SQL EDITOR TO SETUP YOUR DATABASE

-- 1. Create a table for public profiles (so Admin can list users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create policies (Admin can do everything, Users can read own)
create policy "Public profiles are viewable by everyone" 
  on profiles for select using ( true );

create policy "Users can insert their own profile" 
  on profiles for insert with check ( auth.uid() = id );

create policy "Admin can delete profiles" 
  on profiles for delete using ( 
    (select role from profiles where id = auth.uid()) = 'admin' 
  );

-- 4. Create a trigger to auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. MANUALLY INSERT YOUR ADMIN USER HERE (If not signing up via UI)
-- Replace 'admin-uid-here' with actual ID if you manually create user in Auth first.
`;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Supabase Setup Alert */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-yellow-500 mb-2 flex items-center gap-2">
          <IconDatabase className="w-6 h-6" />
          Action Required: Supabase Database Setup
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          To make the <strong>Admin Panel</strong> work (listing users, roles), you must create the database tables in your Supabase project.
          Authentication (Login/Signup) is already connected.
        </p>
        <div className="bg-[#0b0e11] p-4 rounded border border-gray-800 overflow-x-auto relative group">
           <button 
             className="absolute top-2 right-2 text-xs bg-crypto-accent text-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold"
             onClick={() => navigator.clipboard.writeText(supabaseSql)}
           >
             COPY SQL
           </button>
           <pre className="text-xs font-mono text-green-400 whitespace-pre">
             {supabaseSql}
           </pre>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * Copy the SQL above and run it in the <a href="https://supabase.com/dashboard" target="_blank" className="text-blue-400 underline">Supabase SQL Editor</a>.
        </p>
      </div>

      <div className="bg-crypto-panel p-6 rounded-lg border border-gray-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-crypto-green/10 rounded-full text-crypto-green">
             <IconServer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">24/7 Server Code</h2>
            <p className="text-gray-400 text-sm">
              Use this Node.js code to run your bot permanently on a VPS (like DigitalOcean or Heroku).
            </p>
          </div>
        </div>

        <div className="bg-crypto-panel rounded-lg border border-gray-800 overflow-hidden">
          <div className="p-4 bg-[#0b0e11] border-b border-gray-800 flex justify-between items-center">
             <h3 className="font-bold text-white flex items-center gap-2">
               server.js
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
    </div>
  );
};