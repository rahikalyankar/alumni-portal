



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
//         // New table for Chat
//         await pool.query(`CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER, message TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
//         console.log("✅ Database and Chat Tables Ready");
//     } catch (e) { console.error(e); }
// }
// initDb();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));
// app.use(session({ secret: 'ise_secret', resave: false, saveUninitialized: true }));

// // --- CHAT API ---
// app.post('/api/send-message', async (req, res) => {
//     const { receiver_id, message } = req.body;
//     const sender_id = req.session.user.id;
//     await pool.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)', [sender_id, receiver_id, message]);
//     res.json({ success: true });
// });

// app.get('/api/get-messages/:other_id', async (req, res) => {
//     const my_id = req.session.user.id;
//     const other_id = req.params.other_id;
//     const result = await pool.query(`
//         SELECT * FROM messages 
//         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
//         ORDER BY timestamp ASC`, [my_id, other_id]);
//     res.json(result.rows);
// });

// // --- UPDATED CONNECT ROUTE (Saves student_id) ---
// app.post('/api/connect', async (req, res) => {
//     const { mentor_id } = req.body;
//     await pool.query('INSERT INTO requests (student_name, student_id, mentor_id) VALUES ($1, $2, $3)', [req.session.user.name, req.session.user.id, mentor_id]);
//     res.json({ success: true });
// });

// // Reuse your existing login, signup, and accept-request routes here...
// app.get('/api/user', (req, res) => res.json(req.session.user || null));
// app.get('/api/mentors', async (req, res) => {
//     const result = await pool.query('SELECT * FROM mentors');
//     res.json(result.rows);
// });
// app.get('/api/my-requests', async (req, res) => {
//     const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1', [req.session.user.id]);
//     res.json(result.rows);
// });
// app.post('/api/accept-request', async (req, res) => {
//     await pool.query("UPDATE requests SET status = 'Accepted' WHERE id = $1", [req.body.request_id]);
//     res.json({ success: true });
// });
// app.post('/auth/login', async (req, res) => {
//     const { email, password } = req.body;
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     if (result.rows[0] && await bcrypt.compare(password, result.rows[0].password)) {
//         req.session.user = result.rows[0];
//         res.redirect('/portal.html');
//     } else res.send("Fail");
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

async function initDb() {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS mentors (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE, name TEXT, expertise TEXT, company TEXT, bio TEXT);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS requests (id SERIAL PRIMARY KEY, student_name TEXT, student_id INTEGER, mentor_id INTEGER, status TEXT DEFAULT 'Pending');`);
        await pool.query(`CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER, message TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
        console.log("✅ Database and Chat Tables Ready");
    } catch (e) { console.error(e); }
}
initDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'ise_secret', resave: false, saveUninitialized: true }));

// --- FIX: Logout Route ---
app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login.html');
    });
});

// --- Chat API ---
app.post('/api/send-message', async (req, res) => {
    if (!req.session.user) return res.status(401).send("Login first");
    const { receiver_id, message } = req.body;
    await pool.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)', [req.session.user.id, receiver_id, message]);
    res.json({ success: true });
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

// --- Existing Routes ---
app.get('/api/user', (req, res) => res.json(req.session.user || null));
app.get('/api/mentors', async (req, res) => {
    const result = await pool.query('SELECT * FROM mentors');
    res.json(result.rows);
});

app.post('/api/connect', async (req, res) => {
    if (!req.session.user) return res.status(401).send("Login first");
    await pool.query('INSERT INTO requests (student_name, student_id, mentor_id) VALUES ($1, $2, $3)', [req.session.user.name, req.session.user.id, req.body.mentor_id]);
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

app.post('/auth/login', async (req, res) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [req.body.email]);
    if (result.rows[0] && await bcrypt.compare(req.body.password, result.rows[0].password)) {
        req.session.user = result.rows[0];
        res.redirect('/portal.html');
    } else res.send("Invalid Credentials");
});

app.listen(process.env.PORT || 3000);
