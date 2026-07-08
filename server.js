const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_KEY)) {
  console.warn('Warning: SUPABASE_URL and SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY must be set.');
}

const supabaseKey = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL || '', supabaseKey);

const app = express();
const publicPath = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.static(publicPath));

// ── [BARU] API UNTUK LOGIN ──
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ success: false, error: error.message });
    
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── [BARU] API UNTUK REGISTER ──
app.post('/api/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) return res.status(400).json({ success: false, error: error.message });
    
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/checkout', async (req, res) => {
  return res.json({
    success: true,
    message: 'API checkout berhasil dipanggil.',
    data: { timestamp: new Date().toISOString() }
  });
});

app.get('/api/health', (req, res) => {
  return res.json({ status: 'ok', message: 'Express server is running.' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
}

module.exports = app;