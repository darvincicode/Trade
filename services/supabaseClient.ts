import { createClient } from '@supabase/supabase-js';

// Configuration provided by user
const SUPABASE_URL = 'https://gwydjmtxardddcsphijp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3eWRqbXR4YXJkZGRjc3BoaWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MjY3NjIsImV4cCI6MjA4MDQwMjc2Mn0.sg1RrkWuUB-GE2P-HXrLipQE_4DOoByh5KCrFEdo3MQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);