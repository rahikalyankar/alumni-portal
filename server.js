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

// INITIALIZE TABLES AUTOMATICALLY
async function initDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT);
            CREATE TABLE IF NOT EXISTS mentors (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE, name TEXT, expertise TEXT, company TEXT, bio TEXT);
            CREATE TABLE IF NOT EXISTS requests (
                id SERIAL PRIMARY KEY, 
                student_name TEXT, 
                mentor_id INTEGER, 
                status TEXT DEFAULT 'Pending'
            );
        `);
        console.log("✅ Tables Ready");
    } catch (e) { console.log(e); }
}
initDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'ise_key', resave: false, saveUninitialized: true }));

// --- AUTH ---
app.post('/auth/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', [name, email, hash, role]);
        res.redirect('/login.html');
    } catch (e) { res.send("Email already exists"); }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows[0] && await bcrypt.compare(password, result.rows[0].password)) {
        req.session.user = result.rows[0];
        res.redirect('/portal.html');
    } else { res.send("Invalid Login"); }
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// --- PORTAL LOGIC ---
app.get('/api/user', (req, res) => res.json(req.session.user || null));

app.get('/api/mentors', async (req, res) => {
    const result = await pool.query('SELECT * FROM mentors');
    res.json(result.rows);
});

// Alumni registering themselves
app.post('/api/register-mentor', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'alumni') return res.status(403).send("Unauthorized");
    const { expertise, company, bio } = req.body;
    await pool.query(`INSERT INTO mentors (user_id, name, expertise, company, bio) 
                      VALUES ($1, $2, $3, $4, $5) 
                      ON CONFLICT (user_id) DO UPDATE SET expertise=$3, company=$4, bio=$5`, 
                      [req.session.user.id, req.session.user.name, expertise, company, bio]);
    res.redirect('/portal.html');
});

// Student sending request
app.post('/api/connect', async (req, res) => {
    if (!req.session.user) return res.status(401).send("Login first");
    const { mentor_id } = req.body;
    await pool.query('INSERT INTO requests (student_name, mentor_id) VALUES ($1, $2)', [req.session.user.name, mentor_id]);
    res.json({ success: true });
});

// Alumni checking requests
app.get('/api/my-requests', async (req, res) => {
    if (!req.session.user) return res.json([]);
    const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1', [req.session.user.id]);
    res.json(result.rows);
});

app.listen(process.env.PORT || 3000);
