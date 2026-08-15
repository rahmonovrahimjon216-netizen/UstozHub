import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bigdpljqmnlgbwghhwff.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_CKfeJmHXwcdfgKp5BHqUkA_dn79kq5q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
