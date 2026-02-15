

// const express = require('express');
// const { Pool } = require('pg');
// const bcrypt = require('bcryptjs');
// const session = require('express-session');
// const app = express();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }
// });

// async function initDb() {
//     try {
//         await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT);`);
//         await pool.query(`CREATE TABLE IF NOT EXISTS mentors (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE, name TEXT, expertise TEXT, company TEXT, bio TEXT);`);
//         await pool.query(`CREATE TABLE IF NOT EXISTS requests (id SERIAL PRIMARY KEY, student_name TEXT, student_id INTEGER, mentor_id INTEGER, status TEXT DEFAULT 'Pending');`);
//         // The messages table must store sender and receiver IDs
//         await pool.query(`CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER, message TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
//         console.log("✅ Database and Chat fully initialized");
//     } catch (e) { console.error(e); }
// }
// initDb();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));
// app.use(session({ secret: 'ise_secret', resave: false, saveUninitialized: true }));

// // --- Fix: Logout Route ---
// app.get('/auth/logout', (req, res) => {
//     req.session.destroy(() => res.redirect('/login.html'));
// });

// // --- Chat API: Sending ---
// app.post('/api/send-message', async (req, res) => {
//     if (!req.session.user) return res.status(401).send("Login first");
//     const { receiver_id, message } = req.body;
//     const sender_id = req.session.user.id;
//     // Insert message into DB
//     await pool.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)', [sender_id, receiver_id, message]);
//     res.json({ success: true });
// });

// // --- Chat API: Fetching (Both sides use this) ---
// app.get('/api/get-messages/:other_id', async (req, res) => {
//     if (!req.session.user) return res.json([]);
//     const my_id = req.session.user.id;
//     const other_id = req.params.other_id;
//     // Get messages where I am sender OR receiver
//     const result = await pool.query(`
//         SELECT * FROM messages 
//         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
//         ORDER BY timestamp ASC`, [my_id, other_id]);
//     res.json(result.rows);
// });

// // --- Other API Routes ---
// app.get('/api/user', (req, res) => res.json(req.session.user || null));
// app.get('/api/mentors', async (req, res) => {
//     const result = await pool.query('SELECT * FROM mentors');
//     res.json(result.rows);
// });

// app.post('/api/connect', async (req, res) => {
//     if (!req.session.user) return res.status(401).send("Login first");
//     await pool.query('INSERT INTO requests (student_name, student_id, mentor_id) VALUES ($1, $2, $3)', [req.session.user.name, req.session.user.id, req.body.mentor_id]);
//     res.json({ success: true });
// });

// app.get('/api/my-requests', async (req, res) => {
//     if (!req.session.user) return res.json([]);
//     const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1 OR student_id = $1', [req.session.user.id]);
//     res.json(result.rows);
// });

// app.post('/api/accept-request', async (req, res) => {
//     await pool.query("UPDATE requests SET status = 'Accepted' WHERE id = $1", [req.body.request_id]);
//     res.json({ success: true });
// });

// app.post('/auth/login', async (req, res) => {
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
//     if (result.rows[0] && await bcrypt.compare(req.body.password, result.rows[0].password)) {
//         req.session.user = result.rows[0];
//         res.redirect('/portal.html');
//     } else res.send("Invalid Credentials");
// });

// app.listen(process.env.PORT || 3000);



const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize Tables
async function initDb() {
    await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT);`);
    await pool.query(`CREATE TABLE IF NOT EXISTS mentors (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE, name TEXT, expertise TEXT, company TEXT, bio TEXT);`);
    await pool.query(`CREATE TABLE IF NOT EXISTS requests (id SERIAL PRIMARY KEY, student_name TEXT, student_id INTEGER, mentor_id INTEGER, status TEXT DEFAULT 'Pending');`);
    await pool.query(`CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER, message TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
    console.log("✅ Database Ready");
}
initDb();

app.use(express.json()); // Essential for reading message bodies
app.use(express.static('public'));
app.use(session({ secret: 'ise_secret', resave: false, saveUninitialized: true }));

// --- CHAT API ---
app.post('/api/send-message', async (req, res) => {
    const { receiver_id, message } = req.body;
    const sender_id = req.session.user.id;
    
    console.log(`📩 Message from ${sender_id} to ${receiver_id}: ${message}`); // DEBUG LOG

    try {
        await pool.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)', 
            [sender_id, receiver_id, message]);
        res.json({ success: true });
    } catch (err) {
        console.error("❌ DB Error:", err);
        res.status(500).json({ error: "Database failed" });
    }
});

app.get('/api/get-messages/:other_id', async (req, res) => {
    if (!req.session.user) return res.json([]);
    const my_id = req.session.user.id;
    const other_id = req.params.other_id;
    const result = await pool.query(`
        SELECT * FROM messages 
        WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY timestamp ASC`, [my_id, other_id]);
    res.json(result.rows);
});

// --- AUTH & CONNECTION ---
app.get('/api/user', (req, res) => res.json(req.session.user || null));

app.post('/api/connect', async (req, res) => {
    const { mentor_id } = req.body;
    const student_id = req.session.user.id;
    const student_name = req.session.user.name;
    await pool.query('INSERT INTO requests (student_name, student_id, mentor_id) VALUES ($1, $2, $3)', [student_name, student_id, mentor_id]);
    res.json({ success: true });
});

app.get('/api/my-requests', async (req, res) => {
    if (!req.session.user) return res.json([]);
    const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1 OR student_id = $1', [req.session.user.id]);
    res.json(result.rows);
});

app.post('/api/accept-request', async (req, res) => {
    await pool.query("UPDATE requests SET status = 'Accepted' WHERE id = $1", [req.body.request_id]);
    res.json({ success: true });
});

app.get('/api/mentors', async (req, res) => {
    const result = await pool.query('SELECT * FROM mentors');
    res.json(result.rows);
});

app.post('/auth/login', async (req, res) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
    if (result.rows[0] && await bcrypt.compare(req.body.password, result.rows[0].password)) {
        req.session.user = result.rows[0];
        res.redirect('/portal.html');
    } else res.send("Fail");
});

app.get('/auth/logout', (req, res) => req.session.destroy(() => res.redirect('/login.html')));

app.listen(process.env.PORT || 3000);
