import { supabase } from './supabaseClient';
import { BotConfig } from '../types';

export const cloudService = {
  /**
   * Saves the user's bot configuration to their profile in Supabase.
   * This allows the 24/7 Node.js server to read these settings.
   */
  saveConfig: async (userId: string, config: BotConfig) => {
    // Skip for the hardcoded admin mock account
    if (userId === 'admin-master-id') return true;

    try {
      // We assume the 'profiles' table exists and has a 'bot_config' column (JSONB)
      const { error } = await supabase
        .from('profiles')
        .update({ bot_config: config })
        .eq('id', userId);
      
      if (error) {
        // If update fails (e.g., row doesn't exist), try upserting logic handled by triggers usually,
        // but here we just log it.
        console.error("Cloud Save Error:", error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Cloud Connection Failed", e);
      return false;
    }
  },
  
  /**
   * Loads the configuration when the user logs in on a new device.
   */
  loadConfig: async (userId: string): Promise<BotConfig | null> => {
    if (userId === 'admin-master-id') return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('bot_config')
        .eq('id', userId)
        .single();
        
      if (error || !data) return null;
      return data.bot_config as BotConfig;
    } catch (e) {
      return null;
    }
  }
};