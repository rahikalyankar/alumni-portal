const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

app.use(express.static('public'));

// API to fetch mentors from PostgreSQL
app.get('/api/mentors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
