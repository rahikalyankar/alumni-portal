async function start() {
    const uRes = await fetch('/api/user');
    const user = await uRes.json();
    if (!user) { window.location.href = '/login.html'; return; }

    document.getElementById('user-display').innerText = `User: ${user.name}`;

    if (user.role === 'alumni') {
        document.getElementById('alumni-dashboard').style.display = 'block';
        loadMyRequests(user.id);
    }

    const mRes = await fetch('/api/mentors');
    const mentors = await mRes.json();
    displayMentors(mentors);
}

function displayMentors(list) {
    const grid = document.getElementById('mentorGrid');
    grid.innerHTML = list.map(m => `
        <div class="card">
            <span class="badge">${m.expertise}</span>
            <h2>${m.name}</h2>
            <p><strong>${m.company}</strong></p>
            <button class="btn-connect" onclick="requestMentorship(${m.user_id})">Connect</button>
        </div>
    `).join('');
}

async function requestMentorship(id) {
    const res = await fetch('/api/connect', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ mentor_id: id })
    });
    if(res.ok) alert("Request Sent!");
}

async function loadMyRequests() {
    const res = await fetch('/api/my-requests');
    const reqs = await res.json();
    document.getElementById('request-list').innerHTML = reqs.map(r => `
        <div class="request-item">Student <b>${r.student_name}</b> sent you a request!</div>
    `).join('') || "No requests found.";
}

start();
