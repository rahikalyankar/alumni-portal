// async function init() {
//     const userRes = await fetch('/api/user');
//     const user = await userRes.json();
//     if (!user) { window.location.href = '/login.html'; return; }

//     // Set welcome message in your original span
//     document.getElementById('welcome-msg').innerText = `Welcome, ${user.name}`;

//     // Show your original alumni section
//     if (user.role === 'alumni') {
//         document.getElementById('alumni-section').style.display = 'block';
//         loadRequests();
//     }

//     const mentorRes = await fetch('/api/mentors');
//     const mentors = await mentorRes.json();
//     renderMentors(mentors);
// }

// async function loadRequests() {
//     const res = await fetch('/api/my-requests');
//     const reqs = await res.json();
//     const listDiv = document.getElementById('request-list');
    
//     // Injects the student name and an Accept button into your original div
//     listDiv.innerHTML = reqs.map(r => `
//         <div style="background:white; padding:15px; margin-top:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; border: 1px solid #ddd;">
//             <span>Student <b>${r.student_name}</b> sent a connect request! (${r.status})</span>
//             ${r.status === 'Pending' ? 
//                 `<button onclick="handleAccept(${r.id})" style="background:#6366f1; color:white; border:none; padding:8px 15px; border-radius:5px; cursor:pointer;">Accept</button>` 
//                 : `<span style="color:green; font-weight:bold;">Accepted ✓</span>`}
//         </div>
//     `).join('') || "No requests found.";
// }

// async function handleAccept(id) {
//     const res = await fetch('/api/accept-request', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ request_id: id })
//     });
//     if (res.ok) {
//         alert("Mentorship request accepted!");
//         loadRequests(); // Refresh the original request-list div
//     }
// }

// function renderMentors(mentors) {
//     const grid = document.getElementById('mentorGrid');
//     grid.innerHTML = mentors.map(m => `
//         <div class="card" style="background:white; padding:20px; border-radius:15px; margin-bottom:15px; border: 1px solid #eee;">
//             <span class="badge" style="background:#eef2ff; color:#6366f1; padding:5px 10px; border-radius:10px; font-size:12px;">${m.expertise}</span>
//             <h2 style="margin:10px 0;">${m.name}</h2>
//             <p><strong>${m.company}</strong></p>
//             <button class="btn-connect" onclick="sendRequest(${m.user_id})" style="width:100%; padding:10px; background:#6366f1; color:white; border:none; border-radius:10px; cursor:pointer; margin-top:10px;">Connect</button>
//         </div>
//     `).join('');
// }

// async function sendRequest(id) {
//     const res = await fetch('/api/connect', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ mentor_id: id })
//     });
//     if (res.ok) alert("Request sent successfully!");
// }

// init();
async function init() {
    const userRes = await fetch('/api/user');
    const user = await userRes.json();
    if (!user) { window.location.href = '/login.html'; return; }

    document.getElementById('welcome-msg').innerText = `Welcome, ${user.name}`;

    if (user.role === 'alumni') {
        document.getElementById('alumni-section').style.display = 'block';
        loadRequests();
    }

    const mentorRes = await fetch('/api/mentors');
    const mentors = await mentorRes.json();
    renderMentors(mentors);
}

async function loadRequests() {
    const res = await fetch('/api/my-requests');
    const reqs = await res.json();
    const listDiv = document.getElementById('request-list');
    
    listDiv.innerHTML = reqs.map(r => `
        <div class="request-card">
            <span>Student <b>${r.student_name}</b> sent a connect request!</span>
            <div>
                ${r.status === 'Pending' ? 
                    `<button onclick="handleAccept(${r.id})" class="accept-btn">Accept</button>` 
                    : `<span style="color:#10b981; font-weight:bold;">✓ Accepted</span>`}
            </div>
        </div>
    `).join('') || "<p style='color:gray;'>No requests found.</p>";
}

async function handleAccept(id) {
    const res = await fetch('/api/accept-request', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ request_id: id })
    });
    if (res.ok) {
        alert("Mentorship request accepted!");
        loadRequests();
    }
}

function renderMentors(mentors) {
    const grid = document.getElementById('mentorGrid');
    grid.innerHTML = mentors.map(m => `
        <div class="card">
            <span class="badge">${m.expertise}</span>
            <h2>${m.name}</h2>
            <p>Working at <b>${m.company}</b></p>
            <button class="btn-connect" onclick="sendRequest(${m.user_id})">Connect</button>
        </div>
    `).join('');
}

async function sendRequest(id) {
    const res = await fetch('/api/connect', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ mentor_id: id })
    });
    if (res.ok) alert("Request sent successfully!");
}

init();
