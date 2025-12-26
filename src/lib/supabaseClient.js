import { createClient } from '@supabase/supabase-js'

// GANTI DENGAN DATA ASLI DARI DASHBOARD SUPABASE ANDA
const supabaseUrl = 'https://vmtzagvijxmyjvdafvpp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdHphZ3ZpanhteWp2ZGFmdnBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NjMyNjMsImV4cCI6MjA4MjEzOTI2M30.3rFhWmUl4rel3LEUCZ3eEJ2sX9-fLAhaKca9GFjNvXE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)