const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

// THIS FUNCTION RUNS EVERY TIME THE SERVER STARTS
async function setupDatabase() {
  try {
    // 1. Create the table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        expertise VARCHAR(100),
        company VARCHAR(100)
      );
    `);

    // 2. Check if the table is empty
    const check = await pool.query('SELECT COUNT(*) FROM mentors');
    if (check.rows[0].count == 0) {
      // 3. Add sample data if it's empty
      await pool.query(`
        INSERT INTO mentors (name, expertise, company) VALUES 
        ('Rahul Sharma', 'Web Development', 'Google'),
        ('Priya Patel', 'Data Science', 'Microsoft'),
        ('Amit Verma', 'Cybersecurity', 'Amazon');
      `);
      console.log("Database initialized with sample data!");
    }
  } catch (err) {
    console.error("Database setup error:", err);
  }
}

setupDatabase();

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mentors');
    let html = `
      <body style="font-family: Arial; padding: 40px; background: #f4f4f9;">
        <h1 style="color: #2c3e50;">🎓 Alumni Mentorship Portal</h1>
        <p>Live ISE Project - Connected to PostgreSQL Cloud</p>
        <hr>
        <h3>Available Mentors:</h3>
        <div style="display: grid; gap: 15px;">
    `;
    
    result.rows.forEach(m => {
        html += `
          <div style="background: white; padding: 15px; border-radius: 8px; border-left: 5px solid #3498db; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <strong>${m.name}</strong><br>
            ${m.expertise} at <b>${m.company}</b>
          </div>
        `;
    });
    
    html += `</div></body>`;
    res.send(html);
  } catch (err) {
    res.send("<h1>Server Error</h1><p>" + err.message + "</p>");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
