async function init() {
    const userRes = await fetch('/api/user');
    const user = await userRes.json();
    if (!user) { window.location.href = '/login.html'; return; }

    document.getElementById('welcome-msg').innerText = `Welcome, ${user.name}`;

    if (user.role === 'alumni') {
        document.getElementById('alumni-section').style.display = 'block';
        const reqRes = await fetch('/api/my-requests');
        const reqs = await reqRes.json();
        document.getElementById('request-list').innerHTML = reqs.map(r => 
            `<div class="card" style="padding:10px; margin-top:5px;">Student <b>${r.student_name}</b> sent a connect request!</div>`
        ).join('') || "No requests yet.";
    }

    const mRes = await fetch('/api/mentors');
    const mentors = await mRes.json();
    const grid = document.getElementById('mentorGrid');
    grid.innerHTML = mentors.map(m => `
        <div class="card">
            <span class="badge">${m.expertise}</span>
            <h2>${m.name}</h2>
            <p><strong>${m.company}</strong></p>
            <button class="btn-connect" onclick="sendRequest(${m.user_id})">Connect</button>
        </div>
    `).join('');
}

async function sendRequest(mentorId) {
    const res = await fetch('/api/connect', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ mentor_id: mentorId })
    });
    if (res.ok) alert("Request Sent to Alumni!");
}
init();
