const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();

// 1. Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 2. Database Initialization (Fixed Tables)
async function initDb() {
    try {
        // Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY, 
                name TEXT NOT NULL, 
                email TEXT UNIQUE NOT NULL, 
                password TEXT NOT NULL, 
                role TEXT NOT NULL
            );
        `);
        // Create Mentors Table (Linked to users.id)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mentors (
                id SERIAL PRIMARY KEY, 
                user_id INTEGER UNIQUE NOT NULL, 
                name TEXT NOT NULL, 
                expertise TEXT, 
                company TEXT, 
                bio TEXT
            );
        `);
        // Create Requests Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id SERIAL PRIMARY KEY, 
                student_name TEXT NOT NULL, 
                mentor_id INTEGER NOT NULL, 
                status TEXT DEFAULT 'Pending'
            );
        `);
        console.log("✅ Database tables initialized successfully");
    } catch (e) {
        console.error("❌ DB Initialization Error:", e);
    }
}
initDb();

// 3. Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ 
    secret: 'ise_connect_secret_123', 
    resave: false, 
    saveUninitialized: true,
    cookie: { secure: false } // Set to true only if using HTTPS
}));

// 4. Auth Routes
app.post('/auth/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', [name, email, hash, role]);
        res.redirect('/login.html');
    } catch (e) {
        console.error("Signup Error:", e);
        res.status(500).send("Error: User might already exist.");
    }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows[0] && await bcrypt.compare(password, result.rows[0].password)) {
            req.session.user = result.rows[0];
            console.log("User logged in:", req.session.user.name);
            res.redirect('/portal.html');
        } else {
            res.send("Invalid email or password.");
        }
    } catch (e) {
        console.error("Login Error:", e);
        res.status(500).send("Internal Server Error during login.");
    }
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login.html'));
});

// 5. API Routes
app.get('/api/user', (req, res) => res.json(req.session.user || null));

app.get('/api/mentors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mentors');
        res.json(result.rows);
    } catch (e) { res.status(500).json([]); }
});

// --- THE FUNCTION CAUSING YOUR ERROR (FIXED) ---
app.post('/api/register-mentor', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'alumni') {
        return res.status(403).send("Error: You must be logged in as an Alumni to do this.");
    }

    const { expertise, company, bio } = req.body;
    const userId = req.session.user.id;
    const userName = req.session.user.name;

    try {
        // Using ON CONFLICT to prevent "Duplicate Key" errors
        await pool.query(`
            INSERT INTO mentors (user_id, name, expertise, company, bio) 
            VALUES ($1, $2, $3, $4, $5) 
            ON CONFLICT (user_id) 
            DO UPDATE SET expertise = EXCLUDED.expertise, company = EXCLUDED.company, bio = EXCLUDED.bio`, 
            [userId, userName, expertise, company, bio]
        );
        console.log(`✅ Profile updated for: ${userName}`);
        res.redirect('/portal.html');
    } catch (e) {
        console.error("❌ Profile Saving Error:", e);
        res.status(500).send("Error saving profile: " + e.message);
    }
});

app.post('/api/connect', async (req, res) => {
    if (!req.session.user) return res.status(401).send("Please login.");
    const { mentor_id } = req.body;
    try {
        await pool.query('INSERT INTO requests (student_name, mentor_id) VALUES ($1, $2)', [req.session.user.name, mentor_id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false }); }
});

app.get('/api/my-requests', async (req, res) => {
    if (!req.session.user) return res.json([]);
    try {
        const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1', [req.session.user.id]);
        res.json(result.rows);
    } catch (e) { res.json([]); }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
