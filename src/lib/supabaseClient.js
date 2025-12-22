import { createClient } from '@supabase/supabase-js'

// GANTI INI DENGAN DATA DARI SUPABASE DASHBOARD -> SETTINGS -> API
const supabaseUrl = 'https://xyzcompany.supabase.co' 
const supabaseAnonKey = 'eyJh...' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey)