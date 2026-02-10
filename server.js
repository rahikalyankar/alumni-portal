const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// AUTO-SETUP TABLES
async function initDb() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT);
        CREATE TABLE IF NOT EXISTS mentors (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE, name TEXT, expertise TEXT, company TEXT, bio TEXT);
        CREATE TABLE IF NOT EXISTS requests (
            id SERIAL PRIMARY KEY, 
            student_id INTEGER, 
            student_name TEXT, 
            mentor_id INTEGER, 
            status TEXT DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}
initDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'ise_ultra_secret', resave: false, saveUninitialized: true }));

// --- API ROUTES ---

// Send Request
app.post('/api/connect', async (req, res) => {
    if (!req.session.user) return res.status(401).send("Please login first");
    const { mentor_id } = req.body;
    await pool.query('INSERT INTO requests (student_id, student_name, mentor_id) VALUES ($1, $2, $3)', 
        [req.session.user.id, req.session.user.name, mentor_id]);
    res.json({ success: true });
});

// Get Requests (For Alumni to see who contacted them)
app.get('/api/my-requests', async (req, res) => {
    if (!req.session.user) return res.status(401).json([]);
    const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1', [req.session.user.id]);
    res.json(result.rows);
});

// Standard Auth & Mentor Routes (Keep your existing ones or use these)
app.post('/auth/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', [name, email, hash, role]);
    res.redirect('/login.html');
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows[0] && await bcrypt.compare(password, user.rows[0].password)) {
        req.session.user = user.rows[0];
        res.redirect('/portal.html');
    } else { res.send("Fail"); }
});

app.get('/api/mentors', async (req, res) => {
    const result = await pool.query('SELECT * FROM mentors');
    res.json(result.rows);
});

app.get('/api/user', (req, res) => res.json(req.session.user || null));
app.listen(process.env.PORT || 3000);
