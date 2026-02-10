const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- AUTOMATIC DATABASE REPAIR ---
async function initDb() {
    try {
        // 1. Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY, 
                name TEXT NOT NULL, 
                email TEXT UNIQUE NOT NULL, 
                password TEXT NOT NULL, 
                role TEXT NOT NULL
            );
        `);

        // 2. Create Mentors Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mentors (
                id SERIAL PRIMARY KEY, 
                user_id INTEGER UNIQUE, 
                name TEXT, 
                expertise TEXT, 
                company TEXT, 
                bio TEXT
            );
        `);

        // 3. REPAIR: Force add user_id if it's missing (Fixes your specific error)
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='mentors' AND column_name='user_id') THEN
                    ALTER TABLE mentors ADD COLUMN user_id INTEGER UNIQUE;
                END IF;
            END $$;
        `);

        // 4. Create Requests Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id SERIAL PRIMARY KEY, 
                student_name TEXT NOT NULL, 
                mentor_id INTEGER NOT NULL, 
                status TEXT DEFAULT 'Pending'
            );
        `);
        
        console.log("✅ Database tables initialized and REPAIRED");
    } catch (e) {
        console.error("❌ DB Initialization Error:", e);
    }
}
initDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ 
    secret: 'ise_connect_secret', 
    resave: false, 
    saveUninitialized: true 
}));

// --- AUTH ROUTES ---
app.post('/auth/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', [name, email, hash, role]);
        res.redirect('/login.html');
    } catch (e) { res.status(500).send("User already exists."); }
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows[0] && await bcrypt.compare(password, result.rows[0].password)) {
            req.session.user = result.rows[0];
            res.redirect('/portal.html');
        } else { res.send("Invalid credentials."); }
    } catch (e) { res.status(500).send("Login error."); }
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login.html'));
});

// --- API ROUTES ---
app.get('/api/user', (req, res) => res.json(req.session.user || null));

app.get('/api/mentors', async (req, res) => {
    const result = await pool.query('SELECT * FROM mentors');
    res.json(result.rows);
});

app.post('/api/register-mentor', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'alumni') {
        return res.status(403).send("Unauthorized");
    }
    const { expertise, company, bio } = req.body;
    try {
        await pool.query(`
            INSERT INTO mentors (user_id, name, expertise, company, bio) 
            VALUES ($1, $2, $3, $4, $5) 
            ON CONFLICT (user_id) DO UPDATE SET expertise=$3, company=$4, bio=$5`, 
            [req.session.user.id, req.session.user.name, expertise, company, bio]
        );
        res.redirect('/portal.html');
    } catch (e) { 
        console.error(e);
        res.status(500).send("Error saving profile: " + e.message); 
    }
});

app.post('/api/connect', async (req, res) => {
    if (!req.session.user) return res.status(401).send("Login first");
    const { mentor_id } = req.body;
    await pool.query('INSERT INTO requests (student_name, mentor_id) VALUES ($1, $2)', [req.session.user.name, mentor_id]);
    res.json({ success: true });
});

app.get('/api/my-requests', async (req, res) => {
    if (!req.session.user) return res.json([]);
    const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1', [req.session.user.id]);
    res.json(result.rows);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🚀 Server on port ${port}`));
