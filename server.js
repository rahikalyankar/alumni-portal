// // const express = require('express');
// // const { Pool } = require('pg');
// // const bcrypt = require('bcryptjs');
// // const session = require('express-session');
// // const app = express();

// // const pool = new Pool({
// //   connectionString: process.env.DATABASE_URL,
// //   ssl: { rejectUnauthorized: false }
// // });

// // async function initDb() {
// //     try {
// //         await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT);`);
// //         await pool.query(`CREATE TABLE IF NOT EXISTS mentors (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE, name TEXT, expertise TEXT, company TEXT, bio TEXT);`);
// //         // Ensure requests table has an ID for the Accept button to work
// //         await pool.query(`CREATE TABLE IF NOT EXISTS requests (id SERIAL PRIMARY KEY, student_name TEXT, mentor_id INTEGER, status TEXT DEFAULT 'Pending');`);
// //         console.log("✅ Database Ready");
// //     } catch (e) { console.log(e); }
// // }
// // initDb();

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));
// // app.use(express.static('public'));
// // app.use(session({ secret: 'ise_secret', resave: false, saveUninitialized: true }));

// // // --- API ROUTES ---
// // app.get('/api/user', (req, res) => res.json(req.session.user || null));

// // app.get('/api/mentors', async (req, res) => {
// //     const result = await pool.query('SELECT * FROM mentors');
// //     res.json(result.rows);
// // });

// // app.post('/api/register-mentor', async (req, res) => {
// //     if (!req.session.user || req.session.user.role !== 'alumni') return res.status(403).send("Unauthorized");
// //     const { expertise, company, bio } = req.body;
// //     await pool.query(`INSERT INTO mentors (user_id, name, expertise, company, bio) 
// //                       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET expertise=$3, company=$4, bio=$5`, 
// //                       [req.session.user.id, req.session.user.name, expertise, company, bio]);
// //     res.redirect('/portal.html');
// // });

// // app.post('/api/connect', async (req, res) => {
// //     if (!req.session.user) return res.status(401).send("Login first");
// //     const { mentor_id } = req.body;
// //     await pool.query('INSERT INTO requests (student_name, mentor_id) VALUES ($1, $2)', [req.session.user.name, mentor_id]);
// //     res.json({ success: true });
// // });

// // app.get('/api/my-requests', async (req, res) => {
// //     if (!req.session.user) return res.json([]);
// //     const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1 ORDER BY id DESC', [req.session.user.id]);
// //     res.json(result.rows);
// // });

// // // NEW: Accept Request Route
// // app.post('/api/accept-request', async (req, res) => {
// //     if (!req.session.user || req.session.user.role !== 'alumni') return res.status(403).send("Unauthorized");
// //     const { request_id } = req.body;
// //     await pool.query('UPDATE requests SET status = $1 WHERE id = $2', ['Accepted', request_id]);
// //     res.json({ success: true });
// // });

// // app.post('/auth/login', async (req, res) => {
// //     const { email, password } = req.body;
// //     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
// //     if (result.rows[0] && await bcrypt.compare(password, result.rows[0].password)) {
// //         req.session.user = result.rows[0];
// //         res.redirect('/portal.html');
// //     } else res.send("Fail");
// // });

// // app.listen(process.env.PORT || 3000);



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
//         // Ensure requests table has an 'id' and 'status'
//         await pool.query(`CREATE TABLE IF NOT EXISTS requests (id SERIAL PRIMARY KEY, student_name TEXT, mentor_id INTEGER, status TEXT DEFAULT 'Pending');`);
//         console.log("✅ Database Ready");
//     } catch (e) { console.error(e); }
// }
// initDb();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));
// app.use(session({ secret: 'ise_secret', resave: false, saveUninitialized: true }));

// app.get('/api/user', (req, res) => res.json(req.session.user || null));

// app.get('/api/mentors', async (req, res) => {
//     const result = await pool.query('SELECT * FROM mentors');
//     res.json(result.rows);
// });

// app.post('/api/register-mentor', async (req, res) => {
//     if (!req.session.user || req.session.user.role !== 'alumni') return res.status(403).send("Unauthorized");
//     const { expertise, company, bio } = req.body;
//     await pool.query(`INSERT INTO mentors (user_id, name, expertise, company, bio) 
//                       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET expertise=$3, company=$4, bio=$5`, 
//                       [req.session.user.id, req.session.user.name, expertise, company, bio]);
//     res.redirect('/portal.html');
// });

// app.post('/api/connect', async (req, res) => {
//     if (!req.session.user) return res.status(401).send("Login first");
//     const { mentor_id } = req.body;
//     await pool.query('INSERT INTO requests (student_name, mentor_id) VALUES ($1, $2)', [req.session.user.name, mentor_id]);
//     res.json({ success: true });
// });

// app.get('/api/my-requests', async (req, res) => {
//     if (!req.session.user) return res.json([]);
//     const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1 ORDER BY id DESC', [req.session.user.id]);
//     res.json(result.rows);
// });

// // NEW ROUTE: Updates status to 'Accepted'
// app.post('/api/accept-request', async (req, res) => {
//     if (!req.session.user || req.session.user.role !== 'alumni') return res.status(403).send("Unauthorized");
//     const { request_id } = req.body;
//     try {
//         await pool.query('UPDATE requests SET status = $1 WHERE id = $2', ['Accepted', request_id]);
//         res.json({ success: true });
//     } catch (e) { res.status(500).send("Error"); }
// });

// app.post('/auth/login', async (req, res) => {
//     const { email, password } = req.body;
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     if (result.rows[0] && await bcrypt.compare(password, result.rows[0].password)) {
//         req.session.user = result.rows[0];
//         res.redirect('/portal.html');
//     } else res.send("Fail");
// });




const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize and Repair Database Tables
async function initDb() {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS mentors (id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE, name TEXT, expertise TEXT, company TEXT, bio TEXT);`);
        await pool.query(`CREATE TABLE IF NOT EXISTS requests (id SERIAL PRIMARY KEY, student_name TEXT, mentor_id INTEGER, status TEXT DEFAULT 'Pending');`);
        
        // Repair check: ensure 'status' column exists in requests
        await pool.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='status') THEN ALTER TABLE requests ADD COLUMN status TEXT DEFAULT 'Pending'; END IF; END $$;`);
        console.log("✅ Database Ready");
    } catch (e) { console.error("DB Init Error:", e); }
}
initDb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'ise_connect_secret', resave: false, saveUninitialized: true }));

// --- Auth Routes ---
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

app.get('/auth/logout', (req, res) => req.session.destroy(() => res.redirect('/login.html')));

// --- API Routes ---
app.get('/api/user', (req, res) => res.json(req.session.user || null));

app.get('/api/mentors', async (req, res) => {
    const result = await pool.query('SELECT * FROM mentors');
    res.json(result.rows);
});

app.post('/api/register-mentor', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'alumni') return res.status(403).send("Unauthorized");
    const { expertise, company, bio } = req.body;
    try {
        await pool.query(`INSERT INTO mentors (user_id, name, expertise, company, bio) 
            VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id) DO UPDATE SET expertise=$3, company=$4, bio=$5`, 
            [req.session.user.id, req.session.user.name, expertise, company, bio]);
        res.redirect('/portal.html');
    } catch (e) { res.status(500).send("Error saving profile."); }
});

app.post('/api/connect', async (req, res) => {
    if (!req.session.user) return res.status(401).send("Login first");
    const { mentor_id } = req.body;
    await pool.query('INSERT INTO requests (student_name, mentor_id) VALUES ($1, $2)', [req.session.user.name, mentor_id]);
    res.json({ success: true });
});

app.get('/api/my-requests', async (req, res) => {
    if (!req.session.user) return res.json([]);
    const result = await pool.query('SELECT * FROM requests WHERE mentor_id = $1 ORDER BY id DESC', [req.session.user.id]);
    res.json(result.rows);
});

app.post('/api/accept-request', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'alumni') return res.status(403).send("Unauthorized");
    const { request_id } = req.body;
    try {
        await pool.query('UPDATE requests SET status = $1 WHERE id = $2', ['Accepted', request_id]);
        res.json({ success: true });
    } catch (e) { res.status(500).send("Error updating request."); }
});

app.listen(process.env.PORT || 3000);

// app.get('/auth/logout', (req, res) => req.session.destroy(() => res.redirect('/login.html')));

// app.listen(process.env.PORT || 3000);
