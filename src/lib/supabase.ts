import { createClient } from '@supabase/supabase-js';

// These should be in a .env file in a real application
// For now, we'll use placeholders or ask the user to provide them
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
