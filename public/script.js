


// let currentUser = null;
// let activeChatId = null;

// async function init() {
//     const res = await fetch('/api/user');
//     currentUser = await res.json();
//     if (!currentUser) { window.location.href = '/login.html'; return; }

//     document.getElementById('welcome-msg').innerText = `Welcome, ${currentUser.name}`;

//     if (currentUser.role === 'alumni') {
//         document.getElementById('alumni-section').style.display = 'block';
//         loadRequests();
//     }
    
//     const mRes = await fetch('/api/mentors');
//     const mentors = await mRes.json();
//     renderMentors(mentors);
// }

// // ALUMNI DASHBOARD: Shows list of students
// async function loadRequests() {
//     const res = await fetch('/api/my-requests');
//     const reqs = await res.json();
//     const list = document.getElementById('request-list');
    
//     list.innerHTML = reqs.map(r => `
//         <div class="request-card" style="background:white; padding:15px; margin-bottom:10px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid #e2e8f0;">
//             <span><b>${r.student_name}</b> sent a request!</span>
//             ${r.status === 'Pending' ? 
//                 `<button onclick="acceptReq(${r.id})" class="accept-btn" style="background:#6366f1; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer;">Accept</button>` : 
//                 `<button onclick="openChat(${r.student_id}, '${r.student_name}')" class="accept-btn" style="background:#10b981; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer;">Chat</button>`
//             }
//         </div>
//     `).join('') || "No requests yet.";
// }

// // MENTOR GRID: Student view
// async function renderMentors(mentors) {
//     const res = await fetch('/api/my-requests');
//     const myReqs = await res.json();
//     const grid = document.getElementById('mentorGrid');

//     grid.innerHTML = mentors.map(m => {
//         const connection = myReqs.find(r => r.mentor_id === m.user_id);
//         let btnHtml = `<button class="btn-connect" onclick="connect(${m.user_id})" style="background:#6366f1; color:white; border:none; padding:10px; border-radius:10px; cursor:pointer; width:100%;">Connect</button>`;
        
//         if (connection) {
//             btnHtml = connection.status === 'Accepted' ? 
//                 `<button class="btn-connect" style="background:#10b981; color:white; border:none; padding:10px; border-radius:10px; cursor:pointer; width:100%;" onclick="openChat(${m.user_id}, '${m.name}')">Chat Now</button>` :
//                 `<button class="btn-connect" style="background:#64748b; color:white; border:none; padding:10px; border-radius:10px; width:100%; cursor:default;" disabled>Pending...</button>`;
//         }

//         return `<div class="card" style="background:white; padding:20px; border-radius:15px; border:1px solid #eee; margin-bottom:15px;">
//             <span class="badge" style="background:#eef2ff; color:#6366f1; padding:4px 8px; border-radius:5px; font-size:12px;">${m.expertise}</span>
//             <h2 style="margin:10px 0;">${m.name}</h2>
//             <p style="color:gray;">${m.company}</p>
//             ${btnHtml}
//         </div>`;
//     }).join('');
// }

// // CHAT FUNCTIONS
// function openChat(id, name) {
//     activeChatId = id;
//     document.getElementById('chatPartner').innerText = "Chatting with " + name;
//     document.getElementById('chatBox').style.display = 'block';
//     refresh();
// }

// function closeChat() { document.getElementById('chatBox').style.display = 'none'; activeChatId = null; }

// async function sendMessage() {
//     const val = document.getElementById('chatInput').value;
//     if (!val || !activeChatId) return;
    
//     await fetch('/api/send-message', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ receiver_id: activeChatId, message: val })
//     });
    
//     document.getElementById('chatInput').value = ''; // Clear input
//     refresh(); // Refresh list instantly
// }

// async function refresh() {
//     if (!activeChatId) return;
//     const res = await fetch(`/api/get-messages/${activeChatId}`);
//     const msgs = await res.json();
    
//     const chatContainer = document.getElementById('chatMessages');
//     chatContainer.innerHTML = msgs.map(m => `
//         <div style="align-self: ${m.sender_id === currentUser.id ? 'flex-end' : 'flex-start'}; 
//                     background: ${m.sender_id === currentUser.id ? '#6366f1' : '#e2e8f0'}; 
//                     color: ${m.sender_id === currentUser.id ? 'white' : 'black'};
//                     padding: 10px 14px; border-radius: 12px; max-width: 80%; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
//             ${m.message}
//         </div>
//     `).join('');
    
//     chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to bottom
// }

// setInterval(refresh, 2500); // Check for new messages every 2.5 seconds

// async function acceptReq(id) { await fetch('/api/accept-request', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({request_id:id})}); loadRequests(); renderMentors(); }
// async function connect(id) { await fetch('/api/connect', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({mentor_id:id})}); location.reload(); }

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
        loadAlumniRequests();
    }
    loadMentorGrid();
}

async function loadAlumniRequests() {
    const res = await fetch('/api/my-requests');
    const reqs = await res.json();
    const list = document.getElementById('request-list');
    list.innerHTML = reqs.map(r => `
        <div class="request-card" style="border:1px solid #ddd; padding:15px; margin-bottom:10px; border-radius:12px; display:flex; justify-content:space-between; align-items:center;">
            <span>Student <b>${r.student_name}</b> sent a request!</span>
            ${r.status === 'Pending' ? 
                `<button onclick="acceptReq(${r.id})" style="background:#6366f1; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer;">Accept</button>` : 
                `<button onclick="openChat(${r.student_id}, '${r.student_name}')" style="background:#10b981; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer;">Chat</button>`
            }
        </div>
    `).join('') || "No requests found.";
}

async function loadMentorGrid() {
    const mRes = await fetch('/api/mentors');
    const mentors = await mRes.json();
    const rRes = await fetch('/api/my-requests');
    const myReqs = await rRes.json();
    
    const grid = document.getElementById('mentorGrid');
    grid.innerHTML = mentors.map(m => {
        const conn = myReqs.find(r => r.mentor_id === m.user_id);
        let btnHtml = `<button class="btn-connect" onclick="connect(${m.user_id})">Connect</button>`;
        if (conn) {
            btnHtml = conn.status === 'Accepted' ? 
                `<button class="btn-connect" style="background:#10b981;" onclick="openChat(${m.user_id}, '${m.name}')">Chat Now</button>` :
                `<button class="btn-connect" style="background:#94a3b8;" disabled>Pending...</button>`;
        }
        return `<div class="card"><span class="badge">${m.expertise}</span><h2>${m.name}</h2><p>${m.company}</p>${btnHtml}</div>`;
    }).join('');
}

// Chat UI logic
function openChat(id, name) {
    activeChatId = id;
    document.getElementById('chatPartner').innerText = "Chat with " + name;
    document.getElementById('chatBox').style.display = 'block';
    refreshMessages();
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input.value || !activeChatId) return;
    await fetch('/api/send-message', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ receiver_id: activeChatId, message: input.value })
    });
    input.value = '';
    refreshMessages();
}

async function refreshMessages() {
    if (!activeChatId) return;
    const res = await fetch(`/api/get-messages/${activeChatId}`);
    const msgs = await res.json();
    const container = document.getElementById('chatMessages');
    container.innerHTML = msgs.map(m => `<div style="align-self: ${m.sender_id === currentUser.id ? 'flex-end' : 'flex-start'}; background: ${m.sender_id === currentUser.id ? '#6366f1' : '#e2e8f0'}; color: ${m.sender_id === currentUser.id ? 'white' : 'black'}; padding: 10px; border-radius: 10px; max-width: 80%; margin-bottom: 5px;">${m.message}</div>`).join('');
    container.scrollTop = container.scrollHeight;
}

setInterval(refreshMessages, 2500);
function closeChat() { document.getElementById('chatBox').style.display = 'none'; activeChatId = null; }
async function acceptReq(id) { await fetch('/api/accept-request', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({request_id:id})}); loadAlumniRequests(); loadMentorGrid(); }
async function connect(id) { await fetch('/api/connect', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({mentor_id:id})}); location.reload(); }

init();
