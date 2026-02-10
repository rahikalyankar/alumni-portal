let allMentors = [];

async function init() {
    try {
        const response = await fetch('/api/mentors');
        allMentors = await response.json();
        renderMentors(allMentors);
    } catch (error) {
        console.error("Error loading mentors:", error);
    }
}

function renderMentors(mentors) {
    const grid = document.getElementById('mentorGrid');
    grid.innerHTML = mentors.map(m => `
        <div class="card">
            <span class="badge">${m.expertise}</span>
            <h2>${m.name}</h2>
            <p class="company">at <strong>${m.company}</strong></p>
            <button class="btn-connect" onclick="alert('Connection request sent to ${m.name}!')">Connect Now</button>
        </div>
    `).join('');
}

// Search Functionality
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
