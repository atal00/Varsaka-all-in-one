import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
// You can find these in your Supabase Project Settings > API
const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = (rawUrl && rawUrl !== 'undefined') ? rawUrl : 'https://hxexoazbnbtqhyytxitq.supabase.co';

const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseAnonKey = (rawKey && rawKey !== 'undefined') ? rawKey : 'sb_publishable_GyAl59bknkORHbIIFL9UgA_iOPDvcPV';

// This is for normal staff (Secure)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
