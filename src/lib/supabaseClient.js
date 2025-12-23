import { createClient } from '@supabase/supabase-js'

// GANTI DENGAN DATA ASLI DARI DASHBOARD SUPABASE ANDA
const supabaseUrl = 'https://zldkriulvpibqlxwxike.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsZGtyaXVsdnBpYnFseHd4aWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MDYxMDMsImV4cCI6MjA4MTk4MjEwM30.dgq4b7JaxeFk13VT4RUTpe4A9O_6e0tmRWnu6YzlKdc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)