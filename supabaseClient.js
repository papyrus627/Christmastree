import { createClient } from '@supabase/supabase-js'

// 👇 这里直接填你的 Project URL (注意要加引号)
const supabaseUrl = "https://yhxsddcxcapizyscicub.supabase.co" 

// 👇 这里直接填你的 Anon Key (注意要加引号)
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloeHNkZGN4Y2FwaXp5c2NpY3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MzMxMTQsImV4cCI6MjA4MTAwOTExNH0.iSu-GpF5K47UE-wS27Iew1wymBFXQY7LQ5HpYLnXoiw"

export const supabase = createClient(supabaseUrl, supabaseKey)