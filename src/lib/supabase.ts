import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Allow the app to load without Supabase configured (for demo/testing)
// Features requiring Supabase will show appropriate messages
let supabase: SupabaseClient<Database> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('⚠️ Supabase not configured. Some features will be disabled.')
  console.warn(
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable all features.'
  )
}

export { supabase }
