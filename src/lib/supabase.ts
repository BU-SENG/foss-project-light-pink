import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env && (import.meta.env.VITE_SUPABASE_URL as string)) || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta.env && (import.meta.env.VITE_SUPABASE_ANON_KEY as string)) || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars not set: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true },
});

export default supabase;
