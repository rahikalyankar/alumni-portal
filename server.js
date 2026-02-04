const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors');
    let html = `<h1>🎓 Alumni Mentorship Portal</h1>`;
    html += `<p>Welcome to the ISE Project Cloud Deployment.</p>`;
    html += `<h3>Registered Mentors:</h3><ul>`;
    
    if (result.rows.length === 0) {
        html += `<li>No mentors found yet. (Database is connected!)</li>`;
    } else {
        result.rows.forEach(m => {
            html += `<li><strong>${m.name}</strong> - ${m.expertise} at ${m.company}</li>`;
        });
    }
    
    html += `</ul>`;
    res.send(html);
  } catch (err) {
    
    res.send("<h1>Portal is Live!</h1><p>The server is running, but the 'mentors' table needs to be created in the database.</p>");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
