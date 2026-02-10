async function init() {
    const userRes = await fetch('/api/user');
    const user = await userRes.json();
    if (!user) { window.location.href = '/login.html'; return; }

    // If Alumni, show their received requests
    if (user.role === 'alumni') {
        loadRequests();
        document.getElementById('alumni-section').style.display = 'block';
    }

    const mentorRes = await fetch('/api/mentors');
    const mentors = await mentorRes.json();
    renderMentors(mentors);
}

function renderMentors(mentors) {
    const grid = document.getElementById('mentorGrid');
    grid.innerHTML = mentors.map(m => `
        <div class="card">
            <span class="badge">${m.expertise}</span>
            <h2>${m.name}</h2>
            <p><strong>${m.company}</strong></p>
            <button class="btn-connect" onclick="sendConnect(${m.user_id}, '${m.name}')">Request Mentorship</button>
        </div>
    `).join('');
}

async function sendConnect(mentorId, name) {
    const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentor_id: mentorId })
    });
    if (res.ok) alert(`Request sent to ${name}! They will see it on their dashboard.`);
}

async function loadRequests() {
    const res = await fetch('/api/my-requests');
    const data = await res.json();
    const reqDiv = document.getElementById('request-list');
    reqDiv.innerHTML = data.map(r => `
        <div style="padding:10px; border-bottom:1px solid #ddd;">
            Student <strong>${r.student_name}</strong> wants to connect.
        </div>
    `).join('') || "No requests yet.";
}

init();
