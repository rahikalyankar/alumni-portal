




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
//         await pool.query(`CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, sender_id INTEGER, receiver_id INTEGER, message TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`);
//         console.log("✅ All Database Tables Initialized");
//     } catch (e) { console.error(e); }
// }
// initDb();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));
// app.use(session({ secret: 'ise_secret', resave: false, saveUninitialized: true }));

// // --- RESTORED SIGNUP ROUTE ---
// app.post('/auth/signup', async (req, res) => {
//     const { name, email, password, role } = req.body;
//     try {
//         const hash = await bcrypt.hash(password, 10);
//         await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', [name, email, hash, role]);
//         res.redirect('/login.html');
//     } catch (e) { 
//         console.error(e);
//         res.status(500).send("User already exists or database error."); 
//     }
// });

// // --- LOGIN & LOGOUT ---
// app.post('/auth/login', async (req, res) => {
//     const { email, password } = req.body;
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     const user = result.rows[0];
//     if (user && await bcrypt.compare(password, user.password)) {
//         req.session.user = user;
//         res.redirect('/portal.html');
//     } else {
//         res.send("Invalid credentials. <a href='/login.html'>Try again</a>");
//     }
// });

// app.get('/auth/logout', (req, res) => req.session.destroy(() => res.redirect('/login.html')));

// // --- CHAT & API ---
// app.get('/api/user', (req, res) => res.json(req.session.user || null));

// app.post('/api/send-message', async (req, res) => {
//     const { receiver_id, message } = req.body;
//     await pool.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)', [req.session.user.id, receiver_id, message]);
//     res.json({ success: true });
// });

// app.get('/api/get-messages/:other_id', async (req, res) => {
//     const result = await pool.query(`SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY timestamp ASC`, [req.session.user.id, req.params.other_id]);
//     res.json(result.rows);
// });

// app.get('/api/mentors', async (req, res) => {
//     const result = await pool.query('SELECT * FROM mentors');
//     res.json(result.rows);
// });

// app.post('/api/connect', async (req, res) => {
//     await pool.query('INSERT INTO requests (student_name, student_id, mentor_id) VALUES ($1, $2, $3)', [req.session.user.name, req.session.user.id, req.body.mentor_id]);
//     res.json({ success: true });
// });

// app.get('/api/my-requests', async (req, res) => {
//     const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1 OR student_id = $1', [req.session.user.id]);
//     res.json(result.rows);
// });

// app.post('/api/accept-request', async (req, res) => {
//     await pool.query("UPDATE requests SET status = 'Accepted' WHERE id = $1", [req.body.request_id]);
//     res.json({ success: true });
// });

// app.post('/api/register-mentor', async (req, res) => {
//     const { expertise, company, bio } = req.body;
//     await pool.query(`INSERT INTO mentors (user_id, name, expertise, company, bio) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET expertise=$3, company=$4, bio=$5`, [req.session.user.id, req.session.user.name, expertise, company, bio]);
//     res.redirect('/portal.html');
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
        console.log("✅ All Database Tables Initialized");
    } catch (e) { console.error(e); }
}
initDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'ise_secret', resave: false, saveUninitialized: true }));

// --- RESTORED SIGNUP ROUTE ---
app.post('/auth/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)', [name, email, hash, role]);
        res.redirect('/login.html');
    } catch (e) { 
        console.error(e);
        res.status(500).send("User already exists or database error."); 
    }
});

// --- LOGIN & LOGOUT ---
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user;
        res.redirect('/portal.html');
    } else {
        res.send("Invalid credentials. <a href='/login.html'>Try again</a>");
    }
});

app.get('/auth/logout', (req, res) => req.session.destroy(() => res.redirect('/login.html')));

// --- CHAT & API ---
app.get('/api/user', (req, res) => res.json(req.session.user || null));

app.post('/api/send-message', async (req, res) => {
    const { receiver_id, message } = req.body;
    await pool.query('INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)', [req.session.user.id, receiver_id, message]);
    res.json({ success: true });
});

app.get('/api/get-messages/:other_id', async (req, res) => {
    const result = await pool.query(`SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY timestamp ASC`, [req.session.user.id, req.params.other_id]);
    res.json(result.rows);
});

app.get('/api/mentors', async (req, res) => {
    const result = await pool.query('SELECT * FROM mentors');
    res.json(result.rows);
});

app.post('/api/connect', async (req, res) => {
    await pool.query('INSERT INTO requests (student_name, student_id, mentor_id) VALUES ($1, $2, $3)', [req.session.user.name, req.session.user.id, req.body.mentor_id]);
    res.json({ success: true });
});

app.get('/api/my-requests', async (req, res) => {
    const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1 OR student_id = $1', [req.session.user.id]);
    res.json(result.rows);
});

app.post('/api/accept-request', async (req, res) => {
    await pool.query("UPDATE requests SET status = 'Accepted' WHERE id = $1", [req.body.request_id]);
    res.json({ success: true });
});

app.post('/api/register-mentor', async (req, res) => {
    const { expertise, company, bio } = req.body;
    await pool.query(`INSERT INTO mentors (user_id, name, expertise, company, bio) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET expertise=$3, company=$4, bio=$5`, [req.session.user.id, req.session.user.name, expertise, company, bio]);
    res.redirect('/portal.html');
});

app.listen(process.env.PORT || 3000);





