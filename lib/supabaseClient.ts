import { createClient } from '@supabase/supabase-js'

// Ganti dengan URL & Key dari dashboard Supabase Anda
const supabaseUrl = 'https://effcfuogblhcoxwfwexl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZmNmdW9nYmxoY294d2Z3ZXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDUwNTgsImV4cCI6MjA3NjA4MTA1OH0.yElPEpxHmjSFXDVQg8CEHDG4yWyMQPrzWBxg7OI3Yh8';

export const supabase = createClient(supabaseUrl, supabaseKey);