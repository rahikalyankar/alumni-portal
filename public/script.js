



// let currentUser = null;
// let activeChatPartnerId = null;

// async function init() {
//     const userRes = await fetch('/api/user');
//     currentUser = await userRes.json();
//     if (!currentUser) { window.location.href = '/login.html'; return; }

//     document.getElementById('welcome-msg').innerText = `Welcome, ${currentUser.name}`;

//     if (currentUser.role === 'alumni') {
//         document.getElementById('alumni-section').style.display = 'block';
//         loadAlumniRequests();
//     }
    
//     const mentorRes = await fetch('/api/mentors');
//     const mentors = await mentorRes.json();
//     renderMentors(mentors);
// }

// // ALUMNI VIEW: Accept or Chat
// async function loadAlumniRequests() {
//     const res = await fetch('/api/my-requests');
//     const reqs = await res.json();
//     const listDiv = document.getElementById('request-list');
//     listDiv.innerHTML = reqs.map(r => `
//         <div class="request-card">
//             <span>Student: <b>${r.student_name}</b></span>
//             ${r.status === 'Pending' ? 
//                 `<button onclick="handleAccept(${r.id})" class="accept-btn">Accept Request</button>` : 
//                 `<button onclick="openChat(${r.student_id}, '${r.student_name}')" class="accept-btn" style="background:green;">Chat with Student</button>`
//             }
//         </div>
//     `).join('') || "No requests.";
// }

// // MENTOR GRID: Connect or Chat
// async function renderMentors(mentors) {
//     // We need to see if student is already accepted by this mentor
//     const res = await fetch('/api/user'); // Simple check for student's accepted status
//     const grid = document.getElementById('mentorGrid');
    
//     grid.innerHTML = mentors.map(m => `
//         <div class="card">
//             <span class="badge">${m.expertise}</span>
//             <h2>${m.name}</h2>
//             <p>${m.company}</p>
//             <button class="btn-connect" onclick="checkAndChat(${m.user_id}, '${m.name}')" id="btn-${m.user_id}">Check Connection</button>
//         </div>
//     `).join('');
// }

// // Logic to check if student can chat or needs to connect
// async function checkAndChat(mentorId, mentorName) {
//     const res = await fetch('/api/my-requests'); // In a real app, you'd use a specific student-requests route
//     // For demo: Let's assume sendRequest first
//     sendRequest(mentorId);
// }

// // --- CHAT LOGIC ---
// function openChat(id, name) {
//     activeChatPartnerId = id;
//     document.getElementById('chatPartner').innerText = name;
//     document.getElementById('chatBox').style.display = 'block';
//     refreshMessages();
// }

// function closeChat() { document.getElementById('chatBox').style.display = 'none'; }

// async function sendMessage() {
//     const msg = document.getElementById('chatInput').value;
//     if (!msg) return;
//     await fetch('/api/send-message', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ receiver_id: activeChatPartnerId, message: msg })
//     });
//     document.getElementById('chatInput').value = '';
//     refreshMessages();
// }

// async function refreshMessages() {
//     if (!activeChatPartnerId) return;
//     const res = await fetch(`/api/get-messages/${activeChatPartnerId}`);
//     const msgs = await res.json();
//     document.getElementById('chatMessages').innerHTML = msgs.map(m => `
//         <div style="text-align: ${m.sender_id === currentUser.id ? 'right' : 'left'}; margin: 5px;">
//             <span style="background: ${m.sender_id === currentUser.id ? '#eef2ff' : '#f1f5f9'}; padding: 5px; border-radius: 5px; display: inline-block;">
//                 ${m.message}
//             </span>
//         </div>
//     `).join('');
// }

// // Refresh chat every 3 seconds if open
// setInterval(refreshMessages, 3000);

// async function handleAccept(id) {
//     await fetch('/api/accept-request', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ request_id: id })
//     });
//     loadAlumniRequests();
// }

// async function sendRequest(id) {
//     await fetch('/api/connect', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ mentor_id: id })
//     });
//     alert("Request Sent!");
// }

// init();



let currentUser = null;
let activeChatId = null;

async function init() {
    const res = await fetch('/api/user');
    currentUser = await res.json();
    if (!currentUser) { window.location.href = '/login.html'; return; }

    document.getElementById('welcome-msg').innerText = `Welcome, ${currentUser.name}`;

    if (currentUser.role === 'alumni') {
        document.getElementById('alumni-section').style.display = 'block';
        loadRequests();
    }
    
    const mRes = await fetch('/api/mentors');
    const mentors = await mRes.json();
    renderMentors(mentors);
}

async function loadRequests() {
    const res = await fetch('/api/my-requests');
    const reqs = await res.json();
    const list = document.getElementById('request-list');
    
    list.innerHTML = reqs.map(r => `
        <div class="request-card" style="background:white; padding:15px; margin-bottom:10px; border-radius:10px; display:flex; justify-content:space-between; align-items:center; border:1px solid #e2e8f0;">
            <span><b>${r.student_name}</b> sent a request!</span>
            ${r.status === 'Pending' ? 
                `<button onclick="acceptReq(${r.id})" class="accept-btn">Accept</button>` : 
                `<button onclick="openChat(${r.student_id}, '${r.student_name}')" class="accept-btn" style="background:#10b981;">Chat</button>`
            }
        </div>
    `).join('') || "No requests yet.";
}

async function renderMentors(mentors) {
    const res = await fetch('/api/my-requests');
    const myReqs = await res.json();
    const grid = document.getElementById('mentorGrid');

    grid.innerHTML = mentors.map(m => {
        const connection = myReqs.find(r => r.mentor_id === m.user_id);
        let btnHtml = `<button class="btn-connect" onclick="connect(${m.user_id})">Connect</button>`;
        
        if (connection) {
            btnHtml = connection.status === 'Accepted' ? 
                `<button class="btn-connect" style="background:#10b981;" onclick="openChat(${m.user_id}, '${m.name}')">Chat Now</button>` :
                `<button class="btn-connect" style="background:#64748b; cursor:default;" disabled>Pending...</button>`;
        }

        return `
            <div class="card">
                <span class="badge">${m.expertise}</span>
                <h2>${m.name}</h2>
                <p>${m.company}</p>
                ${btnHtml}
            </div>
        `;
    }).join('');
}

function openChat(id, name) {
    activeChatId = id;
    document.getElementById('chatPartner').innerText = "Chat with " + name;
    document.getElementById('chatBox').style.display = 'block';
    refresh();
}

function closeChat() { document.getElementById('chatBox').style.display = 'none'; activeChatId = null; }

async function sendMessage() {
    const val = document.getElementById('chatInput').value;
    if (!val || !activeChatId) return;
    await fetch('/api/send-message', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ receiver_id: activeChatId, message: val })
    });
    document.getElementById('chatInput').value = '';
    refresh();
}

async function refresh() {
    if (!activeChatId) return;
    const res = await fetch(`/api/get-messages/${activeChatId}`);
    const msgs = await res.json();
    document.getElementById('chatMessages').innerHTML = msgs.map(m => `
        <div style="align-self: ${m.sender_id === currentUser.id ? 'flex-end' : 'flex-start'}; 
                    background: ${m.sender_id === currentUser.id ? '#6366f1' : '#e2e8f0'}; 
                    color: ${m.sender_id === currentUser.id ? 'white' : 'black'};
                    padding: 8px 12px; border-radius: 12px; max-width: 80%; font-size: 14px;">
            ${m.message}
        </div>
    `).join('');
    const box = document.getElementById('chatMessages');
    box.scrollTop = box.scrollHeight;
}

setInterval(refresh, 3000); // Polling for new messages every 3 seconds

async function acceptReq(id) { await fetch('/api/accept-request', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({request_id:id})}); loadRequests(); renderMentors(); }
async function connect(id) { await fetch('/api/connect', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({mentor_id:id})}); location.reload(); }

init();
