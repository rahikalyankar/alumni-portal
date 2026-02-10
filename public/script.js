let allMentors = [];

async function init() {
    // 1. Check User Session & Role
    const userRes = await fetch('/api/user');
    const user = await userRes.json();

    if (!user) {
        window.location.href = '/login.html'; // Redirect if not logged in
        return;
    }

    document.getElementById('welcome-msg').innerText = `Hello, ${user.name} (${user.role})`;

    // Show Alumni form if user is an alumni
    if (user.role === 'alumni') {
        document.getElementById('alumni-registration').style.display = 'block';
    }

    // 2. Fetch Mentor Data
    try {
        const mentorRes = await fetch('/api/mentors');
        allMentors = await mentorRes.json();
        renderMentors(allMentors);
    } catch (err) {
        console.error("Error fetching mentors", err);
    }
}

function renderMentors(mentors) {
    const grid = document.getElementById('mentorGrid');
    if (mentors.length === 0) {
        grid.innerHTML = "<p>No alumni mentors found yet.</p>";
        return;
    }
    grid.innerHTML = mentors.map(m => `
        <div class="card">
            <span class="badge">${m.expertise}</span>
            <h2>${m.name}</h2>
            <p class="company">at <strong>${m.company}</strong></p>
            <p>${m.bio || ''}</p>
            <button class="btn-connect" onclick="alert('Request sent to ${m.name}!')">Request Mentorship</button>
        </div>
    `).join('');
}

// Search Logic
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allMentors.filter(m => 
        m.name.toLowerCase().includes(term) || 
        m.company.toLowerCase().includes(term) || 
        m.expertise.toLowerCase().includes(term)
    );
    renderMentors(filtered);
});

init();
