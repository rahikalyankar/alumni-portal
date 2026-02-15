
// async function init() {
//     const userRes = await fetch('/api/user');
//     const user = await userRes.json();
//     if (!user) { window.location.href = '/login.html'; return; }

//     document.getElementById('welcome-msg').innerText = `Welcome, ${user.name}`;

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
    
//     listDiv.innerHTML = reqs.map(r => `
//         <div class="request-card">
//             <span>Student <b>${r.student_name}</b> sent a connect request!</span>
//             <div>
//                 ${r.status === 'Pending' ? 
//                     `<button onclick="handleAccept(${r.id})" class="accept-btn">Accept</button>` 
//                     : `<span style="color:#10b981; font-weight:bold;">✓ Accepted</span>`}
//             </div>
//         </div>
//     `).join('') || "<p style='color:gray;'>No requests found.</p>";
// }

// async function handleAccept(id) {
//     const res = await fetch('/api/accept-request', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ request_id: id })
//     });
//     if (res.ok) {
//         alert("Mentorship request accepted!");
//         loadRequests();
//     }
// }

// function renderMentors(mentors) {
//     const grid = document.getElementById('mentorGrid');
//     grid.innerHTML = mentors.map(m => `
//         <div class="card">
//             <span class="badge">${m.expertise}</span>
//             <h2>${m.name}</h2>
//             <p>Working at <b>${m.company}</b></p>
//             <button class="btn-connect" onclick="sendRequest(${m.user_id})">Connect</button>
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
        loadAlumniRequests();
    } else {
        document.getElementById('student-section').style.display = 'block';
        loadStudentStatus();
    }

    const mentorRes = await fetch('/api/mentors');
    const mentors = await mentorRes.json();
    renderMentors(mentors);
}

// For Alumni to accept
async function loadAlumniRequests() {
    const res = await fetch('/api/my-requests');
    const reqs = await res.json();
    const listDiv = document.getElementById('request-list');
    listDiv.innerHTML = reqs.map(r => `
        <div class="request-card">
            <span>Student <b>${r.student_name}</b> sent a connect request!</span>
            <div>
                ${r.status === 'Pending' ? `<button onclick="handleAccept(${r.id})" class="accept-btn">Accept</button>` : `<span style="color:#10b981; font-weight:bold;">✓ Accepted</span>`}
            </div>
        </div>
    `).join('') || "No requests found.";
}

// For Students to see if they are accepted
async function loadStudentStatus() {
    const res = await fetch('/api/student-requests');
    const reqs = await res.json();
    const listDiv = document.getElementById('my-status-list');
    listDiv.innerHTML = reqs.map(r => `
        <div class="request-card">
            <span>Request to <b>${r.mentor_name}</b></span>
            <span style="font-weight:bold; color: ${r.status === 'Accepted' ? '#10b981' : '#f59e0b'};">
                ${r.status === 'Accepted' ? 'Accepted ✓' : 'Pending...'}
            </span>
        </div>
    `).join('') || "No requests sent.";
}

async function handleAccept(id) {
    await fetch('/api/accept-request', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ request_id: id })
    });
    loadAlumniRequests();
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
    await fetch('/api/connect', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ mentor_id: id })
    });
    alert("Request sent!");
    if (document.getElementById('student-section').style.display === 'block') loadStudentStatus();
}

init();
