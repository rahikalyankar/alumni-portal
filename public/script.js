


// async function init() {
//     const userRes = await fetch('/api/user');
//     const user = await userRes.json();
//     if (!user) { window.location.href = '/login.html'; return; }

//     document.getElementById('welcome-msg').innerText = `Welcome, ${user.name}`;

//     if (user.role === 'alumni') {
//         document.getElementById('alumni-section').style.display = 'block';
//         loadAlumniRequests();
//     } else {
//         document.getElementById('student-section').style.display = 'block';
//         loadStudentStatus();
//     }

//     const mentorRes = await fetch('/api/mentors');
//     const mentors = await mentorRes.json();
//     renderMentors(mentors);
// }

// // For Alumni to accept
// async function loadAlumniRequests() {
//     const res = await fetch('/api/my-requests');
//     const reqs = await res.json();
//     const listDiv = document.getElementById('request-list');
//     listDiv.innerHTML = reqs.map(r => `
//         <div class="request-card">
//             <span>Student <b>${r.student_name}</b> sent a connect request!</span>
//             <div>
//                 ${r.status === 'Pending' ? `<button onclick="handleAccept(${r.id})" class="accept-btn">Accept</button>` : `<span style="color:#10b981; font-weight:bold;">✓ Accepted</span>`}
//             </div>
//         </div>
//     `).join('') || "No requests found.";
// }

// // For Students to see if they are accepted
// async function loadStudentStatus() {
//     const res = await fetch('/api/student-requests');
//     const reqs = await res.json();
//     const listDiv = document.getElementById('my-status-list');
//     listDiv.innerHTML = reqs.map(r => `
//         <div class="request-card">
//             <span>Request to <b>${r.mentor_name}</b></span>
//             <span style="font-weight:bold; color: ${r.status === 'Accepted' ? '#10b981' : '#f59e0b'};">
//                 ${r.status === 'Accepted' ? 'Accepted ✓' : 'Pending...'}
//             </span>
//         </div>
//     `).join('') || "No requests sent.";
// }

// async function handleAccept(id) {
//     await fetch('/api/accept-request', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ request_id: id })
//     });
//     loadAlumniRequests();
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
//     await fetch('/api/connect', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ mentor_id: id })
//     });
//     alert("Request sent!");
//     if (document.getElementById('student-section').style.display === 'block') loadStudentStatus();
// }

// init();





let currentUser = null;
let activeChatPartnerId = null;

async function init() {
    const userRes = await fetch('/api/user');
    currentUser = await userRes.json();
    if (!currentUser) { window.location.href = '/login.html'; return; }

    document.getElementById('welcome-msg').innerText = `Welcome, ${currentUser.name}`;

    if (currentUser.role === 'alumni') {
        document.getElementById('alumni-section').style.display = 'block';
        loadAlumniRequests();
    }
    
    const mentorRes = await fetch('/api/mentors');
    const mentors = await mentorRes.json();
    renderMentors(mentors);
}

// ALUMNI VIEW: Accept or Chat
async function loadAlumniRequests() {
    const res = await fetch('/api/my-requests');
    const reqs = await res.json();
    const listDiv = document.getElementById('request-list');
    listDiv.innerHTML = reqs.map(r => `
        <div class="request-card">
            <span>Student: <b>${r.student_name}</b></span>
            ${r.status === 'Pending' ? 
                `<button onclick="handleAccept(${r.id})" class="accept-btn">Accept Request</button>` : 
                `<button onclick="openChat(${r.student_id}, '${r.student_name}')" class="accept-btn" style="background:green;">Chat with Student</button>`
            }
        </div>
    `).join('') || "No requests.";
}

// MENTOR GRID: Connect or Chat
async function renderMentors(mentors) {
    // We need to see if student is already accepted by this mentor
    const res = await fetch('/api/user'); // Simple check for student's accepted status
    const grid = document.getElementById('mentorGrid');
    
    grid.innerHTML = mentors.map(m => `
        <div class="card">
            <span class="badge">${m.expertise}</span>
            <h2>${m.name}</h2>
            <p>${m.company}</p>
            <button class="btn-connect" onclick="checkAndChat(${m.user_id}, '${m.name}')" id="btn-${m.user_id}">Check Connection</button>
        </div>
    `).join('');
}

// Logic to check if student can chat or needs to connect
async function checkAndChat(mentorId, mentorName) {
    const res = await fetch('/api/my-requests'); // In a real app, you'd use a specific student-requests route
    // For demo: Let's assume sendRequest first
    sendRequest(mentorId);
}

// --- CHAT LOGIC ---
function openChat(id, name) {
    activeChatPartnerId = id;
    document.getElementById('chatPartner').innerText = name;
    document.getElementById('chatBox').style.display = 'block';
    refreshMessages();
}

function closeChat() { document.getElementById('chatBox').style.display = 'none'; }

async function sendMessage() {
    const msg = document.getElementById('chatInput').value;
    if (!msg) return;
    await fetch('/api/send-message', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ receiver_id: activeChatPartnerId, message: msg })
    });
    document.getElementById('chatInput').value = '';
    refreshMessages();
}

async function refreshMessages() {
    if (!activeChatPartnerId) return;
    const res = await fetch(`/api/get-messages/${activeChatPartnerId}`);
    const msgs = await res.json();
    document.getElementById('chatMessages').innerHTML = msgs.map(m => `
        <div style="text-align: ${m.sender_id === currentUser.id ? 'right' : 'left'}; margin: 5px;">
            <span style="background: ${m.sender_id === currentUser.id ? '#eef2ff' : '#f1f5f9'}; padding: 5px; border-radius: 5px; display: inline-block;">
                ${m.message}
            </span>
        </div>
    `).join('');
}

// Refresh chat every 3 seconds if open
setInterval(refreshMessages, 3000);

async function handleAccept(id) {
    await fetch('/api/accept-request', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ request_id: id })
    });
    loadAlumniRequests();
}

async function sendRequest(id) {
    await fetch('/api/connect', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ mentor_id: id })
    });
    alert("Request Sent!");
}

init();
