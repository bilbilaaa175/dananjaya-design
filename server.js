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

app.get('/api/checkout', async (req, res) => {
  // Contoh dummy API. Nanti bisa diganti dengan logika checkout / order processing.
  return res.json({
    success: true,
    message: 'API checkout berhasil dipanggil.',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    message: 'Express server is running.'
  });
});

// Jika file statis tidak ditemukan, Express akan mengembalikan 404.
// Pastikan semua page HTML dan aset berada di folder public/.

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
  });
}

module.exports = app;
