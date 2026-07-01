// ============================================================
//  supabase.js — Inisialisasi Supabase Client
//  Ganti SUPABASE_URL dan SUPABASE_ANON_KEY dengan milik kamu
//  Ambil dari: Supabase Dashboard → Settings → API
// ============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'https://onidnyksjxvrezvlwwzi.supabase.co'; 
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uaWRueWtzanh2cmV6dmx3d3ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjIyNDYsImV4cCI6MjA5ODI5ODI0Nn0.FifA6DnJqjP8SvaMt2snbwHP29E9ccaZvsRyyHuan2c';                // ← ganti

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);