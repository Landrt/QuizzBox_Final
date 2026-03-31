import api from './api.js';

// 1. Auth Check - Direct execution
const token = localStorage.getItem('quizzbox_token');
if (!token) {
    window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', async () => {
    const userGreeting = document.getElementById('user-greeting');
    const userInitial = document.getElementById('user-initial');
    const evalsContainer = document.getElementById('evaluations-container');
    const totalEvalsEl = document.getElementById('total-evals');
    const sharedEvalsEl = document.getElementById('shared-evals');
    const privateEvalsEl = document.getElementById('private-evals');
    const searchInput = document.getElementById('search-input');

    let allEvaluations = [];

    // Load User Data from Cache
    const user = JSON.parse(localStorage.getItem('quizzbox_user') || '{}');
    if (user.name) updateUserUI(user);

    // Refresh User Profile & Evaluations
    try {
        const freshProfile = await api.auth.getProfile();
        localStorage.setItem('quizzbox_user', JSON.stringify(freshProfile));
        updateUserUI(freshProfile);

        allEvaluations = await api.evaluations.list();
        renderEvaluations(allEvaluations);
        updateStats(allEvaluations);
    } catch (err) {
        console.error('Dashboard init error:', err);
    }

    // --- Helpers ---

    function updateUserUI(user) {
        if (userGreeting) userGreeting.textContent = user.name || user.fullName || 'Utilisateur';
        if (userInitial) userInitial.textContent = (user.name || user.fullName || 'U').charAt(0).toUpperCase();
    }

    function renderEvaluations(evals) {
        if (!evalsContainer) return;

        evalsContainer.innerHTML = `
            <article class="eval-card create-card" id="create-new-card">
                <div class="icon">+</div>
                <h3>Créer une évaluation</h3>
                <p>Créer un nouveau module d'évaluation clinique</p>
            </article>
        `;

        // Re-attach create card click
        document.getElementById('create-new-card').addEventListener('click', () => {
            window.location.href = 'create.html';
        });

        if (evals.length === 0) return;

        evals.forEach(ev => {
            const isShared = ev.visibility === 'SHARED' || ev.visibility === 'PUBLIC';
            const card = document.createElement('article');
            card.className = 'eval-card animate-fade';
            card.innerHTML = `
                <span class="badge ${isShared ? 'shared' : 'private'}">${isShared ? 'Partagée' : 'Privée'}</span>
                <h3>${ev.title}</h3>
                <p>${ev.description || 'Aucune description fournie.'}</p>
                <div class="card-footer">
                    <span>Questions: <strong>${ev._count?.questions ?? ev.numQuestions ?? 0}</strong></span>
                    <span>Code: <strong id="code-${ev.id}">${ev.accessCode || '—'}</strong></span>
                </div>
                <div class="card-actions">
                    <a href="session.html?id=${ev.id}" class="card-action-link">🚀 Lancer</a>
                    <a href="create.html?edit=${ev.id}" class="card-action-link" style="color: #64748b;">✏️ Modifier</a>
                    <a href="#" class="card-action-link generate-code-btn" data-eval-id="${ev.id}" style="color: #0369a1;">🔑 Code</a>
                </div>
            `;
            evalsContainer.appendChild(card);
        });

        // Attach generate-code button listeners
        document.querySelectorAll('.generate-code-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const evalId = btn.getAttribute('data-eval-id');
                btn.textContent = '⏳...';
                try {
                    const result = await api.evaluations.generateCode(evalId);
                    const codeEl = document.getElementById(`code-${evalId}`);
                    if (codeEl) codeEl.textContent = result.accessCode;
                    btn.textContent = '✅ Copié !';
                    navigator.clipboard.writeText(result.accessCode).catch(() => {});
                    setTimeout(() => { btn.textContent = '🔑 Code'; }, 2000);
                } catch (err) {
                    alert('Erreur : ' + err.message);
                    btn.textContent = '🔑 Code';
                }
            });
        });
    }

    function updateStats(evals) {
        if (totalEvalsEl) totalEvalsEl.textContent = evals.length;
        if (sharedEvalsEl) sharedEvalsEl.textContent = evals.filter(e => e.visibility === 'SHARED' || e.visibility === 'PUBLIC').length;
        if (privateEvalsEl) privateEvalsEl.textContent = evals.filter(e => e.visibility === 'PRIVATE' || !e.visibility).length;
    }

    // --- Listeners ---

    // Logout
    if (userInitial) {
        userInitial.addEventListener('click', () => {
            if (confirm('Voulez-vous vous déconnecter ?')) {
                localStorage.removeItem('quizzbox_token');
                localStorage.removeItem('quizzbox_user');
                window.location.replace('login.html');
            }
        });
    }

    // Nouvelle évaluation button (in the search row)
    const newEvalBtn = document.getElementById('new-eval-btn');
    if (newEvalBtn) {
        newEvalBtn.addEventListener('click', () => {
            window.location.href = 'create.html';
        });
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = allEvaluations.filter(ev =>
                ev.title.toLowerCase().includes(query) ||
                (ev.description && ev.description.toLowerCase().includes(query))
            );
            renderEvaluations(filtered);
        });
    }
});