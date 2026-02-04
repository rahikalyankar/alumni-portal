const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

// Serve static files from the 'public' folder
app.use(express.static('public'));

// API Endpoint to get mentors
app.get('/api/mentors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__currentdir, 'public', 'index.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}`));
