async function start() {
    const uRes = await fetch('/api/user');
    const user = await uRes.json();
    if (!user) { window.location.href = '/login.html'; return; }

    document.getElementById('welcome-msg').innerText = `Welcome, ${user.name}`;

    if (user.role === 'alumni') {
        document.getElementById('alumni-section').style.display = 'block';
        loadMyRequests();
    }

    const mRes = await fetch('/api/mentors');
    const mentors = await mRes.json();
    renderMentors(mentors);
}

async function loadMyRequests() {
    const res = await fetch('/api/my-requests');
    const reqs = await res.json();
    const list = document.getElementById('request-list');
    
    list.innerHTML = reqs.map(r => `
        <div style="background:white; padding:15px; margin-top:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; border-left: 5px solid ${r.status === 'Accepted' ? '#10b981' : '#f59e0b'};">
            <span>Student <b>${r.student_name}</b> wants to connect. (Status: ${r.status})</span>
            ${r.status === 'Pending' ? 
                `<button onclick="acceptReq(${r.id})" style="background:#6366f1; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Accept</button>` 
                : `<b style="color:#10b981;">Accepted ✓</b>`}
        </div>
    `).join('') || "No requests yet.";
}

async function acceptReq(id) {
    const res = await fetch('/api/accept-request', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ request_id: id })
    });
    if (res.ok) {
        alert("Request Accepted!");
        loadMyRequests();
    }
}

function renderMentors(mentors) {
    const grid = document.getElementById('mentorGrid');
    grid.innerHTML = mentors.map(m => `
        <div class="card">
            <span class="badge">${m.expertise}</span>
            <h2>${m.name}</h2>
            <p><strong>${m.company}</strong></p>
            <button class="btn-connect" onclick="sendReq(${m.user_id})">Connect</button>
        </div>
    `).join('');
}

async function sendReq(id) {
    const res = await fetch('/api/connect', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ mentor_id: id })
    });
    if (res.ok) alert("Request Sent!");
}

start();
