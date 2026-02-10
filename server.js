const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 3000;

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- AUTOMATIC DATABASE SETUP ---
async function initDb() {
    try {
        // 1. Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'student'
            );
        `);
        // 2. Create Mentors (Alumni) Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mentors (
                id SERIAL PRIMARY KEY,
                user_id INTEGER UNIQUE,
                name VARCHAR(100),
                expertise VARCHAR(100),
                company VARCHAR(100),
                bio TEXT
            );
        `);
        console.log("✅ Database Tables Ready");
    } catch (err) {
        console.error("❌ DB Init Error:", err);
    }
}
initDb();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ 
    secret: 'ise_connect_secret', 
    resave: false, 
    saveUninitialized: true 
}));

// --- ROUTES ---

// Signup
app.post('/auth/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', 
            [name, email, hashedPassword, role]);
        res.redirect('/login.html?msg=account_created');
    } catch (err) { res.status(500).send("User already exists or error."); }
});

// Login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            if (await bcrypt.compare(password, user.password)) {
                req.session.user = { id: user.id, name: user.name, role: user.role };
                return res.redirect('/portal.html');
            }
        }
        res.send("Invalid Credentials");
    } catch (err) { res.status(500).send("Login Error"); }
});

// API: Get Mentors
app.get('/api/mentors', async (req, res) => {
    const result = await pool.query('SELECT * FROM mentors');
    res.json(result.rows);
});

// API: Register as Mentor (Alumni Only)
app.post('/api/register-alumni', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'alumni') return res.status(403).send("Forbidden");
    const { expertise, company, bio } = req.body;
    try {
        await pool.query('INSERT INTO mentors (user_id, name, expertise, company, bio) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET expertise=$3, company=$4, bio=$5',
            [req.session.user.id, req.session.user.name, expertise, company, bio]);
        res.redirect('/portal.html');
    } catch (err) { res.status(500).send("Registration Error"); }
});

// Get Current User
app.get('/api/user', (req, res) => res.json(req.session.user || null));

// Logout
app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

app.listen(port, () => console.log(`🚀 Portal Live on port ${port}`));
