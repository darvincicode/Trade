import React from 'react';
import { IconDatabase, IconServer, IconZap } from './Icons';

export const DeployTab: React.FC = () => {
  const multiUserServerCode = `
// server.js - Multi-User Bot Engine (SaaS Style)
// This script runs on your VPS (DigitalOcean/AWS/Heroku)
// It fetches ALL users from Supabase and runs their bots 24/7.

const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const Mexc = require('mexc-sdk'); // Hypothetical SDK
require('dotenv').config();

// 1. Admin Level Connection (Bypass RLS)
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY // Critical: Use Service Role Key for Admin Access
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runTradingCycle() {
  console.log('--- Starting Trading Cycle: ' + new Date().toISOString() + ' ---');

  // 1. Fetch ALL users who have configured a bot
  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .not('bot_config', 'is', null);

  if (error) return console.error('DB Error:', error);

  console.log(\`Found \${users.length} active traders.\`);

  // 2. Loop through each user and execute their specific strategy
  for (const user of users) {
    await processUserBot(user);
  }
}

async function processUserBot(user) {
  const config = user.bot_config;
  
  // Basic validation
  if (!config) return; 

  try {
    console.log(\`Processing for User: \${user.email} | Mode: \${config.tradingMode || 'paper'}\`);

    // A. AI Analysis
    const prompt = \`Analyze \${config.pair} with risk tolerance: \${config.riskTolerance}\`;
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    // Parse result...
    // const signal = ...

    // B. Execution Logic
    if (config.tradingMode === 'live') {
      if (!config.apiKey || !config.apiSecret) {
         console.warn("Skipping LIVE trade: Missing API keys");
         return;
      }
      
      console.log("EXECUTING REAL TRADE ON MEXC...");
      // const client = new Mexc.Client(config.apiKey, config.apiSecret);
      // await client.placeOrder(...)
      
    } else {
      console.log("SIMULATING PAPER TRADE (No real funds used)");
    }

  } catch (err) {
    console.error(\`Error for user \${user.email}:\`, err.message);
  }
}

// Run every 10 seconds
setInterval(runTradingCycle, 10000);
console.log('🚀 24/7 Multi-Tenant Server Started.');
`;

  const supabaseSql = `
-- 1. Create Profiles Table (if not exists)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  role text default 'user',
  bot_config jsonb,  -- THIS COLUMNS STORES THE USER CONFIG
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies
-- Everyone can read
create policy "Public profiles are viewable by everyone" 
  on profiles for select using ( true );

-- Users can update their own config (Critical for Dashboard Sync)
create policy "Users can update own profile" 
  on profiles for update using ( auth.uid() = id );

create policy "Users can insert their own profile" 
  on profiles for insert with check ( auth.uid() = id );

-- 4. Auto-create profile trigger
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Architecture Explanation */}
      <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-blue-400 mb-2 flex items-center gap-2">
          <IconZap className="w-6 h-6" />
          How to run 24/7 for ALL users?
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          You asked: <em>"If I have a database, can I run 24/7 backend?"</em>
          <br /><br />
          <strong>The Answer:</strong> No, a database only <em>stores</em> data. To run the bot 24/7 for every user, you <strong>MUST</strong> have a Node.js server (VPS) running.
          <br /><br />
          <strong>The Architecture:</strong>
          <ol className="list-decimal list-inside ml-2 mt-2 space-y-1 text-gray-400">
            <li><strong>Frontend (This Dashboard):</strong> Users log in and save their settings. These settings are pushed to the <strong>Supabase Database</strong>.</li>
            <li><strong>Database (Supabase):</strong> Holds the `bot_config` for User A, User B, User C, etc.</li>
            <li><strong>Backend (Node.js VPS):</strong> This is a script you upload to a server. It wakes up every 10 seconds, asks the Database for ALL users, and executes trades for them.</li>
          </ol>
        </p>
      </div>

      {/* Supabase Setup */}
      <div className="bg-crypto-panel p-6 rounded-lg border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <IconDatabase className="w-6 h-6 text-crypto-accent" />
          Step 1: Database Setup (Supabase)
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Run this SQL to enable the `bot_config` column. This allows the dashboard to save settings to the cloud.
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
      </div>

      {/* Node.js Server Code */}
      <div className="bg-crypto-panel p-6 rounded-lg border border-gray-800">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-crypto-green/10 rounded-full text-crypto-green">
             <IconServer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Step 2: The 24/7 Engine</h2>
            <p className="text-gray-400 text-sm">
              Upload this code to a VPS. It will handle <strong>all users</strong> automatically.
            </p>
          </div>
        </div>

        <div className="bg-crypto-panel rounded-lg border border-gray-800 overflow-hidden">
          <div className="p-4 bg-[#0b0e11] border-b border-gray-800 flex justify-between items-center">
             <h3 className="font-bold text-white flex items-center gap-2">
               server.js (Multi-User)
             </h3>
             <button 
               className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded border border-gray-700"
               onClick={() => navigator.clipboard.writeText(multiUserServerCode)}
             >
               Copy Code
             </button>
          </div>
          <div className="p-4 bg-[#1e1e1e] overflow-x-auto">
            <pre className="text-xs font-mono text-blue-300 leading-relaxed">
              {multiUserServerCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};